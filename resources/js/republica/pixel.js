// Primitivas em pixel art: tudo em faixas de PX px (1 pixel do pack = 2 px de tela), sem antialias.
export const PX = 2;
export const INK = '#2b2523';

export const snap = (v) => Math.round(v);
const toGrid = (v) => Math.round(v / PX) * PX;

export function rect(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(snap(x), snap(y), snap(w), snap(h));
}

// Faixas de um losango com vértice superior em (cx, topY).
export function diamondRows(cx, topY, w, h) {
    const rows = [];
    const n = Math.max(1, Math.round(h / PX));
    for (let i = 0; i < n; i++) {
        const dist = Math.abs(i * PX + PX / 2 - h / 2);
        const half = toGrid((w / 2) * (1 - dist / (h / 2)));
        rows.push({ y: snap(topY + i * PX), x0: snap(cx - half), x1: snap(cx + half) });
    }
    return rows;
}

export function ellipseRows(cx, cy, rx, ry) {
    const rows = [];
    const n = Math.max(1, Math.round((2 * ry) / PX));
    for (let i = 0; i < n; i++) {
        const dy = (i * PX + PX / 2 - ry) / ry;
        const half = toGrid(rx * Math.sqrt(Math.max(0, 1 - dy * dy)));
        rows.push({ y: snap(cy - ry + i * PX), x0: snap(cx - half), x1: snap(cx + half) });
    }
    return rows;
}

function fillRows(ctx, rows, color) {
    ctx.fillStyle = color;
    for (const r of rows) if (r.x1 > r.x0) ctx.fillRect(r.x0, r.y, r.x1 - r.x0, PX);
}

// Contorno: as pontas de cada faixa, largas o bastante para fechar o degrau até a faixa vizinha.
function strokeRows(ctx, rows, color, capEnds) {
    ctx.fillStyle = color;
    const mid = (rows.length - 1) / 2;
    rows.forEach((r, i) => {
        const width = r.x1 - r.x0;
        if (width <= 0) return;
        const neighbor = rows[i < mid ? i + 1 : i > mid ? i - 1 : i];
        const edge = Math.max(PX, Math.abs((r.x0 - neighbor.x0)));
        if ((capEnds && (i === 0 || i === rows.length - 1)) || edge * 2 >= width) {
            ctx.fillRect(r.x0, r.y, width, PX);
        } else {
            ctx.fillRect(r.x0, r.y, edge, PX);
            ctx.fillRect(r.x1 - edge, r.y, edge, PX);
        }
    });
}

export function fillDiamond(ctx, cx, topY, w, h, color) {
    fillRows(ctx, diamondRows(cx, topY, w, h), color);
}

export function strokeDiamond(ctx, cx, topY, w, h, color) {
    strokeRows(ctx, diamondRows(cx, topY, w, h), color, false);
}

export function fillEllipse(ctx, cx, cy, rx, ry, color) {
    fillRows(ctx, ellipseRows(cx, cy, rx, ry), color);
}

export function strokeEllipse(ctx, cx, cy, rx, ry, color) {
    strokeRows(ctx, ellipseRows(cx, cy, rx, ry), color, true);
}

// Face vertical de parede: aresta inferior de p1 a p2, pintada em colunas de PX px.
export function wallFace(ctx, p1, p2, height, color) {
    const x0 = snap(Math.min(p1.x, p2.x));
    const x1 = snap(Math.max(p1.x, p2.x));
    const span = p2.x - p1.x || 1;
    ctx.fillStyle = color;
    for (let x = x0; x < x1; x += PX) {
        const t = (x + PX / 2 - p1.x) / span;
        const bottom = snap(p1.y + (p2.y - p1.y) * t);
        ctx.fillRect(x, bottom - snap(height), PX, snap(height));
    }
}

// Retângulo com contorno escuro (marcador genérico de fallback).
export function block(ctx, x, y, w, h, color) {
    rect(ctx, x, y, w, h, INK);
    rect(ctx, x + PX, y + PX, w - 2 * PX, h - 2 * PX, color);
}
