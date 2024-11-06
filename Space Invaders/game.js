// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// game.js

import { canvasConfig, spriteConfig } from './global.js'; // Assuming these contain canvas and sprite details

import CanvasUtils from '../scripts/canvas.js'; // Required for dynamic canvas operations, used in animate()
import Fullscreen from '../scripts/fullscreen.js'; // Required for fullscreen control, used elsewhere
import Functions from '../scripts/functions.js';

import Player from './player.js';
import Shield from './shield.js';
import Laser from './laser.js';
let laser = null;
import Ground from './ground.js';

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
import ObjectStatic from '../scripts/objectStatic.js';

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

const enemyBombs = [];
const grounds = [];

// Shield configurations
const numShields = 4; // Number of shields
const shieldYPosition = 700; //(canvasConfig.height * 5) / 6; // 4/5 down the canvas height
const shieldWidth = 100; // Adjust as needed
const shieldSpacing = (canvasConfig.width - numShields * shieldWidth) / (numShields + 1); // Even spacing between shields
const shields = [];

// Initialize other enemies
let enemyShip = null;/*  */

// Function to initialize enemy positions
function initializeEnemies() {
    let enemyHeightSpacing = 59;
    let enemyHeightPosition = 425;

    const octopusWidth = 40;
    const squidWidth = 40;
    const crabWidth = 40;
    // Create 2 rows of crabs (bottom)
    for (let row = 0; row < enemyRows; row++) {
        for (let col = 0; col < enemyCols; col++) {
            console.log(" #1 Row: ", row, " Col: ", col);
            const x = 40 + col * (crabWidth + enemySpacing);
            const y = enemyHeightPosition;
            const enemyCrab = new EnemyCrab(x, y, player.level);
            enemyCrabs.push(enemyCrab);

        }
        enemyHeightPosition -= enemyHeightSpacing;
    }

    // Create 2 rows of squids (middle)
    for (let row = 0; row < enemyRows; row++) {
        for (let col = 0; col < enemyCols; col++) {
            console.log("#2 Row: ", row, " Col: ", col);
            const x = 42 + col * (squidWidth + enemySpacing);
            const y = enemyHeightPosition;
            const enemySquid = new EnemySquid(x, y, player.level);
            enemySquids.push(enemySquid);
        }
        enemyHeightPosition -= enemyHeightSpacing;
    }

    // Create 1 row of octopuses (top)
    for (let row = 0; row < enemyRows - 1; row++) {
        for (let col = 0; col < enemyCols; col++) {
            console.log("#3 Row: ", row, " Col: ", col);
            const x = 47 + col * (octopusWidth + enemySpacing);
            const y = enemyHeightPosition;
            const enemyOctopus = new EnemyOctopus(x, y, player.level);
            enemyOctopuses.push(enemyOctopus);
        }
        enemyHeightPosition -= enemyHeightSpacing;
    }
    Enemy.enemyID = -3;
}

// Function to initialize shield positions
function initializeShields() {
    for (let i = 0; i < numShields; i++) {
        const x = shieldSpacing + i * (shieldWidth + shieldSpacing);
        const shield = new Shield(x, shieldYPosition);
        shields.push(shield);
    }
}

const groundY = 870;
function initialGround() {
    for (let i = 0; i < canvasConfig.width; i += Ground.groundSize) {
        const ground = new Ground(i, groundY);
        grounds.push(ground);
    }
}

function EnemiesUpdate(deltaTime) {
    //---------------------------------------
    [...enemySquids, ...enemyOctopuses, ...enemyCrabs].forEach(enemy => {
        enemy.update(deltaTime, true);
    });
}

