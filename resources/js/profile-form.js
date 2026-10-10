import { renderPreview } from './republica/avatar';

const form = document.querySelector('.profile-form');
const preview = document.getElementById('preview');

function currentLook() {
    const look = {};
    for (const input of form.querySelectorAll('[data-look-picker] input:checked')) {
        look[input.name.match(/look\[(\w+)\]/)[1]] = input.value;
    }
    return look;
}

function updatePreview() {
    const look = currentLook();
    if (['skin', 'hair', 'shirt', 'pants'].every((part) => look[part])) renderPreview(preview, look);
}

// Ajuda de interface: no máximo N idiomas por lista e nada em "praticar" que já esteja em "falo".
function updateLanguages() {
    const picker = form.querySelector('[data-language-picker]');
    const max = Number(picker.dataset.max);
    const speaks = [...form.querySelectorAll('[data-language-list="speaks"] input')];
    const practices = [...form.querySelectorAll('[data-language-list="practices"] input')];
    const spoken = new Set(speaks.filter((i) => i.checked).map((i) => i.value));

    for (const list of [speaks, practices]) {
        const full = list.filter((i) => i.checked).length >= max;
        for (const input of list) {
            const blockedBySpeaks = list === practices && spoken.has(input.value);
            if (blockedBySpeaks) input.checked = false;
            input.disabled = !input.checked && (full || blockedBySpeaks);
        }
    }
}

form.addEventListener('change', () => {
    updatePreview();
    updateLanguages();
});
updatePreview();
updateLanguages();
