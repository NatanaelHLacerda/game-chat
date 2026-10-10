const STATUS = {
    initialized: 'conectando…',
    connecting: 'reconectando…',
    unavailable: 'reconectando…',
    connected: 'online',
    disconnected: 'desconectado',
    failed: 'sem conexão',
};

export function watchConnection(statusEl) {
    const connection = window.Echo.connector.pusher.connection;
    statusEl.textContent = 'conectando…';
    connection.bind('state_change', ({ current }) => {
        statusEl.textContent = STATUS[current] ?? current;
    });
}

export function renderPeople(container, members, meId) {
    container.replaceChildren(...members.map((member) => {
        const chip = document.createElement('span');
        chip.textContent = member.name;
        chip.classList.toggle('me', member.id === meId);
        return chip;
    }));
}

export function bindCloseButtons() {
    document.querySelectorAll('[data-close]').forEach((button) => {
        button.addEventListener('click', () => document.getElementById(button.dataset.close).classList.add('hidden'));
    });
}
