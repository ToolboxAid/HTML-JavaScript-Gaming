// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// AudioPlayer.js

class AudioPlayer {
    constructor(basePath) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.audioCache = {};
        this.basePath = basePath;
        this.loopingSources = {}; // Store each looping source by filename
    }

    static playFrequency(frequency, duration) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + duration);
    }

    // Load and cache the audio file
    async loadAudio(filename) {
        const url = `${this.basePath}/${filename}`;

        if (this.audioCache[url]) {
            console.log(`Loaded from cache: ${url}`);
            return;
        }

        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.audioCache[url] = audioBuffer;
            //console.log(`Loaded: ${url}`);
        } catch (error) {
            console.error(`Failed to load audio: ${url}`, error);
        }
    }

    // Play a sound (with optional looping)
    playAudio(filename, loop = false) {
        const url = `${this.basePath}/${filename}`;

        if (!this.audioCache[url]) {
            console.error(`Audio file not loaded: ${filename}`);
            return;
        }

        // Create a new source for each sound request
        const source = this.audioContext.createBufferSource();
        source.buffer = this.audioCache[url];
        source.connect(this.audioContext.destination);

        // If looping is requested, set the loop property to true
        if (loop) {
            source.loop = true;
            this.loopingSources[filename] = source; // Store this looping source by filename
        }

        // // Handle the end of playback for non-looping sounds
        // source.onended = () => {
        //     console.log(`Finished playing: ${filename}`);
        // };

        // Start the playback of the sound immediately
        source.start(0);
        // console.log(`Playing: ${filename}`);
    }

    // Stop the looping sound by filename
    stopLooping(filename) {
        if (this.loopingSources[filename]) {
            this.loopingSources[filename].stop(); // Stop the looping sound
            delete this.loopingSources[filename]; // Remove from the looping sources map
//            console.log(`Stopped looping sound: ${filename}`);
        }
    }

    // Stop all looping sounds
    stopAllLooping() {
        for (let filename in this.loopingSources) {
            this.loopingSources[filename].stop();
            delete this.loopingSources[filename];
            console.log(`Stopped all looping sounds`);
        }
    }
}

export default AudioPlayer;
