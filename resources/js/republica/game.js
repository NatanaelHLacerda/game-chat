import { loadAtlas } from './atlas';
import { AvatarCard } from './avatar-card';
import { fitCamera, toTile } from './iso';
import { renderNavigator } from './navigator';
import { RepublicPresence } from './republic-presence';
import { avatarFoot, drawScene } from './renderer';
import { RoomSession } from './room-session';
import { bindCloseButtons, renderPeople, watchConnection } from './ui';
import { CallManager } from './voice/call-manager';
import { CallUi } from './voice/call-ui';

const BOTTOM_BAR = 52;
const HIT_W = 28;
const HIT_H = 64;

export class Game {
    constructor(bootstrap) {
        this.data = bootstrap;
        this.me = bootstrap.me;
        this.rooms = bootstrap.rooms;
        this.currentRoomId = null;
        this.mouse = null;
        this.atlas = null;

        this.canvas = document.getElementById('game');
        this.ctx = this.canvas.getContext('2d');
        this.navigatorEl = document.getElementById('navigator');
        this.roomList = document.getElementById('room-list');
        this.roomTitle = document.getElementById('room-title');
        this.roomPeople = document.getElementById('room-people');

        this.card = new AvatarCard(bootstrap.languages);
        this.calls = new CallManager(this.me, bootstrap.voice, new CallUi(), () => this.refreshPanels());
        this.session = new RoomSession(this.me, bootstrap.furniture_types, () => this.refreshPanels(), this.calls.hooks());
        this.calls.attach(this.session);
        this.presence = new RepublicPresence(this.me, {
            onChange: () => this.refreshPanels(),
            onUnknownResident: () => this.refreshRooms(),
            onTakeover: () => this.takeover(),
            knownResident: (userId) => this.rooms.some((room) => room.owner_id === userId),
        });
    }

    start() {
        loadAtlas().then((atlas) => (this.atlas = atlas));
        bindCloseButtons();
        watchConnection(document.getElementById('status'));
        this.bindUi();
        this.resize();

        this.presence.start(this.data.common_room_id);
        this.goTo(this.data.common_room_id);

        let last = performance.now();
        const frame = (now) => {
            const dt = Math.min(0.1, (now - last) / 1000);
            last = now;
            try {
                this.session.update(dt);
                this.draw();
            } catch (error) {
                console.error(error);
            }
            requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
    }

    goTo(roomId) {
        if (roomId === this.currentRoomId) return;
        const room = this.rooms.find((r) => r.id === roomId);
        if (!room) return;

        this.session.leave();
        this.card.close();
        this.currentRoomId = roomId;
        this.layout = this.data.layouts[room.layout];
        this.session.enter(roomId, this.layout);
        this.presence.announce(roomId);
        this.roomTitle.textContent = room.name;
        this.camera = fitCamera(this.layout, this.width, this.height, BOTTOM_BAR);
        this.refreshPanels();
    }

    async refreshRooms() {
        try {
            const response = await fetch('/quartos', { headers: { Accept: 'application/json' } });
            if (response.ok) {
                this.rooms = await response.json();
                this.refreshPanels();
            }
        } catch {
            // Mantém a lista atual; a próxima entrada de morador tenta de novo.
        }
    }

    refreshPanels() {
        if (this.card.isOpen() && this.card.member) this.card.refresh(this.calls.cardAction(this.card.member));
        renderPeople(this.roomPeople, this.session.occupants(), this.me.id);
        renderNavigator(this.roomList, {
            rooms: this.rooms,
            occupancy: this.presence.occupancy(),
            currentRoomId: this.currentRoomId,
            languages: this.data.languages,
            onSelect: (roomId) => this.goTo(roomId),
        });
    }

    takeover() {
        this.calls.leaveCall();
        this.session.leave();
        window.Echo.leave('republica');
        window.Echo.disconnect();
        document.getElementById('takeover').classList.remove('hidden');
    }

    bindUi() {
        window.addEventListener('resize', () => this.resize());
        document.getElementById('btn-common').addEventListener('click', () => this.goTo(this.data.common_room_id));
        document.getElementById('btn-home').addEventListener('click', () => this.goTo(this.data.my_room_id));
        document.getElementById('btn-nav').addEventListener('click', () => this.navigatorEl.classList.toggle('hidden'));
        document.getElementById('btn-use-here').addEventListener('click', () => window.location.reload());

        this.canvas.addEventListener('pointermove', (event) => {
            this.mouse = { x: event.clientX, y: event.clientY };
        });
        this.canvas.addEventListener('pointerleave', () => {
            this.mouse = null;
        });
        this.canvas.addEventListener('click', (event) => this.handleClick(event.clientX, event.clientY));
    }

    // Avatar sob o ponto de tela; com sobreposição, vence o mais à frente.
    avatarAt(px, py) {
        let hit = null;
        for (const avatar of this.session.avatars.values()) {
            const foot = avatarFoot(avatar, this.camera, this.session.grid, this.layout);
            const inside = Math.abs(px - foot.x) <= HIT_W / 2 && py <= foot.y && py >= foot.y - HIT_H;
            const depth = avatar.render.x + avatar.render.y;
            if (inside && (!hit || depth > hit.depth)) hit = { avatar, depth };
        }
        return hit?.avatar ?? null;
    }

    handleClick(px, py) {
        if (!this.session.grid) return;
        const avatar = this.avatarAt(px, py);
        if (avatar) {
            this.card.open(avatar.member, { x: px, y: py }, this.calls.cardAction(avatar.member));
            return;
        }
        this.session.moveTo(toTile(px, py, this.camera));
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = Math.round(this.width * dpr);
        this.canvas.height = Math.round(this.height * dpr);
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.ctx.imageSmoothingEnabled = false;
        if (this.layout) this.camera = fitCamera(this.layout, this.width, this.height, BOTTOM_BAR);
    }

    draw() {
        if (!this.layout || !this.session.grid) return;
        const hoverAvatar = this.mouse ? this.avatarAt(this.mouse.x, this.mouse.y) : null;

        drawScene(this.ctx, {
            layout: this.layout,
            camera: this.camera,
            grid: this.session.grid,
            avatars: [...this.session.avatars.values()],
            hoverTile: this.mouse && !hoverAvatar ? toTile(this.mouse.x, this.mouse.y, this.camera) : null,
            hoverAvatarId: hoverAvatar?.member.id ?? null,
            width: this.width,
            height: this.height,
            decorate: (id) => this.calls.decorations(id),
            atlas: this.atlas,
            time: performance.now() / 1000,
        });
    }
}
