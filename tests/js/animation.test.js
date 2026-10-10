import assert from 'node:assert/strict';
import { test } from 'node:test';
import { canEmote, isDance, poseFor, seatFacing } from '../../resources/js/republica/animation.js';

test('prioridade: sentado > andando > dançando > parado', () => {
    assert.equal(poseFor({ sitting: true, walking: true, dance: 1 }).anim, 'sit');
    assert.equal(poseFor({ walking: true, dance: 1 }).anim, 'walk');
    assert.equal(poseFor({ dance: 3 }).anim, 'dance3');
    assert.equal(poseFor({ dance: 9 }).anim, 'idle');
    assert.equal(poseFor({}).anim, 'idle');
});

test('andar percorre os 4 quadros', () => {
    const frames = new Set();
    for (let phase = 0; phase < 20; phase += 0.4) frames.add(poseFor({ walking: true, walkPhase: phase }).frame);
    assert.deepEqual([...frames].sort(), [0, 1, 2, 3]);
});

test('pisca de vez em quando, não o tempo todo', () => {
    let blinks = 0;
    let samples = 0;
    for (let t = 0; t < 6; t += 0.05) {
        samples++;
        if (poseFor({ time: t, seed: 5 }).blink) blinks++;
    }
    assert.ok(blinks > 0 && blinks < samples / 4);
});

test('fala alterna a boca e aceno avança os quadros', () => {
    assert.equal(poseFor({ talking: true, time: 0.05 }).talk, true);
    assert.equal(poseFor({ talking: true, time: 0.17 }).talk, false);
    assert.equal(poseFor({ talking: false, time: 0.05 }).talk, false);
    assert.equal(poseFor({ waving: true, waveElapsed: 600 }).waveFrame, 2);
});

test('canEmote, isDance e seatFacing', () => {
    assert.equal(canEmote(-Infinity, 0), true);
    assert.equal(canEmote(1000, 2999), false);
    assert.equal(canEmote(1000, 3000), true);
    assert.equal(canEmote(1000, 2900, 1900), true);
    assert.ok([0, 1, 2, 3].every(isDance));
    assert.ok(![4, -1, '1', null].some(isDance));
    assert.deepEqual(seatFacing('SE'), { dir: 1, back: false });
    assert.deepEqual(seatFacing('SW'), { dir: -1, back: false });
});
