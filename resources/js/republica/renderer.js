import { drawAvatar, drawHeadset, drawSpeakingRing, shade } from './avatar';
import { TILE_H, WALL_H, toScreen } from './iso';
import { drawFurnitureSprite } from './sprite-furniture';

const VOID = '#2b2523';
const CREAM = '#f6ead8';
const INK = '#3e3431';
const SEAT_HEIGHT = 10;
const HEAD_TOP = 62;

function polygon(ctx, points, fill, stroke) {
    ctx.beginPath();
    points.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.stroke();
    }
}

const up = (p, h) => ({ x: p.x, y: p.y - h });

function tileDiamond(camera, x, y, inset = 0) {
    return [
        toScreen(x + inset, y + inset, camera),
        toScreen(x + 1 - inset, y + inset, camera),
        toScreen(x + 1 - inset, y + 1 - inset, camera),
        toScreen(x + inset, y + 1 - inset, camera),
    ];
}

// Caixa isométrica em coordenadas de tile fracionárias, elevada `elevation` px.
export function drawBlock(ctx, camera, x0, y0, x1, y1, elevation, height, color) {
    const top = elevation + height;
    const b = toScreen(x1, y0, camera);
    const c = toScreen(x1, y1, camera);
    const d = toScreen(x0, y1, camera);
    const a = toScreen(x0, y0, camera);

    polygon(ctx, [up(d, elevation), up(c, elevation), up(c, top), up(d, top)], shade(color, -0.12));
    polygon(ctx, [up(c, elevation), up(b, elevation), up(b, top), up(c, top)], shade(color, -0.25));
    polygon(ctx, [up(a, top), up(b, top), up(c, top), up(d, top)], color);
}

export function drawRoom(ctx, layout, camera) {
    const rows = layout.tiles.length;
    const cols = layout.tiles[0].length;
    const isFloor = (x, y) => x >= 0 && y >= 0 && x < cols && y < rows && layout.tiles[y][x] === '.';
    const [doorX, doorY] = layout.door;

    // Paredes do fundo
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (!isFloor(x, y)) continue;

            if (!isFloor(x - 1, y)) {
                const p1 = toScreen(x, y, camera);
                const p2 = toScreen(x, y + 1, camera);
                polygon(ctx, [p1, p2, up(p2, WALL_H), up(p1, WALL_H)], layout.wall_left);
                ctx.strokeStyle = shade(layout.wall_left, -0.2);
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y - WALL_H);
                ctx.lineTo(p2.x, p2.y - WALL_H);
                ctx.stroke();

                if (x === doorX && y === doorY) {
                    const lerp = (t) => ({ x: p1.x + (p2.x - p1.x) * t, y: p1.y + (p2.y - p1.y) * t });
                    const d1 = lerp(0.2);
                    const d2 = lerp(0.8);
                    polygon(ctx, [d1, d2, up(d2, 72), up(d1, 72)], VOID, shade(layout.wall_left, -0.35));
                }
            }

            if (!isFloor(x, y - 1)) {
                const p1 = toScreen(x, y, camera);
                const p2 = toScreen(x + 1, y, camera);
                polygon(ctx, [p1, p2, up(p2, WALL_H), up(p1, WALL_H)], layout.wall_right);
                ctx.strokeStyle = shade(layout.wall_right, -0.2);
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y - WALL_H);
                ctx.lineTo(p2.x, p2.y - WALL_H);
                ctx.stroke();
            }
        }
    }

    // Piso em xadrez sutil
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (!isFloor(x, y)) continue;
            const color = (x + y) % 2 ? layout.floor : shade(layout.floor, -0.04);
            polygon(ctx, tileDiamond(camera, x, y), color, shade(layout.floor, -0.1));
        }
    }

    // Tapetes ficam no chão, fora da ordenação por profundidade
    for (const item of layout.furniture) {
        if (item.type !== 'tapete') continue;
        polygon(ctx, tileDiamond(camera, item.x, item.y, 0.06), (item.x + item.y) % 2 ? '#f4b393' : '#9fbf9a', INK);
    }
}

