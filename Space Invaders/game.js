// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// game.js

import { canvasConfig, spriteConfig, enemyConfig } from './global.js'; // Assuming these contain canvas and sprite details

import CanvasUtils from '../scripts/canvas.js'; // Required for dynamic canvas operations, used in animate()
import Fullscreen from '../scripts/fullscreen.js'; // Required for fullscreen control, used elsewhere
import Functions from '../scripts/functions.js';

import Player from './player.js';
import Shield from './shield.js';
import Laser from './laser.js';
import Ground from './ground.js';

import KeyboardInput from '../scripts/keyboard.js';
const keyboardInput = new KeyboardInput();

import Enemy from './enemy.js';
import EnemySquid from './enemySquid.js';
import EnemyCrab from './enemyCrab.js';
import EnemyOctopus from './enemyOctopus.js';
import EnemyShip from './enemyShip.js';
import EnemyBomb1 from './enemyBomb1.js';
import EnemyBomb2 from './enemyBomb2.js';
import EnemyBomb3 from './enemyBomb3.js';
import ObjectStatic from '../scripts/objectStatic.js';

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

class Game {
    constructor(canvas, ctx) {
        // Canvas Setup
        this.ctx = ctx;
        this.canvas = canvas;

        // Canvas needs to know the current directory to game.js for dynamic imports
        const currentDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
        window.canvasPath = currentDir;

        this.keyboardInput = new KeyboardInput();

        // Game State Variables
        this.gameState = "attract"; // Possible states: attract, playerSelect, initGame, initEnemy, playGame, gameOver
        this.playerCount = 1;
        this.currentPlayer = 1;
        this.playerLives = [3, 3]; // Player 1 and Player 2 lives
        this.score = [0, 0]; // Player 1 and Player 2 scores
        this.gameInitialized = false;
        this.enemyInitialized = false;
        this.onetime = true;

        this.backToAttract = 600;
        this.backToAttractCounter = 0;
        //------------------------------------------------------------
        this.player1 = new Player();
        this.player2 = new Player();
        this.player = this.player2; // Current player
        this.highScore = 0;

        // Items to move into the player
        this.gameEnemies = new Map();
        this.gameEnemiesBottom = new Array(enemyConfig.colSize).fill(null);
        this.enemyBombs = [];
        this.shields = [];
        this.grounds = [];

        // Non-player items
        this.laser = null;
        this.enemyShip = null;

        //       this.initialize();
    }

    initializeEnemies() {
        let enemy = null;
        switch (Enemy.getRow()) {
            case 0:
            case 1:
                enemy = new EnemyCrab(this.player.level);
                break;
            case 2:
            case 3:
                enemy = new EnemySquid(this.player.level);
                break;
            case 4:
                enemy = new EnemyOctopus(this.player.level);
                break;
            default:
                enemy = new EnemyCrab(this.player.level);
                console.log("Unknown enemy type!");
                break;
        }
        this.gameEnemies.set(enemy.key, enemy);
    }

    setGameEnemiesBottom(column) {
        this.gameEnemiesBottom[column] = null;
        for (let row = enemyConfig.rowSize - 1; row >= 0; row--) {
            const key = `${row}x${column}`;
            const enemy = this.gameEnemies.get(key);

            if (enemy) {
                this.gameEnemiesBottom[column] = key;
            } else {
                //console.log("not found",key);
            }
        }
    }

    initializeShields() {
        for (let i = 0; i < window.shieldCount; i++) {
            this.shields.push(new Shield(i));
        }
    }

    initialGround() {
        for (let i = 0; i < canvasConfig.width; i += Ground.groundSize) {
            const ground = new Ground(i, spriteConfig.groundY);
            this.grounds.push(ground);
        }
    }

    EnemiesUpdate(deltaTime) {
        this.gameEnemies.forEach((enemy, key) => {
            deltaTime = 1 / 60; // required to maintain spacing between enemies.
            enemy.update(deltaTime, true);
        });
        Enemy.setNextID();
    }

