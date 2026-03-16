// ToolboxAid.com
// David Quesenberry
// 03/16/2026
// inputFrameState.js

class InputFrameState {
    constructor() {
        this.pressed = new Set();
        this.down = new Set();
        this.released = new Set();
        this.pendingDown = new Set();
        this.pendingUp = new Set();
    }

    queueDown(input) {
        this.pendingUp.delete(input);

        if (!this.down.has(input)) {
            this.pendingDown.add(input);
        }
    }

    queueUp(input) {
        if (this.down.has(input) || this.pendingDown.has(input)) {
            this.pendingUp.add(input);
        }
    }

    update() {
        this.pressed.clear();
        this.released.clear();

        this.pendingDown.forEach((input) => {
            if (!this.down.has(input)) {
                this.pressed.add(input);
            }
            this.down.add(input);
        });
        this.pendingDown.clear();

        this.pendingUp.forEach((input) => {
            this.released.add(input);
            this.down.delete(input);
        });
        this.pendingUp.clear();
    }

    clearAll() {
        this.pressed.clear();
        this.down.clear();
        this.released.clear();
        this.pendingDown.clear();
        this.pendingUp.clear();
    }
}

export default InputFrameState;
