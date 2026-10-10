import { EMOTE_RECEIVE_MS, WAVE_MS, canEmote, isDance } from './animation';
import { isEmote } from './emotes';
import { buildGrid, findPath, nearestFree } from './pathfinding';

const SPEED = 2.5; // tiles por segundo
const MOVE_INTERVAL = 250; // no máximo 4 whispers "move" por segundo

const isInt = (n) => Number.isInteger(n);
const isTile = (t) => t && isInt(t.x) && isInt(t.y);

// Presença e movimento dentro de um quarto (canal de presença "quarto.{id}").
export class RoomSession {
    // hooks: { onEntered, onJoining, onLeaving, beforeLeave, whispers: { evento: handler } }
    constructor(me, furnitureTypes, onChange, hooks = {}) {
        this.me = me;
        this.furnitureTypes = furnitureTypes;
        this.onChange = onChange;
        this.hooks = hooks;
        this.roomId = null;
        this.channel = null;
        this.avatars = new Map();
        this.lastMoveAt = 0;
        this.pendingTarget = null;
        this.moveTimer = null;
    }

    enter(roomId, layout) {
        this.roomId = roomId;
        this.layout = layout;
        this.grid = buildGrid(layout, this.furnitureTypes);
        this.door = { x: layout.door[0], y: layout.door[1] };
        this.avatars.clear();

        this.channel = window.Echo.join(`quarto.${roomId}`)
            .here((members) => {
                for (const member of members) {
                    if (member.id !== this.me.id) this.addAvatar(member, this.door);
                }
                const spawn = nearestFree(this.grid, this.door, (t) => this.isOccupiedByOthers(t));
                this.addAvatar(this.me, spawn);
                this.whisper('state', this.stateOf(this.mine()));
                this.hooks.onEntered?.();
                this.onChange();
            })
            .joining((member) => {
                this.addAvatar(member, this.door);
                const mine = this.mine();
                if (mine) this.whisper('state', this.stateOf(mine));
                this.hooks.onJoining?.(member);
                this.onChange();
            })
            .leaving((member) => {
                this.hooks.onLeaving?.(member);
                this.avatars.delete(member.id);
                this.onChange();
            })
            .listenForWhisper('state', (data) => this.receiveState(data))
            .listenForWhisper('move', (data) => this.receiveMove(data))
            .listenForWhisper('action', (data) => this.receiveAction(data))
            .listenForWhisper('emote', (data) => this.receiveEmote(data));

        for (const [event, handler] of Object.entries(this.hooks.whispers ?? {})) {
            this.channel.listenForWhisper(event, (data) => {
                try {
                    handler(data);
                } catch (error) {
                    console.warn(`whisper ${event} ignorado`, error);
                }
            });
        }
    }

    leave() {
        if (this.roomId !== null) {
            this.hooks.beforeLeave?.();
            window.Echo.leave(`quarto.${this.roomId}`);
        }
        clearTimeout(this.moveTimer);
        this.roomId = null;
        this.channel = null;
        this.pendingTarget = null;
        this.avatars.clear();
    }

    mine() {
        return this.avatars.get(this.me.id);
    }

    occupants() {
        return [...this.avatars.values()].map((a) => a.member);
    }

    addAvatar(member, tile) {
        this.avatars.set(member.id, {
            member,
            pos: { x: tile.x, y: tile.y },
            render: { x: tile.x, y: tile.y },
            path: [],
            progress: 0,
            dir: 1,
            back: false,
            sitting: false,
            walkPhase: 0,
            dance: 0,
            waveUntil: 0,
            emote: null,
            lastEmoteAt: -Infinity,
        });
    }

    // Tile onde o avatar vai terminar (destino final ou posição atual).
    finalTile(avatar) {
        return avatar.path.length ? avatar.path[avatar.path.length - 1] : avatar.pos;
    }

    isOccupiedByOthers(tile) {
        for (const avatar of this.avatars.values()) {
            if (avatar.member.id === this.me.id) continue;
            const end = this.finalTile(avatar);
            if (end.x === tile.x && end.y === tile.y) return true;
        }
        return false;
    }

    stateOf(avatar) {
        return { id: this.me.id, x: avatar.pos.x, y: avatar.pos.y, dir: avatar.dir, dance: avatar.dance };
    }

    // API pública: também usada pelo CallManager para a sinalização da voz.
    whisper(event, payload) {
        try {
            this.channel?.whisper(event, payload);
        } catch {
            // Sem conexão: o próximo movimento ou entrada no quarto ressincroniza.
        }
    }

    moveTo(tile) {
        if (!this.mine() || !isTile(tile)) return;
        this.pendingTarget = tile;

        const wait = MOVE_INTERVAL - (performance.now() - this.lastMoveAt);
        if (wait <= 0) {
            this.flushMove();
        } else if (!this.moveTimer) {
            this.moveTimer = setTimeout(() => this.flushMove(), wait);
        }
    }