    EnemiesDropBomb(deltaTime) {
        // Check only bottom enemy should drop bomb
        for (let column = 0; column < enemyConfig.colSize; column++) {
            const enemy = this.gameEnemies.get(this.gameEnemiesBottom[column]);
            if (enemy) {
                if (enemy.isDropBombTime()) {
                    const bombWidth = 5;
                    const bombType = Functions.randomGenerator(0, 2, true); // Generate a random bomb type (0 to 2)
                    switch (bombType) {
                        case 0:
                            this.enemyBombs.push(new EnemyBomb1(enemy.x + (enemy.width / 2) - bombWidth, enemy.y));
                            break;
                        case 1:
                            this.enemyBombs.push(new EnemyBomb2(enemy.x + (enemy.width / 2) - bombWidth, enemy.y));
                            break;
                        case 2:
                            this.enemyBombs.push(new EnemyBomb3(enemy.x + (enemy.width / 2) - bombWidth, enemy.y));
                            break;
                        default:
                            console.log("Unexpected bombType:", bombType);
                            break;
                    }
                }
            }
        }
    }

    checkEnemyShip(deltaTime) {
        if (!this.enemyShip) {
            if (EnemyShip.isCreationTime()) {
                this.enemyShip = new EnemyShip();
            }
        } else {
            this.enemyShip.update(deltaTime);

            if (this.enemyShip.isDying()) {
                const shipValue = `${this.enemyShip.getValue()}`;
                const spacing = 2;
                const someFrame = CanvasUtils.getSpriteText(shipValue, spacing);
                const displayFrames = 60;
                this.enemyShip.setOtherFrame(displayFrames, someFrame);
            }

            if (this.enemyShip.isDead()) {
                this.enemyShip = null;
            }
        }
    }

    updateBombs(deltaTime) {
        this.EnemiesDropBomb(deltaTime);
        this.enemyBombs.forEach(enemyBomb => {
            enemyBomb.update(deltaTime);
        });
    }

    drawScore(ctx) {
        let color = 'yellow';
        const pixelSize = 5;
        CanvasUtils.drawText(ctx, 50, 30, "SCORE-1", pixelSize, 'red');
        CanvasUtils.drawText(ctx, 300, 30, "MIDWAY", pixelSize, 'red');
        CanvasUtils.drawText(ctx, 550, 30, "SCORE-2", pixelSize, 'red');
        CanvasUtils.drawNumber(ctx, 90, 80, this.player1.score, pixelSize, color, 4, '0');
        CanvasUtils.drawNumber(ctx, 340, 80, this.highScore, pixelSize, color, 4, '0');
        CanvasUtils.drawNumber(ctx, 590, 80, this.player2.score, pixelSize, color, 4, '0');
    }

    drawLives(ctx, player) {
        const dwn = 900;
        const color = 'white';
        const pixelSize = 5;
        CanvasUtils.drawNumber(ctx, 15, dwn, player.lives, pixelSize, color, 2, '0');
        CanvasUtils.drawSprite(ctx, 95, dwn, Player.frame[0], spriteConfig.pixelSize);
    }

    drawLevel(ctx, player) {
        const dwn = 895;
        const color = 'white';
        const pixelSize = 5;
        CanvasUtils.drawSprite(ctx, 825, dwn, LevelFrames[0], 2.0); // current 0-9
    }

    drawGround(ctx) {
        this.grounds.forEach(ground => {
            ground.draw(ctx);
        });
    }

    updatePlayerScore(score) {
        this.player.updateScore(score);
        if (this.player.score > this.highScore) {
            this.highScore = this.player.score;
        }
    }

    checkLaserEnemyCollision(player) {
        if (this.laser) {
            let hitDetected = false;
            this.gameEnemies.forEach((enemy, key) => {
                if (enemy.processCollisionWith(this.laser)) {
                    this.updatePlayerScore(enemy.value);
                    enemy.setHit();
                    hitDetected = true;
                }
            });
            if (hitDetected) { // Delete the laser
                this.laser = null;
            }
        }
    }

    checkLaserBombCollision() {
        if (this.laser) {
            // Check for collisions and remove hit laser and bomb
            let hitBomb = false;
            this.enemyBombs.forEach(enemyBomb => {
                if (enemyBomb.processCollisionWith(this.laser)) {
                    hitBomb = true;
                    if (enemyBomb.constructor.name !== "EnemyBomb3") {
                        enemyBomb.setIsDying();
                        enemyBomb.x -= 20;
                    }
                }
            });
            if (hitBomb) {
                this.laser = null; // Delete the laser
            }
        }
    }

