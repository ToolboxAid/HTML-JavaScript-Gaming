// ToolboxAid.com
// David Quesenberry
// puck.js
// 10/16/2024

// Variables for puck properties (ensure these are imported or defined)
const puckWidth = 20; // Width of the puck
const puckHeight = 20; // Height of the puck
const puckColor = "white";
let puckX = gameAreaWidth / 2;
let puckY = gameAreaHeight / 2;
let puckVelocityX = 1.5;
let puckVelocityY = 1.3;

// Function to draw the puck
export function drawPuck(ctx) {
    ctx.fillStyle = puckColor;
    ctx.fillRect(puckX - puckWidth / 2, puckY - puckHeight / 2, puckWidth, puckHeight);
}

export function movePuck(scores) {
    const { player1, player2 } = scores; // Destructure scores object

    let leftPaddleX = 10;
    let leftPaddleY = 10;

    let rightPaddleX = 10;
    let rightPaddleY = 10;

    let paddleWidth = 10;
    let paddleHeight = 10;

    // Update puck position based on velocity
    puckX += puckVelocityX;
    puckY += puckVelocityY;

    // Check for collision with canvas boundaries
    if (puckX + puckWidth / 2 > gameAreaWidth) {
        // Puck touched the right boundary
        puckVelocityX *= -1; // Reverse X direction
        scores.player1++; // Player 1 scores
        resetPuck(); // Optional: reset puck position or speed if desired
    }
    if (puckX - puckWidth / 2 < 0) {
        // Puck touched the left boundary
        puckVelocityX *= -1; // Reverse X direction
        scores.player2++; // Player 2 scores
        resetPuck(); // Optional: reset puck position or speed if desired
    }

    // Check for collision with the top and bottom boundaries (without scoring)
    if (puckY + puckHeight / 2 > gameAreaHeight || puckY - puckHeight / 2 < 0) {
        puckVelocityY *= -1; // Reverse Y direction
    }

    // Check collision with paddles
    // Check collision with left paddle
    if (puckX - puckWidth / 2 < leftPaddleX + paddleWidth &&
        puckY > leftPaddleY && puckY < leftPaddleY + paddleHeight) {

        // Calculate the hit position on the paddle
        let paddleCenterY = leftPaddleY + paddleHeight / 2;
        let offsetY = puckY - paddleCenterY; // Distance from center of paddle

        // Reverse X direction
        puckVelocityX *= -1;

        // Maintain the Y velocity, adjusting based on where it hits the paddle
        puckVelocityY = Math.sign(puckVelocityY) * (Math.abs(puckVelocityY) + offsetY * 0.1);
    }

    // Check collision with right paddle
    if (puckX + puckWidth / 2 > rightPaddleX &&
        puckY > rightPaddleY && puckY < rightPaddleY + paddleHeight) {

        // Calculate the hit position on the paddle
        let paddleCenterY = rightPaddleY + paddleHeight / 2;
        let offsetY = puckY - paddleCenterY; // Distance from center of paddle

        // Reverse X direction
        puckVelocityX *= -1;

        // Maintain the Y velocity, adjusting based on where it hits the paddle
        puckVelocityY = Math.sign(puckVelocityY) * (Math.abs(puckVelocityY) + offsetY * 0.1);
    }
}

// Reset puck position and velocity
export function resetPuck() {
    // Reset puck to the center of screen
    puckX = gameAreaWidth / 2;
    puckY = gameAreaHeight / 2;
    
    // Generate random velocity between -5 and 5
    puckVelocityX = 5 * (randomGenerator() * 2 - 1); // Random initial X direction
    puckVelocityY = 2 * (randomGenerator() * 2 - 1); // Random initial Y direction

    // Print puck position and velocity
    console.log(`Puck Position: X = ${puckX}, Y = ${puckY}`);
    console.log(`Puck Velocity: X = ${puckVelocityX.toFixed(2)}, Y = ${puckVelocityY.toFixed(2)}`);
}

// Ensure randomGenerator is defined correctly
function randomGenerator() {
    return Math.random(); // Example of a simple random generator
}
