// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// AudioPlayer.js
export class AudioPlayer {
    constructor(basePath) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.audioCache = {};
        this.basePath = basePath; // Store the base path
    }

    async loadAudio(filename) {
        const url = `${this.basePath}/${filename}`; // Use the base path and filename to construct the URL

        if (this.audioCache[url]) {
            console.log(`Loaded from cache: ${url}`);
            return;
        }

        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.audioCache[url] = audioBuffer;
            console.log(`Loaded: ${url}`);
        } catch (error) {
            console.error(`Failed to load audio: ${url}`, error);
        }
    }

    playAudio(filename) {
        const url = `${this.basePath}/${filename}`; // Use the base path and filename to construct the URL

        if (!this.audioCache[url]) {
            console.error(`Audio file not loaded: ${filename}`);
            return;
        }

        const source = this.audioContext.createBufferSource();
        source.buffer = this.audioCache[url];
        source.connect(this.audioContext.destination);
        source.start(0);
    }

    resume() {
        this.audioContext.resume().then(() => {
            console.log("Audio context resumed");
        });
    }
}

// Example usage
// const audioPlayer = new AudioPlayer('./audio');

// // Load audio files without playing
// audioPlayer.loadAudio('sample1.wav');
// audioPlayer.loadAudio('sample2.wav');

// // Later, play the loaded audio files using just the filename
// audioPlayer.playAudio('sample1.wav');
// audioPlayer.playAudio('sample2.wav');
