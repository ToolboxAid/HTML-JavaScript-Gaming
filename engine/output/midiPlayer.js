import DebugFlag from "../utils/debugFlag.js";
import NumberUtils from "../math/numberUtils.js";

class MidiPlayer {
    static DEBUG = DebugFlag.has('midiPlayer');

    constructor(fileInputId, options = {}) {
        if (typeof document === 'undefined') {
            throw new Error('MidiPlayer requires a browser document.');
        }

        if (typeof fileInputId !== 'string' || fileInputId.trim() === '') {
            throw new Error('fileInputId must be a non-empty string.');
        }

        this.fileInput = document.getElementById(fileInputId);
        if (!this.fileInput) {
            throw new Error(`File input element not found: ${fileInputId}`);
        }

        this.positionInputId = typeof options.positionInputId === 'string' && options.positionInputId.trim() !== ''
            ? options.positionInputId
            : 'position';
        this.autoplay = true;
        this.player = null;
        this.handleBlur = this.handleBlur.bind(this);
        this.isInitialized = false;
        this.init();
    }

    async loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async init() {
        try {
            await this.loadScript('https://fraigo.github.io/javascript-midi-player/midiplayer/WebAudioFontPlayer.js');
            await this.loadScript('https://fraigo.github.io/javascript-midi-player/midiplayer/MIDIFile.js');
            await this.loadScript('https://fraigo.github.io/javascript-midi-player/midiplayer/MIDIPlayer.js');
            this.player = new MIDIPlayer(this.fileInput.id);
            this.setupPlayer();
            this.isInitialized = true;
            if (MidiPlayer.DEBUG) {
                console.log('MIDI player initialized.');
            }
        } catch (error) {
            console.error('Failed to load MIDI player scripts:', error);
        }
    }

    setupPlayer() {
        this.player.onload = (song) => {
            if (this.autoplay) {
                this.player.play();
            }
            const pos = this.getPositionElement();
            pos.setAttribute("max", Math.round(song.duration * 10));
        };

        this.player.ontick = (song, position) => {
            const pos = this.getPositionElement();
            pos.value = Math.round(position * 10);
        };

        this.player.onend = () => {
            if (MidiPlayer.DEBUG) {
                console.log("End", new Date());
            }
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('blur', this.handleBlur);
        }
    }

    getPositionElement() {
        if (typeof document === 'undefined') {
            throw new Error('MidiPlayer requires a browser document.');
        }

        const pos = document.getElementById(this.positionInputId);
        if (!pos) {
            throw new Error(`Position element not found: ${this.positionInputId}`);
        }

        return pos;
    }

    handleBlur() {
        if (MidiPlayer.DEBUG) {
            console.log("Blur", new Date());
        }

        this.player?.pause?.();
    }

    play() {
        if (this.player) {
            this.player.play();
        }
    }

    pause() {
        if (this.player) {
            this.player.pause();
        }
    }

    stop() {
        if (this.player) {
            this.player.stop();
        }
    }

    setAutoplay(autoplay) {
        this.autoplay = autoplay;
    }

    setPosition(positionTenths) {
        if (!NumberUtils.isNonNegativeFinite(positionTenths)) {
            return false;
        }

        if (!this.player) {
            return false;
        }

        const position = positionTenths / 10;
        if (typeof this.player.setPosition === 'function') {
            this.player.setPosition(position);
            return true;
        }

        if ('position' in this.player) {
            this.player.position = position;
            return true;
        }

        return false;
    }

    destroy() {
        if (typeof window !== 'undefined') {
            window.removeEventListener('blur', this.handleBlur);
        }
        this.stop();
        this.player = null;
        this.fileInput = null;
        this.isInitialized = false;
    }
}

export default MidiPlayer;
