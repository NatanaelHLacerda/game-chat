// DOM da conversa por voz; nenhuma regra de negócio aqui.
function button(label, className, onClick) {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = className;
    el.textContent = label;
    el.addEventListener('click', onClick);
    return el;
}

export class CallUi {
    constructor() {
        this.prompts = document.getElementById('call-prompts');
        this.outgoing = document.getElementById('call-outgoing');
        this.outgoingText = document.getElementById('call-outgoing-text');
        this.outgoingCancel = document.getElementById('btn-cancel-call');
        this.panel = document.getElementById('call-panel');
        this.participants = document.getElementById('call-participants');
        this.muteButton = document.getElementById('btn-mute');
        this.leaveButton = document.getElementById('btn-leave-call');
        this.micError = document.getElementById('mic-error');
        this.micErrorText = document.getElementById('mic-error-text');
        this.toasts = document.getElementById('call-toasts');
        this.audioUnlock = document.getElementById('audio-unlock');
        this.countdowns = new Map();
        this.handlers = {};

        document.getElementById('btn-mic-ok').addEventListener('click', () => this.micError.classList.add('hidden'));
        this.outgoingCancel.addEventListener('click', () => this.handlers.onCancel?.());
        this.muteButton.addEventListener('click', () => this.handlers.onToggleMute?.());
        this.leaveButton.addEventListener('click', () => this.handlers.onLeave?.());
        this.audioUnlock.addEventListener('click', () => this.handlers.onAudioUnlock?.());
    }

    showIncoming({ requestId, kind, fromName, seconds, onAccept, onDecline }) {
        this.closeIncoming(requestId);

        const prompt = document.createElement('section');
        prompt.className = 'window call-prompt';
        prompt.dataset.requestId = requestId;

        const title = document.createElement('div');
        title.className = 'titlebar';
        title.textContent = kind === 'join' ? 'Request to join' : 'Call request';

        const body = document.createElement('div');
        body.className = 'content';
        const text = document.createElement('p');
        text.textContent = kind === 'join' ? `${fromName} wants to join the call` : `${fromName} wants to talk with you`;
        const countdown = document.createElement('p');
        countdown.className = 'countdown';
        const actions = document.createElement('div');
        actions.className = 'actions';
        actions.append(button('Recusar', 'btn', onDecline), button('Aceitar', 'btn btn-primary', onAccept));
        body.append(text, countdown, actions);
        prompt.append(title, body);
        this.prompts.append(prompt);

        let left = seconds;
        countdown.textContent = `${left} s…`;
        this.countdowns.set(requestId, setInterval(() => {
            left = Math.max(0, left - 1);
            countdown.textContent = `${left} s…`;
        }, 1000));
    }

    closeIncoming(requestId) {
        clearInterval(this.countdowns.get(requestId));
        this.countdowns.delete(requestId);
        [...this.prompts.children].find((el) => el.dataset.requestId === requestId)?.remove();
    }

    showOutgoing({ text, onCancel }) {
        this.handlers.onCancel = onCancel;
        this.outgoingText.textContent = text;
        this.outgoing.classList.remove('hidden');
    }

    closeOutgoing() {
        this.outgoing.classList.add('hidden');
    }

    showCallPanel({ participants, meId, muted, speaking, onToggleMute, onLeave }) {
        this.handlers.onToggleMute = onToggleMute;
        this.handlers.onLeave = onLeave;
        this.participants.replaceChildren(...participants.map((member) => {
            const item = document.createElement('li');
            item.textContent = member.id === meId ? `${member.name} (you)` : member.name;
            item.classList.toggle('speaking', speaking.has(member.id));
            return item;
        }));
        this.muteButton.textContent = muted ? 'Unmute' : 'Mute';
        this.panel.classList.remove('hidden');
    }

    hideCallPanel() {
        this.panel.classList.add('hidden');
    }

    showMicError(message) {
        this.micErrorText.textContent = message;
        this.micError.classList.remove('hidden');
    }

    showAudioBlocked(onTap) {
        this.handlers.onAudioUnlock = onTap;
        this.audioUnlock.classList.remove('hidden');
    }

    hideAudioBlocked() {
        this.audioUnlock.classList.add('hidden');
    }

    toast(text) {
        const el = document.createElement('div');
        el.className = 'window toast';
        el.textContent = text;
        this.toasts.append(el);
        setTimeout(() => el.remove(), 4000);
    }
}
