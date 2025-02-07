// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// mouse.js


export  const LEFT = 0;
export const MIDDLE = 1;
export const RIGHT = 2;
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

        // add listeners
        this.start();
    }

    start() {
        // Event listeners for mouse input
        this.handleMouseDown = this.handleMouseDown.bind(this); // Bind methods
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleWheel = this.handleWheel.bind(this);
        this.handleContextMenu = this.handleContextMenu.bind(this);

        // Add event listeners
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mouseup', this.handleMouseUp);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('wheel', this.handleWheel, { passive: true });

        // Prevent right-click context menu
        this.canvas.addEventListener('contextmenu', this.handleContextMenu);
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

    // Positions
    getPosition() {
        return { x: this.mouseX, y: this.mouseY };
    }

    getMouseDelta() {
        return { x: this.mouseX - this.prevX, y: this.mouseY - this.prevY };
    }

    // Buttons
    getButtonsPressed() {
        return Array.from(this.buttonsPressed);
    }

    getButtonsDown() {
        return Array.from(this.buttonsDown);
    }

    getButtonsReleased() {
        return Array.from(this.buttonsReleased);
    }

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
