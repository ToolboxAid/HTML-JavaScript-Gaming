// ToolboxAid.com
// David Quesenberry
// game.js
// 10/16/2024

import {canvasConfig} from './global.js'; // Import canvasConfig
import CanvasUtils from '../scripts/canvas.js'; // shows as unused, but it is required.
import Fullscreen from '../scripts/fullscreen.js'; // shows as unused, but it is required.


// Game loop function
export function gameLoop(ctx, deltaTime) {

  // Add code here}
}

// Canvas needs to know the current directory to game.js
const currentDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
window.canvasPath = currentDir;
