import { canvasConfig } from './global.js';
import KeyboardInput from '../scripts/keyboard.js';
import CanvasUtils from '../scripts/canvas.js';
import Fullscreen from '../scripts/fullscreen.js';

const keyboardInput = new KeyboardInput();

export function gameLoop(ctx, deltaTime) {
    // Call update to manage key states
    keyboardInput.update();

    // Retrieve keys from the KeyboardInput instance
    const keysJustPressed = keyboardInput.getKeyJustPressed();
    const keysPressed = keyboardInput.getKeyPressed();
    const keysReleased = keyboardInput.getKeyReleased();

    // Clear the canvas before drawing
    ctx.clearRect(0, 0, canvasConfig.width, canvasConfig.height);
    
    // Draw a rectangle as a background element
    ctx.fillStyle = '#333333'; // Color for the rectangle
    ctx.fillRect((canvasConfig.width / 2) - 100, (canvasConfig.height / 2) - 50, 200, 100); // Draw a rectangle

    // Example: Change the rectangle color based on key presses
    if (keysPressed.includes('KeyR')) {
        ctx.fillStyle = 'red'; // Change color to red if 'R' is pressed
        ctx.fillRect((canvasConfig.width / 2) - 100, (canvasConfig.height / 2) - 50, 200, 100); // Draw red rectangle
    } 
    if (keysPressed.includes('KeyG')) {
        ctx.fillStyle = 'green'; // Change color to green if 'G' is pressed
        ctx.fillRect((canvasConfig.width / 2), (canvasConfig.height / 2) - 50, 100, 100); // Draw green rectangle
    }

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

// To start the game loop, ensure to call this function in the animation frame as shown in canvas.js

// Canvas needs to know the current directory to game.js
const currentDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
window.canvasPath = currentDir;
