class MidiPlayer {
    constructor(fileInputId) {
        this.fileInput = document.getElementById(fileInputId);
        this.autoplay = true;
        this.player = null;
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
            console.log('MIDI player initialized.');
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
            console.log("End", new Date());
        };

        window.onblur = () => {
            console.log("Blur", new Date());
            this.player.pause();
        };
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
}

export default MidiPlayer;
