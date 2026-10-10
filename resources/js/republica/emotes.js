// Emotes em balão (pack CC0 "Tiny Speech Indicators", de Pigeon Ivy): reagir sem texto.
import { EMOTE_MS } from './animation.js';
import { drawSprite } from './atlas.js';
import { INK, PX, rect } from './pixel.js';

// Ordem = atalhos 1–9 no computador. frame: balão da folha; anim/draw: casos especiais.
export const EMOTES = [
    { type: 'feliz', label: 'Feliz', icon: '😊', frame: 1 },
    { type: 'sorriso', label: 'Sorriso', icon: '🙂', frame: 2 },
    { type: 'rindo', label: 'Rindo', icon: '😆', frame: 3 },
    { type: 'bravo', label: 'Bravo', icon: '😠', frame: 4 },
    { type: 'irritado', label: 'Irritado', icon: '😒', frame: 5 },
    { type: 'neutro', label: 'Neutro', icon: '😐', frame: 6 },
    { type: 'pensando', label: 'Pensando', icon: '💭', frame: 0 },
    { type: 'atencao', label: 'Atenção', icon: '❗', anim: 'exclamation' },
    { type: 'oi', label: 'Oi', icon: '👋', draw: 'hand' },
    { type: 'amei', label: 'Amei', icon: '❤️', draw: 'heart' },
    { type: 'musica', label: 'Música', icon: '🎵', draw: 'note' },
];

const BY_TYPE = new Map(EMOTES.map((e) => [e.type, e]));
const BUBBLE = 11; // px nativos
const EMPTY_FRAME = 7;
const POP_FRAMES = 8;
const POP_MS = 50;

// Ícones desenhados no balão vazio: "x" = cor, "o" = contorno.
const ICONS = {
    hand: { color: '#f3c79e', rows: ['x.x.x', 'x.x.x', 'xxxxx', 'xxxx.', '.xxx.'], outline: true },
    heart: { color: '#e8735a', rows: ['.x.x.', 'xxxxx', 'xxxxx', '.xxx.', '..x..'], shine: [1, 1] },
    note: { color: INK, rows: ['..xx.', '..x.x', '..x..', 'xxx..', 'xx...'] },
};

export function isEmote(type) {
    return BY_TYPE.has(type);
}

function drawIcon(ctx, name, left, top) {
    const icon = ICONS[name];
    const at = (cx, cy) => icon.rows[cy]?.[cx] === 'x';
    // Área interna do balão: colunas 3–7, linhas 2–6.
    const ox = left + 3 * PX;
    const oy = top + 2 * PX;
    icon.rows.forEach((row, y) => {
        [...row].forEach((cell, x) => {
            if (cell === 'x') {
                rect(ctx, ox + x * PX, oy + y * PX, PX, PX, icon.color);
            } else if (icon.outline && (at(x - 1, y) || at(x + 1, y) || at(x, y - 1) || at(x, y + 1))) {
                rect(ctx, ox + x * PX, oy + y * PX, PX, PX, INK);
            }
        });
    });
    if (icon.shine) rect(ctx, ox + icon.shine[0] * PX, oy + icon.shine[1] * PX, PX, PX, '#ffffff');
}

// Balão à direita da cabeça; foot = pés do avatar em px de mundo; now em ms.
export function drawEmote(ctx, atlas, emote, foot, now) {
    const def = BY_TYPE.get(emote?.type);
    const elapsed = now - (emote?.at ?? 0);
    if (!def || elapsed < 0 || elapsed > EMOTE_MS) return;

    const left = Math.round(foot.x + 8);
    const bottom = Math.round(foot.y - 62);
    const top = bottom - BUBBLE * PX;

    if (elapsed < POP_FRAMES * POP_MS) {
        const f = Math.floor(elapsed / POP_MS);
        drawSprite(ctx, atlas, 'bubblePop', f * BUBBLE, 0, BUBBLE, BUBBLE, 0, BUBBLE, left, bottom);
        return;
    }
    if (def.anim === 'exclamation') {
        const f = Math.min(5, Math.floor((elapsed - POP_FRAMES * POP_MS) / 80));
        drawSprite(ctx, atlas, 'exclamation', f * 7, 0, 7, 8, -2, 9, left, bottom);
        return;
    }
    if (def.draw) {
        if (drawSprite(ctx, atlas, 'indicators', EMPTY_FRAME * BUBBLE, 0, BUBBLE, BUBBLE, 0, BUBBLE, left, bottom)) drawIcon(ctx, def.draw, left, top);
        return;
    }
    drawSprite(ctx, atlas, 'indicators', def.frame * BUBBLE, 0, BUBBLE, BUBBLE, 0, BUBBLE, left, bottom);
}
