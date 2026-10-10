// Avatar em pixel art procedural no estilo do Habbo. Unidade = 2 px × scale; origem nos pés;
// partes e poses vêm do rig (avatar-rig.js); a vista esquerda é a direita espelhada.
import { poseFor } from './animation';
import { BOUNDS, buildParts, normalizeLook, paletteFor, shade } from './avatar-rig';
import { INK, PX, fillEllipse, rect as pixelRect, strokeEllipse } from './pixel';

export { shade };

const FLAT = new Set(['ink', 'white', 'mouth', 'blush']);
const CACHE_MAX = 400;

// Cor de uma parte: "skin" usa os 3 tons; "skin.dark" é um tom só.
function toneOf(palette, paint, tone) {
    const [name, fixed] = paint.split('.');
    const entry = palette[name];
    if (typeof entry === 'string') return entry;
    return entry[fixed ?? tone];
}

// Faixas por linha de uma parte; round "all"/"top" tira 1 unidade das pontas da 1ª (e da última) linha.
function spans(x, y, w, h, round) {
    const rows = [];
    for (let j = 0; j < h; j++) {
        const cut = w > 2 && h > 1 && ((j === 0 && round) || (j === h - 1 && round === 'all')) ? 1 : 0;
        rows.push({ y: y + j, x0: x + cut, x1: x + w - cut });
    }
    return rows;
}

function fillSpans(ctx, rows, u) {
    for (const r of rows) ctx.fillRect(r.x0 * u, r.y * u, (r.x1 - r.x0) * u, u);
}

// Silhueta escura, contornos internos (sep) e preenchimento em 3 tons (luz à esquerda).
export function paintParts(ctx, parts, palette, u) {
    const outline = (p) => spans(p.x - 1, p.y - 1, p.w + 2, p.h + 2, p.round);
    ctx.fillStyle = INK;
    for (const p of parts) fillSpans(ctx, outline(p), u);

    for (const p of parts) {
        if (p.sep) {
            ctx.fillStyle = INK;
            fillSpans(ctx, outline(p), u);
        }
        const rows = spans(p.x, p.y, p.w, p.h, p.round);
        const flat = FLAT.has(p.paint) || p.paint.includes('.') || p.w === 1 || p.h === 1;
        ctx.fillStyle = toneOf(palette, p.paint, 'base');
        fillSpans(ctx, rows, u);
        if (flat) continue;
        ctx.fillStyle = toneOf(palette, p.paint, 'dark');
        for (const r of rows) ctx.fillRect((r.x1 - 1) * u, r.y * u, u, u);
        const last = rows[rows.length - 1];
        ctx.fillRect(last.x0 * u, last.y * u, (last.x1 - last.x0) * u, u);
        if (p.w >= 3) {
            ctx.fillStyle = toneOf(palette, p.paint, 'light');
            for (const r of rows.slice(0, -1)) ctx.fillRect(r.x0 * u, r.y * u, u, u);
        }
    }
}

// Quadros já desenhados, por aparência + pose + resolução; LRU simples.
const frames = new Map();

function cachedFrame(key, width, height, draw) {
    let canvas = frames.get(key);
    if (canvas) {
        frames.delete(key);
        frames.set(key, canvas);
        return canvas;
    }
    canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    draw(canvas.getContext('2d'));
    frames.set(key, canvas);
    if (frames.size > CACHE_MAX) frames.delete(frames.keys().next().value);
    return canvas;
}

const poseKey = (p) => `${p.anim}:${p.frame}:${p.blink ? 1 : 0}:${p.talk ? 1 : 0}:${p.waving ? p.waveFrame : -1}:${p.back ? 1 : 0}`;

export function drawAvatar(ctx, footX, footY, look, opts = {}) {
    const { dir = 1, back = false, scale = 1, pixelRatio = null } = opts;
    const u = 2 * scale;
    const base = opts.pose ?? poseFor({ walking: opts.walking, walkPhase: opts.walkPhase, sitting: opts.sitting });
    const pose = { ...base, back };
    const full = normalizeLook(look);

    ctx.save();
    ctx.translate(Math.round(footX), Math.round(footY));
    fillEllipse(ctx, 0, 0, Math.round((12 * scale) / u) * u, Math.round((5 * scale) / u) * u, 'rgba(43, 37, 35, 0.25)');
    ctx.scale(dir, 1);

    const paint = (target, unit) => paintParts(target, buildParts(full, pose), paletteFor(full), unit);
    if (pixelRatio) {
        const w = (BOUNDS.x1 - BOUNDS.x0) * u;
        const h = (BOUNDS.y1 - BOUNDS.y0) * u;
        const key = `${JSON.stringify(full)}|${poseKey(pose)}|${pixelRatio}|${scale}`;
        const frame = cachedFrame(key, Math.ceil(w * pixelRatio), Math.ceil(h * pixelRatio), (fctx) => {
            fctx.setTransform(pixelRatio, 0, 0, pixelRatio, -BOUNDS.x0 * u * pixelRatio, -BOUNDS.y0 * u * pixelRatio);
            paint(fctx, u);
        });
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(frame, BOUNDS.x0 * u, BOUNDS.y0 * u, w, h);
    } else {
        paint(ctx, u);
    }

    ctx.restore();
}

// Pré-visualização do cadastro/perfil e do cartão do avatar.
export function renderPreview(canvas, look) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;
    const scale = Math.max(1, Math.floor(canvas.height / 70));
    drawAvatar(ctx, canvas.width / 2, canvas.height - 12 * scale, look, { scale });
}

// Fone de ouvido sobre a cabeça de quem está em call; (x, y) é o topo da cabeça.
const HEADSET_ARC = [[-12, 2], [-8, -2], [-4, -4], [0, -4], [4, -4], [8, -2], [12, 2]];

export function drawHeadset(ctx, x, y) {
    const cx = Math.round(x);
    const cy = Math.round(y);
    for (const [dx, dy] of HEADSET_ARC) pixelRect(ctx, cx + dx - 2, cy + dy - 2, 4, 4, '#3e3431');
    for (const left of [cx - 16, cx + 10]) {
        pixelRect(ctx, left - PX, cy + 4 - PX, 6 + 2 * PX, 8 + 2 * PX, INK);
        pixelRect(ctx, left, cy + 4, 6, 8, '#e8735a');
    }
}

// Anel pulsante sob os pés de quem está falando; o raio muda em passos de 2 px.
export function drawSpeakingRing(ctx, x, y, time) {
    const r = 14 + 2 * Math.round(1.5 * Math.sin(time * 8));
    strokeEllipse(ctx, Math.round(x), Math.round(y), r, r / 2, 'rgba(159, 191, 154, 0.9)');
}
