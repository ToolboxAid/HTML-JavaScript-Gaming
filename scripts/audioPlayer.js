// AudioPlayer.js
export class AudioPlayer {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.audioCache = {};
    }

    async loadAudio(url) {
        if (this.audioCache[url]) {
            console.log(`Loaded from cache: ${url}`);
            return;
        }

        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        this.audioCache[url] = audioBuffer;
        console.log(`Loaded: ${url}`);
    }

    playAudio(filename) {
        if (!this.audioCache[`./effects/${filename}`]) {
            console.error(`Audio file not loaded: ${filename}`);
            return;
        }

        const source = this.audioContext.createBufferSource();
        source.buffer = this.audioCache[`./effects/${filename}`];
        source.connect(this.audioContext.destination);
        source.start(0);
    }

    resume() {
        this.audioContext.resume().then(() => {
            console.log("Audio context resumed");
        });
    }
}

// // Example usage
// const audioPlayer = new AudioPlayer();

// // Load audio files without playing
// audioPlayer.loadAudio('https://example.com/audio/sample1.wav');
// audioPlayer.loadAudio('https://example.com/audio/sample2.wav');

// // Later, play the loaded audio files using just the filename
// audioPlayer.playAudio('sample1.wav');
// audioPlayer.playAudio('sample2.wav');
