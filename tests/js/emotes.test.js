import assert from 'node:assert/strict';
import { test } from 'node:test';
import { EMOTES, isEmote } from '../../resources/js/republica/emotes.js';

test('11 emotes com tipos únicos', () => {
    assert.equal(EMOTES.length, 11);
    assert.equal(new Set(EMOTES.map((e) => e.type)).size, 11);
});

test('isEmote aceita só o catálogo', () => {
    assert.ok(isEmote('feliz') && isEmote('musica'));
    assert.ok(!isEmote('Olá, tudo bem?') && !isEmote(undefined));
});

test('balões do pack usam quadros 0–7 e os 9 primeiros vão de Feliz a Oi', () => {
    for (const e of EMOTES.filter((e) => 'frame' in e)) assert.ok(e.frame >= 0 && e.frame <= 7);
    assert.equal(EMOTES[0].type, 'feliz');
    assert.equal(EMOTES[8].type, 'oi');
});
