// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// frequency.js

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
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + duration);
    }
}

export default AudioFrequency;