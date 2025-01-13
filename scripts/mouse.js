// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// mouse.js

class MouseInput {
    constructor(canvas) {
        this.canvas = canvas;
        this.buttonsPressed = new Set();
        this.buttonsDown = new Set();
        this.buttonsReleased = new Set();
        this.mouseX = 0;
        this.mouseY = 0;
        this.prevX = 0;
        this.prevY = 0;
        this.wheel = 0;

        // Temporary sets to handle button press/release events
        this.tempButtonsDown = new Set();
        this.tempButtonsUp = new Set();

        // Event listeners for mouse input
        this.canvas = canvas; // Store the canvas reference
        this.handleMouseDown = this.handleMouseDown.bind(this); // Bind methods
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleWheel = this.handleWheel.bind(this);
        this.handleContextMenu = this.handleContextMenu.bind(this);

        // Add event listeners
        canvas.addEventListener('mousedown', this.handleMouseDown);
        canvas.addEventListener('mouseup', this.handleMouseUp);
        canvas.addEventListener('mousemove', this.handleMouseMove);
        canvas.addEventListener('wheel', this.handleWheel, { passive: true });

        // Prevent right-click context menu
        canvas.addEventListener('contextmenu', this.handleContextMenu);
    }

    handleMouseDown(event) {
        if (!this.buttonsDown.has(event.button)) {
            this.tempButtonsDown.add(event.button); // Temporarily store the button
        }
    }

    handleMouseUp(event) {
        if (this.buttonsDown.has(event.button)) {
            this.tempButtonsUp.add(event.button); // Temporarily store the released button
        }
    }

    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect(); // Get canvas position and size
        const scaleX = this.canvas.width / rect.width;   // Scale factor for X
        const scaleY = this.canvas.height / rect.height; // Scale factor for Y

        // Store the previous mouse position before updating
        this.prevX = this.mouseX;
        this.prevY = this.mouseY;

        // Calculate mouse position relative to the canvas
        this.mouseX = (event.clientX - rect.left) * scaleX;
        this.mouseY = (event.clientY - rect.top) * scaleY;
    }

    handleWheel(event) {
        this.wheel = event.deltaY;
        //console.log('Wheel movement detected:', this.wheel);
    }

    handleContextMenu(event) {
        event.preventDefault(); // Prevent the default context menu
    }

    update() {
        // Clear buttonsPressed and buttonsReleased
        this.buttonsPressed.clear();
        this.buttonsReleased.clear();

        // Process mousedown events
        this.tempButtonsDown.forEach(button => {
            this.buttonsPressed.add(button);
            this.buttonsDown.add(button);
        });
        this.tempButtonsDown.clear();

        // Process mouseup events
        this.tempButtonsUp.forEach(button => {
            this.buttonsReleased.add(button);
            this.buttonsDown.delete(button);
        });
        this.tempButtonsUp.clear();
    }

    getButtonsPressed() {
        return Array.from(this.buttonsPressed);
    }

    getButtonsDown() {
        return Array.from(this.buttonsDown);
    }

    getButtonsReleased() {
        return Array.from(this.buttonsReleased);
    }

    getPosition() {
        return { x: this.mouseX, y: this.mouseY };
    }

    getMouseDelta() {
        return { x: this.mouseX - this.prevX, y: this.mouseY - this.prevY };
    }

    isButtonJustPressed(button) {
        return this.buttonsPressed.has(button);
    }

    isButtonDown(button) {
        return this.buttonsDown.has(button);
    }

    isButtonReleased(button) {
        return this.buttonsReleased.has(button);
    }
}

export default MouseInput;
