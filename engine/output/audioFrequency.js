// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// frequency.js

import NumberUtils from '../math/numberUtils.js';

class AudioFrequency {

    /** Constructor for AudioFrequency class.
    * @throws {Error} Always throws error as this is a utility class with only static methods.
    * @example
    * ❌ Don't do this:
    * const audioFrequency = new AudioFrequency(); // Throws Error
    * 
    * ✅ Do this:
    * AudioFrequency.play(...); // Use static methods directly
    */
    constructor() {
        throw new Error('AudioFrequency is a utility class with only static methods. Do not instantiate.');
    }

    static play(frequency, duration) {
        if (!NumberUtils.isPositiveFinite(frequency)) {
            throw new Error('frequency must be a positive finite number.');
        }

        if (!NumberUtils.isPositiveFinite(duration)) {
            throw new Error('duration must be a positive finite number.');
        }

        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) {
            throw new Error('Web Audio API is not available in this environment.');
        }

        const audioContext = new AudioContextClass();
        const oscillator = audioContext.createOscillator();
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.connect(audioContext.destination);
        oscillator.onended = () => {
            if (typeof audioContext.close === 'function') {
                audioContext.close().catch(() => {});
            }
        };
        oscillator.start();
        oscillator.stop(audioContext.currentTime + duration);
    }
}

export default AudioFrequency;
