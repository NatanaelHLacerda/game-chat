export function flagElement(languages, code) {
    const language = languages[code];
    const flag = document.createElement('i');
    flag.className = 'flag';
    flag.title = language?.name ?? code;
    (language?.flag ?? []).forEach((color, i) => flag.style.setProperty(`--flag-${i + 1}`, color));
    flag.style.setProperty('--flag-count', String(language?.flag.length ?? 3));
    return flag;
}

// Idiomas de quem está no quarto: primeiro os praticados, depois os falados, sem repetir.
function roomLanguages(members, limit = 4) {
    const codes = [];
    for (const field of ['practices', 'speaks']) {
        for (const member of members) {
            for (const code of member[field] ?? []) {
                if (!codes.includes(code)) codes.push(code);
            }
        }
    }
    return codes.slice(0, limit);
}

export function renderNavigator(list, { rooms, occupancy, currentRoomId, languages, onSelect }) {
    const sorted = [...rooms].sort((a, b) => {
        if (a.kind !== b.kind) return a.kind === 'common' ? -1 : 1;
        const diff = (occupancy.get(b.id)?.length ?? 0) - (occupancy.get(a.id)?.length ?? 0);
        return diff || a.name.localeCompare(b.name, 'pt-BR');
    });

    list.replaceChildren(...sorted.map((room) => {
        const members = occupancy.get(room.id) ?? [];
        const item = document.createElement('li');
        item.classList.toggle('current', room.id === currentRoomId);

        const name = document.createElement('span');
        name.className = 'room-name';
        name.textContent = room.name;

        const count = document.createElement('span');
        count.className = 'count';
        count.classList.toggle('empty', members.length === 0);
        count.textContent = String(members.length);

        item.append(name, ...roomLanguages(members).map((code) => flagElement(languages, code)), count);
        item.addEventListener('click', () => onSelect(room.id));
        return item;
    }));
}