    checkLaserShieldCollision() {
        let hit = false;
        this.shields.forEach(shield => {
            if (this.laser.isCollidingWith(shield)) {
                if (shield.applyBigBoom(this.laser, true, -5)) {
                    hit = true;
                }
            }
        });
        return hit;
    }

    checkLaserShipCollision(player) {
        if (this.laser && this.enemyShip) {
            const colliding = this.enemyShip.isCollidingWith(this.laser);
            if (colliding) {
                this.updatePlayerScore(this.enemyShip.getValue());
                this.enemyShip.setHit();
                this.laser = null;
            }
        }
    }

    checkBombShieldCollision() {
        this.enemyBombs.forEach(enemyBomb => {
            this.shields.forEach(shield => {
                if (enemyBomb.isCollidingWith(shield)) {
                    if (shield.applyBigBoom(enemyBomb, true, 6)) {
                        if (enemyBomb.isAlive()) {
                            enemyBomb.setIsDying();
                            enemyBomb.y += 10;
                        }
                    }
                }
            });
        });
    }

    checkEnemyShieldCollision() {
        this.gameEnemies.forEach((enemy, key) => {
            this.shields.forEach(shield => {
                if (enemy.isCollidingWith(shield)) {
                    if (shield.applyBigBoom(enemy, false)) {
                    }
                }
            });
        });
    }

    checkBombGroundCollision() {
        this.enemyBombs.forEach(enemyBomb => {
            this.grounds.forEach(ground => {
                const colliding = enemyBomb.isCollidingWith(ground);
                if (colliding) {
                    if (enemyBomb.isAlive()) {
                        enemyBomb.setIsDying();
                        enemyBomb.x -= 12;
                        enemyBomb.y += 7;
                        ground.setIsDead();
                    }
                }
            });
        });
    }

    removeDeadEnemy() {
        let foundDead = false;
        let foundID = -1;
        let foundKey = null;
        this.gameEnemies.forEach((enemy) => {
            if (enemy.isDead()) {
                foundID = enemy.enemyID;
                foundKey = enemy.key;
                foundDead = this.gameEnemies.delete(enemy.key);
                //console.log("removed gameEnemies key: ", foundKey)
            }
        });

        if (foundDead) {
            Enemy.remainingEnemies = this.gameEnemies.size;
            Enemy.reorgID = 0;
            if (foundID < Enemy.nextID) {
                Enemy.nextID--;
                if (Enemy.nextID < 0) {
                    Enemy.nextID = Enemy.remainingEnemies;
                }
            }
            //Enemy.nextID--;
            this.gameEnemies.forEach((enemy) => {
                enemy.reorgID();
            });
            Enemy.prepSpeed = true;

            this.findBottom();
        }
    }

    drawEnemies(ctx) {
        this.gameEnemies.forEach((enemy, key) => {
            enemy.draw(ctx);
        });
    }

    static o1 = null;
    static o2 = null;
    static o3 = null;
    drawCollision(ctx) {
        if (Game.o1) {
            CanvasUtils.drawBounds(ctx, Game.o1.x, Game.o1.y, Game.o1.width, Game.o1.height, "red", 3);
            CanvasUtils.drawBounds(ctx, Game.o2.x, Game.o2.y, Game.o2.width, Game.o2.height, "pink", 3);
        }
        if (Game.o3) {
            CanvasUtils.drawBounds(ctx, Game.o3.x, Game.o3.y, Game.o3.width, Game.o3.height, "orange", 3);
        }
    }

    checkBombPlayerCollision() {
        this.enemyBombs.forEach(enemyBomb => {
            if (enemyBomb.isAlive()) {
                const colliding = this.player.isCollidingWith(enemyBomb);
                if (colliding) {
                    console.log("playerhit");
                    this.player.setIsDying();
                    console.log(this.player);
                    enemyBomb.setIsDying();
                    enemyBomb.x -= 20;
                    //player.setIsDead();
                    this.player.lives -= 1;
                    Game.o1 = new ObjectStatic(this.player.x, this.player.y, this.player.width, this.player.height);
                    Game.o2 = new ObjectStatic(enemyBomb.x, enemyBomb.y, enemyBomb.width, enemyBomb.height);
                }
            }
        });
    }

