import { loadAtlas } from './atlas';
import { DANCE_NAMES, DANCES } from './animation';
import { AvatarCard } from './avatar-card';
import { EMOTES } from './emotes';
import { createGestures } from './gestures';
import { toTile } from './iso';
import { renderNavigator } from './navigator';
import { RepublicPresence } from './republic-presence';
import { avatarFoot, drawScene } from './renderer';
import { RoomSession } from './room-session';
import { bindCloseButtons, renderPeople, watchConnection } from './ui';
import { CallManager } from './voice/call-manager';
import { CallUi } from './voice/call-ui';
import { MOBILE_QUERY, clampPan, computeCamera, defaultZoom, followPan, scaleOf, toWorld } from './view';

const HIT_W = 28;
const HIT_H = 64;
const TOUCH_TARGET = 44; // px CSS
const TAP_MARKER_MS = 600;

export class Game {
    constructor(bootstrap) {
        this.data = bootstrap;
        this.me = bootstrap.me;
        this.rooms = bootstrap.rooms;
        this.currentRoomId = null;
        this.mouse = null;
        this.atlas = null;
        this.mobileQuery = window.matchMedia(MOBILE_QUERY);
        this.zoom = 2;
        this.userZoom = false;
        this.pan = { x: 0, y: 0 };
        this.followPending = false;
        this.tapMarker = null;
        this.dropped = false;

        this.canvas = document.getElementById('game');
        this.ctx = this.canvas.getContext('2d');
        this.navigatorEl = document.getElementById('navigator');
        this.roomList = document.getElementById('room-list');
        this.roomTitle = document.getElementById('room-title');
        this.roomPeople = document.getElementById('room-people');
        this.roomInfo = document.getElementById('room-info');
        this.emotePicker = document.getElementById('emote-picker');
        this.dancePicker = document.getElementById('dance-picker');
        this.toolbar = document.getElementById('toolbar');
        this.moreMenu = document.getElementById('more-menu');
        this.moreButton = document.getElementById('btn-more');
        this.gestures = createGestures({
            onTap: (x, y, type) => this.handleTap(x, y, type),
            onPan: (dx, dy) => this.panBy(dx, dy),
            onPinch: (dir) => this.setZoom(dir === 'in' ? 2 : 1),
        });

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
        this.buildPickers();
        watchConnection(document.getElementById('status'));
        this.watchResume();
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
        if (this.mobileQuery.matches) this.navigatorEl.classList.add('hidden');
        this.userZoom = false;
        this.pan = { x: 0, y: 0 };
        this.followPending = true;
        this.reframe();
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
        document.getElementById('btn-nav').addEventListener('click', () => this.openExclusive(this.navigatorEl));
        document.getElementById('btn-emote').addEventListener('click', () => this.openExclusive(this.emotePicker));
        document.getElementById('btn-dance').addEventListener('click', () => {
            this.openExclusive(this.dancePicker);
            this.refreshDancePicker();
        });
        window.addEventListener('keydown', (event) => this.handleKey(event));
        document.getElementById('btn-zoom').addEventListener('click', () => this.setZoom(this.zoom === 2 ? 1 : 2));
        this.moreButton.addEventListener('click', () => {
            const open = this.moreMenu.classList.toggle('open');
            this.moreButton.setAttribute('aria-expanded', String(open));
        });
        document.addEventListener('pointerdown', (event) => {
            if (!this.moreMenu.contains(event.target) && !this.moreButton.contains(event.target)) {
                this.moreMenu.classList.remove('open');
                this.moreButton.setAttribute('aria-expanded', 'false');
            }
        });
        this.roomTitle.addEventListener('click', () => this.roomInfo.classList.toggle('expanded'));
        document.getElementById('btn-use-here').addEventListener('click', () => window.location.reload());

        const pointer = (event) => ({ id: event.pointerId, x: event.clientX, y: event.clientY, type: event.pointerType });
        this.canvas.addEventListener('pointerdown', (event) => {
            this.canvas.setPointerCapture?.(event.pointerId);
            this.gestures.down(pointer(event));
        });
        this.canvas.addEventListener('pointermove', (event) => {
            if (event.pointerType === 'mouse') this.mouse = { x: event.clientX, y: event.clientY };
            this.gestures.move(pointer(event));
        });
        this.canvas.addEventListener('pointerup', (event) => this.gestures.up(pointer(event)));
        this.canvas.addEventListener('pointercancel', (event) => this.gestures.cancel(pointer(event)));
        this.canvas.addEventListener('pointerleave', (event) => {
            if (event.pointerType === 'mouse') this.mouse = null;
        });
    }

