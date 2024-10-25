// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// game.js

import { canvasConfig, spriteConfig } from './global.js'; // Assuming these contain canvas and sprite details

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


// Initialize player
const player1 = new Player(100, 690);
const lives1 = new Player(100, 750);

// Enemy configurations for octopus, squid, and crab
const enemyRows = 2;
const enemyCols = 11;
const enemySpacing = 5; // 5px space between each enemy

const enemyOctopuses = [];
const enemySquids = [];
const enemyCrabs = [];

// Shield configurations
const numShields = 4; // Number of shields
const shieldYPosition = 620; //(canvasConfig.height * 5) / 6; // 4/5 down the canvas height
const shieldWidth = 100; // Adjust as needed
const shieldSpacing = (canvasConfig.width - numShields * shieldWidth) / (numShields + 1); // Even spacing between shields
const shields = [];

// Function to initialize enemy positions
function initializeEnemies() {
    const octopusWidth = 40;
    const octopusHeight = 40;
    const squidWidth = 40;
    const squidHeight = 40;
    const crabWidth = 40;
    const crabHeight = 40;

    // Create 2 rows of octopuses
    for (let row = 0; row < enemyRows; row++) {
        for (let col = 0; col < enemyCols; col++) {
            const x = 40 + col * (octopusWidth + enemySpacing);
            const y = 100 + row * (octopusHeight + enemySpacing);
            const enemyOctopus = new EnemyOctopus(x, y);
            enemyOctopuses.push(enemyOctopus);
        }
    }

    // Create 2 rows of squids
    for (let row = 0; row < enemyRows; row++) {
        for (let col = 0; col < enemyCols; col++) {
            const x = 40 + col * (squidWidth + enemySpacing);
            const y = 190 + row * (squidHeight + enemySpacing);
            const enemySquid = new EnemySquid(x, y);
            enemySquids.push(enemySquid);
        }
    }

    // Create 2 rows of crabs
    for (let row = 0; row < enemyRows; row++) {
        for (let col = 0; col < enemyCols; col++) {
            const x = 40 + col * (crabWidth + enemySpacing);
            const y = 280 + row * (crabHeight + enemySpacing);
            const enemyCrab = new EnemyCrab(x, y);
            enemyCrabs.push(enemyCrab);
        }
    }
}

// Function to initialize shield positions
function initializeShields() {
    for (let i = 0; i < numShields; i++) {
        const x = shieldSpacing + i * (shieldWidth + shieldSpacing);
        const shield = new Sheild(x, shieldYPosition);
        shields.push(shield);
    }
}

// Initialize other enemies
const enemyShip = new EnemyShip(100, 50);

let elapsedTime = 0;
let intervalTime = 0.5;

// Function to animate and update frames every 0.4 seconds
function animate(deltaTime) {
    elapsedTime += deltaTime;

    if (elapsedTime >= intervalTime) {
        elapsedTime = 0;

        // Update frames for all enemies
        enemySquids.forEach(enemySquid => enemySquid.nextFrame());
        enemyOctopuses.forEach(enemyOctopus => enemyOctopus.nextFrame());
        enemyCrabs.forEach(enemyCrab => enemyCrab.nextFrame());

        enemyShip.nextFrame();
    }
}

// Game loop function
export function gameLoop(ctx, deltaTime) {
    animate(deltaTime);

    // Draw player
    player1.draw(ctx);
    lives1.draw(ctx);

    // Draw shields
    shields.forEach(shield => {shield.draw(ctx); });

    // Draw all enemies
    enemyOctopuses.forEach(enemyOctopus => enemyOctopus.draw(ctx));
    enemySquids.forEach(enemySquid => enemySquid.draw(ctx));
    enemyCrabs.forEach(enemyCrab => enemyCrab.draw(ctx));
    enemyShip.draw(ctx);
}

// Initialize enemies and shields
initializeEnemies();
initializeShields();

// Canvas needs to know the current directory to game.js for dynamic imports
const currentDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
window.canvasPath = currentDir;