export const furnitureDrawers = {
    sofa(ctx, camera, { x, y }) {
        drawBlock(ctx, camera, x + 0.08, y + 0.1, x + 0.92, y + 0.92, 0, 12, '#e8735a');
        drawBlock(ctx, camera, x + 0.08, y + 0.1, x + 0.92, y + 0.32, 12, 16, '#d9694a');
    },
    poltrona(ctx, camera, { x, y }) {
        drawBlock(ctx, camera, x + 0.2, y + 0.2, x + 0.85, y + 0.85, 0, 12, '#9fbf9a');
        drawBlock(ctx, camera, x + 0.2, y + 0.2, x + 0.85, y + 0.38, 12, 16, '#6f9a78');
    },
    mesa(ctx, camera, { x, y }) {
        drawBlock(ctx, camera, x + 0.42, y + 0.42, x + 0.58, y + 0.58, 0, 18, '#8d5b4c');
        drawBlock(ctx, camera, x + 0.1, y + 0.1, x + 0.9, y + 0.9, 18, 4, '#c9a27e');
    },
    planta(ctx, camera, { x, y }) {
        drawBlock(ctx, camera, x + 0.32, y + 0.32, x + 0.68, y + 0.68, 0, 16, '#c4573f');
        const c = toScreen(x + 0.5, y + 0.5, camera);
        const leaves = [[0, -30, 12, '#6f9a78'], [-9, -22, 9, '#9fbf9a'], [9, -24, 9, '#7fae86'], [0, -40, 8, '#9fbf9a']];
        for (const [dx, dy, r, color] of leaves) {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(c.x + dx, c.y + dy, r, 0, Math.PI * 2);
            ctx.fill();
        }
    },
    luminaria(ctx, camera, { x, y }) {
        drawBlock(ctx, camera, x + 0.38, y + 0.38, x + 0.62, y + 0.62, 0, 4, INK);
        drawBlock(ctx, camera, x + 0.47, y + 0.47, x + 0.53, y + 0.53, 4, 52, INK);
        const c = toScreen(x + 0.5, y + 0.5, camera);
        const glow = ctx.createRadialGradient(c.x, c.y - 62, 4, c.x, c.y - 62, 44);
        glow.addColorStop(0, 'rgba(244, 179, 147, 0.45)');
        glow.addColorStop(1, 'rgba(244, 179, 147, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(c.x - 44, c.y - 106, 88, 88);
        drawBlock(ctx, camera, x + 0.3, y + 0.3, x + 0.7, y + 0.7, 56, 14, CREAM);
    },
    estante(ctx, camera, { x, y }) {
        // Encostada na parede mais próxima (fundo-direita se y <= x, senão fundo-esquerda)
        const box = y <= x ? [x + 0.05, y + 0.05, x + 0.95, y + 0.45] : [x + 0.05, y + 0.05, x + 0.45, y + 0.95];
        drawBlock(ctx, camera, ...box, 0, 70, '#8d5b4c');
        const books = ['#e8735a', '#9fbf9a', '#f2d16b'];
        books.forEach((color, i) => drawBlock(ctx, camera, box[0] + 0.05, box[1] + 0.05, box[2], box[3], 6 + i * 22, 14, color));
    },
};

function drawNameTag(ctx, x, y, name) {
    ctx.font = 'bold 11px Verdana, Tahoma, sans-serif';
    const w = Math.ceil(ctx.measureText(name).width) + 12;
    const left = Math.round(x - w / 2);
    ctx.fillStyle = CREAM;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(left + 0.5, Math.round(y) + 0.5, w, 17, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = INK;
    ctx.textBaseline = 'middle';
    ctx.fillText(name, left + 6, Math.round(y) + 9);
}

// Posição de tela dos pés de um avatar (posição interpolada).
export function avatarFoot(avatar, camera, grid) {
    const p = toScreen(avatar.render.x, avatar.render.y, camera);
    const lift = avatar.sitting && grid.seat(avatar.pos.x, avatar.pos.y) ? SEAT_HEIGHT : 0;

    return { x: p.x, y: p.y + TILE_H / 2 - lift };
}

/**
 * state: { layout, camera, grid, furnitureTypes, avatars, hoverTile, hoverAvatarId, width, height, decorate, time }
 */
export function drawScene(ctx, state) {
    const { layout, camera, grid, avatars } = state;

    ctx.fillStyle = VOID;
    ctx.fillRect(0, 0, state.width, state.height);
    drawRoom(ctx, layout, camera);

    if (state.hoverTile && grid.walkable(state.hoverTile.x, state.hoverTile.y)) {
        ctx.lineWidth = 2;
        polygon(ctx, tileDiamond(camera, state.hoverTile.x, state.hoverTile.y, 0.04), 'rgba(246, 234, 216, 0.25)', CREAM);
        ctx.lineWidth = 1;
    }

    const items = [];
    for (const item of layout.furniture) {
        if (item.type === 'tapete' || !furnitureDrawers[item.type]) continue;
        items.push({
            depth: item.x + item.y,
            draw: () => {
                if (state.sprites && drawFurnitureSprite(ctx, camera, item, state.sprites)) return;
                furnitureDrawers[item.type](ctx, camera, item);
            },
        });
    }
    for (const avatar of avatars) {
        items.push({
            depth: avatar.render.x + avatar.render.y + 0.5,
            draw: () => {
                const foot = avatarFoot(avatar, camera, grid);
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
        const foot = avatarFoot(hovered, camera, grid);
        drawNameTag(ctx, foot.x, foot.y - 82, hovered.member.name);
    }
}
