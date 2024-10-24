import { canvasConfig } from './global.js'; // Import canvasConfig for canvas-related configurations
import CanvasUtils from '../scripts/canvas.js'; // Required for dynamic canvas operations, used in animate()
import Fullscreen from '../scripts/fullscreen.js'; // Required for fullscreen control, used elsewhere

import L1Enemy from './L1Enemy.js';
import L2Enemy from './L2Enemy.js';

// Initialize enemies
const enemy1 = new L1Enemy(0);
const enemy2 = new L2Enemy(400); // Adjust the offset for positioning

let elapsedTime = 0; // Accumulator for elapsed time
let intervalTime = 0.4; // Interval time in seconds (0.4 seconds)

// Function to animate and update frames every 0.4 seconds
function animate(deltaTime) {
    // Accumulate the time between frames
    elapsedTime += deltaTime;

    // Check if 0.4 seconds have passed
    if (elapsedTime >= intervalTime) {
        // Reset the accumulator
        elapsedTime = 0;
        // Update the frames for enemies
        enemy1.nextFrame();
        enemy2.nextFrame();
    }
}

// Game loop function
export function gameLoop(ctx, deltaTime) {
    // Update game state with deltaTime
    animate(deltaTime); // Handles animation and frame updates

    // Clear the canvas before redrawing
    //ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw enemies on the canvas
    enemy1.draw(ctx);
    enemy2.draw(ctx);
}

// Canvas needs to know the current directory to game.js for dynamic imports
const currentDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
window.canvasPath = currentDir;
