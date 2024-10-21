// ToolboxAid.com
// David Quesenberry
// game.js
// 10/16/2024

import { canvasConfig } from './global.js'; // Import canvasConfig for canvas-related configurations
import CanvasUtils from '../scripts/canvas.js'; // Required for dynamic canvas operations, used in animate()
import Fullscreen from '../scripts/fullscreen.js'; // Required for fullscreen control, used elsewhere

// Game loop function
export function gameLoop(ctx, deltaTime) {
    // Update game state with deltaTime
    // Example: object.position += object.velocity * deltaTime;

    // Render objects on the canvas
    // CanvasUtils.drawCircle(ctx, {x: 50, y: 50}); // Example rendering
}

// Canvas needs to know the current directory to game.js for dynamic imports
const currentDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
window.canvasPath = currentDir;
