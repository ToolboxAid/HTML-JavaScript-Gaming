import KeyboardState from './KeyboardState.js';

export default class InputService {
    constructor({
        target = window,
        keyboard = null,
    } = {}) {
        this.target = target;
        this.keyboard = keyboard ?? new KeyboardState();
        this.liveKeysDown = new Set();
        this.isAttached = false;

        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        this.onBlur = this.onBlur.bind(this);
    }

    attach() {
        if (this.isAttached) {
            return;
        }

        this.target.addEventListener('keydown', this.onKeyDown);
        this.target.addEventListener('keyup', this.onKeyUp);
        this.target.addEventListener('blur', this.onBlur);
        this.isAttached = true;
    }

    detach() {
        if (!this.isAttached) {
            return;
        }

        this.target.removeEventListener('keydown', this.onKeyDown);
        this.target.removeEventListener('keyup', this.onKeyUp);
        this.target.removeEventListener('blur', this.onBlur);
        this.isAttached = false;
        this.liveKeysDown.clear();
        this.keyboard.reset();
    }

    update() {
        this.keyboard.setSnapshot(this.liveKeysDown);
    }

    reset() {
        this.liveKeysDown.clear();
        this.keyboard.reset();
    }

    isDown(key) {
        return this.keyboard.isDown(key);
    }

    isPressed(key) {
        return this.keyboard.isPressed(key);
    }

    getSnapshot() {
        return this.keyboard.getSnapshot();
    }

    onKeyDown(event) {
        this.liveKeysDown.add(event.code);
    }

    onKeyUp(event) {
        this.liveKeysDown.delete(event.code);
    }

    onBlur() {
        this.liveKeysDown.clear();
    }
}
