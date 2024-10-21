// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// AudioPlayer.js

export class AudioPlayer {
    constructor(basePath) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.audioCache = {};
        this.basePath = basePath;
        this.currentSource = null;
        this.startTime = 0;
        this.playbackPosition = 0;
        this.isPlaying = false;
        this.currentBuffer = null; // Store the current audio buffer
    }

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
            console.log(`Loaded: ${url}`);
        } catch (error) {
            console.error(`Failed to load audio: ${url}`, error);
        }
    }

    static playFrequency(frequency, duration) {
        // Create a new audio context
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Create an oscillator
        const oscillator = audioContext.createOscillator();

        // Set the frequency
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

        // Connect the oscillator to the output (speakers)
        oscillator.connect(audioContext.destination);

        // Start the oscillator
        oscillator.start();

        // Stop the oscillator after 1 second
        oscillator.stop(audioContext.currentTime + duration);
    }

    playAudio(filename) {
        const url = `${this.basePath}/${filename}`;

        if (!this.audioCache[url]) {
            console.error(`Audio file not loaded: ${filename}`);
            return;
        }

        // If already playing, stop it
        if (this.currentSource) {
            this.currentSource.stop();
        }

        // Create a new source and buffer
        this.currentSource = this.audioContext.createBufferSource();
        this.currentBuffer = this.audioCache[url]; // Store the buffer for resuming
        this.currentSource.buffer = this.currentBuffer;
        this.currentSource.connect(this.audioContext.destination);

        // Handle the end of playback
        this.currentSource.onended = () => {
            this.isPlaying = false;
            this.playbackPosition = 0; // Reset position when playback ends
        };

        // Start playback from the last known position
        this.currentSource.start(0, this.playbackPosition);
        this.startTime = this.audioContext.currentTime; // Capture the current time
        this.isPlaying = true;

        console.log(`Playing: ${url}`);
    }

    pause() {
        if (this.isPlaying) {
            this.playbackPosition += this.audioContext.currentTime - this.startTime; // Update position
            this.currentSource.stop(); // Stop the current source
            this.isPlaying = false;
            console.log("Paused at position:", this.playbackPosition);
        }
    }

    resume() {
        if (!this.currentBuffer) {
            console.log("No audio loaded for resuming");
            return;
        }

        if (this.isPlaying) {
            console.log("Audio is already playing");
            return;
        }

        console.log("Resumed playback from position:", this.playbackPosition);
        
        // Create a new buffer source for resuming playback
        const bufferSource = this.audioContext.createBufferSource();
        bufferSource.buffer = this.currentBuffer;
        bufferSource.connect(this.audioContext.destination);

        // Start playback from the last known position
        bufferSource.start(0, this.playbackPosition);
        this.startTime = this.audioContext.currentTime; // Update start time
        this.isPlaying = true;

        // Set the current source to the new buffer source
        this.currentSource = bufferSource;

        console.log("Resumed playback from position:", this.playbackPosition);
    }
}
