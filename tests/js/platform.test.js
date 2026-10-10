import assert from 'node:assert/strict';
import { test } from 'node:test';
import { platformOf } from '../../resources/js/republica/platform.js';
import { micErrorMessage } from '../../resources/js/republica/voice/media.js';

const UA = {
    iphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
    ipad: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
    android: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36',
    linux: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
};

test('platformOf reconhece iPhone, iPad "Mac" com toque, Android e desktop', () => {
    assert.equal(platformOf(UA.iphone, 5), 'ios');
    assert.equal(platformOf(UA.ipad, 5), 'ios');
    assert.equal(platformOf(UA.ipad, 0), 'desktop');
    assert.equal(platformOf(UA.android, 5), 'android');
    assert.equal(platformOf(UA.linux, 0), 'desktop');
});

test('mensagem de microfone bloqueado por plataforma', () => {
    const denied = { name: 'NotAllowedError' };
    assert.match(micErrorMessage(denied, 'ios'), /Safari.*Ajustes do Site/);
    assert.match(micErrorMessage(denied, 'android'), /Chrome.*Permissões/);
    assert.equal(
        micErrorMessage(denied),
        'O navegador bloqueou o microfone. Clique no cadeado ao lado do endereço, permita o microfone e tente de novo.',
    );
    assert.equal(micErrorMessage({ name: 'NotFoundError' }, 'ios'), 'Nenhum microfone encontrado. Conecte um microfone e tente de novo.');
});
