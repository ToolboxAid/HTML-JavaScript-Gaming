// ToolboxAid.com
// David Quesenberry
// 02/03/2025
// timer.js

class Timer {

    // Play your game normally: game.html
    // Enable debug mode: game.html?timer
    static DEBUG = new URLSearchParams(window.location.search).has('timer');
    static timers = new Set();

    constructor(durationMs) {
        if (!durationMs || durationMs <= 0) {
            throw new Error('Duration must be positive number');
        }
        this.durationMs = durationMs;
        this.startTime = 0; //performance.now();
        this.isActive = false;
        this.isPaused = false;
        this.pauseTime = null;
        this.wasVisibilityPaused = false;

        Timer.timers.add(this);

        if (Timer.DEBUG) console.log(`Timer created: duration ${durationMs}ms`);
    }

    static pauseAllForVisibility() {
        this.timers.forEach((timer) => {
            timer.pauseForVisibility();
        });
    }

    static resumeAllFromVisibility() {
        this.timers.forEach((timer) => {
            timer.resumeFromVisibility();
        });
    }

    start() {
        if (!this.isActive) {
            this.startTime = performance.now();
            this.isActive = true;
            this.isPaused = false;
            if (Timer.DEBUG) console.log('Timer started');
        }
        return this;
    }

    pause() {
        if (this.isActive && !this.isPaused) {
            this.isPaused = true;
            this.pauseTime = performance.now();
            if (Timer.DEBUG) console.log('Timer paused');
        }
        return this;
    }

    pauseForVisibility() {
        if (!this.isActive || this.isPaused) {
            this.wasVisibilityPaused = false;
            return this;
        }

        this.wasVisibilityPaused = true;
        return this.pause();
    }

    resume() {
        if (this.isPaused) {
            const pauseDuration = performance.now() - this.pauseTime;
            this.startTime += pauseDuration;
            this.isPaused = false;
            this.pauseTime = null;
            if (Timer.DEBUG) console.log('Timer resumed');
        }
        return this;
    }

    resumeFromVisibility() {
        if (!this.wasVisibilityPaused) {
            return this;
        }

        this.wasVisibilityPaused = false;
        return this.resume();
    }

    stop() {
        this.isActive = false;
        this.isPaused = false;
        this.pauseTime = null;
        this.wasVisibilityPaused = false;
        if (Timer.DEBUG) console.log('Timer stopped');
        return this;
    }

    destroy() {
        this.stop();
        Timer.timers.delete(this);
        this.durationMs = null;
        this.startTime = null;
        this.pauseTime = null;
        this.wasVisibilityPaused = false;
        if (Timer.DEBUG) console.log('Timer destroyed');
        return this;
    }

    reset() {
        this.startTime = performance.now();
        this.isPaused = false;
        this.pauseTime = null;
        this.wasVisibilityPaused = false;
        if (Timer.DEBUG) console.log('Timer reset');
        return this;
    }

    getElapsed() {
        if (!this.startTime) return 0;
        if (this.isPaused) {
            return this.pauseTime - this.startTime;
        }
        return performance.now() - this.startTime;
    }

    isRunning() {
        return this.isActive && !this.isPaused && !this.isComplete();
    }

    isComplete() {
        if (Timer.DEBUG) {
            console.log("Timer complete", this.getElapsed() >= this.durationMs, this.isPaused);
        }
        
        return this.getElapsed() >= this.durationMs;
    }

    getRemainingTime() {
        if (!this.isActive) return 0;
        return Math.max(0, this.durationMs - this.getElapsed());
    }

    getProgress() {
        return Math.min(1, this.getElapsed() / this.durationMs);
    }
}

export default Timer;
