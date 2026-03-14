import AudioPlayer from '../../engine/output/audioPlayer.js';

const AUDIO_FILES = Object.freeze([
    'elemental-magic.mp3',
    'relaxing-guitar-loop.mp3',
    'Alesis-Sanctuary.wav',
    'Ouch-6.wav'
]);

class AudioOrchestrator {
    constructor(basePath = './fx') {
        this.audioPlayer = new AudioPlayer(basePath);
        this.allowedAudioFiles = new Set(AUDIO_FILES);
        this.selectedFile = AUDIO_FILES[0];
    }

    getAudioFiles() {
        return [...AUDIO_FILES];
    }

    setSelectedFile(filename) {
        if (!this.allowedAudioFiles.has(filename)) {
            return {
                ok: false,
                error: 'Invalid audio selection.'
            };
        }

        this.selectedFile = filename;
        return {
            ok: true,
            selectedFile: this.selectedFile
        };
    }

    async loadAudioFiles() {
        try {
            await AudioPlayer.loadAllAudioFiles(AUDIO_FILES, this.audioPlayer);
            return {
                ok: true
            };
        } catch (error) {
            return {
                ok: false,
                error: 'Failed to load one or more audio samples.'
            };
        }
    }

    playSelected() {
        if (!this.allowedAudioFiles.has(this.selectedFile)) {
            return {
                ok: false,
                error: 'Invalid audio selection.'
            };
        }

        try {
            this.audioPlayer.playAudio(this.selectedFile);
            return {
                ok: true,
                selectedFile: this.selectedFile
            };
        } catch (error) {
            return {
                ok: false,
                error: 'Unable to play audio sample.'
            };
        }
    }

    stopAll() {
        try {
            this.audioPlayer.stopAllAudio();
            return {
                ok: true
            };
        } catch (error) {
            return {
                ok: false,
                error: 'Unable to stop audio.'
            };
        }
    }
}

export default AudioOrchestrator;

