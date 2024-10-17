// ToolboxAid.com
// David Quesenberry
// canvas.js
// 10/16/2024

import { canvasConfig } from './global.js'; // Import canvasConfig
import Paddle from './paddle.js'; // Import the Paddle class
import Puck from './puck.js'; // Import the Puck class

// Create paddles instances
const leftPaddle = new Paddle(true);
const rightPaddle = new Paddle(false);

// Create puck instance
const puck = new Puck(); // Create a single puck instance

// Variables to store the puck's position and radius 
const speedIncrease = 1.1;
const puckWidth = 20; // Width of the puck
const puckHeight = 20; // Height of the puck
const puckColor = "white";

// Accessing dimensions
let puckX = canvasConfig.width / 2;
let puckY = canvasConfig.height / 2;
let puckVelocityX = 1.5;
let puckVelocityY = 1.3;

// // Function to handle actions based on key states
// function handleInput() {
//     // Move paddles
//    // movePaddles();
// }

// Function to draw a dashed vertical line
function drawDashedLine(ctx) {
    ctx.save(); // Save the current context state

    // Set the line properties
    ctx.lineWidth = 8; // Line width
    ctx.strokeStyle = 'white'; // Line color

    // Set the line dash pattern (15px dash, 5px space)
    ctx.setLineDash([19, 19]);

    // Draw the dashed line
    const centerX = canvasConfig.width / 2; // Middle of the canvas
    ctx.beginPath();
    ctx.moveTo(centerX, 0); // Start from the top
    ctx.lineTo(centerX, canvasConfig.height); // End at the bottom
    ctx.stroke(); // Render the line

    ctx.restore(); // Restore the previous context state
}

const scores = {
    player1: 0,
    player2: 0
};

function formatScore(score) {
    return score.toString().padStart(2, '0'); // Format score to 2 digits
}

function drawScores(ctx) {
    const pixelWidth = 15;
    const pixelHeight = 20;
    const x = 280; // X position for player 1 score
    const y = 30; // Y position for scores

    // Draw Player 1 Score
    const formattedScore1 = formatScore(scores.player1);
    drawChar(ctx, formattedScore1[0], x, y, pixelWidth, pixelHeight); // Tens
    drawChar(ctx, formattedScore1[1], x + 4 * pixelWidth, y, pixelWidth, pixelHeight); // Units

    // Draw Player 2 Score
    const formattedScore2 = formatScore(scores.player2);
    drawChar(ctx, formattedScore2[0], x + 185, y, pixelWidth, pixelHeight); // Tens
    drawChar(ctx, formattedScore2[1], x + 185 + 4 * pixelWidth, y, pixelWidth, pixelHeight); // Units
}

// Game loop function
function gameLoop(ctx) {
    // // Handle input
    // handleInput();

    // Move the puck using its method
    puck.move(scores, leftPaddle, rightPaddle); // Ensure leftPaddle and rightPaddle are defined

     // Update paddles
     leftPaddle.update();
     rightPaddle.update();
 
     // Draw paddles
     leftPaddle.draw(ctx);
     rightPaddle.draw(ctx);
    
    // Draw the puck
    puck.draw(ctx); // Use the draw method from the Puck class

    drawScores(ctx); // Call this function to draw scores

    // Draw the dashed line
    drawDashedLine(ctx);

    // Test entry and exit points
    if (false) {
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

function animate(time) {
    var canvas = document.getElementById('gameArea');
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');
        window.canvasUtils.initCanvas(ctx); // Use the global reference
        gameLoop(ctx, time); // Ensure gameLoop is defined
        window.canvasUtils.drawBorder(ctx); // Use the global reference
        if (window.fpsShow) { // Accessing global variable
            window.canvasUtils.drawFPS(ctx); // Use the global reference
        }
    } else {
        alert('You need a modern browser to see this.');
    }

    requestAnimationFrame(animate);
}

window.addEventListener('DOMContentLoaded', () => {
    requestAnimationFrame(animate);
});