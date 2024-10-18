// ToolboxAid.com
// David Quesenberry
// canvas.js
// 10/16/2024

import { canvasConfig } from './global.js'; // Import canvasConfig
import { drawScores } from './font5x3.js'; 
import Fullscreen from '../scripts/fullscreen.js';
import Intersect from '../scripts/intersect.js'; 
import Functions from '../scripts/functions.js';
import Paddle from './paddle.js';
import Puck from './puck.js';
import CanvasUtils from '../scripts/canvas.js';

// Create paddles instances
const leftPaddle = new Paddle(true);
const rightPaddle = new Paddle(false);

// Create puck instance
const puck = new Puck(); // Create a single puck instance

// Player scores
const scores = {
    player1: 0,
    player2: 0
};

function drawDashedLine(ctx) {
    const dashPattern = [19, 19]; // Define your dash pattern
    const centerX = canvasConfig.width / 2; // Middle of the canvas
    CanvasUtils.drawDashLine(ctx, centerX, 0, centerX, canvasConfig.height, 8, 'white', dashPattern); // Draw a dashed line
}

// Game loop function
export function gameLoop(ctx) {
    // Move the puck using its method
    puck.move(leftPaddle, rightPaddle); // Ensure leftPaddle and rightPaddle are defined

    // Update paddles
    leftPaddle.update();
    rightPaddle.update();

    // Draw paddles
    leftPaddle.draw(ctx);
    rightPaddle.draw(ctx);

    // Call drawScores to display the current scores
    drawScores(ctx, leftPaddle, rightPaddle);

    // Draw the dashed line
    drawDashedLine(ctx);

    // Draw the puck
    puck.draw(ctx); // Use the draw method from the Puck class

    // Test entry and exit points
    if (false) {
    // // Test entry and exit points (Example Logic)
    // // You can keep this section for testing intersection logic
    // // Instantiate a static rectangle object
    // let rectangleObject = new ObjectStatic(100, 100, 160, 100);
    // let squareObject = null;
    // let result = null;

        // Instantiate a static rectangle object
        let rectangleObject = new ObjectStatic(100, 100, 160, 100);

        let squareObject = null;
        let result = null;
        //  ObjectDynamic ( x, y, width, height, velocityX, velocityY )

        /* ------------------------------------
        Enter Left: Exit Top, Right, Bottom
        ------------------------------------ */
        if (false) {

            // Exit TOP  (--- not working on exit ---)
            squareObject = new ObjectDynamic(30, 150, 10, 10, 300, -100);
            result = checkIntersection(ctx, squareObject, rectangleObject);

            // Exit RIGHT
            squareObject = new ObjectDynamic(30, 150, 10, 10, 300, 0);
            result = checkIntersection(ctx, squareObject, rectangleObject);

            // Exit Bottom
            squareObject = new ObjectDynamic(30, 150, 10, 10, 300, 100);
            result = checkIntersection(ctx, squareObject, rectangleObject);
        }
        /* ------------------------------------
        Enter TOP: Exit Left, Right, Bottom
        ------------------------------------    */
        if (true) {

            // Exit Right
            squareObject = new ObjectDynamic(180, 30, 10, 10, 125, 200);
            result = checkIntersection(ctx, squareObject, rectangleObject);

            // Exit Bottom
            squareObject = new ObjectDynamic(180, 30, 10, 10, 0, 200);
            result = checkIntersection(ctx, squareObject, rectangleObject);

            // Exit Left   (--- not working on exit ---)
            squareObject = new ObjectDynamic(180, 30, 10, 10, -125, 200);
            result = checkIntersection(ctx, squareObject, rectangleObject);
        }

        /* ------------------------------------
        Enter Right: Exit Left, Top, Bottom
        ------------------------------------*/
        if (false) {
            // Exit TOP   (--- not working on exit ---)
            squareObject = new ObjectDynamic(280, 150, 10, 10, -125, -125);
            result = checkIntersection(ctx, squareObject, rectangleObject);

            // Exit Left   (--- not working on exit ---)
            squareObject = new ObjectDynamic(280, 150, 10, 10, -225, 0);
            result = checkIntersection(ctx, squareObject, rectangleObject);

            // Exit Bottom
            squareObject = new ObjectDynamic(280, 150, 10, 10, -125, 125);
            result = checkIntersection(ctx, squareObject, rectangleObject);
        }

        /* ------------------------------------
        Enter Right: Exit Left, Top, Bottom
        ------------------------------------*/
        if (true) {
            // Exit Left   (--- not working on exit ---)
            squareObject = new ObjectDynamic(170, 220, 10, 10, -125, -100);
            result = checkIntersection(ctx, squareObject, rectangleObject);

            // Exit Top   (--- not working on exit ---)
            squareObject = new ObjectDynamic(170, 220, 10, 10, 0, -185);
            result = checkIntersection(ctx, squareObject, rectangleObject);

            // Exit Right
            squareObject = new ObjectDynamic(170, 220, 10, 10, 125, -100);
            result = checkIntersection(ctx, squareObject, rectangleObject);
        }
    }
}

// Canvas needs to know the current directory to game.js
const currentDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/')); 
window.canvasPath = currentDir;
