// ToolboxAid.com
// David Quesenberry
// game.js
// 10/16/2024

import { canvasConfig } from './global.js'; // Import canvasConfig
import CanvasUtils from '../scripts/canvas.js'; // shows as unused, but it is required.
import Fullscreen from '../scripts/fullscreen.js'; // shows as unused, but it is required.
import Functions from '../scripts/functions.js';
import Circle from './circle.js';

class Game {
    constructor() {
        // Create our circle
        this.radius = 25;
        this.circle = new Circle(canvasConfig.width, canvasConfig.height, this.radius, 
            Functions.randomGenerator(150.0, 350.0), Functions.randomGenerator(150.0, 350.0));

        // Canvas needs to know the current directory to game.js
        this.currentDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
        window.canvasPath = this.currentDir;
    }

    updateCirclePosition(hitBoundaries) {
        // Check if the array is empty
        if (hitBoundaries.length === 0) {
            console.log("No boundaries were hit");
        } else {
            console.log("Boundaries hit:", hitBoundaries);
        }
    }

    gameLoop(deltaTime) {
        // Update circle position
        this.circle.update(deltaTime);

        // Call the checkCollisionWithBounds function
        const boundariesHit = this.circle.checkCollisionWithBounds(canvasConfig.width, canvasConfig.height);
        if (boundariesHit.length > 0) {
            // Pass boundariesHit to updateCirclePosition
            this.updateCirclePosition(boundariesHit);
        }

        // Call the drawing function
        this.circle.draw();
    }
}

// Export the Game class
export default Game;

// Canvas needs to know the current directory to game.js
const currentDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
window.canvasPath = currentDir;