function EnemiesDropBomb(deltaTime) {
    // Check if enemy should drop bomb
    [enemySquids, enemyOctopuses, enemyCrabs].forEach(enemyArray => {
        for (let i = enemyArray.length - 1; i >= 0; i--) {
            const enemy = enemyArray[i];
            if (enemy.isDropBombTime()) {
                const bombWidth = 5;

                const bombType = Functions.randomGenerator(0, 2, true); // Generate a random bomb type (0 to 2)
                switch (bombType) {
                    case 0: // Handle bombType 0
                        enemyBombs.push(new EnemyBomb1(enemy.x + (enemy.width / 2) - bombWidth, enemy.y));
                        break;
                    case 1:// Handle bombType 1
                        enemyBombs.push(new EnemyBomb2(enemy.x + (enemy.width / 2) - bombWidth, enemy.y));
                        break;
                    case 2:// Handle bombType 2
                        enemyBombs.push(new EnemyBomb3(enemy.x + (enemy.width / 2) - bombWidth, enemy.y));
                        break;
                    default:
                        console.log("Unexpected bombType:", bombType);
                        break;
                }

            }
        }
    });
}

function checkEnemyShip(deltaTime) {
    if (!enemyShip) {
        if (EnemyShip.isCreationTime()) {
            enemyShip = new EnemyShip();
        }
    } else {
        enemyShip.update(deltaTime);
        if (enemyShip.isDead()) {
            enemyShip = null;
        }
    }
}

function updateBombs(deltaTime) {
    EnemiesDropBomb(deltaTime);
    enemyBombs.forEach(enemyBomb => {
        enemyBomb.update(deltaTime);
    });
}

function drawScore(ctx) {
    // ctx.font = '30px Arial';
    // ctx.fillStyle = 'white';
    let color = 'yellow';
    const pixelSize = 5;
    CanvasUtils.drawText(ctx, 50, 30, "SCORE-1", pixelSize, 'red');
    CanvasUtils.drawText(ctx, 300, 30, "MIDWAY", pixelSize, 'red');
    CanvasUtils.drawText(ctx, 550, 30, "SCORE-2", pixelSize, 'red');
    CanvasUtils.drawNumber(ctx, 90, 80, player1.score, pixelSize, color, 4, '0');
    CanvasUtils.drawNumber(ctx, 340, 80, 0, pixelSize, color, 4, '0');
    CanvasUtils.drawNumber(ctx, 590, 80, player2.score, pixelSize, color, 4, '0');
}

function drawLives(ctx, player) {
    const dwn = 900;
    const color = 'white';
    const pixelSize = 5;
    CanvasUtils.drawNumber(ctx, 15, dwn, player.lives, pixelSize, color, 2, '0');
    CanvasUtils.drawSprite(ctx, 95, dwn, Player.frame, 3);
}