    flushMove() {
        this.moveTimer = null;
        const target = this.pendingTarget;
        const mine = this.mine();
        this.pendingTarget = null;
        if (!target || !mine) return;

        const stepping = mine.path.length > 0;
        const origin = stepping ? mine.path[0] : mine.pos;
        const path = findPath(this.grid, origin, target, (t) => this.isOccupiedByOthers(t));
        if (!path) return;

        this.applyPath(mine, origin, path);
        this.lastMoveAt = performance.now();
        this.whisper('move', { id: this.me.id, from: { x: origin.x, y: origin.y }, to: { x: target.x, y: target.y } });
    }

    // Se o avatar já está indo para `origin`, mantém o passo atual; senão recomeça de `origin`.
    applyPath(avatar, origin, path) {
        const next = avatar.path[0];
        if (next && next.x === origin.x && next.y === origin.y) {
            avatar.path = [next, ...path];
        } else {
            avatar.pos = { x: origin.x, y: origin.y };
            avatar.progress = 0;
            avatar.path = path;
        }
        avatar.sitting = false;
        avatar.dance = 0;
    }

    // Dança do próprio avatar (0 = parar); sentado não dança.
    dance(value) {
        const mine = this.mine();
        if (!mine || mine.sitting || !isDance(value)) return false;
        mine.dance = value;
        this.whisper('action', { id: this.me.id, kind: 'dance', value });
        return true;
    }

    wave() {
        const mine = this.mine();
        if (!mine) return;
        mine.waveUntil = performance.now() + WAVE_MS;
        this.whisper('action', { id: this.me.id, kind: 'wave' });
    }

    // No máximo 1 emote a cada 2 s; "oi" também acena.
    emote(type) {
        const mine = this.mine();
        const now = performance.now();
        if (!mine || !isEmote(type) || !canEmote(mine.lastEmoteAt, now)) return false;
        mine.emote = { type, at: now };
        mine.lastEmoteAt = now;
        this.whisper('emote', { id: this.me.id, type });
        if (type === 'oi') this.wave();
        return true;
    }

    receiveAction(data) {
        const avatar = this.avatars.get(data?.id);
        if (!avatar || data.id === this.me.id) return;
        if (data.kind === 'dance' && isDance(data.value) && !avatar.sitting) avatar.dance = data.value;
        if (data.kind === 'wave') avatar.waveUntil = performance.now() + WAVE_MS;
    }

    receiveEmote(data) {
        const avatar = this.avatars.get(data?.id);
        const now = performance.now();
        if (!avatar || data.id === this.me.id || !isEmote(data.type) || !canEmote(avatar.lastEmoteAt, now, EMOTE_RECEIVE_MS)) return;
        avatar.emote = { type: data.type, at: now };
        avatar.lastEmoteAt = now;
    }

    receiveState(data) {
        const avatar = this.avatars.get(data?.id);
        if (!avatar || data.id === this.me.id || !isInt(data.x) || !isInt(data.y) || !this.grid.isFloor(data.x, data.y)) return;

        avatar.pos = { x: data.x, y: data.y };
        avatar.render = { x: data.x, y: data.y };
        avatar.path = [];
        avatar.progress = 0;
        avatar.dir = data.dir === -1 ? -1 : 1;
        avatar.sitting = this.grid.seat(data.x, data.y);
        avatar.dance = !avatar.sitting && isDance(data.dance) ? data.dance : 0;
    }

    receiveMove(data) {
        const avatar = this.avatars.get(data?.id);
        if (!avatar || data.id === this.me.id || !isTile(data.from) || !isTile(data.to)) return;
        if (!this.grid.walkable(data.from.x, data.from.y)) return;

        // O remetente já validou a ocupação; aqui só recalculamos o mesmo caminho.
        const path = findPath(this.grid, data.from, data.to);
        if (path) this.applyPath(avatar, data.from, path);
    }

    update(dt) {
        for (const avatar of this.avatars.values()) {
            if (!avatar.path.length) {
                avatar.render = { ...avatar.pos };
                continue;
            }

            avatar.progress += dt * SPEED;
            avatar.walkPhase += dt * 12;

            while (avatar.path.length && avatar.progress >= 1) {
                avatar.pos = avatar.path.shift();
                avatar.progress -= 1;
            }

            const next = avatar.path[0];
            if (!next) {
                avatar.progress = 0;
                avatar.render = { ...avatar.pos };
                avatar.sitting = this.grid.seat(avatar.pos.x, avatar.pos.y);
                if (avatar.sitting) avatar.dance = 0;
                continue;
            }

            const dx = next.x - avatar.pos.x;
            const dy = next.y - avatar.pos.y;
            if (dx - dy !== 0) avatar.dir = dx - dy > 0 ? 1 : -1;
            avatar.back = dx + dy < 0;
            avatar.render = {
                x: avatar.pos.x + dx * avatar.progress,
                y: avatar.pos.y + dy * avatar.progress,
            };
        }
    }
}
