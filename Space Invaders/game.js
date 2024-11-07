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
const player1 = new Player(100, 810);
const player2 = new Player(100, 810);

const enemySpacing = 19; // 5px space between each enemy

// Correctly initialize the enemies array as a 5x11 array (5 rows, 11 columns)
const enemies = Array.from({ length: 5 }, () => Array(11).fill(null));

const enemyBombs = [];
const grounds = [];

// Shield configurations
const numShields = 4; // Number of shields
const shieldYPosition = 700; //(canvasConfig.height * 5) / 6; // 4/5 down the canvas height
const shieldWidth = 100; // Adjust as needed
const shieldSpacing = (canvasConfig.width - numShields * shieldWidth) / (numShields + 1); // Even spacing between shields
const shields = [];


let initializingGame = true;

// Enemy configurations for octopus, squid, and crab
let enemyRow = 0;
let enemyCol = 0;

/*
let gameSettings = new Map();

// Add some settings
gameSettings.set("volume", 5);
gameSettings.set("difficulty", "hard");
gameSettings.set("fullscreen", true);

console.log("Before deletion:", gameSettings); // Map with 3 items

// Remove an item from the map
gameSettings.delete("fullscreen");

console.log("After deletion:", gameSettings); // Map without the "fullscreen" setting
*/
let gameEnemies = new Map();

function initializeEnemies() {

    let enemyHeightSpacing = 59;
    let enemyHeightPosition = 425;

    const enemyWidth = 40;

    let x = 40 + (enemyCol * (enemyWidth + enemySpacing));
    const y = enemyHeightPosition - (enemyRow * enemyHeightSpacing);

    let key = enemyRow + "x" + enemyCol;
    let enemy = null;
    switch (enemyRow) {
        case 0:
        case 1:
            x -= Math.ceil((12 * spriteConfig.pixelSize) / 2);
            enemy = new EnemyCrab(x, y, player.level);
            break;
        case 2:
        case 3:
            x -= Math.ceil((11 * spriteConfig.pixelSize) / 2);
            enemy = new EnemySquid(x, y, player.level);
            break;
        case 4:
            x -= Math.ceil((8 * spriteConfig.pixelSize) / 2);
            enemy = new EnemyOctopus(x, y, player.level);
            break;
        default:
            console.log("Unknown enemy type!");
            break;
    }

    // Add enemy to two (2) dimensional array
    //enemies[enemyRow][enemyCol] = enemy;
    enemy.key = key;
    gameEnemies.set(key, enemy);
    //   console.log("Map Size 0:", gameEnemies.size);

    if (++enemyCol >= 11) {
        enemyCol = 0;
        if (++enemyRow >= 5) {
            initializingGame = false;
            console.log(enemies);
        }
    }
}

// Function to initialize shield positions
function initializeShields() {
    for (let i = 0; i < numShields; i++) {
        const x = shieldSpacing + i * (shieldWidth + shieldSpacing);
        const shield = new Shield(x, shieldYPosition);
        shields.push(shield);
    }
    console.log(shields);
}

const groundY = 870;
function initialGround() {
    for (let i = 0; i < canvasConfig.width; i += Ground.groundSize) {
        const ground = new Ground(i, groundY);
        grounds.push(ground);
    }
}

