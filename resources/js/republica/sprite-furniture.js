// TESTE (não está na especificação): móveis com sprites do Furniture Kit do Kenney (CC0).
// Ativado só com ?mobilia=kenney no endereço; sem o parâmetro, nada muda.
import { TILE_W, toScreen } from './iso';

const SOURCE_TILE_W = 151; // largura do piso isométrico no kit do Kenney
const SCALE = TILE_W / SOURCE_TILE_W;

const SPRITES = {
    sofa: 'loungeSofa',
    poltrona: 'loungeChair',
    mesa: 'tableCoffee',
    planta: 'pottedPlant',
    luminaria: 'lampRoundFloor',
    estante: 'bookcaseOpen',
};

export function spritesRequested() {
    return new URLSearchParams(window.location.search).get('mobilia') === 'kenney';
}

export async function loadFurnitureSprites() {
    const sprites = new Map();
    const loads = [];
    for (const [type, name] of Object.entries(SPRITES)) {
        for (const dir of ['SW', 'SE']) {
            const img = new Image();
            img.src = `/sprites/kenney/${name}_${dir}.png`;
            loads.push(img.decode().then(() => sprites.set(`${type}_${dir}`, img)).catch(() => {}));
        }
    }
    await Promise.all(loads);
    return sprites;
}

// Encostado na parede do fundo-direita (y <= x) olha para SW; na do fundo-esquerda, para SE.
export function drawFurnitureSprite(ctx, camera, item, sprites) {
    const img = sprites.get(`${item.type}_${item.y <= item.x ? 'SW' : 'SE'}`);
    if (!img) return false;

    const w = img.naturalWidth * SCALE;
    const h = img.naturalHeight * SCALE;
    const center = toScreen(item.x + 0.5, item.y + 0.5, camera);
    // A base do sprite é o vértice inferior da área ocupada (metade da altura do losango = largura / 4).
    const bottom = center.y + w / 4;

    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, Math.round(center.x - w / 2), Math.round(bottom - h), Math.round(w), Math.round(h));
    ctx.restore();
    return true;
}
