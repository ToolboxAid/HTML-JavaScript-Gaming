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

const gameEnemies = new Map();
const enemyBombs = [];
const shields = [];
const grounds = [];


// Initialize player
const player1 = new Player();
const player2 = new Player();

let player = player2;

let enemyShip = null;
let onetime = true;

function initializeEnemies() {
    let enemy = null;
    switch (Enemy.getRow()) {
        case 0:
        case 1:
            enemy = new EnemyCrab(player.level);
            break;
        case 2:
        case 3:
            enemy = new EnemySquid(player.level);
            break;
        case 4:
            enemy = new EnemyOctopus(player.level);
            break;
        default:
            enemy = new EnemyCrab(player.level);
            console.log("Unknown enemy type!");
            break;
    }
    gameEnemies.set(enemy.key, enemy);
}

// Function to initialize shield positions
function initializeShields() {
    for (let i = 0; i < window.shieldCount; i++) {
        shields.push(new Shield(i));
    }
}

function initialGround() {
    for (let i = 0; i < canvasConfig.width; i += Ground.groundSize) {
        const ground = new Ground(i, spriteConfig.groundY);
        grounds.push(ground);
    }
}

function EnemiesUpdate(deltaTime) {
    gameEnemies.forEach((enemy, key) => {
        deltaTime = 1 / 60; // required to maintain spacing between enemies.
        enemy.update(deltaTime, true);
    });
    Enemy.setNextID();
}

function EnemiesDropBomb(deltaTime) {

    // Check if enemy should drop bomb
    gameEnemies.forEach((enemy, key) => {
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
        gameEnemies.forEach((enemy, key) => {
            if (laser.processCollisionWith(enemy)) {
                player.score += enemy.value;
                enemy.setHit();
                hitDetected = true;
            }
        });
        if (hitDetected) { // Delete the laser
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
        if (laser.isCollidingWith(shield)) {
            if (shield.applyBigBoom(laser)) {
                hit = true;
            }
        }
    });
    return hit;
}

function checkLaserShipCollision(player) {
    if (laser && enemyShip) {
        const colliding = laser.isCollidingWith(enemyShip);
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
            if (enemyBomb.isCollidingWith(shield)) {
                if (shield.applyBigBoom(enemyBomb)) {
                    enemyBomb.setIsDead();
                }
            }
        });
    });
}

function checkEnemyShieldCollision() {

    gameEnemies.forEach((enemy, key) => {
        shields.forEach(shield => {
            if (enemy.isCollidingWith(shield)) {
                if (shield.applyBigBoom(enemy, false)) {
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

function removeDeadEnemy() {
    let foundDead = false;
    let foundID = -1;
    let foundKey = null;
    gameEnemies.forEach((enemy) => {
        if (enemy.isDead()) {
            foundID = enemy.enemyID;
            foundKey = enemy.key;
            foundDead = gameEnemies.delete(enemy.key);
        }
    });

    if (foundDead) {
        Enemy.remainingEnemies = gameEnemies.size;
        Enemy.reorgID = 0;
        if (foundID < Enemy.nextID) {
            Enemy.nextID--;
            if (Enemy.nextID < 0) {
                Enemy.nextID = Enemy.remainingEnemies;
            }
        }
        //Enemy.nextID--;
        gameEnemies.forEach((enemy) => {
            enemy.reorgID();
        });
        Enemy.prepSpeed = true;
    }
}

function drawEnemies(ctx) {
    gameEnemies.forEach((enemy, key) => {
        enemy.draw(ctx);
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
            if (checkLaserShieldCollision()) {
                laser = null;
            }
        }
    }
}

// Game loop function
export function gameLoop(ctx, deltaTime) {

    if (!Enemy.getEnemiesInitialized()) {

        if (shields.length === 0) {
            initializeShields();
            initialGround();
            Enemy.enemyID = 0;
        }

        initializeEnemies();

    } else {
        if (onetime) {
            onetime = false;
            Enemy.remainingEnemies = gameEnemies.size;
        }

        removeDeadEnemy();

        EnemiesUpdate(deltaTime);
        checkEnemyShieldCollision();


        // Update, Remove and Check bombs
        removeDeadBomb();
        updateBombs(deltaTime);
        checkBombShieldCollision();
        checkBombGroundCollision();
        checkBombPlayerCollision();

        checkEnemyShip(deltaTime);


        keyboardInput.update();
        const laserFirePoint = player.update(keyboardInput.getKeyPressed(), keyboardInput.getKeyJustPressed());
        checkLaser(deltaTime, laserFirePoint);
        checkLaserEnemyCollision(player);
        checkLaserShipCollision(player);
        checkLaserBombCollision();
    }

    // Draw scores
    drawScore(ctx);
    drawLevel(ctx, player);

    // Draw enemy ship
    if (enemyShip) {
        enemyShip.draw(ctx);
    }

    drawEnemies(ctx);

    // Draw all bombs
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
}

// Canvas needs to know the current directory to game.js for dynamic imports
const currentDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
window.canvasPath = currentDir;

//-------------------------------------------------------------------------
// tests below this line
//-------------------------------------------------------------------------
