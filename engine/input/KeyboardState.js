/*
Toolbox Aid
David Quesenberry
03/21/2026
KeyboardState.js
*/
export default class KeyboardState {
    constructor() {
        this.currentDown = new Set();
        this.previousDown = new Set();
    }

    setSnapshot(keysDown) {
        this.previousDown = new Set(this.currentDown);
        this.currentDown = new Set(keysDown);
    }

    reset() {
        this.currentDown.clear();
        this.previousDown.clear();
    }

    isDown(key) {
        return this.currentDown.has(key);
    }

    isPressed(key) {
        return this.currentDown.has(key) && !this.previousDown.has(key);
    }

    getSnapshot() {
        return {
            down: new Set(this.currentDown),
            pressed: new Set(
                [...this.currentDown].filter((key) => !this.previousDown.has(key))
            ),
        };
    }
}
