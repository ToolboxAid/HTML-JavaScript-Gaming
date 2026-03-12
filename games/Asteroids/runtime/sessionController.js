// ToolboxAid.com
// David Quesenberry
// 03/12/2026
// sessionController.js

import AsteroidsSession from './session.js';

class AsteroidsSessionController {
    constructor(audioPlayer) {
        this.audioPlayer = audioPlayer;
        this.session = null;
    }

    ensureSession(playerCount, playerLives) {
        if (this.session || !playerCount || !playerLives) {
            return this.session;
        }

        this.session = new AsteroidsSession(this.audioPlayer);
        this.session.initialize(playerCount, playerLives);
        return this.session;
    }

    clearSession() {
        this.session = null;
    }

    getSession() {
        return this.session;
    }
}

export default AsteroidsSessionController;
