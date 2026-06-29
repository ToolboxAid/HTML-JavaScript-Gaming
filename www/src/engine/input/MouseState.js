/*
Toolbox Aid
David Quesenberry
03/21/2026
MouseState.js
*/
export default class MouseState {
    constructor() {
        this.current = this.createState();
        this.previousButtons = new Set();
    }

    createState() {
        return {
            x: 0,
            y: 0,
            deltaX: 0,
            deltaY: 0,
            buttonsDown: new Set(),
        };
    }

    setSnapshot({ x = 0, y = 0, deltaX = 0, deltaY = 0, buttonsDown = new Set() } = {}) {
        this.previousButtons = new Set(this.current.buttonsDown);
        this.current = {
            x,
            y,
            deltaX,
            deltaY,
            buttonsDown: new Set(buttonsDown),
        };
    }

    reset() {
        this.current = this.createState();
        this.previousButtons.clear();
    }

    getPosition() {
        return { x: this.current.x, y: this.current.y };
    }

    getDelta() {
        return { x: this.current.deltaX, y: this.current.deltaY };
    }

    isDown(button) {
        return this.current.buttonsDown.has(button);
    }

    isPressed(button) {
        return this.current.buttonsDown.has(button) && !this.previousButtons.has(button);
    }

    getSnapshot() {
        return {
            position: this.getPosition(),
            delta: this.getDelta(),
            down: new Set(this.current.buttonsDown),
            pressed: new Set(
                [...this.current.buttonsDown].filter((button) => !this.previousButtons.has(button))
            ),
        };
    }
}
