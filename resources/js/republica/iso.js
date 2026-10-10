// Projeção isométrica 2:1. (x, y) são coordenadas de tile; (0, 0) é o canto do fundo.
export const TILE_W = 64;
export const TILE_H = 32;
export const WALL_H = 110;

// Vértice superior do losango do tile (ou canto de coordenadas fracionárias).
export function toScreen(x, y, camera) {
    return {
        x: (x - y) * (TILE_W / 2) + camera.x,
        y: (x + y) * (TILE_H / 2) + camera.y,
    };
}

// Tile cujo losango contém o ponto de tela.
export function toTile(px, py, camera) {
    const a = (px - camera.x) / (TILE_W / 2);
    const b = (py - camera.y - TILE_H / 2) / (TILE_H / 2);

    return { x: Math.round((a + b) / 2), y: Math.round((b - a) / 2) };
}

// Centraliza o quarto (incluindo as paredes) na área visível acima da barra inferior.
export function fitCamera(layout, width, height, bottomBar) {
    const rows = layout.tiles.length;
    const cols = layout.tiles[0].length;
    const minX = -rows * (TILE_W / 2);
    const maxX = cols * (TILE_W / 2);
    const minY = -WALL_H;
    const maxY = (cols + rows) * (TILE_H / 2);

    return {
        x: Math.round(width / 2 - (minX + maxX) / 2),
        y: Math.round((height - bottomBar) / 2 - (minY + maxY) / 2),
    };
}