const LevelFrames = [
    [   // 0
        "0000000010000000",
        "0000000101000000",
        "0000001000100000",
        "0000010000010000",
        "0000100000001000",
        "0001000000000100",
        "0010000000000010",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000"
    ],
    [   // 1
        "0000000010000000",
        "0000000101000000",
        "0000001000100000",
        "0000010010010000",
        "0000100101001000",
        "0001001000100100",
        "0010010000010010",
        "0000100000001000",
        "0001000000000100",
        "0010000000000010",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000"
    ],
    [   // 2
        "0000000010000000",
        "0000000101000000",
        "0000001000100000",
        "0000010010010000",
        "0000100101001000",
        "0001001000100100",
        "0010010010010010",
        "0000100101001000",
        "0001001000100100",
        "0010010000010010",
        "0000100000001000",
        "0001000000000100",
        "0010000000000010",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000"
    ],
    [   // 3
        "0000000010000000",
        "0000000101000000",
        "0000001000100000",
        "0000010010010000",
        "0000100101001000",
        "0001001000100100",
        "0010010010010010",
        "0000100101001000",
        "0001001000100100",
        "0010010000010010",
        "0000100000001000",
        "0001000000000100",
        "0010000000000010",
        "0100000000000001",
        "0011100000001110",
        "0000011111110000"
    ],
    [   // 4
        "0000000010000000",
        "0000000101000000",
        "0000001000100000",
        "0000010010010000",
        "0000100101001000",
        "0001001000100100",
        "0010010010010010",
        "0000100101001000",
        "0001001000100100",
        "0010010000010010",
        "0000100000001000",
        "0001000000000100",
        "0010000000000010",
        "0100000000000001",
        "0011100000001110",
        "0000011111110000",
        "0100000000000001",
        "0011100000001110",
        "0000011111110000"
    ],
    [   // 5
        "0000000010000000",
        "0000000101000000",
        "0000001000100000",
        "0000010010010000",
        "0000100101001000",
        "0001001000100100",
        "0010010010010010",
        "0000100101001000",
        "0001001000100100",
        "0010010000010010",
        "0000100000001000",
        "0001000000000100",
        "0010000000000010",
        "0100000000000001",
        "0011100000001110",
        "0000011111110000",
        "0100000000000001",
        "0011100000001110",
        "0000011111110000",
        "0100000000000001",
        "0011100000001110",
        "0000011111110000"
    ],
    [   // 6
        "0000000010000000",
        "0000000101000000",
        "0000001000100000",
        "0000010010010000",
        "0000100101001000",
        "0001001000100100",
        "0010010010010010",
        "0000100101001000",
        "0001001000100100",
        "0010010000010010",
        "0000100000001000",
        "0001000111000100",
        "0010000000000010",
        "0100000000000001",
        "0011100000001110",
        "0000011111110000",
        "0100000000000001",
        "0011100000001110",
        "0000011111110000",
        "0100000000000001",
        "0011100000001110",
        "0000011111110000"
    ],
    [   // 7
        "0000000010000000",
        "0000000101000000",
        "0000001000100000",
        "0000010010010000",
        "0000100101001000",
        "0001001000100100",
        "0010010010010010",
        "0000100101001000",
        "0001001000100100",
        "0010010000010010",
        "0000100010001000",
        "0001000111000100",
        "0010000010000010",
        "0100000000000001",
        "0011100000001110",
        "0000011111110000",
        "0100000000000001",
        "0011100000001110",
        "0000011111110000",
        "0100000000000001",
        "0011100000001110",
        "0000011111110000"
    ],
    [   // 8
        "0000000010000000",
        "0000000101000000",
        "0000001000100000",
        "0000010010010000",
        "0000100101001000",
        "0001001000100100",
        "0010010010010010",
        "0000100101001000",
        "0001001000100100",
        "0010010000010010",
        "0000100010001000",
        "0001000111000100",
        "0010000010000010",
        "0100000000000001",
        "0011100000001110",
        "0000011111110000",
        "0100000000000001",
        "0011100000001110",
        "0000011111110000",
        "0100000000000001",
        "0011100000001110",
        "0000011111110000"
    ],
    [   // 9
        "0000000010000000",
        "0000000101000000",
        "0000001000100000",
        "0000010010010000",
        "0000100101001000",
        "0001001000100100",
        "0010010010010010",
        "0000100101001000",
        "0001001000100100",
        "0010010000010010",
        "0000100111001000",
        "0001000101000100",
        "0010000111000010",
        "0100000000000001",
        "0011100000001110",
        "0000011111110000",
        "0100000000000001",
        "0011100000001110",
        "0000011111110000",
        "0100000000000001",
        "0011100000001110",
        "0000011111110000"
    ],
];


function drawLevel(ctx, player) {
    const dwn = 895;
    const color = 'white';
    const pixelSize = 5;
    CanvasUtils.drawSprite(ctx, 825, dwn, LevelFrames[0], 2.0); // current 0-9
}

function drawGround(ctx) {
    grounds.forEach(ground => {
        ground.draw(ctx);
    });
}

