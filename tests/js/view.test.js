import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FOLLOW_MARGIN, clampPan, computeCamera, defaultZoom, followPan, roomBounds, toWorld } from '../../resources/js/republica/view.js';

const room = (cols, rows) => ({ tiles: Array.from({ length: rows }, () => '.'.repeat(cols)) });
const salaDeEstar = room(16, 14);
const quarto = room(10, 10);

test('fora do modo celular o zoom é sempre 2', () => {
    assert.equal(defaultZoom(salaDeEstar, 360, 580, false), 2);
});

test('no celular: 1 quando não cabe, 2 quando cabe', () => {
    assert.equal(defaultZoom(salaDeEstar, 360, 580, true), 1);
    const b = roomBounds(quarto);
    assert.equal(defaultZoom(quarto, b.maxX - b.minX, b.maxY - b.minY, true), 2);
    assert.equal(defaultZoom(quarto, 640, 300, true), 1);
});

test('clampPan: zero quando cabe e limitado quando não cabe', () => {
    assert.deepEqual(clampPan(quarto, 2000, 2000, 2, { x: 50, y: -50 }), { x: 0, y: 0 });
    const b = roomBounds(salaDeEstar);
    const limit = ((b.maxX - b.minX) - 360 / 0.5) / 2;
    assert.equal(clampPan(salaDeEstar, 360, 2000, 1, { x: 9999, y: 0 }).x, limit);
    assert.equal(clampPan(salaDeEstar, 360, 2000, 1, { x: -9999, y: 0 }).x, -limit);
});

test('computeCamera em zoom 1 fica em px de mundo pares', () => {
    for (const pan of [{ x: 0, y: 0 }, { x: 3, y: 7 }, { x: -5, y: 1 }]) {
        const c = computeCamera(salaDeEstar, 361, 579, 1, pan);
        assert.equal(c.x % 2, 0);
        assert.equal(c.y % 2, 0);
    }
});

test('followPan traz o pé de volta para dentro da margem', () => {
    const pan = followPan(salaDeEstar, 360, 580, 1, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 10, y: 600 });
    assert.ok(pan.x > 0);
    const margin = FOLLOW_MARGIN / 0.5;
    assert.ok(10 + pan.x >= margin || pan.x === clampPan(salaDeEstar, 360, 580, 1, { x: 9999, y: 0 }).x);
});

test('toWorld divide pela escala', () => {
    assert.deepEqual(toWorld(100, 50, 1), { x: 200, y: 100 });
    assert.deepEqual(toWorld(100, 50, 2), { x: 100, y: 50 });
});
