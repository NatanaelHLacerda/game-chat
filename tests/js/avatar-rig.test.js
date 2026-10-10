import assert from 'node:assert/strict';
import { test } from 'node:test';
import { poseFor } from '../../resources/js/republica/animation.js';
import { BOUNDS, HAIR_STYLES, TOP_STYLES, buildParts, normalizeLook } from '../../resources/js/republica/avatar-rig.js';

const look = { skin: '#f3c79e', hair: '#6b4a3a', shirt: '#e8735a', pants: '#6b4a3a' };
const pose = (anim, frame = 0, extra = {}) => ({ anim, frame, blink: false, talk: false, waving: false, waveFrame: 0, back: false, ...extra });
const POSES = [
    ...[0, 1].map((f) => pose('idle', f)),
    ...[0, 1, 2, 3].map((f) => pose('walk', f)),
    pose('sit'),
    ...[1, 2, 3].flatMap((d) => [0, 1, 2, 3].map((f) => pose(`dance${d}`, f))),
    ...[0, 1, 2].map((f) => pose('idle', 0, { waving: true, waveFrame: f })),
    pose('idle', 0, { talk: true, blink: true }),
];
const key = (parts) => JSON.stringify(parts);

test('normalizeLook completa estilos ausentes ou inválidos', () => {
    assert.deepEqual(normalizeLook(look), { ...look, hair_style: 'curto', top_style: 'camiseta' });
    assert.equal(normalizeLook({ ...look, hair_style: 'moicano', top_style: 'regata' }).hair_style, 'curto');
    assert.equal(normalizeLook({ ...look, top_style: 'regata' }).top_style, 'regata');
});

test('todas as combinações cabem em BOUNDS (com o contorno)', () => {
    for (const hair_style of HAIR_STYLES) {
        for (const top_style of TOP_STYLES) {
            for (const back of [false, true]) {
                for (const p of POSES) {
                    for (const part of buildParts({ ...look, hair_style, top_style }, { ...p, back })) {
                        assert.ok(part.x - 1 >= BOUNDS.x0 && part.x + part.w + 1 <= BOUNDS.x1, `x ${hair_style}/${top_style}/${p.anim}`);
                        assert.ok(part.y - 1 >= BOUNDS.y0 && part.y + part.h + 1 <= BOUNDS.y1, `y ${hair_style}/${top_style}/${p.anim}`);
                        assert.ok(Number.isInteger(part.x) && Number.isInteger(part.y));
                    }
                }
            }
        }
    }
});

test('a frente tem olhos e as costas não', () => {
    const eyes = (parts) => parts.filter((p) => p.paint === 'ink' && p.y < -19);
    assert.ok(eyes(buildParts(look, pose('idle'))).length >= 2);
    assert.equal(eyes(buildParts(look, pose('idle', 0, { back: true }))).length, 0);
});

test('piscar deixa o olho com 1 de altura', () => {
    const eyes = buildParts(look, pose('idle', 0, { blink: true })).filter((p) => p.paint === 'ink' && p.y < -22);
    assert.ok(eyes.length >= 2 && eyes.every((p) => p.h === 1));
});

test('quadros de andar e de dança diferem; sentar desce o tronco', () => {
    assert.notEqual(key(buildParts(look, pose('walk', 0))), key(buildParts(look, pose('walk', 2))));
    for (const d of [1, 2, 3]) {
        const frames = new Set([0, 1, 2, 3].map((f) => key(buildParts(look, pose(`dance${d}`, f)))));
        assert.ok(frames.size >= 3, `dance${d}`);
    }
    const torsoY = (p) => buildParts(look, p).find((part) => part.paint === 'top' && part.w === 8).y;
    assert.equal(torsoY(pose('sit')), torsoY(pose('idle')) + 3);
});

test('poseFor alimenta o rig sem erro', () => {
    assert.ok(buildParts(look, { ...poseFor({ dance: 2, time: 1.3, seed: 7 }), back: false }).length > 10);
});