    removeDeadBomb() {    // Check for dead enemyBomb and remove
        [this.enemyBombs].forEach(enemyBombArray => {
            for (let i = enemyBombArray.length - 1; i >= 0; i--) {
                const enemyBomb = enemyBombArray[i];
                if (enemyBomb.isDead()) {
                    enemyBombArray.splice(i, 1); // Remove the bomb at index i
                }
            }
        });
    }

    checkLaser(deltaTime, laserFirePoint) {
        if (!this.laser) {
            if (laserFirePoint) {
                this.laser = new Laser(laserFirePoint.x, laserFirePoint.y - 10);
                Game.o3 = new ObjectStatic(this.laser.x, this.laser.y, this.laser.width, this.laser.height);
            }
        } else {
            if (this.laser.update(deltaTime)) { // Update laser position
                this.laser = null; //laser out of bounds, delete it
            } else {
                if (this.checkLaserShieldCollision()) {
                    this.laser = null;
                }
            }
        }
    }

    findBottom() {// if the column is know, call `setGameEnemiesBottom(column)` instead    
        for (let column = 0; column < enemyConfig.colSize; column++) {
            this.setGameEnemiesBottom(column);
        }
    }

    static gameInitialized = false;
    static onetime = true;
    initializeGame() {

        if (!Enemy.isEnemiesInitialized()) {
            if (this.shields.length === 0) {
                this.initializeShields();
                this.initialGround();
                Enemy.enemyID = 0;
            }
            this.initializeEnemies();
        } else {
            // if (onetime) {
            //   onetime = false;
            Enemy.remainingEnemies = this.gameEnemies.size;
            //}
            this.findBottom();
            this.gameInitialized = true;
        }
    }

    // Example: object.position += object.velocity * deltaTime;
    gameLoop(ctx, deltaTime) {

        this.keyboardInput.update();

        // Update game state with deltaTime
        switch (this.gameState) {
            case "attract":
                this.displayAttractMode(this.ctx);
                break;

            case "playerSelect":
                this.displayPlayerSelect();
                break;

            case "initGame":
                if (!this.gameInitialized) {
                    this.initializeGame();
                }
                break;

            case "initEnemy":
                if (!this.enemyInitialized) {
                    this.initializeEnemy();
                }
                break;

            case "playGame":
                //                this.playGameLogic(this.ctx, this.canvas)
                this.playGame();
                break;

            case "gameOver":
                this.displayGameOver();
                break;
        }
    }

    // Display Functions
    displayAttractMode(ctx) {
        CanvasUtils.drawText(this.ctx, 150, 200, "Welcome to the Game!", 3.5, "white");
        CanvasUtils.drawText(this.ctx, 150, 300, "Press `Enter` to Start", 3.5, "white");
        console.log("attract");

        if (this.keyboardInput.getKeyJustPressed().includes('Enter')) {
            this.gameState = "playerSelect";
        }
    }

    displayPlayerSelect() {
        CanvasUtils.drawText(this.ctx, 150, 200, "Select Player Mode", 3.5, "white");
        CanvasUtils.drawText(this.ctx, 150, 250, "Press `1` for Single Player", 3.5, "white");
        CanvasUtils.drawText(this.ctx, 150, 300, "Press `2` for Two Players", 3.5, "white");

        console.log("player select");

        if (this.keyboardInput.getKeyJustPressed().includes('Digit1')) {
            this.playerCount = 1;
            this.gameState = "initGame";
        } else if (this.keyboardInput.getKeyJustPressed().includes('Digit2')) {
            this.playerCount = 2;
            this.gameState = "initGame";
        }
    }

    displayGameOver() {
        CanvasUtils.drawText(this.ctx, 250, 200, "Game Over", 3.5, "white");
        CanvasUtils.drawText(this.ctx, 150, 250, "Press `Enter` to Restart", 3.5, "white");
        console.log("game over");

        if (this.keyboardInput.getKeyJustPressed().includes('Enter') ||
            this.backToAttractCounter++ > this.backToAttract) {
            this.resetGame();
        }
    }

    // Game Logic Functions
    initializeGame() {
        console.log("Initializing Game...");
        this.gameInitialized = true;
        this.onetime = true;
        this.playerLives = [3, 3]; // Reset lives
        this.score = [0, 0]; // Reset score
        this.currentPlayer = 1;

        this.gameState = "initEnemy";
    }

    initializeEnemy() {
        console.log("Initializing Enemy...");
        this.enemyInitialized = true;

        this.gameState = "playGame";
    }

