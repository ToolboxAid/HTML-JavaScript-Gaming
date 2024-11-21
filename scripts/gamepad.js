// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// gamepad.js

class GamepadInput {
    constructor() {
        this.gamepads = []; // This will store the state of each gamepad
        this.deadzone = 0.2; // Deadzone threshold for analog inputs to prevent drift
        this.pollInterval = setInterval(this.pollGamepads.bind(this), 16); // ~60 FPS polling
    }

    pollGamepads() {
        const gamepads = navigator.getGamepads();

        if (!gamepads) return;

        this.gamepads = []; // Reset gamepad states on each poll

        // Iterate through all available gamepads
        for (let i = 0; i < gamepads.length; i++) {
            const gamepad = gamepads[i];
            if (gamepad) {
                // Store the gamepad state (buttons and axes)
                this.gamepads[i] = {
                    buttons: gamepad.buttons.map(button => button.pressed), // Store button states
                    axes: gamepad.axes.map(value => Math.abs(value) > this.deadzone ? value : 0), // Process axes
                };
            }
        }
    }

    update() {
        // This is where we would update the gamepad state each frame (not needed since polling is handled already)
    }

    isButtonJustPressed(gamepadIndex, buttonIndex) {
        // Check if a specific button was pressed for a given gamepad
        const gamepad = this.gamepads[gamepadIndex];
        return gamepad && gamepad.buttons[buttonIndex];
    }

    isButtonReleased(gamepadIndex, buttonIndex) {
        // Check if a specific button was released for a given gamepad
        const gamepad = this.gamepads[gamepadIndex];
        return gamepad && !gamepad.buttons[buttonIndex];
    }

    getAxes(gamepadIndex) {
        // Return the axes of a specific gamepad
        const gamepad = this.gamepads[gamepadIndex];
        return gamepad ? gamepad.axes : [0, 0]; // Default to no movement if no axes available
    }

    disconnect() {
        clearInterval(this.pollInterval); // Stop polling gamepads
    }
}

export default GamepadInput;
