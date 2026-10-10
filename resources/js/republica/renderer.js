import {
    FLOOR_H,
    FLOOR_W,
    FLOORS,
    FURNITURE,
    RUGS,
    WALL_ANCHOR,
    WALL_SRC_H,
    WALL_W,
    WALLS,
    drawSprite,
    facing,
    seatHeight,
} from './atlas';
import { drawAvatar, drawHeadset, drawSpeakingRing, shade } from './avatar';
import { TILE_H, TILE_W, WALL_H, toScreen } from './iso';
import { INK, PX, block, fillDiamond, fillEllipse, rect, strokeDiamond, wallFace } from './pixel';
import { groupRugs } from './rugs';

const VOID = '#2b2523';
const CREAM = '#f6ead8';
const HEAD_TOP = 62;
const DOOR_H = 72;

const up = (p, h) => ({ x: p.x, y: p.y - h });
const lerp = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

function floorTest(layout) {
    const rows = layout.tiles.length;
    const cols = layout.tiles[0].length;
    return (x, y) => x >= 0 && y >= 0 && x < cols && y < rows && layout.tiles[y][x] === '.';
}

// Bloco de parede (peça 0, 1 ou 2 do grupo) com o vértice inferior da pegada em `bottom`.
function wallBlock(ctx, atlas, texture, piece, bottom) {
    const [gx, gy] = WALLS[texture] ?? WALLS.cinza;
    return drawSprite(ctx, atlas, 'wall', gx + piece * WALL_W, gy, WALL_W, WALL_SRC_H, ...WALL_ANCHOR, bottom.x, bottom.y);
}

function fallbackWall(ctx, p1, p2, color) {
    wallFace(ctx, p1, p2, WALL_H, color);
    wallFace(ctx, up(p1, WALL_H), up(p2, WALL_H), PX, INK);
}

function drawDoor(ctx, layout, camera) {
    const [x, y] = layout.door;
    const p1 = toScreen(x, y, camera);
    const p2 = toScreen(x, y + 1, camera);
    const step = PX / Math.abs(p2.x - p1.x);
    wallFace(ctx, lerp(p1, p2, 0.2), lerp(p1, p2, 0.8), DOOR_H + PX, shade(layout.wall_left, -0.35));
    wallFace(ctx, lerp(p1, p2, 0.2 + step), lerp(p1, p2, 0.8 - step), DOOR_H, VOID);
}

// Paredes ficam por fora do piso: blocos de meio tile, 2 por aresta, do fundo para a frente.
export function drawWalls(ctx, layout, camera, atlas) {
    const isFloor = floorTest(layout);
    const theme = layout.theme ?? {};
    const sheet = atlas.has('wall');

    if (isFloor(0, 0) && sheet) wallBlock(ctx, atlas, theme.wall_left, 1, toScreen(0, 0, camera));

    for (let y = 0; y < layout.tiles.length; y++) {
        for (let x = 0; x < layout.tiles[0].length; x++) {
            if (!isFloor(x, y) || isFloor(x - 1, y)) continue;
            if (sheet) {
                wallBlock(ctx, atlas, theme.wall_left, 2, toScreen(x, y + 0.5, camera));
                wallBlock(ctx, atlas, theme.wall_left, 2, toScreen(x, y + 1, camera));
            } else {
                fallbackWall(ctx, toScreen(x, y, camera), toScreen(x, y + 1, camera), layout.wall_left);
            }
        }
    }

    for (let x = 0; x < layout.tiles[0].length; x++) {
        for (let y = 0; y < layout.tiles.length; y++) {
            if (!isFloor(x, y) || isFloor(x, y - 1)) continue;
            if (sheet) {
                wallBlock(ctx, atlas, theme.wall_right, 0, toScreen(x + 0.5, y, camera));
                wallBlock(ctx, atlas, theme.wall_right, 0, toScreen(x + 1, y, camera));
            } else {
                fallbackWall(ctx, toScreen(x, y, camera), toScreen(x + 1, y, camera), layout.wall_right);
            }
        }
    }

    drawDoor(ctx, layout, camera);
}

