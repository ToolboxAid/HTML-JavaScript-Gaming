// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// mouse.js

export const LEFT = 0;
export const MIDDLE = 1;
export const RIGHT = 2;

class MouseInput {
    constructor(canvas) {
        if (!canvas || !(canvas instanceof HTMLElement)) {
            throw new Error("Invalid canvas element provided.");
        }

        this.canvas = canvas;
        this.buttonsPressed = new Set();
        this.buttonsDown = new Set();
        this.buttonsReleased = new Set();
        this.mouseX = 0;
        this.mouseY = 0;
        this.prevX = 0;
        this.prevY = 0;
        this.wheel = 0;

        // Temporary sets for tracking button state changes
        this.tempButtonsDown = new Set();
        this.tempButtonsUp = new Set();

        // Cache canvas dimensions and scaling factors
        this.rect = this.canvas.getBoundingClientRect();
        this.scaleX = this.canvas.width / this.rect.width;
        this.scaleY = this.canvas.height / this.rect.height;

        this.start();
    }

    start() {
        // Bind event handlers to the class instance
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleWheel = this.handleWheel.bind(this);
        this.handleContextMenu = this.handleContextMenu.bind(this);

        // Attach event listeners
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mouseup', this.handleMouseUp);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('wheel', this.handleWheel, { passive: true });
        // Prevent right-click context menu
        this.canvas.addEventListener('contextmenu', this.handleContextMenu);
    }

    handleMouseDown(event) {
        if (!this.buttonsDown.has(event.button)) {
            this.tempButtonsDown.add(event.button); // Track newly pressed buttons
        }
    }

    handleMouseUp(event) {
        if (this.buttonsDown.has(event.button)) {
            this.tempButtonsUp.add(event.button); // Track newly released buttons
        }
    }

    handleMouseMove(event) {
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
        // Clear previous state
        this.buttonsPressed.clear();
        this.buttonsReleased.clear();

        // Process newly pressed buttons
        this.tempButtonsDown.forEach(button => {
            this.buttonsPressed.add(button);
            this.buttonsDown.add(button);
        });
        this.tempButtonsDown.clear();

        // Process newly released buttons
        this.tempButtonsUp.forEach(button => {
            this.buttonsReleased.add(button);
            this.buttonsDown.delete(button);
        });
        this.tempButtonsUp.clear();
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
        return Array.from(this.buttonsPressed);
    }

    getButtonsDown() {
        return Array.from(this.buttonsDown);
    }

    getButtonsReleased() {
        return Array.from(this.buttonsReleased);
    }

    // Check the state of a specific button
    wasButtonIndexPressed(buttonIndex) {
        return this.buttonsPressed.has(buttonIndex);
    }

    isButtonIndexDown(buttonIndex) {
        return this.buttonsDown.has(buttonIndex);
    }

    wasButtonIndexReleased(buttonIndex) {
        return this.buttonsReleased.has(buttonIndex);
    }
}

export default MouseInput;