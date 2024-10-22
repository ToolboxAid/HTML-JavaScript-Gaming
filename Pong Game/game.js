// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// game.js

import { canvasConfig } from './global.js'; // Import canvasConfig
import Font5x3 from './font5x3.js';
import Paddle from './paddle.js';
import Puck from './puck.js';
import CanvasUtils from '../scripts/canvas.js';
import Fullscreen from '../scripts/fullscreen.js'; // shows as unused, but it is required.

/*
Sounds in Original Pong
Ball Bounce Sound:

Frequency: Approximately 400 Hz
Duration: Around 100 milliseconds
Description: A short beep sound that played whenever the ball hit the paddles or the walls.
Paddle Hit Sound:

Frequency: Similar to the ball bounce sound, around 400 Hz
Duration: Also about 100 milliseconds
Description: A distinct sound effect that played when the ball collided with a paddle.
Score Sound:

Frequency: Approximately 300 Hz to 400 Hz (varied based on the version)
Duration: Usually longer than the bounce sounds, around 200-500 milliseconds
Description: A sound indicating a score was made, usually more pronounced than the bounce sound.
*/

// Create paddles instances
let leftPaddle = new Paddle(true);
let rightPaddle = new Paddle(false);

// Create puck instance
let puck = new Puck(); // Create a single puck instance

function drawDashedLine(ctx) {
    const dashPattern = [19, 19]; // Define your dash pattern
    const centerX = canvasConfig.width / 2; // Middle of the canvas
    CanvasUtils.drawDashLine(ctx, centerX, 0, centerX, canvasConfig.height, 8, 'white', dashPattern); // Draw a dashed line
}

// Game loop function
export function gameLoop(ctx, deltaTime) { // exported for use by canvs.js
    if (Paddle.winner) {
        // Display a winner message
        alert("We have a winner!");

        // Optionally, stop the game loop or reset the game
        // Example: clear the game loop or set a flag
        // Create paddles instances
        Paddle.winner = false;
        leftPaddle = new Paddle(true);
        rightPaddle = new Paddle(false);

        // Create puck instance
        puck = new Puck(); // Create a single puck instance
    }

    // Update paddles using keyboard
    leftPaddle.update();
    rightPaddle.update();

    // Update/Move the puck using its inheritaed method
    puck.update(ctx, leftPaddle, rightPaddle, deltaTime); // Ensure leftPaddle and rightPaddle are defined

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
