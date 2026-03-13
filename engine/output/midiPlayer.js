class MidiPlayer {
    static DEBUG = new URLSearchParams(window.location.search).has('midiPlayer');

    constructor(fileInputId) {
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
            const pos = document.getElementById("position");
            pos.setAttribute("max", Math.round(song.duration * 10));
        };

        this.player.ontick = (song, position) => {
            const pos = document.getElementById("position");
            pos.value = Math.round(position * 10);
        };

        this.player.onend = () => {
            if (MidiPlayer.DEBUG) {
                console.log("End", new Date());
            }
        };

        window.addEventListener('blur', this.handleBlur);
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

    destroy() {
        window.removeEventListener('blur', this.handleBlur);
        this.stop();
        this.player = null;
        this.fileInput = null;
        this.isInitialized = false;
    }
}

export default MidiPlayer;