// Piso em amostras de meio tile, varrendo por meias-linhas para as da frente cobrirem a espessura das de trás.
export function drawFloor(ctx, layout, camera, atlas) {
    const isFloor = floorTest(layout);
    const [fx, fy] = FLOORS[layout.theme?.floor] ?? FLOORS.bege;
    const rows = layout.tiles.length;
    const cols = layout.tiles[0].length;

    for (let y2 = 0; y2 < rows * 2; y2++) {
        for (let x2 = 0; x2 < cols * 2; x2++) {
            if (!isFloor(x2 >> 1, y2 >> 1)) continue;
            const p = toScreen(x2 / 2, y2 / 2, camera);
            if (drawSprite(ctx, atlas, 'floor', fx, fy, FLOOR_W, FLOOR_H, FLOOR_W / 2, 0, p.x, p.y)) continue;
            if (x2 % 2 || y2 % 2) continue;
            fillDiamond(ctx, p.x, p.y, TILE_W, TILE_H, (x2 + y2) % 4 ? layout.floor : shade(layout.floor, -0.04));
            strokeDiamond(ctx, p.x, p.y, TILE_W, TILE_H, shade(layout.floor, -0.1));
        }
    }
}

// Tapetes ficam no chão, fora da ordenação por profundidade.
export function drawRugs(ctx, layout, camera, atlas) {
    for (const g of groupRugs(layout.furniture)) {
        const rug = g.w === 2 && g.h === 2 ? RUGS['2x2'] : g.w * g.h === 2 ? RUGS['2x1'] : null;
        const bottom = toScreen(g.x + g.w, g.y + g.h, camera);
        if (rug && drawSprite(ctx, atlas, rug.sheet, rug.x, rug.y, rug.w, rug.h, rug.w / 2, rug.h - 1, bottom.x, bottom.y, g.h > g.w)) {
            continue;
        }
        for (let dy = 0; dy < g.h; dy++) {
            for (let dx = 0; dx < g.w; dx++) {
                const top = toScreen(g.x + dx, g.y + dy, camera);
                fillDiamond(ctx, top.x, top.y + PX, TILE_W - 4 * PX, TILE_H - 2 * PX, (g.x + dx + g.y + dy) % 2 ? '#f4b393' : '#9fbf9a');
                strokeDiamond(ctx, top.x, top.y + PX, TILE_W - 4 * PX, TILE_H - 2 * PX, INK);
            }
        }
    }
}

function drawPlant(ctx, camera, { x, y }) {
    const c = toScreen(x + 0.5, y + 0.5, camera);
    // Vaso: trapézio de 12 px, mais largo em cima
    for (let i = 0; i < 6; i++) {
        const half = 10 - (i >> 1) * PX;
        rect(ctx, c.x - half - PX, c.y - 12 + i * PX, 2 * half + 2 * PX, PX, INK);
        rect(ctx, c.x - half, c.y - 12 + i * PX, 2 * half, PX, i < 2 ? '#c4573f' : '#a8452f');
    }
    rect(ctx, c.x - 8 - PX, c.y, 16 + 2 * PX, PX, INK);
    const leaves = [[0, -30, 12, '#6f9a78'], [-10, -22, 10, '#9fbf9a'], [10, -24, 10, '#7fae86'], [0, -40, 8, '#9fbf9a']];
    for (const [dx, dy, r] of leaves) fillEllipse(ctx, c.x + dx, c.y + dy, r + PX, r + PX, INK);
    for (const [dx, dy, r, color] of leaves) fillEllipse(ctx, c.x + dx, c.y + dy, r, r, color);
}

function drawLamp(ctx, camera, { x, y }) {
    const c = toScreen(x + 0.5, y + 0.5, camera);
    fillEllipse(ctx, c.x, c.y - 62, 40, 40, 'rgba(244, 179, 147, 0.15)');
    fillEllipse(ctx, c.x, c.y - 62, 28, 28, 'rgba(244, 179, 147, 0.25)');
    rect(ctx, c.x - 6, c.y - 4, 12, 4, INK);
    rect(ctx, c.x - 2, c.y - 56, 4, 52, INK);
    // Cúpula: trapézio creme de 14 px, mais estreito em cima
    for (let i = 0; i < 7; i++) {
        const half = 8 + (i >> 1) * PX;
        const edge = i === 0 || i === 6;
        rect(ctx, c.x - half - PX, c.y - 70 + i * PX, 2 * half + 2 * PX, PX, INK);
        if (!edge) rect(ctx, c.x - half, c.y - 70 + i * PX, 2 * half, PX, i < 3 ? CREAM : shade(CREAM, -0.08));
    }
}

export function drawFurniture(ctx, camera, item, atlas) {
    if (item.type === 'planta') return drawPlant(ctx, camera, item);
    if (item.type === 'luminaria') return drawLamp(ctx, camera, item);

    const sprite = FURNITURE[item.type];
    if (!sprite) return;
    const bottom = toScreen(item.x + 1, item.y + 1, camera);
    const flip = facing(item) !== sprite.facing;
    if (drawSprite(ctx, atlas, sprite.sheet, sprite.x, sprite.y, sprite.w, sprite.h, sprite.w / 2, sprite.h - 1, bottom.x, bottom.y, flip)) return;

    const c = toScreen(item.x + 0.5, item.y + 0.5, camera);
    block(ctx, c.x - 16, c.y - 24, 32, 28, '#c9a27e');
}