function EnemiesUpdate(deltaTime) {//

    gameEnemies.forEach((value, key) => { 
        let enemy = value;
enemy.update(deltaTime,true);
    });

    // for (let row = 0; row <= enemies.length - 1; row++) {
    //     // Loop through the columns from the last one down to the first
    //     for (let col = 0; col <= enemies[row].length - 1; col++) {
    //         const enemy = enemies[row][col];
    //         if (enemy) { // Check if the enemy is present
    //             enemy.update(deltaTime, true);; // Call the draw method on the enemy object
    //         }
    //     }
    // }
    Enemy.setNextID();
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


        gameEnemies.forEach((value, key) => { 
            let enemy = value;
            if (laser.processCollisionWith(enemy)) {
                player.score += enemy.value;
                enemy.setHit();
                hitDetected = true;
                //break;
            }

        });

        // for (let row = 0; row <= enemies.length - 1; row++) {
        //     for (let col = 0; col <= enemies[row].length - 1; col++) {
        //         const enemy = enemies[row][col];
        //         if (enemy) {
        //             if (enemy.isAlive()) {
        //                 if (laser.processCollisionWith(enemy)) {
        //                     player.score += enemy.value;
        //                     enemy.setHit();
        //                     hitDetected = true;
        //                     //break;
        //                 }
        //             }
        //         }
        //     }
        // }

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

// function doReorgEnemyID() {
//     console.log("doReorg");
//     // console.log("doReorgEnemyID()", Enemy.remainingEnemies);
//     Enemy.resetRemainingEnemies();
//     for (let row = 0; row <= enemies.length - 1; row++) {
//         for (let col = 0; col <= enemies[row].length - 1; col++) {
//             const enemy = enemies[row][col];
//             if (enemy) {
//                 enemy.toString();
//                 if (enemy.isAlive()) {
//                     enemy.reorgID();
//                 } else {
//                     enemy.enemyID = 999;
//                 }
//             }
//         }
//     }

//     for (let row = 0; row <= enemies.length - 1; row++) {
//         for (let col = 0; col <= enemies[row].length - 1; col++) {
//             const enemy = enemies[row][col];
//             if (enemy) {
//                 //                console.log(enemy.velocityX);
//                 //                enemy.adjustSpeed();
//             }
//         }
//     }

//     Enemy.remainingEnemies++;

//     //console.log(enemies);
// }

function removeDeadEnemy() {
//    let resetNeeded = false;
    // Check for dead enemy and remove?

    gameEnemies.forEach((value, key) => { 
        let enemy = value;
        if (enemy.isDead()){
            gameEnemies.delete(enemy.key);
        }
    });

    // if (resetNeeded) {
    //     // doReorgEnemyID();
    // }
    // return resetNeeded;
}

function drawEnemies(ctx) {
    // // Loop through the rows from the last one down to the first
    // for (let row = enemies.length - 1; row >= 0; row--) {
    //     // Loop through the columns from the last one down to the first
    //     for (let col = enemies[row].length - 1; col >= 0; col--) {
    //         const enemy = enemies[row][col];
    //         if (enemy) { // Check if the enemy is present
    //             enemy.draw(ctx); // Call the draw method on the enemy object
    //             //console.log(enemy.enemyID);
    //         }
    //     }
    // }

    gameEnemies.forEach((value, key) => { 
        // console.log("Key & Value: ", key);
        // value.toString();
        value.draw(ctx);
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
            let hit = checkLaserShieldCollision();
            if (hit) {
                laser = null;
            }
        }
    }
}

let player = player2;

let enemyShip = null;/*  */
let onetime = true;
// Game loop function
export function gameLoop(ctx, deltaTime) {

    if (initializingGame) {

        if (shields.length === 0) {
            initializeShields();
            initialGround();
            console.log("initGame");
        }

        initializeEnemies();

    } else {
        if (onetime) {
            onetime = false;
            //console.log("Before deletion:", gameEnemies);
            console.log("Map Size:", gameEnemies.size);

            // for (let [key, value] of gameEnemies) {
            //     console.log(key);
            //     console.log("Key&Value: ", key," Value: " , value);
            // } 
            // Iterating over maps

            // gameEnemies.forEach((value, key) => {
            //     //console.log(`${key}: ${value.toString()}`);
            //     console.log("Key&Value: ", key," Value: " , value.toString());    
            // });

            gameEnemies.delete("2x0");
            gameEnemies.delete("2x1");
            gameEnemies.delete("2x2");
            gameEnemies.delete("2x3");

            gameEnemies.forEach((value, key) => { 
                //console.log("Key & Value: ", key);
                value.toString();
            });
        }

        removeDeadEnemy();
        // if (removeDeadEnemy()) {
        //     doReorgEnemyID();
        //     // change velocity?????
        // }

        EnemiesUpdate(deltaTime);
        // checkEnemyShieldCollision();


        // Update, Remove and Check bombs
        // removeDeadBomb();
        // updateBombs(deltaTime);
        // checkBombShieldCollision();
        // checkBombGroundCollision();
        // checkBombPlayerCollision();

        // checkEnemyShip(deltaTime);


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

    // draw Level
}



// Canvas needs to know the current directory to game.js for dynamic imports
const currentDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
window.canvasPath = currentDir;

//-------------------------------------------------------------------------
// tests below this line
//-------------------------------------------------------------------------
