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
        this.circle = new Circle();

        // Canvas needs to know the current directory to game.js
        this.currentDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
        window.canvasPath = this.currentDir;
    }

    gameLoop(deltaTime) {
        // Update circle position
        this.circle.update(deltaTime);

        // Call the drawing function
        this.circle.draw();
    }
}

// Export the Game class
export default Game;

// Canvas needs to know the current directory to game.js
const currentDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
window.canvasPath = currentDir;
