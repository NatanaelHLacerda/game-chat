// Animação por relógio: a pose sai do estado do avatar e do tempo, sem timers por avatar.
export const DANCES = [1, 2, 3];
export const DANCE_NAMES = { 1: 'Balanço', 2: 'Braços para cima', 3: 'Passinho' };
export const WAVE_MS = 1500;
export const EMOTE_MS = 4000;
export const EMOTE_COOLDOWN_MS = 2000;
export const EMOTE_RECEIVE_MS = 1900; // tolerância de rede no destino

export function isDance(value) {
    return value === 0 || DANCES.includes(value);
}

export function canEmote(lastAt, now, gap = EMOTE_COOLDOWN_MS) {
    return now - lastAt >= gap;
}

// Direção do avatar sentado = a direção para a qual o assento olha.
export function seatFacing(itemFacing) {
    return itemFacing === 'SE' ? { dir: 1, back: false } : { dir: -1, back: false };
}

export function poseFor({ walking = false, walkPhase = 0, sitting = false, dance = 0, waving = false, waveElapsed = 0, talking = false, time = 0, seed = 0 }) {
    let anim;
    let frame;
    if (sitting) {
        anim = 'sit';
        frame = 0;
    } else if (walking) {
        anim = 'walk';
        frame = Math.floor(walkPhase / 1.6) % 4;
    } else if (DANCES.includes(dance)) {
        anim = `dance${dance}`;
        frame = Math.floor(time * 6) % 4;
    } else {
        anim = 'idle';
        frame = Math.floor(time / 0.75) % 2;
    }

    const s = Math.abs(Math.trunc(seed));
    const period = 3 + (s % 4);

    return {
        anim,
        frame,
        sitting,
        blink: (time + (s % 7) * 0.61) % period < 0.15,
        talk: talking && Math.floor(time / 0.12) % 2 === 0,
        waving,
        waveFrame: waving ? Math.floor(waveElapsed / 250) % 3 : 0,
    };
}
