// ToolboxAid.com
// David Quesenberry
// canvas.js
// 10/16/2024

import { canvasConfig } from './global.js'; // Import canvasConfig
import Font5x3 from './font5x3.js';
import Paddle from './paddle.js';
import Puck from './puck.js';
import CanvasUtils from '../scripts/canvas.js';
import Fullscreen from '../scripts/fullscreen.js'; // shows as unused, but it is required.

// Create paddles instances
const leftPaddle = new Paddle(true);
const rightPaddle = new Paddle(false);

// Create puck instance
const puck = new Puck(); // Create a single puck instance

function drawDashedLine(ctx) {
    const dashPattern = [19, 19]; // Define your dash pattern
    const centerX = canvasConfig.width / 2; // Middle of the canvas
    CanvasUtils.drawDashLine(ctx, centerX, 0, centerX, canvasConfig.height, 8, 'white', dashPattern); // Draw a dashed line
}

// Game loop function
export function gameLoop(ctx) { // exported for use by canvs.js
    // Move the puck using its method
    puck.move(leftPaddle, rightPaddle); // Ensure leftPaddle and rightPaddle are defined

    // Update paddles
    leftPaddle.update();
    rightPaddle.update();

    // Draw paddles
    leftPaddle.draw(ctx);
    rightPaddle.draw(ctx);

    // Call drawScores to display the current scores
    Font5x3.drawScores(ctx, leftPaddle, rightPaddle);

    // Draw the dashed line
    drawDashedLine(ctx);

    // Draw the puck
    puck.draw(ctx); // Use the draw method from the Puck class
}

// Canvas needs to know the current directory to game.js
const currentDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/')); 
window.canvasPath = currentDir;
