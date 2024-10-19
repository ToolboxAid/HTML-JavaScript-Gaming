// ToolboxAid.com
// David Quesenberry
// game.js
// 10/16/2024

import { canvasConfig } from './global.js'; // Import canvasConfig
import CanvasUtils from '../scripts/canvas.js'; // shows as unused, but it is required.
import Fullscreen from '../scripts/fullscreen.js'; // shows as unused, but it is required.
import Functions from '../scripts/functions.js';
import Circle from './circle.js';


// Create our circle
let radius = 25;
let circle = new Circle(canvasConfig.width, canvasConfig.height, radius, 
    Functions.randomGenerator(150.0, 350.0), Functions.randomGenerator(150.0, 350.0));

// Function to update the circle's position
function updateCirclePosition(hitBoundaries) {
    // Check if the array is empty
    if (hitBoundaries.length === 0) {
        console.log("No boundaries were hit");
    } else {
        console.log("Boundaries hit:", hitBoundaries);
    }
}

// Game loop function
export function gameLoop(ctx, deltaTime) {

    // Update circle position
    circle.update(deltaTime);

    // Call the checkCollisionWithBounds function
    const boundariesHit = circle.checkCollisionWithBounds(canvasConfig.width, canvasConfig.height);
    if (boundariesHit.length > 0) {
        // Pass boundariesHit to updateCirclePosition
        updateCirclePosition(boundariesHit);
    }

    // // Call the drawing function
    circle.draw(ctx);
}

// Canvas needs to know the current directory to game.js
const currentDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
window.canvasPath = currentDir;
