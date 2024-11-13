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

import LevelFrames from './levelFrams.js';

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


// would like to have game extend canvas to eliminate bad form
// would like to have game extend canvas to eliminate bad form
// would like to have game extend canvas to eliminate bad form
// would like to have game extend canvas to eliminate bad form
// would like to have game extend canvas to eliminate bad form

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
        this.gameState = "attract"; // Possible states: attract, playerSelect, initGameShield, initGameEnemy, playGame, pauseGame, gameOver
        this.playerCount = 1;
        this.currentPlayer = 1;

        this.backToAttract = 600;
        this.backToAttractCounter = 0;

        // Initialize players as an array of player instances
        this.players = [new Player(), new Player()]; // Array holding player1 and player2
        this.player = this.players[0]; // Current player
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

    drawScore() {
        let color = 'yellow';
        const pixelSize = 5;
        CanvasUtils.drawText(50, 30, "SCORE-1", pixelSize, 'red');
        CanvasUtils.drawText(300, 30, "MIDWAY", pixelSize, 'red');
        CanvasUtils.drawText(550, 30, "SCORE-2", pixelSize, 'red');
        CanvasUtils.drawNumber(90, 80, this.players[0].score, pixelSize, color, 4, '0');
        CanvasUtils.drawNumber(340, 80, this.highScore, pixelSize, color, 4, '0');
        CanvasUtils.drawNumber(590, 80, this.players[1].score, pixelSize, color, 4, '0');
    }

    drawLives(player) {
        const dwn = 900;
        const color = 'white';
        const pixelSize = 5;
        CanvasUtils.drawNumber(15, dwn, player.lives, pixelSize, color, 2, '0');
        CanvasUtils.drawSprite(95, dwn, Player.frame[0], spriteConfig.pixelSize);
    }

    drawLevel(player) {
        const dwn = 895;
        const color = 'white';
        const pixelSize = 5;
        CanvasUtils.drawSprite(825, dwn, LevelFrames.frames[player.level], 2.0); // current 0-9
    }

    drawGround() {
        this.grounds.forEach(ground => {
            ground.draw(CanvasUtils.ctx);
        });
    }

    drawEnemies() {
        this.gameEnemies.forEach((enemy, key) => {
            enemy.draw(CanvasUtils.ctx);
        });
    }

    static o1 = null;
    static o2 = null;
    static o3 = null;
    drawCollision() {
        if (Game.o1) {
            CanvasUtils.drawBounds(Game.o1.x, Game.o1.y, Game.o1.width, Game.o1.height, "red", 3);
            CanvasUtils.drawBounds(Game.o2.x, Game.o2.y, Game.o2.width, Game.o2.height, "pink", 3);
        }
        if (Game.o3) {
            CanvasUtils.drawBounds(Game.o3.x, Game.o3.y, Game.o3.width, Game.o3.height, "orange", 3);
        }
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
                //foundKey = enemy.key;
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

    checkBombPlayerCollision() {
        this.enemyBombs.forEach(enemyBomb => {
            if (enemyBomb.isAlive() && this.player.isAlive()) {
                const colliding = this.player.isCollidingWith(enemyBomb);
                if (colliding) {
                    console.log("playerhit");
                    this.player.setIsDying();
                    enemyBomb.setIsDying();
                    enemyBomb.x -= 20;
                    console.log(this.player);
                    Game.o1 = new ObjectStatic(this.player.x, this.player.y, this.player.width, this.player.height);
                    Game.o2 = new ObjectStatic(enemyBomb.x, enemyBomb.y, enemyBomb.width, enemyBomb.height);
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

    // Example: object.position += object.velocity * deltaTime;
    gameLoop(ctx, deltaTime) {

        this.keyboardInput.update();

        // Update game state with deltaTime
        switch (this.gameState) {
            case "attract":
                this.displayAttractMode(deltaTime);
                break;

            case "playerSelect":
                this.displayPlayerSelect();
                break;

            case "initGameShield":
                this.initializeGameShields();
                break;

            case "initGameGround":
                this.initializeGameGround();
                break;

            case "initGameEnemy":
                this.initializeGameEnemy();
                break;

            case "playGame":
                this.playGame(deltaTime);
                break;

            case "pauseGame":
                this.pauseGame();
                break;

            case "gameOver":
                this.displayGameOver();
                break;
        }
    }

    // Display Functions
    displayAttractMode(deltaTime) {
        CanvasUtils.drawText(150, 200, "Welcome to the Game!", 3.5, "white");
        CanvasUtils.drawText(150, 300, "Press `Enter` to Start", 3.5, "white");
        console.log("attract");

        if (this.keyboardInput.getKeyJustPressed().includes('Enter')) {
            this.gameState = "playerSelect";
        }
    }

    displayPlayerSelect() {
        CanvasUtils.drawText(150, 200, "Select Player Mode", 3.5, "white");
        CanvasUtils.drawText(150, 250, "Press `1` for One Player", 3.5, "white");
        CanvasUtils.drawText(150, 300, "Press `2` for Two Players", 3.5, "white");

        console.log("player select");

        if (this.keyboardInput.getKeyJustPressed().includes('Digit1')) {
            this.playerCount = 1;
            this.gameState = "initGameShield";
        } else if (this.keyboardInput.getKeyJustPressed().includes('Digit2')) {
            this.playerCount = 2;
            this.gameState = "initGameShield";
        }
    }

    displayGameOver() {
        console.log("game over");

        this.drawGame();

        // Set the fill style to black with 50% alpha
        CanvasUtils.ctx.fillStyle = canvasConfig.backgroundColor + "88";
        console.log(CanvasUtils.ctx.fillStyle);
        CanvasUtils.ctx.fillRect(0, 0, canvasConfig.width, canvasConfig.height); // Adjust the position and size as needed

        const x = canvasConfig.width / 2 - 100;
        const y = canvasConfig.height / 2 - 100;

        CanvasUtils.drawText(x, y, "Game Over.", 3.5, "white");
        CanvasUtils.drawText(x - 150, y + 60, "Press `Enter` to Restart", 3.5, "#ffffffff");

        if (this.keyboardInput.getKeyJustPressed().includes('Enter') ||
            this.backToAttractCounter++ > this.backToAttract) {
            this.resetGame();
        }
    }

    initializeGameShields() {
        console.log("Initializing Game Shields...");
        for (let i = 0; i < window.shieldCount; i++) {
            this.shields.push(new Shield(i));
        }
        this.gameState = "initGameGround";
    }

    initializeGameGround() {
        for (let i = 0; i < canvasConfig.width; i += Ground.groundSize) {
            const ground = new Ground(i, spriteConfig.groundY);
            this.grounds.push(ground);
        }
        this.gameState = "initGameEnemy";
    }

    initializeGameEnemy() {
        console.log("Initializing Game Enemy...");

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

        if (Enemy.isEnemiesInitialized()) {
            Enemy.remainingEnemies = this.gameEnemies.size;
            this.findBottom();
            this.gameState = "playGame";

            Enemy.enemyID = 0;

        }
        this.drawGame();
    }

    // Draw Game
    drawGame() {
        // Draw scores
        this.drawScore();
        this.drawLevel(this.player);

        // Draw enemy ship
        if (this.enemyShip) {
            this.enemyShip.draw(CanvasUtils.ctx);
        }

        // Draw all bombs
        this.enemyBombs.forEach(enemyBomb => enemyBomb.draw(CanvasUtils.ctx));

        this.drawEnemies();

        // Draw shields
        this.shields.forEach(shield => { shield.draw(CanvasUtils.ctx); });

        // Draw Laser
        if (this.laser) {
            this.laser.draw(CanvasUtils.ctx);
        }

        // Draw player
        this.player.draw(CanvasUtils.ctx);

        this.drawGround(CanvasUtils.ctx);

        this.drawLives(this.player);
    }

    // Game loop function
    playGameLogic(deltaTime) {
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

        const laserFirePoint = this.player.update(this.keyboardInput.getKeyPressed(), this.keyboardInput.getKeyJustPressed());
        this.checkLaser(deltaTime, laserFirePoint);
        this.checkLaserEnemyCollision(this.player);
        this.checkLaserShipCollision(this.player);
        this.checkLaserBombCollision();

        this.drawGame();
    }

    checkGamePause() {
        if (this.keyboardInput.getKeyJustPressed().includes('KeyP')) {
            if (this.gameState === "playGame") {
                this.gameState = "pauseGame";
            } else if (this.gameState === "pauseGame") {
                this.gameState = "playGame";
            }
        }
    }

    pauseGame() {
        this.checkGamePause();
        console.log("paused");
        this.drawGame();

        // Set the fill style to black with 50% alpha
        CanvasUtils.ctx.fillStyle = canvasConfig.backgroundColor + "88";
        console.log(CanvasUtils.ctx.fillStyle);
        CanvasUtils.ctx.fillRect(0, 0, canvasConfig.width, canvasConfig.height); // Adjust the position and size as needed

        const x = canvasConfig.width / 5;
        const y = canvasConfig.height - 75;

        CanvasUtils.drawText(x, y, "Game Paused.", 3.5, "white");
        CanvasUtils.drawText(x, y + 35, "Press `P` to unpause game", 3.5, "#ffffffff");
    }

    // Initialize player based on current player index
    resetCurrentPlayer() {
        const currentPlayer = this.currentPlayer - 1;

        // Set current player as the active player in the array
        this.player = this.players[currentPlayer];

        const x = 127, y = 820; // Default starting position
        this.player.setPosition(x, y);
        this.player.setIsAlive();
    }
    
    killBombs(deltaTime) {
        this.enemyBombs.forEach(enemyBomb => {
            enemyBomb.isDying();
        });
    }

    playGame(deltaTime) {
        this.checkGamePause();

        console.log("play game");

        this.playGameLogic(deltaTime);

        // // Display current player status using Player class properties
        // const playerInfo = `Player ${this.currentPlayer} - Lives: ${this.player.lives} - Score: ${this.player.score}`;
        // console.log(playerInfo);
        const x = canvasConfig.width / 5;
        const y = canvasConfig.height - 75;
        CanvasUtils.drawText(x, y, "Press `P` to pause game", 3.5, "white");

        // Simulate losing a life with 'D' key
        if (this.player.isDead()) {

            // Decrease current player's life
            this.player.decrementLives();
            console.log(this.currentPlayer, this.player, this.players);
            console.log(`Player ${this.currentPlayer} lost a life!`);

            // Check if current player is out of lives
            if (this.player.lives <= 0) {
                console.log(`Player ${this.currentPlayer} is out of lives.`);

                // If it's a single-player game, game over
                if (this.playerCount === 1) {
                    console.log("Player 1 is out of lives. Game Over!");
                    this.gameState = "gameOver";
                    return;
                }

                // In multiplayer mode, check if the other player is out of lives
                if (this.playerCount === 2) {
                    // Check if both players are out of lives
                    if (this.players[0].lives <= 0 && this.players[1].lives <= 0) {
                        console.log("Both players are out of lives. Game Over!");
                        this.gameState = "gameOver";
                        return; // End the game if both players are out of lives
                    } else {
                        // Swap to the other player if there are lives remaining for the other player
                        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
                        this.resetCurrentPlayer();
                        console.log(`Swapping to Player ${this.currentPlayer}.`);
                    }
                }
            } else {
                // Alternate players if the current one still has lives
                if (this.playerCount === 2) {
                    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
                    this.resetCurrentPlayer();
                    console.log(`Swapping to Player ${this.currentPlayer}.`);
                } else {
                    this.resetCurrentPlayer();
                }
            }
        } else {
            if (this.gameEnemies.size <= 0){
                Enemy.unsetEnemiesInitialized()
                this.initializeGameShields();
                this.initializeGameGround();
                this.initializeGameEnemy();
            }
        }
    }

    resetGame() {
        console.log("Resetting Game...");
        this.gameState = "attract";
        this.backToAttractCounter = 0;
    }

}

export default Game;

// Canvas needs to know the current directory to game.js for dynamic imports
const currentDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
window.canvasPath = currentDir;