    // Avatar sob o ponto de tela; com sobreposição, vence o mais à frente.
    // (px, py) em px CSS; no toque a área cresce até 44 px CSS também no zoom 1×.
    avatarAt(px, py, touch = false) {
        const p = toWorld(px, py, this.zoom);
        const scale = scaleOf(this.zoom);
        const hitW = touch ? Math.max(HIT_W, TOUCH_TARGET / scale) : HIT_W;
        const hitH = touch ? Math.max(HIT_H, TOUCH_TARGET / scale) : HIT_H;
        let hit = null;
        for (const avatar of this.session.avatars.values()) {
            const foot = avatarFoot(avatar, this.camera, this.session.grid, this.layout);
            const inside = Math.abs(p.x - foot.x) <= hitW / 2 && p.y <= foot.y && p.y >= foot.y - hitH;
            const depth = avatar.render.x + avatar.render.y;
            if (inside && (!hit || depth > hit.depth)) hit = { avatar, depth };
        }
        return hit?.avatar ?? null;
    }

    handleTap(px, py, type) {
        if (!this.session.grid) return;
        const touch = type !== 'mouse';
        const avatar = this.avatarAt(px, py, touch);
        if (avatar) {
            // O próprio avatar abre as danças; os outros, o cartão.
            if (avatar.member.id === this.me.id) {
                this.openExclusive(this.dancePicker, true);
                this.refreshDancePicker();
                return;
            }
            if (this.mobileQuery.matches) this.hidePanels();
            this.card.open(avatar.member, { x: px, y: py }, this.calls.cardAction(avatar.member));
            return;
        }
        const p = toWorld(px, py, this.zoom);
        const tile = toTile(p.x, p.y, this.camera);
        this.session.moveTo(tile);
        if (touch) this.tapMarker = { tile, until: performance.now() + TAP_MARKER_MS };
    }

    buildPickers() {
        const button = (text, title, onClick) => {
            const el = document.createElement('button');
            el.type = 'button';
            el.className = 'btn';
            el.textContent = text;
            el.title = title;
            el.addEventListener('click', onClick);
            return el;
        };
        document.getElementById('emote-grid').replaceChildren(...EMOTES.map((emote) => button(emote.icon, emote.label, () => {
            this.session.emote(emote.type);
            if (this.mobileQuery.matches) this.emotePicker.classList.add('hidden');
        })));
        const dances = [...DANCES.map((n) => [n, DANCE_NAMES[n]]), [0, 'Parar']];
        document.getElementById('dance-grid').replaceChildren(...dances.map(([n, name]) => {
            const el = button(name, name, () => {
                this.session.dance(n);
                this.refreshDancePicker();
            });
            el.dataset.dance = String(n);
            return el;
        }));
    }

    hidePanels(except = null) {
        for (const el of [this.navigatorEl, this.card.el, this.emotePicker, this.dancePicker]) {
            if (el !== except) el.classList.add('hidden');
        }
        if (except !== this.card.el) this.card.close();
    }

    // No celular só um painel fica aberto; no computador o botão só alterna o painel.
    openExclusive(el, forceOpen = false) {
        const opening = forceOpen || el.classList.contains('hidden');
        if (this.mobileQuery.matches && opening) this.hidePanels(el);
        el.classList.toggle('hidden', !opening);
    }

    refreshDancePicker() {
        const mine = this.session.mine();
        const sitting = Boolean(mine?.sitting);
        document.getElementById('dance-hint').classList.toggle('hidden', !sitting);
        for (const el of document.querySelectorAll('#dance-grid .btn')) {
            el.disabled = sitting;
            el.classList.toggle('btn-primary', Number(el.dataset.dance) === (mine?.dance ?? 0) && Number(el.dataset.dance) !== 0);
        }
    }

