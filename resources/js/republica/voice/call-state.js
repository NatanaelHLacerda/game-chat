// Estado puro das calls do quarto atual: sem DOM e sem rede (testável no Node).
export class CallRegistry {
    constructor() {
        this.calls = new Map();
    }

    callOf(userId) {
        for (const call of this.calls.values()) {
            if (call.members.has(userId)) return call;
        }
        return null;
    }

    isInCall(userId) {
        return this.callOf(userId) !== null;
    }

    // Um morador, uma call: quem aparece no roster sai de qualquer outra call.
    setRoster(callId, members) {
        const unique = [...new Set(members)];
        for (const userId of unique) {
            const other = this.callOf(userId);
            if (other && other.id !== callId) this.removeMember(userId);
        }

        if (unique.length < 2) {
            this.calls.delete(callId);
            return;
        }
        this.calls.set(callId, { id: callId, members: new Set(unique) });
    }

    addMember(callId, userId) {
        const other = this.callOf(userId);
        if (other && other.id !== callId) this.removeMember(userId);

        if (!this.calls.has(callId)) this.calls.set(callId, { id: callId, members: new Set() });
        const call = this.calls.get(callId);
        call.members.add(userId);
        return call;
    }

    removeMember(userId) {
        const call = this.callOf(userId);
        if (!call) return null;

        call.members.delete(userId);
        if (call.members.size < 2) {
            this.calls.delete(call.id);
            return { id: call.id, members: new Set(call.members), ended: true };
        }
        return { id: call.id, members: call.members, ended: false };
    }

    clear() {
        this.calls.clear();
    }

    // Guardião do roster: o membro de menor id.
    rosterKeeper(callId) {
        const call = this.calls.get(callId);
        return call ? Math.min(...call.members) : null;
    }

    // Em cada par da malha, o id maior envia a oferta WebRTC.
    static shouldOffer(me, other) {
        return me > other;
    }

    // Em pedidos cruzados, o id menor aceita automaticamente.
    static shouldAutoAcceptCrossed(me, other) {
        return me < other;
    }
}

export function newRequestId(userId) {
    return `${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function newCallId(userId) {
    return `${userId}-${Date.now()}`;
}
