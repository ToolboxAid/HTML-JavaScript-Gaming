// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// game.js

import { canvasConfig, spriteConfig } from './global.js'; // Assuming these contain canvas and sprite details

import CanvasUtils from '../scripts/canvas.js'; // Required for dynamic canvas operations, used in animate()
import Fullscreen from '../scripts/fullscreen.js'; // Required for fullscreen control, used elsewhere

import Player from './player.js';
import Sheild from './sheild.js';

import Enemy from './Enemy.js';
import EnemySquid from './enemySquid.js';
import EnemyCrab from './enemyCrab.js';
import EnemyOctopus from './enemyOctopus.js';
import EnemyShip from './enemyShip.js';
import EnemyBullet1 from './enemyBullet1.js';
import EnemyBullet2 from './enemyBullet2.js';
import EnemyBullet3 from './enemyBullet3.js';

// Initialize player
const player1 = new Player(100, 790);

// Enemy configurations for octopus, squid, and crab
const enemyRows = 2;
const enemyCols = 11;
const enemySpacing = 19; // 5px space between each enemy

const enemyOctopuses = [];
const enemySquids = [];
const enemyCrabs = [];

// Shield configurations
const numShields = 4; // Number of shields
const shieldYPosition = 700; //(canvasConfig.height * 5) / 6; // 4/5 down the canvas height
const shieldWidth = 100; // Adjust as needed
const shieldSpacing = (canvasConfig.width - numShields * shieldWidth) / (numShields + 1); // Even spacing between shields
const shields = [];

// Initialize other enemies
const enemyShip = new EnemyShip(295, 145);

