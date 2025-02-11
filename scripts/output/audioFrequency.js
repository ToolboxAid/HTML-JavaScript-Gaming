// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// frequency.js

class AudioFrequency {

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