function checkLaserEnemyCollision(player) {
    if (laser) {
        let hitDetected = false;
        // Check for collisions and remove hit enemies
        [enemySquids, enemyOctopuses, enemyCrabs].forEach(enemyArray => {
            for (let i = enemyArray.length - 1; i >= 0; i--) {
                const enemy = enemyArray[i];
                if (!hitDetected) {
                    if (laser.processCollisionWith(enemy)) {
                        player.score += enemy.value;
                        enemy.setHit();
                        hitDetected = true;



                        break; // Exit the current `for` loop
                    }
                }
            }
        });
        // Delete the laser
        if (hitDetected) {
            laser = null;
        }
    }
}

function checkLaserBombCollision() {
    if (laser) {
        // Check for collisions and remove hit laser and bomb
        let hitBomb = false;
        enemyBombs.forEach(enemyBomb => {
            if (laser.processCollisionWith(enemyBomb)) {
                hitBomb = true;
                if (enemyBomb.constructor.name !== "EnemyBomb3") {
                    enemyBomb.setIsDead();
                }
            }
        });
        if (hitBomb) {
            laser = null; // Delete the laser
        }
    }
}

function checkLaserShieldCollision() {
    let hit = false;
    shields.forEach(shield => {
        const colliding = laser.isCollidingWith(shield); //const hit = laser.processCollisionWith(shield, false);
        if (colliding) {
            if (shield.applyBigBoom(laser)) {
                hit = true;
            }
        }
    });
    return hit;
}

function checkLaserShipCollision(player) {
    if (laser && enemyShip) {
        const colliding = laser.isCollidingWith(enemyShip); //const hit = laser.processCollisionWith(shield, false);
        if (colliding) {
            player.score += enemyShip.getValue();
            enemyShip.setHit();
            laser = null;
        }
    }
}

function checkBombShieldCollision() {
    enemyBombs.forEach(enemyBomb => {
        shields.forEach(shield => {
            const colliding = enemyBomb.isCollidingWith(shield);
            if (colliding) {
                if (shield.applyBigBoom(enemyBomb)) {
                    enemyBomb.setIsDead();
                }
            }
        });
    });
}

function checkEnemyShieldCollision() {
    [...enemySquids, ...enemyOctopuses, ...enemyCrabs].forEach(enemy => {
        shields.forEach(shield => {
            const colliding = enemy.isCollidingWith(shield);
            if (colliding) {
                if (shield.applyBigBoom(enemy, false)) {
                    //console.log("enemy hit shield");
                }
            }
        });
    });
}

function checkBombGroundCollision() {
    enemyBombs.forEach(enemyBomb => {
        grounds.forEach(ground => {
            const colliding = enemyBomb.isCollidingWith(ground);
            if (colliding) {
                enemyBomb.setIsDead();
                ground.setIsDead();
            }
        });
    });
}

let o1 = null;
let o2 = null;
let o3 = null;
function drawCollision(ctx) {
    if (o1) {
        CanvasUtils.drawBounds(ctx, o1.x, o1.y, o1.width, o1.height, "red", 3);
        CanvasUtils.drawBounds(ctx, o2.x, o2.y, o2.width, o2.height, "pink", 3);
    }
    if (o3) {
        CanvasUtils.drawBounds(ctx, o3.x, o3.y, o3.width, o3.height, "orange", 3);
    }
}

function checkBombPlayerCollision() {
    enemyBombs.forEach(enemyBomb => {
        const colliding = enemyBomb.isCollidingWith(player);
        if (colliding) {
            console.log("playerhit");
            enemyBomb.setIsDead();
            //player.setIsDead();
            player.lives -= 1;
            o1 = new ObjectStatic(player.x, player.y, player.width, player.height);
            o2 = new ObjectStatic(enemyBomb.x, enemyBomb.y, enemyBomb.width, enemyBomb.height);
        }
    });
}

