/*
Toolbox Aid
David Quesenberry
03/21/2026
SceneTransition.js
*/
export default class SceneTransition {
    constructor({ durationSeconds = 0.35 } = {}) {
        this.durationSeconds = durationSeconds;
        this.elapsedSeconds = 0;
    }

    reset() {
        this.elapsedSeconds = 0;
    }

    advance(dtSeconds) {
        this.elapsedSeconds += dtSeconds;
    }

    getProgress() {
        if (this.durationSeconds <= 0) {
            return 1;
        }

        return Math.min(1, this.elapsedSeconds / this.durationSeconds);
    }

    isComplete() {
        return this.getProgress() >= 1;
    }
}
