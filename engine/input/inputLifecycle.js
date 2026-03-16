// ToolboxAid.com
// David Quesenberry
// 03/16/2026
// inputLifecycle.js

class InputLifecycle {
    constructor(startFn, stopFn) {
        this.startFn = startFn;
        this.stopFn = stopFn;
        this.isListening = false;
    }

    start() {
        if (this.isListening) {
            return false;
        }

        this.startFn();
        this.isListening = true;
        return true;
    }

    stop() {
        if (!this.isListening) {
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
    }
}

export default InputLifecycle;
