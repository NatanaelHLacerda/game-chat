import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FLOOR_H, FLOOR_W, FLOORS, FURNITURE, RUGS, WALL_SRC_H, WALL_W, WALLS, facing, seatHeight } from '../../resources/js/republica/atlas.js';

// Espelha os temas de config/republica.php.
const THEMES = {
    sala: ['bege', 'laranja', 'laranja'],
    jardim: ['cinza', 'listrado', 'verde'],
    'por-do-sol': ['bege', 'laranja', 'terracota'],
    estudio: ['madeira', 'painel', 'ardosia'],
    'sala-de-estar': ['bege', 'laranja', 'verde'],
};

const SHEET_SIZES = { floor: [128, 48], wall: [256, 240], furniture: [512, 768], decoration: [512, 496] };

const fits = (sheet, x, y, w, h) => {
    const [sw, sh] = SHEET_SIZES[sheet];
    return x >= 0 && y >= 0 && x + w <= sw && y + h <= sh;
};

test('facing segue a regra y <= x', () => {
    assert.equal(facing({ x: 3, y: 0 }), 'SW');
    assert.equal(facing({ x: 2, y: 2 }), 'SW');
    assert.equal(facing({ x: 0, y: 8 }), 'SE');
});

test('todo móvel declara a direção nativa', () => {
    for (const sprite of Object.values(FURNITURE)) assert.ok(['SW', 'SE'].includes(sprite.facing));
});

test('assentos têm altura e o resto não', () => {
    assert.ok(seatHeight('sofa') > 0);
    assert.ok(seatHeight('poltrona') > 0);
    assert.equal(seatHeight('mesa'), 0);
    assert.equal(seatHeight('desconhecido'), 0);
});

test('todo tema da config usa texturas do manifesto', () => {
    for (const [layout, [floor, left, right]] of Object.entries(THEMES)) {
        assert.ok(FLOORS[floor], `${layout}: piso ${floor}`);
        assert.ok(WALLS[left], `${layout}: parede ${left}`);
        assert.ok(WALLS[right], `${layout}: parede ${right}`);
    }
});

test('todos os recortes cabem nas folhas', () => {
    for (const [x, y] of Object.values(FLOORS)) assert.ok(fits('floor', x, y, FLOOR_W, FLOOR_H));
    for (const [x, y] of Object.values(WALLS)) assert.ok(fits('wall', x, y, 3 * WALL_W, WALL_SRC_H));
    for (const s of [...Object.values(FURNITURE), ...Object.values(RUGS)]) assert.ok(fits(s.sheet, s.x, s.y, s.w, s.h));
});
