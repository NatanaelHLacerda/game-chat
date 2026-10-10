// Agrupa tiles de tapete vizinhos em retângulos (2×2, 2×1, 1×2 ou 1×1), que viram uma peça só no desenho.
export function groupRugs(furniture) {
    const cells = new Set();
    for (const item of furniture) if (item.type === 'tapete') cells.add(`${item.x},${item.y}`);

    const positions = [...cells]
        .map((key) => key.split(',').map(Number))
        .sort((a, b) => a[1] - b[1] || a[0] - b[0]);

    const used = new Set();
    const free = (x, y) => cells.has(`${x},${y}`) && !used.has(`${x},${y}`);
    const groups = [];

    for (const [x, y] of positions) {
        if (used.has(`${x},${y}`)) continue;
        const [w, h] = [[2, 2], [2, 1], [1, 2]].find(([gw, gh]) => {
            for (let dy = 0; dy < gh; dy++) for (let dx = 0; dx < gw; dx++) if (!free(x + dx, y + dy)) return false;
            return true;
        }) ?? [1, 1];

        for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) used.add(`${x + dx},${y + dy}`);
        groups.push({ x, y, w, h });
    }
    return groups;
}