function drawNameTag(ctx, x, y, name) {
    ctx.font = 'bold 11px Verdana, Tahoma, sans-serif';
    let w = Math.ceil(ctx.measureText(name).width) + 12;
    w += w % 2;
    const h = 18;
    const left = Math.round(x - w / 2);
    const top = Math.round(y);
    // Contorno sem os cantos: a moldura fica chanfrada
    rect(ctx, left + PX, top, w - 2 * PX, PX, INK);
    rect(ctx, left + PX, top + h - PX, w - 2 * PX, PX, INK);
    rect(ctx, left, top + PX, PX, h - 2 * PX, INK);
    rect(ctx, left + w - PX, top + PX, PX, h - 2 * PX, INK);
    rect(ctx, left + PX, top + PX, w - 2 * PX, h - 2 * PX, CREAM);
    ctx.fillStyle = INK;
    ctx.textBaseline = 'middle';
    ctx.fillText(name, left + 6, top + 9);
}

// Tipo de móvel (não tapete) em cada tile, memorizado por layout.
const typesByLayout = new WeakMap();
function typeAt(layout, x, y) {
    let types = typesByLayout.get(layout);
    if (!types) {
        types = new Map();
        for (const item of layout.furniture) {
            const key = `${item.x},${item.y}`;
            if (item.type !== 'tapete' && !types.has(key)) types.set(key, item.type);
        }
        typesByLayout.set(layout, types);
    }
    return types.get(`${x},${y}`);
}

// Posição de tela dos pés de um avatar (posição interpolada).
export function avatarFoot(avatar, camera, grid, layout) {
    const p = toScreen(avatar.render.x, avatar.render.y, camera);
    const seated = layout && avatar.sitting && grid.seat(avatar.pos.x, avatar.pos.y);
    const lift = seated ? seatHeight(typeAt(layout, avatar.pos.x, avatar.pos.y)) : 0;

    return { x: p.x, y: p.y + TILE_H / 2 - lift };
}

/**
 * state: { layout, camera, grid, avatars, hoverTile, hoverAvatarId, width, height, decorate, atlas, time }
 */
export function drawScene(ctx, state) {
    const { layout, camera, grid, avatars, atlas } = state;

    ctx.fillStyle = VOID;
    ctx.fillRect(0, 0, state.width, state.height);
    if (!atlas) return;

    drawWalls(ctx, layout, camera, atlas);
    drawFloor(ctx, layout, camera, atlas);
    drawRugs(ctx, layout, camera, atlas);

    if (state.hoverTile && grid.walkable(state.hoverTile.x, state.hoverTile.y)) {
        const top = toScreen(state.hoverTile.x, state.hoverTile.y, camera);
        fillDiamond(ctx, top.x, top.y, TILE_W, TILE_H, 'rgba(246, 234, 216, 0.25)');
        strokeDiamond(ctx, top.x, top.y, TILE_W, TILE_H, CREAM);
    }

    const items = [];
    for (const item of layout.furniture) {
        if (item.type === 'tapete') continue;
        items.push({ depth: item.x + item.y, draw: () => drawFurniture(ctx, camera, item, atlas) });
    }
    for (const avatar of avatars) {
        items.push({
            depth: avatar.render.x + avatar.render.y + 0.5,
            draw: () => {
                const foot = avatarFoot(avatar, camera, grid, layout);
                const marks = state.decorate?.(avatar.member.id) ?? {};
                if (marks.speaking) drawSpeakingRing(ctx, foot.x, foot.y, state.time ?? 0);
                drawAvatar(ctx, foot.x, foot.y, avatar.member.look, {
                    dir: avatar.dir,
                    back: avatar.back,
                    walkPhase: avatar.walkPhase,
                    walking: avatar.path.length > 0,
                    sitting: avatar.sitting,
                });
                if (marks.inCall) drawHeadset(ctx, foot.x, foot.y - HEAD_TOP + (avatar.sitting ? 6 : 0));
            },
        });
    }
    items.sort((a, b) => a.depth - b.depth).forEach((item) => item.draw());

    const hovered = avatars.find((a) => a.member.id === state.hoverAvatarId);
    if (hovered) {
        const foot = avatarFoot(hovered, camera, grid, layout);
        drawNameTag(ctx, foot.x, foot.y - 82, hovered.member.name);
    }
}
