// Vista do quarto: zoom em escala inteira do pack (1× ou 2×) e deslocamento da câmera limitado ao quarto.
// Coordenadas "de mundo" são as do renderer (o 2× do pack); scale converte mundo → px CSS.
import { TILE_H, TILE_W, WALL_H } from './iso.js';

export const MOBILE_QUERY = '(pointer: coarse) and (max-width: 899px)';
export const FOLLOW_MARGIN = 48; // px CSS

// Limites do desenho do quarto (paredes por fora do piso incluídas), relativos à origem da câmera.
export function roomBounds(layout) {
    const rows = layout.tiles.length;
    const cols = layout.tiles[0].length;

    return {
        minX: -(rows + 0.5) * (TILE_W / 2) - 16,
        maxX: (cols + 0.5) * (TILE_W / 2) + 16,
        minY: -WALL_H - 32,
        maxY: (cols + rows) * (TILE_H / 2) + 16,
    };
}

export const scaleOf = (zoom) => zoom / 2;

export function fits(layout, viewW, viewH, zoom) {
    const b = roomBounds(layout);
    const scale = scaleOf(zoom);
    return (b.maxX - b.minX) * scale <= viewW && (b.maxY - b.minY) * scale <= viewH;
}

export function defaultZoom(layout, viewW, viewH, mobile) {
    return !mobile || fits(layout, viewW, viewH, 2) ? 2 : 1;
}

// Em cada eixo: 0 se o quarto cabe; senão, a borda do quarto nunca entra na tela.
export function clampPan(layout, viewW, viewH, zoom, pan) {
    const b = roomBounds(layout);
    const scale = scaleOf(zoom);
    const axis = (value, extent, world) => {
        if (extent <= world) return 0;
        const limit = (extent - world) / 2;
        return Math.max(-limit, Math.min(limit, value));
    };

    return {
        x: axis(pan.x, b.maxX - b.minX, viewW / scale),
        y: axis(pan.y, b.maxY - b.minY, viewH / scale),
    };
}

// Em 0,5 a câmera fica em px de mundo pares, para cada pixel do pack cair num px CSS inteiro.
export function computeCamera(layout, viewW, viewH, zoom, pan) {
    const b = roomBounds(layout);
    const scale = scaleOf(zoom);
    const snap = scale < 1 ? (v) => 2 * Math.round(v / 2) : Math.round;

    return {
        x: snap(viewW / scale / 2 - (b.minX + b.maxX) / 2 + pan.x),
        y: snap(viewH / scale / 2 - (b.minY + b.maxY) / 2 + pan.y),
    };
}

// Desloca o mínimo para manter pés e cabeça do avatar a FOLLOW_MARGIN da borda.
export function followPan(layout, viewW, viewH, zoom, pan, camera, foot, headTop = 64) {
    const scale = scaleOf(zoom);
    const worldW = viewW / scale;
    const worldH = viewH / scale;
    const m = FOLLOW_MARGIN / scale;
    const next = { ...pan };

    if (foot.x < m) next.x += m - foot.x;
    else if (foot.x > worldW - m) next.x -= foot.x - (worldW - m);

    const top = foot.y - headTop;
    if (top < m) next.y += m - top;
    else if (foot.y > worldH - m) next.y -= foot.y - (worldH - m);

    return clampPan(layout, viewW, viewH, zoom, next);
}

export function toWorld(x, y, zoom) {
    const scale = scaleOf(zoom);
    return { x: x / scale, y: y / scale };
}
