import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createGestures } from '../../resources/js/republica/gestures.js';

function tracker() {
    const events = [];
    const g = createGestures({
        onTap: (x, y, type) => events.push(['tap', x, y, type]),
        onPan: (dx, dy) => events.push(['pan', dx, dy]),
        onPinch: (dir) => events.push(['pinch', dir]),
    });
    return { g, events };
}

test('toque curto vira tap', () => {
    const { g, events } = tracker();
    g.down({ id: 1, x: 100, y: 100, type: 'touch' });
    g.move({ id: 1, x: 104, y: 103 });
    g.up({ id: 1, x: 104, y: 103, type: 'touch' });
    assert.deepEqual(events, [['tap', 104, 103, 'touch']]);
});

test('movimento acima de 10 px vira pan, sem tap', () => {
    const { g, events } = tracker();
    g.down({ id: 1, x: 100, y: 100 });
    g.move({ id: 1, x: 120, y: 100 });
    g.move({ id: 1, x: 125, y: 90 });
    g.up({ id: 1, x: 125, y: 90 });
    assert.deepEqual(events, [['pan', 20, 0], ['pan', 5, -10]]);
});

test('pinça abrindo dispara um pinch in; fechando, out', () => {
    const open = tracker();
    open.g.down({ id: 1, x: 100, y: 100 });
    open.g.down({ id: 2, x: 200, y: 100 });
    open.g.move({ id: 2, x: 240, y: 100 });
    open.g.move({ id: 2, x: 300, y: 100 });
    assert.deepEqual(open.events, [['pinch', 'in']]);

    const close = tracker();
    close.g.down({ id: 1, x: 100, y: 100 });
    close.g.down({ id: 2, x: 200, y: 100 });
    close.g.move({ id: 2, x: 170, y: 100 });
    assert.deepEqual(close.events, [['pinch', 'out']]);
});

test('soltar um dedo depois da pinça não gera tap', () => {
    const { g, events } = tracker();
    g.down({ id: 1, x: 100, y: 100 });
    g.down({ id: 2, x: 200, y: 100 });
    g.up({ id: 2, x: 200, y: 100 });
    g.up({ id: 1, x: 100, y: 100 });
    assert.deepEqual(events, []);
});

test('cancel não gera tap', () => {
    const { g, events } = tracker();
    g.down({ id: 1, x: 100, y: 100 });
    g.cancel({ id: 1 });
    g.up({ id: 1, x: 100, y: 100 });
    assert.deepEqual(events, []);
});
