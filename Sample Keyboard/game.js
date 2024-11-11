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

    updateKeyStates() {
        // Call update to manage key states
        this.keyboardInput.update();
    }

    getKeyStates() {
        // Retrieve keys from the KeyboardInput instance
        const keysJustPressed = this.keyboardInput.getKeyJustPressed();
        const keysPressed = this.keyboardInput.getKeyPressed();
        const keysReleased = this.keyboardInput.getKeyReleased();
        return { keysJustPressed, keysPressed, keysReleased };
    }

    drawBackground(ctx) {
        // Clear the canvas before drawing
        ctx.clearRect(0, 0, canvasConfig.width, canvasConfig.height);
        
        // Draw a rectangle as a background element
        ctx.fillStyle = '#333333'; // Color for the rectangle
        ctx.fillRect((canvasConfig.width / 2) - 100, (canvasConfig.height / 2) - 50, 200, 100); // Draw a rectangle
    }

    drawRectangles(ctx, keysPressed) {
        // Example: Change the rectangle color based on key presses
        if (keysPressed.includes('KeyR')) {
            ctx.fillStyle = 'red'; // Change color to red if 'R' is pressed
            ctx.fillRect((canvasConfig.width / 2) - 100, (canvasConfig.height / 2) - 50, 200, 100); // Draw red rectangle
        }
        if (keysPressed.includes('KeyG')) {
            ctx.fillStyle = 'green'; // Change color to green if 'G' is pressed
            ctx.fillRect((canvasConfig.width / 2), (canvasConfig.height / 2) - 50, 100, 100); // Draw green rectangle
        }
    }

    drawKeyStates(ctx, keysJustPressed, keysPressed, keysReleased) {
        // Display the key states on the canvas
        ctx.fillStyle = 'white'; // Set text color
        ctx.font = '40px Arial'; // Set font style

        // Draw each list of keys on the canvas
        ctx.fillText('Keys Just Pressed: ' + (keysJustPressed.length > 0 ? keysJustPressed.join(', ') : 'None'), 10, 100);
        ctx.fillText('Keys Currently Pressed (' + keysPressed.length + '):', 10, 140); // Show count of currently pressed keys
        ctx.fillText('Keys Just Released: ' + (keysReleased.length > 0 ? keysReleased.join(', ') : 'None'), 10, 220);
        ctx.font = '20px Arial'; // Change font size for the pressed keys display
        ctx.fillText(keysPressed.length > 0 ? keysPressed.join(', ') : 'None', 10, 180);
    }

    gameLoop(ctx) {
        // Call update to manage key states
        this.updateKeyStates();

        // Retrieve key states
        const { keysJustPressed, keysPressed, keysReleased } = this.getKeyStates();

        // Draw the background
        this.drawBackground(ctx);

        // Draw rectangles based on key presses
        this.drawRectangles(ctx, keysPressed);

        // Draw key states on the canvas
        this.drawKeyStates(ctx, keysJustPressed, keysPressed, keysReleased);
    }
}

// Export the GameLoop class
export default GameLoop;

// To start the game loop, ensure to call this function in the animation frame as shown in canvas.js

// Canvas needs to know the current directory to game.js
const currentDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
window.canvasPath = currentDir;