     // Game loop function
     playGameLogic(ctx, deltaTime) {
        if (!this.gameInitialized) {
            this.initializeGame();
        }

        this.removeDeadEnemy();

        this.EnemiesUpdate(deltaTime);
        this.checkEnemyShieldCollision();

        // Update, Remove and Check bombs
        this.removeDeadBomb();
        this.updateBombs(deltaTime);
        this.checkBombShieldCollision();
        this.checkBombGroundCollision();
        this.checkBombPlayerCollision();

        this.checkEnemyShip(deltaTime);


        keyboardInput.update();
        const laserFirePoint = this.player.update(keyboardInput.getKeyPressed(), keyboardInput.getKeyJustPressed());
        this.checkLaser(deltaTime, laserFirePoint);
        this.checkLaserEnemyCollision(this.player);
        this.checkLaserShipCollision(this.player);
        this.checkLaserBombCollision();


        /* Drawing
        */
        // Draw scores
        this.drawScore(ctx);
        this.drawLevel(ctx, this.player);

        // Draw enemy ship
        if (this.enemyShip) {
            this.enemyShip.draw(ctx);
        }

        // Draw all bombs
        this.enemyBombs.forEach(enemyBomb => enemyBomb.draw(ctx));

        this.drawEnemies(ctx);

        // Draw shields
        this.shields.forEach(shield => { shield.draw(ctx); });

        // Draw Laser
        if (this.laser) {
            this.laser.draw(ctx);
        }

        // Draw player
        this.player.draw(ctx);

        this.drawGround(ctx);

        this.drawLives(ctx, this.player);
    }

    playGame() {
        if (this.playerLives[this.currentPlayer - 1] <= 0) {
            if (this.currentPlayer < this.playerCount) {
                this.currentPlayer++;
                this.gameState = "initGame";
            } else {
                this.gameState = "gameOver";
            }
        }

        console.log("play game");
        // Display current player status
        const playerInfo = `Player ${this.currentPlayer} - Lives: ${this.playerLives[this.currentPlayer - 1]} - Score: ${this.score[this.currentPlayer - 1]}`;
        CanvasUtils.drawText(this.ctx, 100, 200, playerInfo, 3.5, "white");
        CanvasUtils.drawText(this.ctx, 100, 250, "Press `D` for player death", 3.5, "white");
        CanvasUtils.drawText(this.ctx, 100, 300, "Press `S` for score", 3.5, "white");

        if (this.keyboardInput.getKeyJustPressed().includes('KeyS')) {
            this.score[this.currentPlayer - 1] += 100;
            console.log("score");
        }

        // Check if Space key was just pressed to simulate losing a life
        if (this.keyboardInput.getKeyJustPressed().includes('KeyD')) {
            this.playerLives[this.currentPlayer - 1] -= 1; // Decrease current player's life
            console.log(`Player ${this.currentPlayer} lost a life!`);

            // Check if current player is out of lives
            if (this.playerLives[this.currentPlayer - 1] <= 0) {
                console.log(`Player ${this.currentPlayer} is out of lives.`);

                // If only one player (single-player mode)
                if (this.playerCount === 1) {
                    // End game if the single player is out of lives
                    console.log("Player 1 is out of lives. Game Over!");
                    this.gameState = "gameOver";
                    return;
                }

                // If two players (multiplayer mode), check if both are out of lives
                if (this.playerCount === 2) {
                    if (this.playerLives[0] <= 0 && this.playerLives[1] <= 0) {
                        console.log("Both players are out of lives. Game Over!");
                        this.gameState = "gameOver";
                        return;
                    }

                    // Swap to the other player if the current one is out of lives
                    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
                    console.log(`Swapping to Player ${this.currentPlayer}.`);
                }
            } else {
                // If current player still has lives left, swap only in two-player mode
                if (this.playerCount === 2) {
                    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
                    console.log(`Swapping to Player ${this.currentPlayer}.`);
                }
            }
        }
    }

    resetGame() {
        console.log("Resetting Game...");
        this.gameState = "attract";
        this.gameInitialized = false;
        this.enemyInitialized = false;
        this.backToAttractCounter = 0;
    }

}

export default Game;

// Canvas needs to know the current directory to game.js for dynamic imports
const currentDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
window.canvasPath = currentDir;
