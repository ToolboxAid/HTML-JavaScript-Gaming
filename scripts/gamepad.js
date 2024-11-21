// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// gampad.js

class GamepadInput {
    constructor() {
        this.buttonsPressed = new Set();  // Buttons pressed this frame
        this.buttonsDown = new Set();     // Buttons currently pressed
        this.buttonsReleased = new Set(); // Buttons released this frame

        this.tempButtonsDown = new Set(); // Temporary storage for button presses
        this.tempButtonsUp = new Set();   // Temporary storage for button releases

        this.gamepads = []; // Array to store the state of connected gamepads
        this.axesData = []; // Separate storage for axes data

        this.deadzone = 0.2; // Deadzone threshold for analog inputs

        // Automatically poll for gamepad updates
        this.pollInterval = setInterval(this.pollGamepads.bind(this), 16); // ~60 FPS

        // Cleanup when the page is unloaded (or game is paused)
        window.addEventListener('beforeunload', () => {
            this.disconnect(); // Stop polling gamepads before the page unloads
        });
    }

    pollGamepads() {
        const gamepads = navigator.getGamepads(); // Get the state of all connected gamepads

        if (!gamepads) return;
        // Update gamepads array, even if some slots are null (disconnected gamepads)
        this.gamepads = Array.from(gamepads).map(gamepad => gamepad || null);
    }

    update() {
        // Clear previous frame states
        this.buttonsPressed.clear();
        this.buttonsReleased.clear();

        // Ensure we are not iterating over undefined gamepads
        this.gamepads.forEach((gamepad, index) => {
            if (!gamepad) return; // Skip disconnected gamepads

            // Store the raw axes data for each gamepad
            this.axesData[index] = gamepad.axes;

            // Handle button presses
            gamepad.buttons.forEach((button, buttonIndex) => {
                if (button.pressed) {
                    if (!this.buttonsDown.has(buttonIndex)) {
                        this.tempButtonsDown.add(buttonIndex); // Add to temporary buttonsDown
                    }
                } else {
                    if (this.buttonsDown.has(buttonIndex)) {
                        this.tempButtonsUp.add(buttonIndex); // Add to temporary buttonsUp
                    }
                }
            });
        });

        // Apply button updates
        this.tempButtonsDown.forEach(button => {
            this.buttonsPressed.add(button);
            this.buttonsDown.add(button);
        });
        this.tempButtonsDown.clear();

        this.tempButtonsUp.forEach(button => {
            this.buttonsReleased.add(button);
            this.buttonsDown.delete(button);
        });
        this.tempButtonsUp.clear();
    }

    // Utility methods
    getButtonsPressed() {
        return Array.from(this.buttonsPressed);
    }

    getButtonsDown() {
        return Array.from(this.buttonsDown);
    }

    getButtonsReleased() {
        return Array.from(this.buttonsReleased);
    }

    isButtonJustPressed(buttonIndex) {
        return this.buttonsPressed.has(buttonIndex);
    }

    isButtonDown(buttonIndex) {
        return this.buttonsDown.has(buttonIndex);
    }

    isButtonReleased(buttonIndex) {
        return this.buttonsReleased.has(buttonIndex);
    }

    getAxes(gamepadIndex) { // Return the axes of a specific gamepad with a deadzone applied
        const axes = this.axesData[gamepadIndex] || [0, 0]; // Get axes from stored data, or return [0, 0] if no axes

        // Apply deadzone: If the axis value is within the deadzone, set it to zero
        const deadzone = this.deadzone;
        const filteredAxes = axes.map(axis => Math.abs(axis) < deadzone ? 0 : axis);

        return filteredAxes; // Return axes after deadzone processing
    }

    // Disconnect the gamepad polling when no longer needed
    disconnect() {
        clearInterval(this.pollInterval); // Stop polling gamepads
    }
}

export default GamepadInput;