    // Atalhos só no computador e fora de campos de texto.
    handleKey(event) {
        if (this.mobileQuery.matches || event.target.closest?.('input, textarea, select')) return;
        if (event.key >= '1' && event.key <= '9') {
            this.session.emote(EMOTES[Number(event.key) - 1].type);
        } else if (event.key === 'd' || event.key === 'D') {
            const mine = this.session.mine();
            if (mine) this.session.dance(mine.dance ? 0 : 1);
            this.refreshDancePicker();
        } else if (event.key === 'Escape') {
            this.emotePicker.classList.add('hidden');
            this.dancePicker.classList.add('hidden');
        }
    }

    viewSize() {
        return { w: this.width, h: this.height - this.toolbar.offsetHeight };
    }

    reframe() {
        if (!this.layout) return;
        const { w, h } = this.viewSize();
        if (!this.userZoom) this.zoom = defaultZoom(this.layout, w, h, this.mobileQuery.matches);
        this.pan = clampPan(this.layout, w, h, this.zoom, this.pan);
        this.camera = computeCamera(this.layout, w, h, this.zoom, this.pan);
    }

    setZoom(zoom) {
        this.zoom = zoom;
        this.userZoom = true;
        this.pan = { x: 0, y: 0 };
        this.followPending = true;
        this.reframe();
    }

    panBy(dx, dy) {
        if (!this.layout) return;
        const scale = scaleOf(this.zoom);
        this.pan = { x: this.pan.x + dx / scale, y: this.pan.y + dy / scale };
        this.reframe();
    }

    // Câmera acompanha o próprio avatar ao entrar e enquanto ele anda.
    follow() {
        const mine = this.session.mine();
        if (!mine || !(this.followPending || mine.path.length)) return;
        const { w, h } = this.viewSize();
        const foot = avatarFoot(mine, this.camera, this.session.grid, this.layout);
        this.pan = followPan(this.layout, w, h, this.zoom, this.pan, this.camera, foot);
        this.camera = computeCamera(this.layout, w, h, this.zoom, this.pan);
        this.followPending = false;
    }

    // Depois de uma queda de conexão (ex.: celular em segundo plano), refaz o quarto do zero.
    watchResume() {
        window.Echo.connector.pusher.connection.bind('state_change', ({ previous, current }) => {
            if (previous === 'connected' && current !== 'connected') this.dropped = true;
            if (current === 'connected' && this.dropped) {
                this.dropped = false;
                this.resume();
            }
        });
    }

    resume() {
        if (this.currentRoomId === null) return;
        this.calls.connectionLost();
        this.session.leave();
        this.session.enter(this.currentRoomId, this.layout);
        this.presence.announce(this.currentRoomId);
        this.followPending = true;
        this.refreshPanels();
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = Math.round(this.width * dpr);
        this.canvas.height = Math.round(this.height * dpr);
        this.dpr = dpr;
        this.followPending = true;
        this.reframe();
    }

    draw() {
        if (!this.layout || !this.session.grid) return;
        this.follow();

        const scale = scaleOf(this.zoom);
        this.ctx.setTransform(this.dpr * scale, 0, 0, this.dpr * scale, 0, 0);
        this.ctx.imageSmoothingEnabled = false;

        const hoverAvatar = this.mouse ? this.avatarAt(this.mouse.x, this.mouse.y) : null;
        const mouse = this.mouse ? toWorld(this.mouse.x, this.mouse.y, this.zoom) : null;
        if (this.tapMarker && performance.now() > this.tapMarker.until) this.tapMarker = null;

        drawScene(this.ctx, {
            layout: this.layout,
            camera: this.camera,
            grid: this.session.grid,
            avatars: [...this.session.avatars.values()],
            hoverTile: mouse && !hoverAvatar ? toTile(mouse.x, mouse.y, this.camera) : (this.tapMarker?.tile ?? null),
            hoverAvatarId: hoverAvatar?.member.id ?? null,
            width: this.width / scale,
            height: this.height / scale,
            scale,
            pixelRatio: this.dpr * scale,
            now: performance.now(),
            decorate: (id) => this.calls.decorations(id),
            atlas: this.atlas,
            time: performance.now() / 1000,
        });
    }
}
