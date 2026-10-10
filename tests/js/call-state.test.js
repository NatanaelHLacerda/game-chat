import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CallRegistry } from '../../resources/js/republica/voice/call-state.js';

test('setRoster cria a call e apaga quando sobra 1 membro', () => {
    const registry = new CallRegistry();
    registry.setRoster('c1', [1, 2]);
    assert.deepEqual([...registry.callOf(1).members], [1, 2]);

    registry.setRoster('c1', [1]);
    assert.equal(registry.callOf(1), null);
    assert.equal(registry.calls.size, 0);
});

test('addMember move o morador de outra call (um morador, uma call)', () => {
    const registry = new CallRegistry();
    registry.setRoster('a', [1, 2, 3]);
    registry.setRoster('b', [4, 5]);

    registry.addMember('b', 3);

    assert.equal(registry.callOf(3).id, 'b');
    assert.deepEqual([...registry.calls.get('a').members], [1, 2]);
});

test('removeMember informa se a call terminou', () => {
    const registry = new CallRegistry();
    registry.setRoster('c', [1, 2, 3]);

    const first = registry.removeMember(3);
    assert.equal(first.ended, false);
    assert.equal(registry.isInCall(1), true);

    const second = registry.removeMember(2);
    assert.equal(second.ended, true);
    assert.deepEqual([...second.members], [1]);
    assert.equal(registry.isInCall(1), false);
    assert.equal(registry.removeMember(9), null);
});

test('guardião do roster é o menor id', () => {
    const registry = new CallRegistry();
    registry.setRoster('c', [7, 3, 9]);
    assert.equal(registry.rosterKeeper('c'), 3);
});

test('em cada par exatamente um oferece e exatamente um aceita pedido cruzado', () => {
    assert.equal(CallRegistry.shouldOffer(5, 3), true);
    assert.equal(CallRegistry.shouldOffer(3, 5), false);
    assert.equal(CallRegistry.shouldAutoAcceptCrossed(3, 5), true);
    assert.equal(CallRegistry.shouldAutoAcceptCrossed(5, 3), false);

    for (const [a, b] of [[1, 2], [10, 4], [8, 9]]) {
        assert.notEqual(CallRegistry.shouldOffer(a, b), CallRegistry.shouldOffer(b, a));
        assert.notEqual(CallRegistry.shouldAutoAcceptCrossed(a, b), CallRegistry.shouldAutoAcceptCrossed(b, a));
    }
});
