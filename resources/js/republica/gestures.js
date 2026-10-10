// Classifica ponteiros em toque curto, arrasto ou pinça. Puro: recebe { id, x, y, type } e chama os callbacks.
export const TAP_SLOP = 10; // px CSS
export const PINCH_IN = 1.25;
export const PINCH_OUT = 0.8;

const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

export function createGestures({ onTap, onPan, onPinch }) {
    const pointers = new Map();
    let mode = 'idle';
    let dist0 = 0;
    let pinched = false;

    const pair = () => [...pointers.values()].slice(0, 2);

    return {
        down({ id, x, y }) {
            if (pointers.size >= 2) return;
            pointers.set(id, { x, y, sx: x, sy: y });
            if (pointers.size === 1) {
                mode = 'press';
            } else {
                mode = 'pinch';
                dist0 = distance(...pair()) || 1;
                pinched = false;
            }
        },

        move({ id, x, y }) {
            const p = pointers.get(id);
            if (!p) return;
            const last = { x: p.x, y: p.y };
            p.x = x;
            p.y = y;

            if (mode === 'press' && Math.hypot(x - p.sx, y - p.sy) > TAP_SLOP) {
                mode = 'pan';
                onPan?.(x - p.sx, y - p.sy);
            } else if (mode === 'pan') {
                onPan?.(x - last.x, y - last.y);
            } else if (mode === 'pinch' && !pinched) {
                const ratio = distance(...pair()) / dist0;
                if (ratio >= PINCH_IN || ratio <= PINCH_OUT) {
                    pinched = true;
                    onPinch?.(ratio >= PINCH_IN ? 'in' : 'out');
                }
            }
        },

        up({ id, x, y, type }) {
            if (!pointers.has(id)) return;
            if (mode === 'press') onTap?.(x, y, type);
            pointers.delete(id);
            mode = pointers.size ? 'done' : 'idle';
        },

        cancel({ id }) {
            pointers.delete(id);
            mode = pointers.size ? 'done' : 'idle';
        },
    };
}
