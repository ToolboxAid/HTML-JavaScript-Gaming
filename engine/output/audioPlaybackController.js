// Reusable audio playback controller for sample/game UI orchestration.
import AudioPlayer from './audioPlayer.js';

class AudioPlaybackController {
    constructor(basePath, audioFiles = []) {
        if (!Array.isArray(audioFiles) || audioFiles.length === 0) {
            throw new Error('audioFiles must be a non-empty array.');
        }

        this.audioPlayer = new AudioPlayer(basePath);
        this.audioFiles = Object.freeze([...audioFiles]);
        this.allowedAudioFiles = new Set(this.audioFiles);
        this.selectedFile = this.audioFiles[0];
    }

    getAudioFiles() {
        return [...this.audioFiles];
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
            await AudioPlayer.loadAllAudioFiles(this.audioFiles, this.audioPlayer);
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

    destroy() {
        if (this.audioPlayer && typeof this.audioPlayer.destroy === 'function') {
            this.audioPlayer.destroy();
        }
    }
}

export default AudioPlaybackController;
