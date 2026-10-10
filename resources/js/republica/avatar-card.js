import { renderPreview } from './avatar';
import { flagElement } from './navigator';
import { MOBILE_QUERY } from './view';

// Cartão do morador: nome, mini-avatar e idiomas. Sem ações nesta entrega.
export class AvatarCard {
    constructor(languages) {
        this.languages = languages;
        this.el = document.getElementById('avatar-card');
        this.name = document.getElementById('card-name');
        this.canvas = document.getElementById('card-avatar');
        this.speaks = document.getElementById('card-speaks');
        this.practices = document.getElementById('card-practices');
        this.action = document.getElementById('card-action');
        this.hint = document.getElementById('card-hint');
        this.member = null;
        this.currentAction = null;

        this.action.addEventListener('click', () => {
            const action = this.currentAction;
            this.close();
            action?.onClick?.();
        });

        document.addEventListener('pointerdown', (event) => {
            if (!this.el.classList.contains('hidden') && !this.el.contains(event.target)) this.close();
        });
    }

    open(member, screenPos, action = null) {
        this.member = member;
        this.name.textContent = member.name;
        renderPreview(this.canvas, member.look);
        this.speaks.replaceChildren(...(member.speaks ?? []).map((code) => flagElement(this.languages, code)));
        this.practices.replaceChildren(...(member.practices ?? []).map((code) => flagElement(this.languages, code)));

        this.refresh(action);
        this.el.classList.remove('hidden');
        // No celular o cartão é um painel inferior (CSS); não segue o toque.
        if (window.matchMedia(MOBILE_QUERY).matches) {
            this.el.style.left = '';
            this.el.style.top = '';
            return;
        }
        const { width, height } = this.el.getBoundingClientRect();
        this.el.style.left = `${Math.max(8, Math.min(window.innerWidth - width - 8, screenPos.x + 16))}px`;
        this.el.style.top = `${Math.max(8, Math.min(window.innerHeight - height - 60, screenPos.y - height))}px`;
    }

    // Reavalia o botão de ação (ex.: "Conversar") enquanto o cartão está aberto.
    refresh(action) {
        this.currentAction = action;
        this.action.classList.toggle('hidden', !action);
        this.hint.classList.toggle('hidden', !action?.hint);
        if (!action) return;
        this.action.textContent = action.label;
        this.action.disabled = Boolean(action.disabled);
        this.hint.textContent = action.hint ?? '';
    }

    isOpen() {
        return !this.el.classList.contains('hidden');
    }

    close() {
        this.el.classList.add('hidden');
        this.member = null;
        this.currentAction = null;
    }
}
