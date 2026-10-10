const MAX_SDP = 9000;
const ICE_WAIT_MS = 2000;

// Uma RTCPeerConnection de áudio por participante remoto. ICE sem trickle:
// a SDP só é enviada depois de reunir os candidatos (ou 2 s).
export class PeerMesh {
    constructor({ iceServers, signal, onPeerFailed, onAudioBlocked }) {
        this.iceServers = iceServers;
        this.signal = signal;
        this.onPeerFailed = onPeerFailed;
        this.onAudioBlocked = onAudioBlocked;
        this.peers = new Map();
        this.audios = new Map();
        this.localStream = null;
    }

    setLocalStream(stream) {
        this.localStream = stream;
    }

    createPeer(remoteId) {
        this.close(remoteId);
        const pc = new RTCPeerConnection({ iceServers: this.iceServers });
        this.localStream?.getTracks().forEach((track) => pc.addTrack(track, this.localStream));

        pc.ontrack = (event) => {
            let audio = this.audios.get(remoteId);
            if (!audio) {
                audio = document.createElement('audio');
                audio.autoplay = true;
                document.getElementById('voice-audio')?.append(audio);
                this.audios.set(remoteId, audio);
            }
            audio.srcObject = event.streams[0];
            audio.play().catch((error) => {
                if (error?.name === 'NotAllowedError') this.onAudioBlocked?.();
            });
        };
        pc.onconnectionstatechange = () => {
            if (pc.connectionState === 'failed') this.onPeerFailed(remoteId);
        };

        this.peers.set(remoteId, pc);
        return pc;
    }

    // Tenta tocar de novo todos os áudios (o iOS só libera depois de um gesto); true se todos tocaram.
    async resumeAudio() {
        const results = await Promise.allSettled([...this.audios.values()].map((audio) => audio.play()));
        return results.every((result) => result.status === 'fulfilled');
    }

    waitForIce(pc) {
        if (pc.iceGatheringState === 'complete') return Promise.resolve();
        return new Promise((resolve) => {
            const timer = setTimeout(resolve, ICE_WAIT_MS);
            pc.addEventListener('icegatheringstatechange', () => {
                if (pc.iceGatheringState === 'complete') {
                    clearTimeout(timer);
                    resolve();
                }
            });
        });
    }

    sendDescription(event, remoteId, pc) {
        const sdp = pc.localDescription?.sdp ?? '';
        if (!sdp || sdp.length > MAX_SDP) {
            this.onPeerFailed(remoteId);
            return;
        }
        this.signal(event, { to: remoteId, sdp });
    }

    async connect(remoteId) {
        if (this.peers.has(remoteId)) return;
        const pc = this.createPeer(remoteId);
        try {
            await pc.setLocalDescription(await pc.createOffer());
            await this.waitForIce(pc);
            if (this.peers.get(remoteId) === pc) this.sendDescription('rtc-offer', remoteId, pc);
        } catch (error) {
            console.warn('falha ao criar oferta de áudio', error.name);
            this.onPeerFailed(remoteId);
        }
    }

    async handleOffer(from, sdp) {
        const pc = this.createPeer(from);
        try {
            await pc.setRemoteDescription({ type: 'offer', sdp });
            await pc.setLocalDescription(await pc.createAnswer());
            await this.waitForIce(pc);
            if (this.peers.get(from) === pc) this.sendDescription('rtc-answer', from, pc);
        } catch (error) {
            console.warn('falha ao responder oferta de áudio', error.name);
            this.onPeerFailed(from);
        }
    }

    async handleAnswer(from, sdp) {
        const pc = this.peers.get(from);
        if (!pc || pc.signalingState !== 'have-local-offer') return;
        try {
            await pc.setRemoteDescription({ type: 'answer', sdp });
        } catch (error) {
            console.warn('falha ao aplicar resposta de áudio', error.name);
            this.onPeerFailed(from);
        }
    }

    close(remoteId) {
        this.peers.get(remoteId)?.close();
        this.peers.delete(remoteId);
        const audio = this.audios.get(remoteId);
        if (audio) {
            audio.pause();
            audio.srcObject = null;
            audio.remove();
            this.audios.delete(remoteId);
        }
    }

    closeAll() {
        for (const remoteId of [...this.peers.keys()]) this.close(remoteId);
        this.localStream?.getTracks().forEach((track) => track.stop());
        this.localStream = null;
    }
}
