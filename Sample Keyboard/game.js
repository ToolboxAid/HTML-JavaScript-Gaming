// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// game.js - Sample Keyboard

import { canvasConfig } from './global.js';
import KeyboardInput from '../scripts/keyboard.js';
import CanvasUtils from '../scripts/canvas.js';
import Fullscreen from '../scripts/fullscreen.js';

class GameLoop {
    constructor() {
        // Create an instance of KeyboardInput
        this.keyboardInput = new KeyboardInput();

        // Initialize canvas path
        this.currentDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
        window.canvasPath = this.currentDir;
    }

    getKeyStates() {
        // Retrieve keys from the KeyboardInput instance
        const keysPressed = this.keyboardInput.getkeysPressed();
        const keysDown = this.keyboardInput.getKeysDown();
        const keysReleased = this.keyboardInput.getKeysReleased();
        return { keysPressed, keysDown, keysReleased };
    }

    drawRectangles(ctx, keysDown) {
        // outline where colors will be
        ctx.fillStyle = '#888888'; // Change color
        ctx.fillRect((canvasConfig.width / 2) - 100, (canvasConfig.height / 2) - 50, 200, 100); // Draw red rectangle

        // Example: Change the rectangle color based on key presses
        if (keysDown.includes('KeyR')) {
            ctx.fillStyle = 'red'; // Change color to red if 'R' is pressed
            ctx.fillRect((canvasConfig.width / 2) - 100, (canvasConfig.height / 2) - 50, 100, 100); // Draw red rectangle
        }

        if (keysDown.includes('KeyG')) {
            ctx.fillStyle = 'green'; // Change color to green if 'G' is pressed
            ctx.fillRect((canvasConfig.width / 2), (canvasConfig.height / 2) - 50, 100, 100); // Draw green rectangle
        }
    }

    drawKeyStates(ctx, keysPressed, keysDown, keysReleased) {
        // Display the key states on the canvas
        ctx.fillStyle = 'white'; // Set text color
        ctx.font = '40px Arial'; // Set font style

        // Draw each list of keys on the canvas
        ctx.fillText('Keys Just Pressed: ' + (keysPressed.length > 0 ? keysPressed.join(', ') : 'None'), 10, 100);
        ctx.fillText('Keys Currently Pressed (' + keysDown.length + '):', 10, 140); // Show count of currently pressed keys
        ctx.fillText('Keys Just Released: ' + (keysReleased.length > 0 ? keysReleased.join(', ') : 'None'), 10, 220);
        ctx.font = '20px Arial'; // Change font size for the pressed keys display
        ctx.fillText(keysDown.length > 0 ? keysDown.join(', ') : 'None', 10, 175);

        ctx.font = '30px Arial'; // Set font style
        ctx.fillText("Press `r` for RED", 275, 390);
        ctx.fillText("Press `g` for GREEN", 275, 425);

        ctx.fillText("Caution, some keyboard scan and cannot", 105, 550);
        ctx.fillText("display all keys pressed: test your key combos.", 85, 575);
    }

    gameLoop() {
        let ctx = CanvasUtils.ctx;

        // Call update to manage key states
        this.keyboardInput.update();

        // Retrieve key states
        const { keysPressed, keysDown, keysReleased } = this.getKeyStates();

        // Draw rectangles based on key presses
        this.drawRectangles(ctx, keysDown);

        // Draw key states on the canvas
        this.drawKeyStates(ctx, keysPressed, keysDown, keysReleased);
    }
}

// Export the GameLoop class
export default GameLoop;

// To start the game loop, ensure to call this function in the animation frame as shown in canvas.js

// Canvas needs to know the current directory to game.js
const currentDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
window.canvasPath = currentDir;
