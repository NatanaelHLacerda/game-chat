export async function getMicrophone() {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('insecure');

    return navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        video: false,
    });
}

const BLOCKED = {
    ios: 'Safari blocked the microphone. Tap "aA" in the address bar, open "Website Settings", allow the Microphone and try again.',
    android: 'Chrome blocked the microphone. Tap the icon next to the address, open "Permissions", allow the Microphone and try again.',
    desktop: 'Your browser blocked the microphone. Click the lock next to the address, allow the microphone and try again.',
};

export function micErrorMessage(error, platform = 'desktop') {
    switch (error?.name === 'Error' ? error.message : error?.name) {
        case 'NotAllowedError':
        case 'SecurityError':
            return BLOCKED[platform] ?? BLOCKED.desktop;
        case 'NotFoundError':
        case 'OverconstrainedError':
            return 'No microphone found. Connect a microphone and try again.';
        case 'NotReadableError':
            return 'The microphone is being used by another program. Close it and try again.';
        case 'insecure':
            return 'Voice only works on a secure address (https or localhost).';
        default:
            return 'Could not turn on the microphone.';
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