// Function to initialize enemy positions
function initializeEnemies() {
    let enemyHeightSpacing = 59;
    let enemyHeightPosition = 425;

    const octopusWidth = 40;
    const squidWidth = 40;
    const crabWidth = 40;

    // Create 2 rows of crabs
    for (let row = 0; row < enemyRows; row++) {
        for (let col = 0; col < enemyCols; col++) {
            const x = 40 + col * (crabWidth + enemySpacing);
            const y = enemyHeightPosition;
            const enemyCrab = new EnemyCrab(x, y);
            enemyCrabs.push(enemyCrab);
        }
        enemyHeightPosition -= enemyHeightSpacing;
    }

    // Create 2 rows of squids
    for (let row = 0; row < enemyRows; row++) {
        for (let col = 0; col < enemyCols; col++) {
            const x = 42 + col * (squidWidth + enemySpacing);
            const y = enemyHeightPosition;
            const enemySquid = new EnemySquid(x, y);
            enemySquids.push(enemySquid);
        }
        enemyHeightPosition -= enemyHeightSpacing;
    }


    // Create 1 row of octopuses
    for (let row = 0; row < enemyRows - 1; row++) {
        for (let col = 0; col < enemyCols; col++) {
            const x = 47 + col * (octopusWidth + enemySpacing);
            const y = enemyHeightPosition;
            const enemyOctopus = new EnemyOctopus(x, y);
            enemyOctopuses.push(enemyOctopus);
        }
        enemyHeightPosition -= enemyHeightSpacing;
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

// function enimiesAnimationRequired() {
//     // Calculate the number of remaining enemies
//     const remainingEnemies = enemies.length;
//     const initialEnemyCount = enemyRows * enemyColumns;

//     let AnimationRequired = false;

//     // Set the dynamic animation interval based on remaining enemies
//     // Start at 60 frames (1 second) and go down to 1 frame (1/100 of a second)
//     const maxInterval = 60;  // 1 second at 60 FPS
//     const minInterval = 2;   // 2 frame, representing 2/60 second

//     // Update animation based on dynamic animation interval
//     if (frameCount % dynamicAnimationInterval === 0) {

//       AnimationRequired = true;

//       dynamicAnimationInterval = Math.max(minInterval, Math.floor(maxInterval * (remainingEnemies / initialEnemyCount)));
//       console.log(`FrameCount: ${frameCount}, dynamicAnimationInterval: ${dynamicAnimationInterval}`);
//     }

//     // Log the interval for debugging purposes (optional)
//     // console.log(`Remaining Enemies: ${remainingEnemies}, Dynamic Animation Interval: ${dynamicAnimationInterval}`);
//     return AnimationRequired;
//   }

function setEnemyDropTimer() {
    const initialEnemyCount = 5 * enemyCols;// 5 for enemyRows
    const time = 750; //1500; // 1.5 seconds
    const dropIncr = time / initialEnemyCount;
    let dropDelay = 0;

    // Calculate the number of remaining enemies
    const remainingEnemies = enemyOctopuses.length + enemySquids.length + enemyCrabs.length;

    let adj = remainingEnemies / initialEnemyCount;
    enemyCrabs.forEach(enemyCrab => {
        enemyCrab.setDropTimer(dropDelay);
        dropDelay += dropIncr;
    });
    enemySquids.forEach(enemySquid => {
        enemySquid.setDropTimer(dropDelay);
        dropDelay += dropIncr;
    });
    enemyOctopuses.forEach(enemyOctopus => {
        enemyOctopus.setDropTimer(dropDelay);
        dropDelay += dropIncr;
    });
}

let elapsedTime = 0;
let intervalTime = 0.5;

// Function to animate and update frames every 0.4 seconds
function animate(deltaTime) {
    elapsedTime += deltaTime;

    if (elapsedTime >= intervalTime) {
        elapsedTime = 0;

        let dropEnimy = false;
        // Update frames and set drop timer for all enemies
        [...enemySquids, ...enemyOctopuses, ...enemyCrabs].forEach(enemy => {
            let atBounds = enemy.nextFrame();
            if (!dropEnimy && atBounds) {
                dropEnimy = true;
            }
        });
        if (dropEnimy) {
            //enemy.setDropTimer();
            Enemy.changeDirections();
            setEnemyDropTimer();
        }
    }
}

function updateEnimies() {
    enemySquids.forEach(enemySquid => enemySquid.update());
    enemyOctopuses.forEach(enemyOctopus => enemyOctopus.update());
    enemyCrabs.forEach(enemyCrab => enemyCrab.update());
}

let tmpScore = 0;
function drawScore(ctx, player) {
    tmpScore++;
    // ctx.font = '30px Arial';
    // ctx.fillStyle = 'white';
    let color = 'yellow';
    const pixelSize = 5;
    CanvasUtils.drawText(ctx, 50, 30, "SCORE-1", pixelSize, 'red');
    CanvasUtils.drawText(ctx, 300, 30, "MIDWAY", pixelSize, 'red');
    CanvasUtils.drawText(ctx, 550, 30, "SCORE-2", pixelSize, 'red');
    let number = 0;
    CanvasUtils.drawNumber(ctx, 50, 80, tmpScore, pixelSize, color, 5, '-');
    number += 999;
    CanvasUtils.drawNumber(ctx, 300, 80, 0, pixelSize, color, 5, '0');
    number += 999;
    CanvasUtils.drawNumber(ctx, 550, 80, number, pixelSize, color, 5, '-');
}

function drawLives(ctx, player) {
    ctx.font = '30px Arial';
    ctx.fillStyle = 'white';
    let dwn = 930;
    ctx.fillText(player.lives, 25, dwn);
    CanvasUtils.drawSprite(ctx, 65, dwn - 30, Player.frame, 3);
}

function drawBottomBar(ctx) {
    let bottom = 880;
    CanvasUtils.drawLine(ctx, 0, bottom, 800, bottom, 5, "pink");
}

// Game loop function
export function gameLoop(ctx, deltaTime) {

    animate(deltaTime);

    // Draw scores
    drawScore(ctx);

    updateEnimies();
    // Draw player
    player1.draw(ctx);
    drawBottomBar(ctx);
    drawLives(ctx, player1);

    // Draw shields
    shields.forEach(shield => { shield.draw(ctx); });

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
