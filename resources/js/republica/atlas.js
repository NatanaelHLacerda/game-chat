// Sprites do pack "Pixel Isometric Modern Interior" (Cryovex, Free v1.01), recortados das folhas originais.
// Coordenadas em pixels nativos; tudo é desenhado em escala PX.
import { PX } from './pixel.js';

const BASE = '/sprites/';

export const SHEETS = {
    floor: 'cryovex/floor_free.png',
    wall: 'cryovex/wall_free.png',
    furniture: 'cryovex/furniture_free.png',
    decoration: 'cryovex/decoration_free.png',
    indicators: 'pigeonivy/tiny_speech_indicators-11x11.png',
    bubblePop: 'pigeonivy/speech_bubble_animation-11x11.png',
    exclamation: 'pigeonivy/exclamation-7x8.png',
};

// Amostra de piso 16×10 (losango de meio tile + espessura); âncora no vértice superior.
export const FLOOR_W = 16;
export const FLOOR_H = 10;
export const FLOORS = {
    madeira: [0, 6],
    branco: [48, 6],
    marmore: [80, 6],
    bege: [96, 6],
    cinza: [0, 22],
};

// Grupo de 3 blocos de 16×72: [0] parede do fundo-direita, [1] canto, [2] parede do fundo-esquerda.
// Âncora no vértice inferior da pegada (meio tile).
export const WALL_W = 16;
export const WALL_SRC_H = 72;
export const WALL_ANCHOR = [8, 68];
export const WALLS = {
    madeira: [80, 8],
    bege: [128, 8],
    painel: [176, 8],
    cinza: [0, 88],
    listrado: [48, 88],
    verde: [96, 88],
    ardosia: [144, 88],
    laranja: [192, 88],
    marinho: [0, 168],
    terracota: [48, 168],
    marrom: [96, 168],
};

// Âncora no vértice inferior do tile: (w/2, h-1). facing = direção nativa no pack; seat = altura do assento em px de tela.
export const FURNITURE = {
    poltrona: { sheet: 'furniture', x: 2, y: 160, w: 34, h: 35, facing: 'SE', seat: 12 },
    sofa: { sheet: 'furniture', x: 73, y: 160, w: 30, h: 33, facing: 'SE', seat: 12 },
    mesa: { sheet: 'furniture', x: 73, y: 436, w: 32, h: 20, facing: 'SW' },
    estante: { sheet: 'furniture', x: 430, y: 240, w: 34, h: 66, facing: 'SW' },
};

// Tapetes por pegada (largura em x × altura em y); 1x2 é o 2x1 espelhado. Âncora no vértice inferior.
export const RUGS = {
    '2x2': { sheet: 'decoration', x: 84, y: 384, w: 64, h: 32 },
    '2x1': { sheet: 'decoration', x: 248, y: 384, w: 48, h: 24 },
};

export function loadAtlas() {
    const sheets = new Map();
    const loads = Object.entries(SHEETS).map(([name, file]) => {
        const img = new Image();
        img.src = BASE + file;
        return img
            .decode()
            .then(() => sheets.set(name, img))
            .catch(() => {});
    });

    return Promise.all(loads).then(() => ({ sheets, has: (name) => sheets.has(name) }));
}

// Encostado na parede do fundo-direita (y <= x) olha para SW; na do fundo-esquerda, para SE.
export function facing(item) {
    return item.y <= item.x ? 'SW' : 'SE';
}

export function seatHeight(type) {
    return FURNITURE[type]?.seat ?? 0;
}

// Desenha o recorte com o ponto nativo (ax, ay) sobre o ponto de tela (px, py); flip espelha em torno da âncora.
export function drawSprite(ctx, atlas, sheet, sx, sy, sw, sh, ax, ay, px, py, flip = false) {
    const img = atlas?.sheets.get(sheet);
    if (!img) return false;

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.translate(Math.round(px), Math.round(py));
    if (flip) ctx.scale(-1, 1);
    ctx.drawImage(img, sx, sy, sw, sh, -ax * PX, -ay * PX, sw * PX, sh * PX);
    ctx.restore();
    return true;
}
