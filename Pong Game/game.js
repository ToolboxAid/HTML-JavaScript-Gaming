// ToolboxAid.com
// David Quesenberry
// canvas.js
// 10/16/2024

import { canvasConfig } from './global.js';

import Paddle from './paddle.js'; // Import the Paddle class

import Puck from './puck.js'; // Import the Puck class

// Create puck instance
const puck = new Puck(); // Create a single puck instance

// Create paddles instances
const leftPaddle = new Paddle(true);  // For the left paddle
const rightPaddle = new Paddle(false); // For the right paddle


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

// Paddle positions (use let to allow modification)
const paddleWidth = 20;
const paddleHeight = 110;
const leftPaddleX = 20;
const leftPaddleColor = "white";
const rightPaddleX = canvasConfig.width - leftPaddleX - paddleWidth;
const rightPaddleColor = "white";
const paddleSpeed = 8.0;
let leftPaddleY = (canvasConfig.height / 2) - (paddleHeight / 2);
let rightPaddleY = leftPaddleY;

// Function to draw paddles
function drawPaddles(ctx) {
    // Draw left paddle
    ctx.fillStyle = leftPaddleColor;
    ctx.fillRect(leftPaddleX, leftPaddleY, paddleWidth, paddleHeight);

    // Draw right paddle
    ctx.fillStyle = rightPaddleColor;
    ctx.fillRect(rightPaddleX, rightPaddleY, paddleWidth, paddleHeight);
}

// Function to move paddles
function movePaddles() {
    // Move left paddle
    if (keys.a && leftPaddleY > 0) {
        leftPaddleY -= paddleSpeed;
    }
    if (keys.z && leftPaddleY < canvasConfig.height - paddleHeight) {
        leftPaddleY += paddleSpeed;
    }

    // Move right paddle
    if (keys.up && rightPaddleY > 0) {
        rightPaddleY -= paddleSpeed;
    }
    if (keys.down && rightPaddleY < canvasConfig.height - paddleHeight) {
        rightPaddleY += paddleSpeed;
    }
}

// Function to handle actions based on key states
function handleInput() {
    // Move paddles
    movePaddles();
}

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

function drawChar(ctx, char, x, y, pixelWidth, pixelHeight) {
    const charArray = font5x3[char];

    // If character not found, return
    if (!charArray) return;

    for (let row = 0; row < charArray.length; row++) {
        for (let col = 0; col < charArray[row].length; col++) {
            if (charArray[row][col] === 1) {
                ctx.fillRect(x + col * pixelWidth,
                    y + row * pixelHeight,
                    pixelWidth + 1,
                    pixelHeight + 1);
            }
        }
    }
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
    // Handle input
    handleInput();

    // Move the puck using its method
    puck.move(scores, leftPaddle, rightPaddle); // Ensure leftPaddle and rightPaddle are defined

    // Draw the dashed line
    drawDashedLine(ctx);

    // Draw paddles
    drawPaddles(ctx);
    // leftPaddle.draw(ctx);
    // rightPaddle.draw(ctx);
    
    // Draw the puck
    puck.draw(ctx); // Use the draw method from the Puck class

    drawScores(ctx); // Call this function to draw scores

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

// Object to keep track of key states
const keys = {
    left: false,
    right: false,
    up: false,
    down: false,
    a: false,
    z: false,
};

// Event listener for keydown
document.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'ArrowLeft':
            keys.left = true;
            break;
        case 'ArrowRight':
            keys.right = true;
            break;
        case 'Space':
            keys.space = true;
            break;
        case 'KeyA':
            keys.a = true;
            break;
        case 'KeyZ':
            keys.z = true;
            break;
        case 'ArrowUp':
            keys.up = true;
            break;
        case 'ArrowDown':
            keys.down = true;
            break;
    }
});

// Event listener for keyup
document.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'ArrowLeft':
            keys.left = false;
            break;
        case 'ArrowRight':
            keys.right = false;
            break;
        case 'Space':
            keys.space = false;
            break;
        case 'KeyA':
            keys.a = false;
            break;
        case 'KeyZ':
            keys.z = false;
            break;
        case 'ArrowUp':
            keys.up = false;
            break;
        case 'ArrowDown':
            keys.down = false;
            break;
    }
});


function animate(time) {
    var canvas = document.getElementById('gameArea');
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');
        window.canvasUtils.initCanvas(ctx); // Use the global reference
        gameLoop(ctx, time); // Ensure gameLoop is defined
        window.canvasUtils.drawBorder(ctx); // Use the global reference
        if (window.showFPS) { // Accessing global variable
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