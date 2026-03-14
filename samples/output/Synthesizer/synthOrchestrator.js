import Synthesizer from '../../../engine/synthesizer/synthesizer.js';
import { sanitizeSoundProfileInput } from '../../../engine/synthesizer/synthSoundProfile.js';
import SynthTransport from '../../../engine/synthesizer/synthTransport.js';
import { createSynthKeyboardMap, normalizeSynthKeyboardKey } from '../../../engine/synthesizer/synthKeyboardMap.js';
import { parseTimeSignatureInput } from '../../../engine/synthesizer/synthTimeSignature.js';

class SynthOrchestrator {
    constructor(getElementByNote, baseOctaveOffset = 3) {
        this.synthesizer = new Synthesizer();
        this.transport = new SynthTransport(this.synthesizer);
        this.keys = createSynthKeyboardMap(getElementByNote, baseOctaveOffset);
    }

    applySoundProfileInput(inputValues) {
        const { profilePatch, normalizedValues } = sanitizeSoundProfileInput(inputValues);

        try {
            this.synthesizer.setSoundProfile(profilePatch);
            return { ok: true, normalizedValues, error: '' };
        } catch (error) {
            return {
                ok: false,
                normalizedValues,
                error: 'Invalid sound controls were ignored. Using safe values.'
            };
        }
    }

    applyTimeSignatureInput(rawValue) {
        const parsed = parseTimeSignatureInput(rawValue);
        if (!parsed.ok) {
            return { ok: false, error: parsed.error };
        }

        try {
            this.synthesizer.setTimeSignature(parsed.beatsPerMeasure, parsed.beatUnit);
            return { ok: true, error: '' };
        } catch (error) {
            return { ok: false, error: 'Time signature must be positive values like 4/4.' };
        }
    }

    applyTempoInput(rawTempo) {
        const tempo = parseInt(rawTempo, 10);
        try {
            this.synthesizer.setTempo(tempo);
            return { ok: true, error: '' };
        } catch (error) {
            return { ok: false, error: 'Tempo must be a positive number.' };
        }
    }

    getTempo() {
        return this.synthesizer.tempo;
    }

    getTimeSignatureText() {
        return `${this.synthesizer.timeSignature.beatsPerMeasure}/${this.synthesizer.timeSignature.beatUnit}`;
    }

    getKeyMap() {
        return this.keys;
    }

    normalizeKey(rawKey) {
        return normalizeSynthKeyboardKey(rawKey);
    }

    async playSong(song) {
        await this.transport.playSong(song);
    }

    async playKeyboardNoteByKey(key, duration = '4n') {
        if (!this.keys[key]) {
            return false;
        }

        const keyConfig = this.keys[key];
        await this.transport.playKeyboardNote(keyConfig.note, duration, keyConfig.octaveOffset);
        return true;
    }

    stopAll() {
        this.transport.stopAll();
    }
}

export default SynthOrchestrator;


