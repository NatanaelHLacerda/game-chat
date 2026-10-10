// Ocupação global da república (canal de presença "republica") e regra "a aba nova assume".
export class RepublicPresence {
    constructor(me, { onChange, onUnknownResident, onTakeover, knownResident }) {
        this.me = me;
        this.onChange = onChange;
        this.onUnknownResident = onUnknownResident;
        this.onTakeover = onTakeover;
        this.knownResident = knownResident;
        this.tabId = Math.random().toString(36).slice(2) + Date.now().toString(36);
        this.online = new Map();
        this.locations = new Map();
        this.roomId = null;
        this.channel = null;
    }

    start(roomId) {
        this.roomId = roomId;

        this.channel = window.Echo.join('republica')
            .here((members) => {
                for (const member of members) this.online.set(member.id, member);
                this.whisper('takeover', { userId: this.me.id, tabId: this.tabId });
                this.announce(this.roomId);
            })
            .joining((member) => {
                this.online.set(member.id, member);
                this.announce(this.roomId);
                if (!this.knownResident(member.id)) this.onUnknownResident();
                this.onChange();
            })
            .leaving((member) => {
                this.online.delete(member.id);
                this.locations.delete(member.id);
                this.onChange();
            })
            .listenForWhisper('where', (data) => {
                if (!Number.isInteger(data?.id) || !Number.isInteger(data?.roomId) || data.id === this.me.id) return;
                this.locations.set(data.id, data.roomId);
                this.onChange();
            })
            .listenForWhisper('takeover', (data) => {
                if (data?.userId === this.me.id && data.tabId !== this.tabId) this.onTakeover();
            });
    }

    announce(roomId) {
        this.roomId = roomId;
        this.whisper('where', { id: this.me.id, roomId });
        this.onChange();
    }

    whisper(event, payload) {
        try {
            this.channel?.whisper(event, payload);
        } catch {
            // Sem conexão: será reenviado quando alguém entrar na república.
        }
    }

    // Map<roomId, member[]> incluindo o próprio morador.
    occupancy() {
        const byRoom = new Map();
        const add = (roomId, member) => {
            if (!byRoom.has(roomId)) byRoom.set(roomId, []);
            byRoom.get(roomId).push(member);
        };

        if (this.roomId !== null) add(this.roomId, this.me);
        for (const [userId, roomId] of this.locations) {
            const member = this.online.get(userId);
            if (member) add(roomId, member);
        }

        return byRoom;
    }
}
