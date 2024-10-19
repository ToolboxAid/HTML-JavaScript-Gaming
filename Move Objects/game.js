// ToolboxAid.com
// David Quesenberry
// game.js
// 10/16/2024

import { canvasConfig } from './global.js'; // Import canvasConfig
import CanvasUtils from '../scripts/canvas.js'; // shows as unused, but it is required.
import Fullscreen from '../scripts/fullscreen.js'; // shows as unused, but it is required.

// Function to get a random velocity between min and max
function getRandomVelocity(min, max) {
    return Math.random() * (max - min) + min;
}

// Variables to store the circle's position, radius, and random velocity
let circleX = 400; // Initial X position
let circleY = 300; // Initial Y position
const circleRadius = 25; // Radius of the circle

// Random velocity components between 1.0 and 5.0
let velocityX = getRandomVelocity(1.0, 5.0); // Change in X position per frame
let velocityY = getRandomVelocity(1.0, 5.0); // Change in Y position per frame

// Function to draw the filled circle
function drawFilledCircle(ctx) {
    ctx.beginPath();
    ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'yellow';
    ctx.fill();
}

// Function to update the circle's position
function updateCirclePosition() {
    // Update circle position
    circleX += velocityX;
    circleY += velocityY;

    // Check for boundary collisions and reverse direction if necessary
    if (circleX + circleRadius > canvasConfig.width || circleX - circleRadius < 0) {
        velocityX = -velocityX; // Reverse X direction
    }
    if (circleY + circleRadius > canvasConfig.height || circleY - circleRadius < 0) {
        velocityY = -velocityY; // Reverse Y direction
    }
}

// Game loop function
export function gameLoop(ctx) {
    // Update the circle's position
    updateCirclePosition();

    // Call the drawing function
    drawFilledCircle(ctx);
}

// Canvas needs to know the current directory to game.js
const currentDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
window.canvasPath = currentDir;
