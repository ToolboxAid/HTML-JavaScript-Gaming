// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// gamepad.js

class GamepadInput {
    constructor() {
        this.buttonsPressed = new Set();  // Buttons pressed this frame
        this.buttonsDown = new Set();        // Buttons currently pressed
        this.buttonsReleased = new Set();   // Buttons released this frame

        this.tempButtonsDown = new Set();   // Temporary storage for button presses
        this.tempButtonsUp = new Set();     // Temporary storage for button releases

        this.axes = [];  // Array to store the state of the gamepad axes (analog sticks, triggers)
        this.deadzone = 0.2; // Deadzone threshold for analog inputs to prevent drift

        // Start polling after a brief delay to ensure gamepad is available
        setTimeout(() => {
            this.pollInterval = setInterval(this.pollGamepads.bind(this), 16); // ~60 FPS
        }, 1000); // Wait for 1 second before starting polling
    }

    pollGamepads() {
        const gamepads = navigator.getGamepads();
    
        if (!gamepads) {
            console.log("No gamepads available.");
            return;
        }
    
        let foundGamepad = false;
    
        for (const gamepad of gamepads) {
            if (!gamepad) continue; // Skip disconnected gamepads
    
            foundGamepad = true; // Mark that a valid gamepad was found
//            console.log("Gamepad found:", gamepad);
    
            // Process buttons
            gamepad.buttons.forEach((button, index) => {
                if (button.pressed) {
                    if (!this.buttonsDown.has(index)) {
                        this.tempButtonsDown.add(index); // Add to temporary buttonsDown
                    }
                } else {
                    if (this.buttonsDown.has(index)) {
                        this.tempButtonsUp.add(index); // Add to temporary buttonsUp
                    }
                }
            });
    
            // Process axes (analog sticks, triggers)
            this.axes = gamepad.axes.map(value => 
                Math.abs(value) > this.deadzone ? value : 0
            );
        }
    
        if (!foundGamepad) {
            console.log("No valid gamepad found.");
        }
    }
    

    update() {
        // Clear previous frame states
        this.buttonsPressed.clear();
        this.buttonsReleased.clear();

        // Process button presses
        this.tempButtonsDown.forEach(button => {
            this.buttonsPressed.add(button);
            this.buttonsDown.add(button);
        });
        this.tempButtonsDown.clear();

        // Process button releases
        this.tempButtonsUp.forEach(button => {
            this.buttonsReleased.add(button);
            this.buttonsDown.delete(button);
        });
        this.tempButtonsUp.clear();
    }

    // Utility methods
    getbuttonsPressed() {
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

    getAxes() {
        return [...this.axes];
    }

    disconnect() {
        clearInterval(this.pollInterval); // Stop polling gamepads
    }
}

export default GamepadInput;
