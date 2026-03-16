// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// mouse.js
import InputFrameState from './inputFrameState.js';
import InputLifecycle from './inputLifecycle.js';

export const LEFT = 0;
export const MIDDLE = 1;
export const RIGHT = 2;

class MouseInput {
    constructor(canvas) {
        if (!canvas || !(canvas instanceof HTMLElement)) {
            throw new Error("Invalid canvas element provided.");
        }

        this.canvas = canvas;
        this.buttonState = new InputFrameState();
        this.mouseX = 0;
        this.mouseY = 0;
        this.prevX = 0;
        this.prevY = 0;
        this.wheel = 0;

        // Cache canvas dimensions and scaling factors
        this.rect = this.canvas.getBoundingClientRect();
        this.scaleX = this.canvas.width / this.rect.width;
        this.scaleY = this.canvas.height / this.rect.height;

        // Bind event handlers to the class instance
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleWheel = this.handleWheel.bind(this);
        this.handleContextMenu = this.handleContextMenu.bind(this);
        this.lifecycle = new InputLifecycle(
            () => {
                this.canvas.addEventListener('mousedown', this.handleMouseDown);
                this.canvas.addEventListener('mouseup', this.handleMouseUp);
                this.canvas.addEventListener('mousemove', this.handleMouseMove);
                this.canvas.addEventListener('wheel', this.handleWheel, { passive: true });
                this.canvas.addEventListener('contextmenu', this.handleContextMenu);
            },
            () => {
                this.canvas.removeEventListener('mousedown', this.handleMouseDown);
                this.canvas.removeEventListener('mouseup', this.handleMouseUp);
                this.canvas.removeEventListener('mousemove', this.handleMouseMove);
                this.canvas.removeEventListener('wheel', this.handleWheel);
                this.canvas.removeEventListener('contextmenu', this.handleContextMenu);
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

    refreshScale() {
        this.rect = this.canvas.getBoundingClientRect();
        this.scaleX = this.canvas.width / this.rect.width;
        this.scaleY = this.canvas.height / this.rect.height;
    }

    handleMouseDown(event) {
        this.buttonState.queueDown(event.button);
    }

    handleMouseUp(event) {
        this.buttonState.queueUp(event.button);
    }

    handleMouseMove(event) {
        this.refreshScale();

        // Calculate mouse position relative to the canvas
        const offsetX = event.clientX - this.rect.left;
        const offsetY = event.clientY - this.rect.top;

        // Store the previous mouse position
        this.prevX = this.mouseX;
        this.prevY = this.mouseY;

        // Scale mouse position to match canvas resolution
        this.mouseX = offsetX * this.scaleX;
        this.mouseY = offsetY * this.scaleY;
    }

    handleWheel(event) {
        this.wheel = event.deltaY; // Track wheel movement
    }

    handleContextMenu(event) {
        event.preventDefault(); // Prevent the default context menu
    }

    update() {
        this.buttonState.update();
    }

    // Get the current mouse position
    getPosition() {
        return { x: this.mouseX, y: this.mouseY };
    }

    // Get the mouse movement delta (change in position since the last update)
    getMouseDelta() {
        return { x: this.mouseX - this.prevX, y: this.mouseY - this.prevY };
    }

    // Get lists of buttons pressed, down, or released
    getButtonsPressed() {
        return Array.from(this.buttonState.pressed);
    }

    getButtonsDown() {
        return Array.from(this.buttonState.down);
    }

    getButtonsReleased() {
        return Array.from(this.buttonState.released);
    }

    // Check the state of a specific button
    wasButtonIndexPressed(buttonIndex) {
        return this.buttonState.pressed.has(buttonIndex);
    }

    isButtonIndexDown(buttonIndex) {
        return this.buttonState.down.has(buttonIndex);
    }

    wasButtonIndexReleased(buttonIndex) {
        return this.buttonState.released.has(buttonIndex);
    }

    destroy() {
        this.lifecycle.destroy(() => {
            this.buttonState.clearAll();
        });
    }
}

export default MouseInput;
