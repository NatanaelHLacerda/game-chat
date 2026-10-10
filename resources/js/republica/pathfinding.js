// Ordem fixa de vizinhos: garante que todos os clientes calculem o mesmo caminho.
const NEIGHBORS = [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]];

export function buildGrid(layout, furnitureTypes) {
    const h = layout.tiles.length;
    const w = layout.tiles[0].length;
    const blocked = new Set();
    const seats = new Set();

    for (const item of layout.furniture) {
        const type = furnitureTypes[item.type];
        if (!type.walkable) blocked.add(`${item.x},${item.y}`);
        if (type.seat) seats.add(`${item.x},${item.y}`);
    }

    const isFloor = (x, y) => x >= 0 && y >= 0 && x < w && y < h && layout.tiles[y][x] === '.';

    return {
        w,
        h,
        isFloor,
        walkable: (x, y) => isFloor(x, y) && !blocked.has(`${x},${y}`),
        seat: (x, y) => seats.has(`${x},${y}`),
    };
}

/**
 * BFS em 8 direções, sem cortar quinas. Atravessar tiles ocupados é permitido,
 * mas o destino precisa estar livre. Devolve o caminho sem o ponto inicial.
 */
export function findPath(grid, from, to, isOccupied = () => false) {
    if (!grid.walkable(to.x, to.y) || isOccupied(to)) return null;
    if (from.x === to.x && from.y === to.y) return [];

    const key = (x, y) => `${x},${y}`;
    const prev = new Map([[key(from.x, from.y), null]]);
    const queue = [from];

    for (let i = 0; i < queue.length; i++) {
        const current = queue[i];

        if (current.x === to.x && current.y === to.y) {
            const path = [];
            for (let node = current; node && (node.x !== from.x || node.y !== from.y); node = prev.get(key(node.x, node.y))) {
                path.unshift({ x: node.x, y: node.y });
            }
            return path;
        }

        for (const [dx, dy] of NEIGHBORS) {
            const nx = current.x + dx;
            const ny = current.y + dy;
            if (prev.has(key(nx, ny)) || !grid.walkable(nx, ny)) continue;
            if (dx && dy && (!grid.walkable(current.x + dx, current.y) || !grid.walkable(current.x, current.y + dy))) continue;
            prev.set(key(nx, ny), current);
            queue.push({ x: nx, y: ny });
        }
    }

    return null;
}

// Primeiro tile caminhável e livre a partir de origin (chegada pela porta).
export function nearestFree(grid, origin, isOccupied = () => false) {
    const seen = new Set([`${origin.x},${origin.y}`]);
    const queue = [origin];

    for (let i = 0; i < queue.length; i++) {
        const tile = queue[i];
        if (grid.walkable(tile.x, tile.y) && !isOccupied(tile)) return tile;

        for (const [dx, dy] of NEIGHBORS) {
            const next = { x: tile.x + dx, y: tile.y + dy };
            const k = `${next.x},${next.y}`;
            if (seen.has(k) || !grid.isFloor(next.x, next.y)) continue;
            seen.add(k);
            queue.push(next);
        }
    }

    return origin;
}
