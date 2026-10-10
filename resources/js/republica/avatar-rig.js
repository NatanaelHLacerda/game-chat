// Rig do avatar: partes em unidades da grade (1 unidade = 1 pixel do pack), origem nos pés,
// vista "direita" (frente-direita ou costas-direita); a esquerda sai por espelhamento.
import { INK } from './pixel.js';

export const HAIR_STYLES = ['curto', 'medio', 'cacheado', 'longo'];
export const TOP_STYLES = ['camiseta', 'regata', 'moletom'];
export const DEFAULT_STYLE = { hair_style: 'curto', top_style: 'camiseta' };
export const BOUNDS = { x0: -10, x1: 10, y0: -36, y1: 2 };

export function shade(hex, factor) {
    const n = parseInt(hex.slice(1), 16);
    const channel = (c) => Math.max(0, Math.min(255, Math.round(factor < 0 ? c * (1 + factor) : c + (255 - c) * factor)));
    const r = channel(n >> 16);
    const g = channel((n >> 8) & 255);
    const b = channel(n & 255);

    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

export function normalizeLook(look = {}) {
    return {
        ...look,
        hair_style: HAIR_STYLES.includes(look.hair_style) ? look.hair_style : DEFAULT_STYLE.hair_style,
        top_style: TOP_STYLES.includes(look.top_style) ? look.top_style : DEFAULT_STYLE.top_style,
    };
}

// paint: cor do cadastro (skin, hair, top, pants) com tom opcional (".dark"/".light"), ou cor fixa.
export function paletteFor(look) {
    const tones = (c) => ({ light: shade(c, 0.22), base: c, dark: shade(c, -0.22) });
    return {
        skin: tones(look.skin),
        hair: tones(look.hair),
        top: tones(look.shirt),
        pants: tones(look.pants),
        shoe: tones('#3e3431'),
        ink: INK,
        white: '#ffffff',
        mouth: '#8a3b33',
        blush: '#f4a3a3',
    };
}

const part = (paint, x, y, w, h, extra = {}) => ({ paint, x, y, w, h, sep: false, ...extra });
const SLEEVE = { camiseta: 3, regata: 0, moletom: 5 };

// Braço de 2 de largura: pele inteira com a manga por cima. variant: down | up | half | bent.
// Erguido (up/half), o braço se afasta 1 unidade do corpo (out = ±1) para não sumir atrás da cabeça.
function arm(x0, variant, top, group, sep, handDx = 0, out = 0) {
    const sleeve = SLEEVE[top];
    const x = variant === 'up' || variant === 'half' ? x0 + out * 2 : x0;
    const parts = [];
    if (variant === 'up') {
        parts.push(part('skin', x + handDx, -25, 2, 2, { group, sep }));
        parts.push(part('skin', x, -23, 2, 6, { group, sep }));
        if (sleeve) parts.push(part('top', x, -17 - sleeve + 1, 2, sleeve, { group }));
    } else if (variant === 'half') {
        parts.push(part('skin', x, -21, 2, 5, { group, sep }));
        if (sleeve) parts.push(part('top', x, -17 - Math.min(sleeve, 3) + 1, 2, Math.min(sleeve, 3), { group }));
    } else if (variant === 'bent') {
        parts.push(part('skin', x, -17, 2, 4, { group, sep }));
        parts.push(part('skin', x + 2, -15, 2, 2, { group, sep }));
        if (sleeve) parts.push(part('top', x, -17, 2, Math.min(sleeve, 4), { group }));
    } else {
        parts.push(part('skin', x, -17, 2, 7, { group, sep }));
        if (sleeve) parts.push(part('top', x, -17, 2, sleeve, { group }));
    }
    return parts;
}

function legs(sitting) {
    if (sitting) {
        // Coxas para a frente sobre o assento, canelas descendo na ponta.
        return [
            part('pants', -1, -9, 8, 3, { group: 'legBack' }),
            part('pants', 4, -7, 3, 4, { group: 'legFront', sep: true }),
            part('shoe', 4, -3, 4, 2, { group: 'legFront', round: 'top' }),
        ];
    }
    return [
        part('pants', -3, -10, 3, 8, { group: 'legBack' }),
        part('shoe', -3, -2, 3, 2, { group: 'legBack', round: 'top' }),
        part('pants', 0, -10, 3, 8, { group: 'legFront', sep: true }),
        part('shoe', 0, -2, 4, 2, { group: 'legFront', round: 'top' }),
    ];
}

function torso(top, back) {
    const parts = [part('top', -4, -18, 8, 9, { group: 'body', round: 'top' })];
    if (top === 'regata') parts.push(part('skin', -2, -18, 4, 1, { group: 'body' }));
    if (top === 'camiseta' && !back) parts.push(part('skin', -1, -18, 3, 1, { group: 'body' }));
    if (top === 'moletom') {
        parts.push(part('top.dark', -4, -11, 8, 1, { group: 'body' }));
        if (!back) parts.push(part('top.dark', -1, -14, 4, 2, { group: 'body' }));
        else parts.push(part('top.dark', -3, -18, 6, 3, { group: 'body' }));
    }
    return parts;
}

function hairFront(style) {
    const g = { group: 'body' };
    const cap = part('hair', -5, -31, 10, 5, { ...g, round: 'all' });
    switch (style) {
        case 'medio':
            return {
                behind: [part('hair', -6, -29, 5, 9, { ...g, round: 'all' })],
                front: [cap, part('hair', 0, -27, 5, 1, g), part('hair', -5, -27, 2, 4, g)],
            };
        case 'cacheado':
            return {
                behind: [part('hair', -7, -30, 6, 9, { ...g, round: 'all' })],
                front: [
                    part('hair', -6, -34, 12, 8, { ...g, round: 'all' }),
                    part('hair.dark', -4, -32, 1, 1, g),
                    part('hair.dark', -1, -33, 1, 1, g),
                    part('hair.dark', 2, -32, 1, 1, g),
                    part('hair.dark', 3, -29, 1, 1, g),
                    part('hair.dark', 0, -30, 1, 1, g),
                    part('hair.dark', -4, -28, 1, 1, g),
                ],
            };
        case 'longo':
            return {
                behind: [part('hair', -7, -30, 6, 16, { ...g, round: 'all' })],
                front: [cap, part('hair', 4, -27, 1, 3, g), part('hair', -5, -27, 2, 5, g)],
            };
        default:
            return { behind: [], front: [cap, part('hair', -5, -27, 3, 3, g)] };
    }
}

function hairBack(style) {
    const g = { group: 'body' };
    switch (style) {
        case 'medio':
            return [part('hair', -6, -31, 12, 11, { ...g, round: 'all' })];
        case 'cacheado':
            return [
                part('hair', -7, -34, 14, 13, { ...g, round: 'all' }),
                part('hair.dark', -3, -31, 1, 1, g),
                part('hair.dark', 2, -28, 1, 1, g),
                part('hair.dark', -1, -25, 1, 1, g),
                part('hair.dark', 4, -32, 1, 1, g),
            ];
        case 'longo':
            return [part('hair', -6, -31, 12, 10, { ...g, round: 'all' }), part('hair', -5, -22, 10, 8, { ...g, round: 'all' })];
        default:
            return [part('hair', -5, -31, 10, 9, { ...g, round: 'all' })];
    }
}

function face(pose) {
    const g = { group: 'body' };
    // Rosto deslocado para a direita (vista 3/4): é o que diferencia a vista da espelhada.
    const parts = [
        part('hair.dark', 0, -27, 2, 1, g),
        part('hair.dark', 3, -27, 2, 1, g),
        part('skin.dark', 4, -24, 1, 1, g),
        part('blush', -1, -22, 1, 1, g),
    ];
    if (pose.blink) {
        parts.push(part('ink', 0, -25, 2, 1, g), part('ink', 3, -25, 2, 1, g));
    } else {
        parts.push(part('ink', 0, -26, 2, 2, g), part('ink', 3, -26, 2, 2, g));
        parts.push(part('white', 0, -26, 1, 1, g), part('white', 3, -26, 1, 1, g));
    }
    if (pose.talk) parts.push(part('mouth', 2, -22, 2, 2, g));
    else parts.push(part('ink', 2, -21, 2, 1, g));
    return parts;
}

// Braços conforme a animação: [traseiro, dianteiro] com variante e deslocamento da mão.
function armVariants(pose) {
    const f = pose.frame;
    let backV = 'down';
    let frontV = 'down';
    if (pose.anim === 'dance1') [backV, frontV] = f % 2 ? ['down', 'half'] : ['half', 'down'];
    if (pose.anim === 'dance2') [backV, frontV] = [f === 1 ? 'down' : 'up', f === 3 ? 'down' : 'up'];
    if (pose.anim === 'dance3') [backV, frontV] = ['bent', 'bent'];
    if (pose.waving) frontV = 'up';
    return { backV, frontV, handDx: pose.waving ? [-1, 0, 1][pose.waveFrame ?? 0] : 0 };
}

// Deslocamentos por grupo: body (tronco, cabeça, braços), legBack, legFront, armBack, armFront.
function offsets(pose) {
    const o = { body: [0, 0], legBack: [0, 0], legFront: [0, 0], armBack: [0, 0], armFront: [0, 0] };
    const f = pose.frame;
    switch (pose.anim) {
        case 'walk':
            if (f === 0 || f === 2) {
                const s = f === 0 ? 1 : -1;
                o.legFront = [s, 0];
                o.legBack = [-s, 0];
                o.armFront = [-s, 0];
                o.armBack = [s, 0];
            } else {
                o.body = [0, -1];
                o.armFront = [0, -1];
                o.armBack = [0, -1];
                o[f === 1 ? 'legBack' : 'legFront'] = [0, -1];
            }
            break;
        case 'idle':
            if (f === 1) o.body = o.armFront = o.armBack = [0, -1];
            break;
        case 'sit':
            o.body = o.armFront = o.armBack = [0, 3];
            break;
        case 'dance1': {
            const dx = [-1, 0, 1, 0][f];
            const dy = [0, -1, 0, -1][f];
            o.body = o.armFront = o.armBack = [dx, dy];
            break;
        }
        case 'dance2': {
            const dy = [0, -1, 0, -1][f];
            o.body = o.armFront = o.armBack = [0, dy];
            break;
        }
        case 'dance3': {
            const dx = [1, 0, -1, 0][f];
            o.body = o.armFront = o.armBack = [dx, 0];
            if (f === 0) o.legFront = [0, -2];
            if (f === 2) o.legBack = [0, -2];
            break;
        }
    }
    return o;
}

export function buildParts(look, pose) {
    const l = normalizeLook(look);
    const top = l.top_style;
    const { backV, frontV, handDx } = armVariants(pose);
    const backArm = arm(-6, backV, top, 'armBack', false, 0, -1);
    const frontArm = arm(4, frontV, top, 'armFront', true, handDx, 1);
    const raised = frontV === 'up' || frontV === 'half';
    const legParts = legs(pose.anim === 'sit');
    const neck = part('skin', -1, -19, 2, 1, { group: 'body' });
    const head = part('skin', -5, -30, 10, 11, { group: 'body', sep: true, round: 'all' });

    let parts;
    if (pose.back) {
        const nearArm = arm(-6, backV, top, 'armBack', true, 0, -1);
        const nearRaised = backV === 'up' || backV === 'half';
        parts = [
            ...arm(4, frontV, top, 'armFront', false, handDx, 1),
            ...legParts,
            ...torso(top, true),
            ...(nearRaised ? [] : nearArm),
            neck,
            head,
            ...hairBack(l.hair_style),
            ...(nearRaised ? nearArm : []),
        ];
    } else {
        const hair = hairFront(l.hair_style);
        const hood = top === 'moletom' ? [part('top.dark', -4, -19, 8, 1, { group: 'body' })] : [];
        // Braço da frente erguido passa para depois da cabeça.
        parts = [
            ...hair.behind,
            ...backArm,
            ...legParts,
            ...torso(top, false),
            ...(raised ? [] : frontArm),
            ...hood,
            neck,
            head,
            ...face(pose),
            ...hair.front,
            ...(raised ? frontArm : []),
        ];
    }

    const o = offsets(pose);
    return parts.map(({ group, ...p }) => {
        const [dx, dy] = o[group] ?? [0, 0];
        return { ...p, x: p.x + dx, y: p.y + dy };
    });
}
