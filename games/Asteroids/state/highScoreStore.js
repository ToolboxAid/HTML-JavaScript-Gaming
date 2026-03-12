// ToolboxAid.com
// David Quesenberry
// 03/12/2026
// highScoreStore.js

import Cookies from '../../../engine/misc/cookies.js';

class AsteroidsHighScoreStore {
    constructor() {
        const currentDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));

        this.cookieName = Cookies.sanitizeCookieName(currentDir);
        this.cookiePath = '/';
    }

    load(initScore = 0) {
        let cookie = Cookies.get(this.cookieName, { path: this.cookiePath });
        console.log('Retrieved cookie:', cookie);

        if (cookie === null) {
            this.save(initScore);

            cookie = Cookies.get(this.cookieName, { path: this.cookiePath });
            if (cookie === null) {
                console.error('Failed to set the cookie!', this.cookieName, this.cookiePath);
                return 0;
            }

            console.log('Set new cookie:', cookie);
        } else {
            console.log('Cookie found:', cookie);
        }

        const highScore = parseInt(cookie, 10);
        if (Number.isNaN(highScore)) {
            console.error('Error: Cookie value is not a valid number');
            return 0;
        }

        console.log('Parsed high score:', highScore);
        return highScore;
    }

    save(score) {
        Cookies.set(this.cookieName, score, {
            expires: 7,
            path: this.cookiePath
        });
        console.log(`Cookie set: ${this.cookieName}=${score}`);
    }

    saveIfHigher(score, currentHighScore) {
        if (score <= currentHighScore) {
            return currentHighScore;
        }

        this.save(score);
        return score;
    }
}

export default AsteroidsHighScoreStore;
