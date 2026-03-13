// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// AudioPlayer.js

class AudioPlayer {
    // Debug mode enabled via URL parameter: game.html?audioPlayer
    static DEBUG = new URLSearchParams(window.location.search).has('audioPlayer');

    static getAudioContextClass() {
        return window.AudioContext || window.webkitAudioContext;
    }

    constructor(basePath) {
        if (typeof basePath !== 'string' || basePath.trim() === '') {
            throw new Error('basePath must be a non-empty string.');
        }

        const AudioContextClass = AudioPlayer.getAudioContextClass();
        if (!AudioContextClass) {
            throw new Error('Web Audio API is not available in this environment.');
        }

        this.audioContext = new AudioContextClass();
        this.audioCache = {};
        this.basePath = basePath;
        this.loopingSources = {};
        this.activeSources = new Map();
        this.gainNodes = new Map();
    }

    // Add this static method to the AudioPlayer class:
    static async loadAllAudioFiles(audioFiles, audioPlayer) {
        for (const filename of audioFiles) {
            try {
                await audioPlayer.loadAudio(filename);
                if (AudioPlayer.DEBUG) {
                    console.log(`Sound cached: ${filename}`);
                }
            } catch (error) {
                console.error(`Error loading ${filename}:`, error);
            }
        }
    }

    // Load and cache the audio file
    async loadAudio(filename) {
        if (typeof filename !== 'string' || filename.trim() === '') {
            throw new Error('filename must be a non-empty string.');
        }

        const url = `${this.basePath}/${filename}`;

        if (this.audioCache[url]) {
            if (AudioPlayer.DEBUG) {
                console.log(`Loaded from cache: ${url}`);
            }
            return;
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status} while loading ${url}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.audioCache[url] = audioBuffer;
            if (AudioPlayer.DEBUG) {
                console.log(`Loaded: ${url}`);
            }
        } catch (error) {
            console.error(`Failed to load audio: ${url}`, error);
            throw error;
        }
    }

    // Add method to set volume for a specific file
    setVolume(filename, volume) {
        if (!Number.isFinite(volume)) {
            throw new Error('volume must be a finite number.');
        }

        if (this.gainNodes.has(filename)) {
            // Clamp volume between 0 and 1
            const clampedVolume = Math.max(0, Math.min(1, volume));
            this.gainNodes.get(filename).gain.value = clampedVolume;
            if (AudioPlayer.DEBUG) {
                console.log(`Volume set to ${clampedVolume} for ${filename}`);
            }
        }
    }

    // Play a sound (with optional looping)
    playAudio(filename, volume = 1.0, loop = false) {
        if (typeof filename !== 'string' || filename.trim() === '') {
            throw new Error('filename must be a non-empty string.');
        }

        if (!Number.isFinite(volume)) {
            throw new Error('volume must be a finite number.');
        }

        const url = `${this.basePath}/${filename}`;

        if (!this.audioCache[url]) {
            console.error(`Audio file not loaded: ${filename}`);
            return;
        }

        // Check if sound is already playing
        if (this.activeSources.has(filename)) {
            const activeSource = this.activeSources.get(filename);
            if (!activeSource.isFinished) {
                if (AudioPlayer.DEBUG) {
                    console.log(`Sound ${filename} is already playing`);
                }
                return;
            }
        }

        if (this.audioContext.state === 'suspended' && typeof this.audioContext.resume === 'function') {
            this.audioContext.resume().catch(() => {
                // Ignore resume failures so gameplay audio calls stay non-blocking.
            });
        }

        // Create a new source and gain node
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();

        // Set initial volume
        gainNode.gain.value = Math.max(0, Math.min(1, volume));

        // Connect nodes: source -> gain -> destination
        source.buffer = this.audioCache[url];
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Store the gain node for future volume control
        this.gainNodes.set(filename, gainNode);

        if (loop) {
            source.loop = true;
            this.loopingSources[filename] = source;
        }

        source.isFinished = false;
        source.onended = () => {
            source.isFinished = true;
            this.activeSources.delete(filename);
            this.gainNodes.delete(filename);
            if (AudioPlayer.DEBUG) {
                console.log(`Finished playing: ${filename}`);
            }
        };

        this.activeSources.set(filename, source);
        source.start(0);

        if (AudioPlayer.DEBUG) {
            console.log(`Playing: ${filename} with volume: ${volume}`);
        }
    }

    // Stop the looping sound by filename
    stopLooping(filename) {
        if (this.loopingSources[filename]) {
            this.loopingSources[filename].stop(); // Stop the looping sound
            delete this.loopingSources[filename]; // Remove from the looping sources map
            this.activeSources.delete(filename);
            this.gainNodes.delete(filename);
            if (AudioPlayer.DEBUG) {
                console.log(`Stopped looping sound: ${filename}`);
            }
        }
    }

    // Stop all looping sounds
    stopAllLooping() {
        for (const filename of Object.keys(this.loopingSources)) {
            this.loopingSources[filename].stop();
            delete this.loopingSources[filename];
            this.activeSources.delete(filename);
            this.gainNodes.delete(filename);
            if (AudioPlayer.DEBUG) {
                console.log(`Stopped all looping sounds`);
            }
        }
    }

    destroy() {
        this.stopAllLooping();

        for (const source of this.activeSources.values()) {
            try {
                source.stop();
            } catch (error) {
                // Ignore stop errors for already-finished sources.
            }
        }

        this.activeSources.clear();
        this.gainNodes.clear();
        this.audioCache = {};

        if (this.audioContext && typeof this.audioContext.close === 'function') {
            this.audioContext.close().catch(() => {
                // Ignore close errors during teardown.
            });
        }

        this.audioContext = null;
    }
}

export default AudioPlayer;

/** Usage:

    import AudioPlayer from '../engine/output/audioPlayer.js';

    Inside class {   

        static audioPlayer = new AudioPlayer('./assets/effects');

        // List of audio files to be loaded
        static audioFiles = [
            'explosion.wav',
            'fastinvader1.wav',
            'fastinvader2.wav',
            'fastinvader3.wav',
            'fastinvader4.wav',
            'invaderkilled.wav',
            'shoot.wav',
            'ufo_highpitch.wav',
            'ufo_lowpitch.wav'
        ];

    Within  try/catch of  async onInitialize() {:
        // Load audio files
        await AudioPlayer.loadAllAudioFiles(Game.audioFiles, Game.audioPlayer);
        console.log("All audio files have been loaded and cached.");

    play the audio
        Game.audioPlayer.playAudio('fastinvader1.wav');
 */