function doResetEnemyID(){

    const enemyArrays = [enemySquids, enemyOctopuses, enemyCrabs];
    const totalCount = enemyArrays.reduce((sum, enemyArray) => sum + enemyArray.length, 0);
    Enemy.setRemainingEnemies(totalCount);

    [enemySquids, enemyOctopuses, enemyCrabs].forEach(enemyArray => {
        for (let i = enemyArray.length - 1; i >= 0; i--) {
            const enemy = enemyArray[i];
            //enemy.enemyID = i;
            enemy.doResetEnemyID(i);
        }
    });

}

function removeDeadEnemy() {
    let reset = false;
    // Check for dead enemy and remove
    [enemySquids, enemyOctopuses, enemyCrabs].forEach(enemyArray => {
        for (let i = enemyArray.length - 1; i >= 0; i--) {
            const enemy = enemyArray[i];
            if (enemy.isDead()) {
                enemyArray.splice(i, 1); // Remove the enemy at index i
                reset = true;
                break; // Exit the current `for` loop
            }
        }
    });
    return reset;
}

function removeDeadBomb() {
    // Check for dead enemyBomb and remove
    [enemyBombs].forEach(enemyBombArray => {
        for (let i = enemyBombArray.length - 1; i >= 0; i--) {
            const enemyBomb = enemyBombArray[i];
            if (enemyBomb.isDead()) {
                enemyBombArray.splice(i, 1); // Remove the bomb at index i
            }
        }
    });
}

function checkLaser(deltaTime, laserFirePoint) {
    if (!laser) {
        if (laserFirePoint) {
            laser = new Laser(laserFirePoint.x, laserFirePoint.y - 10);
            o3 = new ObjectStatic(laser.x, laser.y, laser.width, laser.height);
        }
    } else {
        if (laser.update(deltaTime)) { // Update laser position
            laser = null; //laser out of bounds, delete it
        } else {
            let hit = checkLaserShieldCollision();
            if (hit) {
                laser = null;
            }
        }
    }
}

let player = player2;
// Game loop function
export function gameLoop(ctx, deltaTime) {

    Enemy.setID();

    updateBombs(deltaTime);
    const resetEnemyID = removeDeadEnemy();
    if (resetEnemyID){
        doResetEnemyID();
    }
    removeDeadBomb();

    EnemiesUpdate(deltaTime);

    checkEnemyShieldCollision();
    checkBombShieldCollision();
    checkBombGroundCollision();
    checkBombPlayerCollision();
    checkEnemyShip(deltaTime);

    keyboardInput.update();
    const laserFirePoint = player.update(keyboardInput.getKeyPressed(), keyboardInput.getKeyJustPressed());
    checkLaser(deltaTime, laserFirePoint);
    checkLaserShipCollision(player);

    checkLaserEnemyCollision(player);
    checkLaserBombCollision();

    // Draw scores
    drawScore(ctx);
    drawLevel(ctx, player);

    // Draw enemy ship
    if (enemyShip) {
        enemyShip.draw(ctx);
    }

    // Draw all enemies
    enemyOctopuses.forEach(enemyOctopus => enemyOctopus.draw(ctx));
    enemySquids.forEach(enemySquid => enemySquid.draw(ctx));
    enemyCrabs.forEach(enemyCrab => enemyCrab.draw(ctx));
    enemyBombs.forEach(enemyBomb => enemyBomb.draw(ctx, "white"));

    // Draw shields
    shields.forEach(shield => { shield.draw(ctx); });

    // Draw Laser
    if (laser) {
        laser.draw(ctx);
    }

    // Draw player
    player.draw(ctx);

    drawGround(ctx);

    drawLives(ctx, player);

    // draw Level
}

// Initialize enemies and shields
initializeEnemies();
initializeShields();
initialGround();

// Canvas needs to know the current directory to game.js for dynamic imports
const currentDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
window.canvasPath = currentDir;

//-------------------------------------------------------------------------
// tests below this line
//-------------------------------------------------------------------------
