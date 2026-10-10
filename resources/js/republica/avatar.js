// Avatar em pixel art procedural. Unidade = 2 px × scale; origem nos pés; desenhado olhando para a direita.
import { INK, PX, fillEllipse, rect as pixelRect, strokeEllipse } from './pixel';

const SHOE = '#3e3431';

export function shade(hex, factor) {
    const n = parseInt(hex.slice(1), 16);
    const channel = (c) => Math.max(0, Math.min(255, Math.round(factor < 0 ? c * (1 + factor) : c + (255 - c) * factor)));
    const r = channel(n >> 16);
    const g = channel((n >> 8) & 255);
    const b = channel(n & 255);

    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

export function drawAvatar(ctx, footX, footY, look, opts = {}) {
    const { dir = 1, back = false, walkPhase = 0, walking = false, sitting = false, scale = 1 } = opts;
    const u = 2 * scale;

    ctx.save();
    ctx.translate(Math.round(footX), Math.round(footY));

    fillEllipse(ctx, 0, 0, Math.round(12 * scale / u) * u, Math.round(5 * scale / u) * u, 'rgba(43, 37, 35, 0.25)');

    ctx.scale(dir, 1);
    // Os retângulos são acumulados: primeiro a silhueta escura (1 unidade maior), depois as cores.
    const parts = [];
    const rect = (x, y, w, h, color) => parts.push([x, y, w, h, color]);

    const step = walking ? Math.round(Math.sin(walkPhase)) : 0;
    const body = sitting ? 3 : 0; // sentado, o tronco desce

    // Pernas
    if (sitting) {
        rect(-4, -10 + body, 8, 3, look.pants);
        rect(2, -7 + body, 3, 5, shade(look.pants, -0.1));
        rect(2, -2 + body, 4, 1, SHOE);
    } else {
        const backLift = step > 0 ? 1 : 0;
        const frontLift = step < 0 ? 1 : 0;
        rect(-4, -10, 3, 9 - backLift, shade(look.pants, -0.15));
        rect(-4, -1 - backLift, 4, 1, SHOE);
        rect(1, -10, 3, 9 - frontLift, look.pants);
        rect(1, -1 - frontLift, 4, 1, SHOE);
    }

    // Tronco e braços
    const swing = walking ? step : 0;
    rect(-6, -18 + body + swing, 2, 7, shade(look.shirt, -0.2));
    rect(-6, -11 + body + swing, 2, 2, shade(look.skin, -0.1));
    rect(-4, -19 + body, 8, 10, look.shirt);
    rect(2, -19 + body, 2, 10, shade(look.shirt, -0.1));
    rect(4, -18 + body - swing, 2, 7, look.shirt);
    rect(4, -11 + body - swing, 2, 2, look.skin);

    // Pescoço, cabeça e cabelo
    rect(-1, -20 + body, 2, 1, shade(look.skin, -0.1));
    rect(-4, -28 + body, 8, 8, look.skin);
    if (back) {
        rect(-4, -29 + body, 8, 7, look.hair);
    } else {
        rect(-4, -29 + body, 8, 3, look.hair);
        rect(-4, -26 + body, 2, 3, look.hair);
        rect(1, -25 + body, 1, 1, INK);
        rect(3, -25 + body, 1, 1, INK);
        rect(2, -22 + body, 1, 1, shade(look.skin, -0.3));
    }

    ctx.fillStyle = INK;
    for (const [x, y, w, h] of parts) ctx.fillRect((x - 1) * u, (y - 1) * u, (w + 2) * u, (h + 2) * u);
    for (const [x, y, w, h, color] of parts) {
        ctx.fillStyle = color;
        ctx.fillRect(x * u, y * u, w * u, h * u);
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
