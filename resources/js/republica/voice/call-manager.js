import { CallRegistry, newCallId, newRequestId } from './call-state';
import { createSpeakingDetector, getMicrophone, micErrorMessage } from './media';
import { PeerMesh } from './peer-mesh';
import { platformOf } from '../platform';

const SPEAKING_INTERVAL = 250; // no máximo 4 whispers "call-speaking" por segundo

const isId = (v) => Number.isInteger(v);
const isKey = (v) => typeof v === 'string' && v.length > 0 && v.length <= 64;
const isSdp = (v) => typeof v === 'string' && v.length > 0 && v.length <= 9000;

// Regras da conversa por voz: pedidos, aprovações, timers, cooldowns e a malha de áudio.
export class CallManager {
    constructor(me, voice, ui, onChange) {
        this.me = me;
        this.voice = voice;
        this.ui = ui;
        this.onChange = onChange;
        this.session = null;

        this.registry = new CallRegistry();
        this.mesh = new PeerMesh({
            iceServers: voice.ice_servers,
            signal: (event, payload) => this.send(event, payload),
            onPeerFailed: (id) => this.handlePeerFailed(id),
            onAudioBlocked: () => this.audioBlockedNow(),
        });

        this.myCallId = null;
        this.outgoing = null;
        this.prompts = new Map();
        this.cooldowns = new Map();
        this.speaking = new Set();
        this.muted = false;
        this.detector = null;
        this.localStream = null;
        this.speakingSentAt = 0;
        this.speakingTimer = null;
        this.audioBlocked = false;
        this.wakeLock = null;

        window.addEventListener('pagehide', () => this.leaveCall());
        document.addEventListener('pointerdown', () => {
            if (this.audioBlocked) this.resumeAudio();
        });
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && this.myCallId) this.requestWakeLock();
        });
    }

    attach(session) {
        this.session = session;
    }

    hooks() {
        const guard = (handler) => (data) => {
            if (!data || !isId(data.id) || data.id === this.me.id || !this.inRoom(data.id)) {
                console.warn('whisper de voz inválido');
                return;
            }
            handler.call(this, data);
        };

        return {
            onEntered: () => this.onEntered(),
            onJoining: (member) => this.onJoining(member),
            onLeaving: (member) => this.handleDeparture(member.id),
            beforeLeave: () => this.beforeLeave(),
            whispers: {
                'call-request': guard(this.onCallRequest),
                'call-answer': guard(this.onCallAnswer),
                'call-cancel': guard(this.onCallCancel),
                'join-request': guard(this.onJoinRequest),
                'join-answer': guard(this.onJoinAnswer),
                'call-joined': guard(this.onCallJoined),
                'call-left': guard(this.onCallLeft),
                'call-roster': guard(this.onCallRoster),
                'call-speaking': guard(this.onCallSpeaking),
                'rtc-offer': guard(this.onRtcOffer),
                'rtc-answer': guard(this.onRtcAnswer),
            },
        };
    }

    send(event, payload) {
        this.session?.whisper(event, { id: this.me.id, ...payload });
    }

    nameOf(id) {
        return this.session?.avatars.get(id)?.member.name ?? 'Alguém';
    }

    inRoom(id) {
        return this.session?.avatars.has(id) ?? false;
    }

    cooldownLeft(key) {
        return Math.max(0, Math.ceil(((this.cooldowns.get(key) ?? 0) - Date.now()) / 1000));
    }

    startCooldown(key) {
        this.cooldowns.set(key, Date.now() + this.voice.retry_cooldown * 1000);
    }

    cardAction(member) {
        if (member.id === this.me.id) return null;

        const theirCall = this.registry.callOf(member.id);
        if (this.myCallId && theirCall?.id === this.myCallId) return null;
        if (this.myCallId) return { label: 'Conversar', disabled: true, hint: 'Você já está numa conversa' };
        if (this.outgoing) return { label: 'Chamando…', disabled: true, hint: null };

        if (theirCall) {
            const label = 'Pedir para participar';
            if (theirCall.members.size >= this.voice.max_participants) return { label, disabled: true, hint: 'Conversa cheia' };
            if (this.cooldownLeft(`call:${theirCall.id}`)) return { label, disabled: true, hint: 'Aguarde 1 min' };
            return { label, disabled: false, hint: null, onClick: () => this.requestJoin(member) };
        }

        if (this.cooldownLeft(`user:${member.id}`)) return { label: 'Conversar', disabled: true, hint: 'Aguarde 1 min' };
        return { label: 'Conversar', disabled: false, hint: null, onClick: () => this.requestCall(member) };
    }

    async ensureMicrophone() {
        if (this.localStream) return true;
        try {
            this.localStream = await getMicrophone();
            this.localStream.getAudioTracks().forEach((track) => {
                track.enabled = !this.muted;
            });
            this.mesh.setLocalStream(this.localStream);
            return true;
        } catch (error) {
            this.ui.showMicError(micErrorMessage(error, platformOf(navigator.userAgent, navigator.maxTouchPoints)));
            return false;
        }
    }

    // Microfone pedido para um pedido que não virou call: libera para não ficar aceso.
    releaseIdleMicrophone() {
        if (this.myCallId || this.outgoing || !this.localStream) return;
        this.localStream.getTracks().forEach((track) => track.stop());
        this.localStream = null;
        this.mesh.setLocalStream(null);
    }

    async requestCall(member) {
        const action = this.cardAction(member);
        if (!action || action.disabled) return;
        if (this.registry.isInCall(member.id)) return this.requestJoin(member);
        if (!(await this.ensureMicrophone())) return;
        if (this.outgoing || this.myCallId || !this.inRoom(member.id)) return;

        const requestId = newRequestId(this.me.id);
        this.outgoing = {
            requestId,
            kind: 'call',
            to: member.id,
            callId: null,
            timer: setTimeout(() => this.expireOutgoing(), this.voice.request_timeout * 1000),
        };
        this.send('call-request', { to: member.id, requestId });
        this.ui.showOutgoing({ text: `Chamando ${member.name}…`, onCancel: () => this.cancelOutgoing() });
        this.onChange();
    }

    async requestJoin(member) {
        const call = this.registry.callOf(member.id);
        if (!call || this.myCallId || this.outgoing) return;
        if (call.members.size >= this.voice.max_participants || this.cooldownLeft(`call:${call.id}`)) return;
        if (!(await this.ensureMicrophone())) return;
        if (this.outgoing || this.myCallId) return;

        const requestId = newRequestId(this.me.id);
        this.outgoing = {
            requestId,
            kind: 'join',
            to: null,
            callId: call.id,
            timer: setTimeout(() => this.expireOutgoing(), this.voice.request_timeout * 1000),
        };
        this.send('join-request', { callId: call.id, requestId });
        this.ui.showOutgoing({ text: 'Pedindo para participar…', onCancel: () => this.cancelOutgoing() });
        this.onChange();
    }

    clearOutgoing() {
        if (!this.outgoing) return null;
        const outgoing = this.outgoing;
        clearTimeout(outgoing.timer);
        this.outgoing = null;
        this.ui.closeOutgoing();
        return outgoing;
    }

    cancelOutgoing() {
        const outgoing = this.clearOutgoing();
        if (!outgoing) return;
        this.send('call-cancel', { requestId: outgoing.requestId, to: outgoing.to, callId: outgoing.callId });
        this.releaseIdleMicrophone();
        this.onChange();
    }

    expireOutgoing(silent = false) {
        const outgoing = this.clearOutgoing();
        if (!outgoing) return;
        this.send('call-cancel', { requestId: outgoing.requestId, to: outgoing.to, callId: outgoing.callId });
        if (!silent) {
            this.ui.toast(outgoing.kind === 'call' ? `${this.nameOf(outgoing.to)} não respondeu.` : 'Ninguém respondeu ao pedido.');
        }
        this.releaseIdleMicrophone();
        this.onChange();
    }

    openPrompt(requestId, kind, from, callId) {
        const timer = setTimeout(() => this.closePrompt(requestId), this.voice.request_timeout * 1000);
        this.prompts.set(requestId, { requestId, kind, from, callId, timer });
        this.ui.showIncoming({
            requestId,
            kind,
            fromName: this.nameOf(from),
            seconds: this.voice.request_timeout,
            onAccept: () => this.answerPrompt(requestId, true),
            onDecline: () => this.answerPrompt(requestId, false),
        });
    }

    closePrompt(requestId) {
        const prompt = this.prompts.get(requestId);
        if (!prompt) return null;
        clearTimeout(prompt.timer);
        this.prompts.delete(requestId);
        this.ui.closeIncoming(requestId);
        return prompt;
    }

    onCallRequest({ id, to, requestId }) {
        if (to !== this.me.id || !isKey(requestId)) return;

        if (this.myCallId) {
            this.send('call-answer', { to: id, requestId, accepted: false, busyCallId: this.myCallId });
            return;
        }

        if (this.outgoing?.kind === 'call' && this.outgoing.to === id) {
            if (CallRegistry.shouldAutoAcceptCrossed(this.me.id, id)) {
                this.clearOutgoing();
                this.acceptCall(id, requestId);
            }
            return;
        }

        this.openPrompt(requestId, 'call', id, null);
    }

    onCallAnswer({ id, to, requestId, accepted, callId, busyCallId, reason }) {
        if (to !== this.me.id || !isKey(requestId)) return;

        if (this.outgoing?.requestId !== requestId) {
            if (accepted === true && isKey(callId)) this.send('call-left', { callId });
            return;
        }

        this.clearOutgoing();

        if (accepted === true && isKey(callId)) {
            this.joinCallLocally(callId, [id, this.me.id]);
        } else if (isKey(busyCallId)) {
            const member = this.session.avatars.get(id)?.member;
            if (member) this.requestJoin(member);
        } else {
            this.startCooldown(`user:${id}`);
            this.ui.toast(reason === 'mic' ? `${this.nameOf(id)} não conseguiu ligar o microfone.` : `${this.nameOf(id)} recusou a conversa.`);
            this.releaseIdleMicrophone();
        }
        this.onChange();
    }

    onCallCancel({ requestId }) {
        if (isKey(requestId)) this.closePrompt(requestId);
    }

    onJoinRequest({ id, callId, requestId }) {
        if (!isKey(callId) || !isKey(requestId) || callId !== this.myCallId) return;

        const call = this.registry.calls.get(callId);
        if (call.members.size >= this.voice.max_participants) {
            if (this.registry.rosterKeeper(callId) === this.me.id) {
                this.send('join-answer', { to: id, requestId, accepted: false, callId, reason: 'full' });
            }
            return;
        }

        this.openPrompt(requestId, 'join', id, callId);
    }

    onJoinAnswer({ to, requestId, accepted, callId, reason }) {
        if (!isKey(requestId)) return;

        // A primeira resposta encerra o pedido para todos os participantes.
        this.closePrompt(requestId);

        if (to !== this.me.id || this.outgoing?.requestId !== requestId || !isKey(callId)) return;
        this.clearOutgoing();

        if (accepted === true) {
            const known = [...(this.registry.calls.get(callId)?.members ?? [])];
            this.send('call-joined', { callId });
            this.joinCallLocally(callId, [...known, this.me.id]);
        } else {
            this.startCooldown(`call:${callId}`);
            this.ui.toast(reason === 'full' ? 'A conversa está cheia.' : 'Seu pedido para participar foi recusado.');
            this.releaseIdleMicrophone();
        }
        this.onChange();
    }

    onCallJoined({ id, callId }) {
        if (!isKey(callId)) return;
        this.registry.addMember(callId, id);

        if (this.myCallId === callId) {
            this.ui.toast(`${this.nameOf(id)} entrou na conversa.`);
            if (CallRegistry.shouldOffer(this.me.id, id)) this.mesh.connect(id);
            this.refreshPanel();
        }
        this.onChange();
    }

    onCallLeft({ id, callId }) {
        if (isKey(callId)) this.handleDeparture(id);
    }

    onCallRoster({ callId, members }) {
        if (!isKey(callId) || !Array.isArray(members) || members.length > this.voice.max_participants) return;
        if (!members.every(isId) || callId === this.myCallId) return;

        // Só quem está no quarto; e nunca eu, já que esta não é a minha call.
        this.registry.setRoster(callId, members.filter((m) => m !== this.me.id && this.inRoom(m)));
        this.onChange();
    }

    onCallSpeaking({ id, on }) {
        if (on === true && this.registry.isInCall(id)) this.speaking.add(id);
        else this.speaking.delete(id);
        if (this.registry.callOf(id)?.id === this.myCallId) this.refreshPanel();
    }

    onRtcOffer({ id, to, sdp }) {
        if (to !== this.me.id || !isSdp(sdp) || !this.myCallId) return;
        if (this.registry.callOf(id)?.id !== this.myCallId) return;
        this.mesh.handleOffer(id, sdp);
    }

    onRtcAnswer({ id, to, sdp }) {
        if (to !== this.me.id || !isSdp(sdp)) return;
        this.mesh.handleAnswer(id, sdp);
    }

    async answerPrompt(requestId, accepted) {
        const prompt = this.closePrompt(requestId);
        if (!prompt) return;

        if (prompt.kind === 'call') {
            if (accepted) await this.acceptCall(prompt.from, requestId);
            else this.send('call-answer', { to: prompt.from, requestId, accepted: false });
        } else if (prompt.callId === this.myCallId) {
            this.send('join-answer', { to: prompt.from, requestId, accepted, callId: prompt.callId });
        }
        this.onChange();
    }

    async acceptCall(fromId, requestId) {
        if (!(await this.ensureMicrophone())) {
            this.send('call-answer', { to: fromId, requestId, accepted: false, reason: 'mic' });
            return;
        }
        if (!this.inRoom(fromId) || this.myCallId) {
            this.releaseIdleMicrophone();
            return;
        }

        const callId = newCallId(this.me.id);
        this.send('call-answer', { to: fromId, requestId, accepted: true, callId });
        this.joinCallLocally(callId, [this.me.id, fromId]);
        this.send('call-roster', { callId, members: [this.me.id, fromId] });
    }

    joinCallLocally(callId, members) {
        this.registry.setRoster(callId, members);
        this.myCallId = callId;

        for (const member of members) {
            if (member !== this.me.id && CallRegistry.shouldOffer(this.me.id, member)) this.mesh.connect(member);
        }

        this.detector?.stop();
        this.detector = this.localStream ? createSpeakingDetector(this.localStream, (on) => this.setSpeaking(on)) : null;
        this.requestWakeLock();
        this.refreshPanel();
        this.onChange();
    }

    refreshPanel() {
        const call = this.myCallId ? this.registry.calls.get(this.myCallId) : null;
        if (!call) return;

        this.ui.showCallPanel({
            participants: [...call.members].map((id) => (id === this.me.id ? this.me : this.session.avatars.get(id)?.member ?? { id, name: 'Alguém' })),
            meId: this.me.id,
            muted: this.muted,
            speaking: this.speaking,
            onToggleMute: () => this.toggleMute(),
            onLeave: () => this.leaveCall(),
        });
    }

    setSpeaking(on) {
        const value = on && !this.muted;
        if (value) this.speaking.add(this.me.id);
        else this.speaking.delete(this.me.id);
        this.refreshPanel();

        // Último estado vence: envia no máximo 4 vezes por segundo.
        clearTimeout(this.speakingTimer);
        const wait = SPEAKING_INTERVAL - (performance.now() - this.speakingSentAt);
        const flush = () => {
            this.speakingSentAt = performance.now();
            if (this.myCallId) this.send('call-speaking', { on: this.speaking.has(this.me.id) });
        };
        if (wait <= 0) flush();
        else this.speakingTimer = setTimeout(flush, wait);
    }

    toggleMute() {
        this.muted = !this.muted;
        this.localStream?.getAudioTracks().forEach((track) => {
            track.enabled = !this.muted;
        });
        if (this.muted) this.setSpeaking(false);
        this.refreshPanel();
    }

    leaveCall() {
        if (!this.myCallId) return;
        this.send('call-left', { callId: this.myCallId });
        this.endLocalCall();
    }

    endLocalCall(message) {
        this.mesh.closeAll();
        this.detector?.stop();
        this.detector = null;
        this.localStream = null;
        clearTimeout(this.speakingTimer);
        this.registry.removeMember(this.me.id);
        this.myCallId = null;
        this.speaking.delete(this.me.id);
        this.releaseWakeLock();
        this.audioBlocked = false;
        this.ui.hideAudioBlocked();
        this.ui.hideCallPanel();
        if (message) this.ui.toast(message);
        this.onChange();
    }

    // Conexão caiu (ex.: celular em segundo plano): a call local acabou; a pessoa pede de novo se quiser.
    connectionLost() {
        if (this.myCallId) this.endLocalCall('A conversa caiu enquanto você estava fora. Peça para entrar de novo.');
    }

    audioBlockedNow() {
        this.audioBlocked = true;
        this.ui.showAudioBlocked(() => this.resumeAudio());
    }

    resumeAudio() {
        this.mesh.resumeAudio().then((ok) => {
            if (ok) {
                this.audioBlocked = false;
                this.ui.hideAudioBlocked();
            }
        });
    }

    // Tela acesa durante a call; o navegador solta o lock quando a página fica oculta.
    requestWakeLock() {
        if (!navigator.wakeLock || this.wakeLock) return;
        navigator.wakeLock
            .request('screen')
            .then((lock) => {
                this.wakeLock = lock;
                lock.addEventListener('release', () => {
                    if (this.wakeLock === lock) this.wakeLock = null;
                });
            })
            .catch(() => {});
    }

    releaseWakeLock() {
        this.wakeLock?.release().catch(() => {});
        this.wakeLock = null;
    }

    handleDeparture(id) {
        const result = this.registry.removeMember(id);
        this.speaking.delete(id);
        this.mesh.close(id);

        if (result && result.id === this.myCallId) {
            if (result.ended) this.endLocalCall('A conversa terminou.');
            else {
                this.ui.toast(`${this.nameOf(id)} saiu da conversa.`);
                this.refreshPanel();
            }
        } else if (result?.ended) {
            for (const member of result.members) this.speaking.delete(member);
        }

        for (const prompt of [...this.prompts.values()]) {
            if (prompt.from === id) this.closePrompt(prompt.requestId);
        }
        if (this.outgoing?.to === id) this.expireOutgoing(true);
        this.onChange();
    }

    handlePeerFailed(id) {
        this.ui.toast(`A conexão de áudio com ${this.nameOf(id)} caiu.`);
        this.handleDeparture(id);
    }

    onJoining() {
        for (const call of this.registry.calls.values()) {
            if (this.registry.rosterKeeper(call.id) === this.me.id) {
                this.send('call-roster', { callId: call.id, members: [...call.members] });
            }
        }
    }

    onEntered() {
        this.registry.clear();
        this.speaking.clear();
    }

    beforeLeave() {
        this.leaveCall();
        this.cancelOutgoing();
        for (const prompt of [...this.prompts.values()]) {
            this.closePrompt(prompt.requestId);
            if (prompt.kind === 'call') this.send('call-answer', { to: prompt.from, requestId: prompt.requestId, accepted: false });
        }
        this.registry.clear();
        this.speaking.clear();
    }

    decorations(userId) {
        return { inCall: this.registry.isInCall(userId), speaking: this.speaking.has(userId) };
    }
}
