export async function getMicrophone() {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('insecure');

    return navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        video: false,
    });
}

export function micErrorMessage(error) {
    switch (error?.name === 'Error' ? error.message : error?.name) {
        case 'NotAllowedError':
        case 'SecurityError':
            return 'O navegador bloqueou o microfone. Clique no cadeado ao lado do endereço, permita o microfone e tente de novo.';
        case 'NotFoundError':
        case 'OverconstrainedError':
            return 'Nenhum microfone encontrado. Conecte um microfone e tente de novo.';
        case 'NotReadableError':
            return 'O microfone está sendo usado por outro programa. Feche-o e tente de novo.';
        case 'insecure':
            return 'A voz só funciona em endereço seguro (https ou localhost).';
        default:
            return 'Não foi possível ligar o microfone.';
    }
}

const SPEAK_ON = 0.04;
const SPEAK_OFF = 0.02;
const SILENCE_MS = 400;

// Detector de fala local por RMS, com histerese para não piscar.
export function createSpeakingDetector(stream, onChange) {
    const context = new AudioContext();
    const analyser = context.createAnalyser();
    analyser.fftSize = 512;
    context.createMediaStreamSource(stream).connect(analyser);

    const samples = new Float32Array(analyser.fftSize);
    let speaking = false;
    let quietSince = null;

    const interval = setInterval(() => {
        const enabled = stream.getAudioTracks().some((track) => track.enabled);
        analyser.getFloatTimeDomainData(samples);
        const rms = enabled ? Math.sqrt(samples.reduce((sum, v) => sum + v * v, 0) / samples.length) : 0;

        if (!speaking && rms > SPEAK_ON) {
            speaking = true;
            quietSince = null;
            onChange(true);
        } else if (speaking && rms < SPEAK_OFF) {
            quietSince ??= performance.now();
            if (!enabled || performance.now() - quietSince >= SILENCE_MS) {
                speaking = false;
                quietSince = null;
                onChange(false);
            }
        } else if (speaking) {
            quietSince = null;
        }
    }, 100);

    return {
        stop() {
            clearInterval(interval);
            context.close().catch(() => {});
        },
    };
}
