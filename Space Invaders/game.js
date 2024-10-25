// https://www.youtube.com/watch?v=MU4psw3ccUI

// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// game.js

import { canvasConfig } from './global.js'; // Import canvasConfig for canvas-related configurations
import CanvasUtils from '../scripts/canvas.js'; // Required for dynamic canvas operations, used in animate()
import Fullscreen from '../scripts/fullscreen.js'; // Required for fullscreen control, used elsewhere

import Player from './player.js';
import Sheild from './sheild.js';

import EnemySquid from './enemySquid.js';
import EnemyCrab from './enemyCrab.js';
import EnemyOctopus from './enemyOctopus.js';
import EnemyShip from './enemyShip.js';
import EnemyBullet1 from './enemyBullet1.js';
import EnemyBullet2 from './enemyBullet2.js';
import EnemyBullet3 from './enemyBullet3.js';


// Initialize enemies
const player1 = new Player(300,300);
const sheild = new Sheild(400,400);

const enemyCrab = new EnemyCrab(100, 100);
const enemyOctopus = new EnemyOctopus(150, 100);
const enemySquid = new EnemySquid(200, 100);
const enemyShip = new EnemyShip(250, 100);
const enemyBullet1 = new EnemyBullet1(100,200);
const enemyBullet2 = new EnemyBullet2(125,200);
const enemyBullet3 = new EnemyBullet3(150,200);

let elapsedTime = 0; // Accumulator for elapsed time
let intervalTime = 0.5; // Interval time in seconds (0.4 seconds)

// Function to animate and update frames every 0.4 seconds
function animate(deltaTime) {
    // Accumulate the time between frames
    elapsedTime += deltaTime;

    // Check if 0.4 seconds have passed
    if (elapsedTime >= intervalTime) {
        // Reset the accumulator
        elapsedTime = 0;
        // Update the frames for enemies
        enemyCrab.nextFrame();
        enemyOctopus.nextFrame();
        enemySquid.nextFrame();
        enemyShip.nextFrame();
        enemyBullet1.nextFrame();
        enemyBullet2.nextFrame();
        enemyBullet3.nextFrame();
    }
}

// Game loop function
export function gameLoop(ctx, deltaTime) {
    // Update game state with deltaTime
    animate(deltaTime); // Handles animation and frame updates

    // Draw player
    player1.draw(ctx);
    sheild.draw(ctx);
    // Draw enemies on the canvas
    enemyCrab.draw(ctx);
    enemyOctopus.draw(ctx);
    enemySquid.draw(ctx);
    enemyShip.draw(ctx);
    enemyBullet1.draw(ctx);
    enemyBullet2.draw(ctx);
    enemyBullet3.draw(ctx);
}

// Canvas needs to know the current directory to game.js for dynamic imports
const currentDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
window.canvasPath = currentDir;
