// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// gampad.js

class GamepadInput {
    constructor() {
        this.gamepads = []; // Array to store the state of connected gamepads
        this.axesData = []; // Separate storage for axes data

        this.buttonsPressed = Array.from({ length: 4 }, () => new Set());  // Buttons just pressed
        this.buttonsDown = Array.from({ length: 4 }, () => new Set());     // Buttons currently pressed
        this.buttonsReleased = Array.from({ length: 4 }, () => new Set()); // Buttons just released

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
        this.gamepads.forEach((gamepad, index) => {
            if (!gamepad) return; // Skip disconnected gamepads

            // Store the raw axes data for each gamepad
            this.axesData[index] = gamepad.axes;

            // Clear previous button states
            this.buttonsPressed[index].clear();
            this.buttonsReleased[index].clear;

            let showDetails = false;
            // Handle button presses
            gamepad.buttons.forEach((button, buttonIndex) => {
                if (button.pressed) {
                    if (!this.buttonsDown[index].has(buttonIndex)) {// First time pressed
                        this.buttonsPressed[index].add(buttonIndex);
                    }
                    this.buttonsDown[index].add(buttonIndex);
                    showDetails = true;
                } else { // !button.pressed
                    if (this.buttonsDown[index].has(buttonIndex)) {
                        this.buttonsReleased[index].add(buttonIndex);
                        this.buttonsDown[index].delete(buttonIndex);
                        showDetails = true
                    } else {
                        if (this.buttonsReleased[index].has(buttonIndex)) {
                            this.buttonsReleased[index].delete(buttonIndex)
                            showDetails = true;
                        };
                    }
                }
            });

            showDetails = false;
            if (showDetails) {
                console.log("Pressed:", this.buttonsPressed[index], "Down:", this.buttonsDown[index], "Released:", this.buttonsReleased[index]);
            }
        });
    }

    // Utility methods
    getButtonsPressed(gamepad) {
        return Array.from(this.buttonsPressed[gamepad]);
    }

    getButtonsDown(gamepad) {
        return Array.from(this.buttonsDown[gamepad]);
    }

    getButtonsReleased(gamepad) {
        return Array.from(this.buttonsReleased[gamepad]);
    }

    isButtonJustPressed(gamepad, buttonIndex) {
        return this.buttonsPressed[gamepad].has(buttonIndex);
    }

    isButtonDown(gamepad, buttonIndex) {
        return this.buttonsDown[gamepad].has(buttonIndex);
    }

    isButtonReleased(gamepad, buttonIndex) {
        return this.buttonsReleased[gamepad].has(buttonIndex);
    }

    getAxes(gamepadIndex) {
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
