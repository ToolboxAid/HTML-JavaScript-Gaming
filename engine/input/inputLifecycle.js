// ToolboxAid.com
// David Quesenberry
// 03/16/2026
// inputLifecycle.js

class InputLifecycle {
    constructor(startFn, stopFn) {
        this.startFn = startFn;
        this.stopFn = stopFn;
        this.isListening = false;
        this.isDestroyed = false;
    }

    start() {
        if (this.isDestroyed || this.isListening || typeof this.startFn !== 'function') {
            return false;
        }

        this.startFn();
        this.isListening = true;
        return true;
    }

    stop() {
        if (this.isDestroyed || !this.isListening || typeof this.stopFn !== 'function') {
            return false;
        }

        this.stopFn();
        this.isListening = false;
        return true;
    }

    destroy(cleanupFn = null) {
        this.stop();

        if (typeof cleanupFn === 'function') {
            cleanupFn();
        }

        this.startFn = null;
        this.stopFn = null;
        this.isListening = false;
        this.isDestroyed = true;
    }
}

export default InputLifecycle;
