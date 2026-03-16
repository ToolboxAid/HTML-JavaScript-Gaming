// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// keyboard.js
import InputFrameState from './inputFrameState.js';
import InputLifecycle from './inputLifecycle.js';

class KeyboardInput {
    constructor() {
        this.keyState = new InputFrameState();

        this.handleKeyDownBound = this.handleKeyDown.bind(this);
        this.handleKeyUpBound = this.handleKeyUp.bind(this);
        this.lifecycle = new InputLifecycle(
            () => {
                window.addEventListener('keydown', this.handleKeyDownBound);
                window.addEventListener('keyup', this.handleKeyUpBound);
            },
            () => {
                window.removeEventListener('keydown', this.handleKeyDownBound);
                window.removeEventListener('keyup', this.handleKeyUpBound);
            }
        );
        this.start();
    }

    start() {
        this.lifecycle.start();
    }

    stop() {
        this.lifecycle.stop();
    }

    handleKeyDown(event) {
        const key = event.code;
        this.keyState.queueDown(key);
    }

    handleKeyUp(event) {
        const key = event.code;
        this.keyState.queueUp(key);
    }

    update() {
        this.keyState.update();
    }

    // Utility methods
    getKeysPressed() {
        return Array.from(this.keyState.pressed);
    }

    getKeysDown() {
        return Array.from(this.keyState.down);
    }

    getKeysReleased() {
        return Array.from(this.keyState.released);
    }

    isKeyPressed(key) {
        return this.keyState.pressed.has(key);
    }

    isKeyDown(key) {
        return this.keyState.down.has(key);
    }

    isKeyReleased(key) {
        return this.keyState.released.has(key);
    }

    destroy() {
        this.lifecycle.destroy(() => {
            this.keyState.clearAll();
        });
    }
}

export default KeyboardInput;
