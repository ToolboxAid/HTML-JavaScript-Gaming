// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// mouse.js

class MouseInput {
    constructor(canvas) {
        this.canvas = canvas;
        this.buttonsJustPressed = new Set();
        this.buttonsDown = new Set();
        this.buttonsReleased = new Set();
        this.mouseX = 0;
        this.mouseY = 0;
        this.prevX = 0;
        this.prevY = 0;

        // Temporary sets to handle button press/release events
        this.tempButtonsDown = new Set();
        this.tempButtonsUp = new Set();

        // Event listeners for mouse input
        window.addEventListener('mousedown', this.handleMouseDown.bind(this));
        window.addEventListener('mouseup', this.handleMouseUp.bind(this));
        window.addEventListener('mousemove', this.handleMouseMove.bind(this));
        window.addEventListener('wheel', this.handleWheel.bind(this)); // Listen to the wheel event
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
        // Store the previous mouse position before updating
        this.prevX = this.mouseX;
        this.prevY = this.mouseY;

        // Calculate mouse position relative to the canvas
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = event.clientX - rect.left;
        this.mouseY = event.clientY - rect.top;
    }

    handleWheel(event) {
        // You can use event.deltaX, event.deltaY, or event.deltaZ to get scroll direction
        console.log('Wheel movement detected:', event.deltaY);
        // Handle wheel movement here, e.g., zooming or scrolling
    }

    update() {
        // Clear buttonsJustPressed and buttonsReleased
        this.buttonsJustPressed.clear();
        this.buttonsReleased.clear();

        // Process mousedown events
        this.tempButtonsDown.forEach(button => {
            this.buttonsJustPressed.add(button);
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

    getButtonsJustPressed() {
        return Array.from(this.buttonsJustPressed);
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
        // Return change in mouse position
        return { x: this.mouseX - this.prevX, y: this.mouseY - this.prevY };
    }

    isButtonJustPressed(button) {
        return this.buttonsJustPressed.has(button);
    }

    isButtonDown(button) {
        return this.buttonsDown.has(button);
    }

    isButtonReleased(button) {
        return this.buttonsReleased.has(button);
    }
}

export default MouseInput;
