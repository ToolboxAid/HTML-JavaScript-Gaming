// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// game.js

import { canvasConfig, spriteConfig } from './global.js'; // Assuming these contain canvas and sprite details

import CanvasUtils from '../scripts/canvas.js'; // Required for dynamic canvas operations, used in animate()
import Fullscreen from '../scripts/fullscreen.js'; // Required for fullscreen control, used elsewhere

import Player from './player.js';
import Shield from './shield.js';
import Laser from './laser.js';
let laser = null;

import KeyboardInput from '../scripts/keyboard.js';
const keyboardInput = new KeyboardInput();

import Enemy from './Enemy.js';
import EnemySquid from './enemySquid.js';
import EnemyCrab from './enemyCrab.js';
import EnemyOctopus from './enemyOctopus.js';
import EnemyShip from './enemyShip.js';
import EnemyBomb1 from './enemyBomb1.js';
import EnemyBomb2 from './enemyBomb2.js';
import EnemyBomb3 from './enemyBomb3.js';

// Initialize player
const player1 = new Player(100, 810);// was 790
const player2 = new Player(100, 810);

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

const initialSpeed = 0.0;
const finalSpeed = 7;
const initialEnemies = 55;
function calculateSpeed(remainingEnemies) {
    // Calculate the slope with positive change
    const speedChangePerEnemy = (finalSpeed - initialSpeed) / (initialEnemies - 1);

    // Calculate the current speed
    const speed = initialSpeed + (speedChangePerEnemy * (initialEnemies - remainingEnemies));

    // Ensure speed does not go above the final speed
    return Math.min(speed, finalSpeed);
}

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
        const shield = new Shield(x, shieldYPosition);
        shields.push(shield);
    }
}

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

// Function to animate and update frames, start every 0.4 seconds 
const maxInterval = 60;  // 1 second at 60 FPS
const minInterval = 2;   // 2 frame, representing 2/60 second

let frameCount = 0;
let initialEnemyCount = 55;
let dynamicAnimationInterval = initialEnemyCount;
function animate(deltaTime) {

    const remainingEnemies = enemySquids.length + enemyOctopuses.length + enemyCrabs.length;
    frameCount++;
    dynamicAnimationInterval = Math.max(minInterval, Math.floor(maxInterval * (remainingEnemies / initialEnemyCount)));
    if (frameCount % dynamicAnimationInterval === 0) {

        //const speedMultiplier = (initialEnemyCount - remainingEnemies) / (initialEnemyCount - 1);
        //const speed = Math.max(0, Math.min(2, speedMultiplier)) * 5; // Ensure the value stays within 0 and 2
        const speed = calculateSpeed(remainingEnemies);
        //      console.log(speedMultiplier + " " + speed );
        Enemy.setSpeed(speed);

        //console.log(`FrameCount: ${frameCount}, dynamicAnimationInterval: ${dynamicAnimationInterval}`);

        let dropEnimy = false;
        // Update frames and set drop timer for all enemies
        [...enemySquids, ...enemyOctopuses, ...enemyCrabs].forEach(enemy => {
            let atBounds = enemy.nextFrame();
            if (!dropEnimy && atBounds) {
                dropEnimy = true;
            }
        });
        if (dropEnimy) {
            Enemy.changeDirections();
            setEnemyDropTimer();
        }
    }
}

function updateEnimies(deltaTime) {
    enemySquids.forEach(enemySquid => enemySquid.update(deltaTime));
    enemyOctopuses.forEach(enemyOctopus => enemyOctopus.update(deltaTime));
    enemyCrabs.forEach(enemyCrab => enemyCrab.update(deltaTime));
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
    CanvasUtils.drawNumber(ctx, 50, 80, player1.score, pixelSize, color, 5, ' ');
    CanvasUtils.drawNumber(ctx, 300, 80, 0, pixelSize, color, 5, ' ');
    CanvasUtils.drawNumber(ctx, 550, 80, player2.score, pixelSize, color, 5, ' ');
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

function checkLaserColliision() {
    let hitDetected = false; // Flag to track if a hit occurred

    // Check for collisions and remove hit enemies
    [enemySquids, enemyOctopuses, enemyCrabs].forEach(enemyArray => {
        for (let i = enemyArray.length - 1; i >= 0; i--) {
            const enemy = enemyArray[i];
            if (!hitDetected) {
                if (laser.checkObjectCollision(enemy)) {
                    player1.score += enemy.value;
                    enemy.setHit();
                    laser = null; // Delete the laser
                    hitDetected = true; // Set the flag to indicate a hit
                    break; // Exit the current `for` loop
                }
            }
        }
    });
    return hitDetected;
}

function removeDeadEnemy() {
    // Check for dead enemy and remove
    [enemySquids, enemyOctopuses, enemyCrabs].forEach(enemyArray => {
        for (let i = enemyArray.length - 1; i >= 0; i--) {
            const enemy = enemyArray[i];
            if (enemy.isDead()) {
                enemyArray.splice(i, 1); // Remove the enemy at index i
                break; // Exit the current `for` loop
            }
        }
    });
}

// Game loop function
export function gameLoop(ctx, deltaTime) {

    removeDeadEnemy();

    keyboardInput.update();
    let laserPoint = player1.update(keyboardInput.getKeyPressed(), keyboardInput.getKeyJustPressed());

    if (!laser) {
        if (laserPoint) {
            laser = new Laser(laserPoint.x, laserPoint.y);
        }
    }

    if (laser) {
        if (laser.update(deltaTime)) { // Update laser position
            laser = null; //laser out of bounds, delete it
        } else {
            shields.forEach(shield => {
                const hit = laser.checkObjectCollision(shield);
                if (hit) {
                    //console.log("Shield was hit at position:", shield.x, shield.y);
                    //shield.applyOverlay(laser); // Apply the overlay if a hit is detected
                }
            });
        }
    }
    // if (laser) {
    //     let hitEnimy = checkLaserColliision();
    // }    

    animate(deltaTime);

    // Draw scores
    drawScore(ctx);

    updateEnimies(deltaTime);

    // if (laser) {
    //     let outBounds = laser.update();
    //     if (outBounds) {
    //         // Delete the laser object
    //         laser = null;
    //     }
    // }

    if (laser) {
        let hitEnimy = checkLaserColliision();
    }

    if (laser) {
        laser.draw(ctx);
    }
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

//-------------------------------------------------------------------------
// tests below this line
//-------------------------------------------------------------------------

if (false) {
    // Test for speed calc
    for (let enemies = 55; enemies >= 1; enemies--) {
        let timer = calculateSpeed(enemies);
        console.log("Enemies: " + enemies + ", Speed: " + timer.toFixed(4));
    }



}
