import assert from 'node:assert/strict';
import { test } from 'node:test';
import { groupRugs } from '../../resources/js/republica/rugs.js';

const rugs = (cells) => cells.map(([x, y]) => ({ type: 'tapete', x, y }));

test('quatro tapetes em quadrado viram um grupo 2×2', () => {
    assert.deepEqual(groupRugs(rugs([[7, 7], [8, 7], [7, 8], [8, 8]])), [{ x: 7, y: 7, w: 2, h: 2 }]);
});

test('par em x vira 2×1 e par em y vira 1×2', () => {
    assert.deepEqual(groupRugs(rugs([[4, 4], [5, 4]])), [{ x: 4, y: 4, w: 2, h: 1 }]);
    assert.deepEqual(groupRugs(rugs([[3, 2], [3, 3]])), [{ x: 3, y: 2, w: 1, h: 2 }]);
});

test('tapete isolado vira 1×1', () => {
    assert.deepEqual(groupRugs(rugs([[1, 1]])), [{ x: 1, y: 1, w: 1, h: 1 }]);
});

test('móveis que não são tapete são ignorados', () => {
    const furniture = [{ type: 'sofa', x: 4, y: 4 }, { type: 'mesa', x: 5, y: 4 }, ...rugs([[0, 0]])];
    assert.deepEqual(groupRugs(furniture), [{ x: 0, y: 0, w: 1, h: 1 }]);
});

test('tapetes da Sala de estar (config) formam um único grupo', () => {
    const salaDeEstar = [
        { type: 'sofa', x: 4, y: 0 },
        { type: 'mesa', x: 5, y: 2 },
        ...rugs([[7, 7], [8, 7], [7, 8], [8, 8]]),
        { type: 'poltrona', x: 6, y: 9 },
    ];
    assert.equal(groupRugs(salaDeEstar).length, 1);
});
