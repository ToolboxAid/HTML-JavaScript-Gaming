// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// game.js - Space Invaders

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

import { AudioPlayer } from '../scripts/audioPlayer.js';
import { Cookies } from '../scripts/cookies.js';


import AttractMode from './attractMode.js';
class Game {

    static scoreFlash = 0;
    static scoreDelay = 0;
    static scoreOn = true;
    static scoreOnPlayer1 = true;
    static scoreOnPlayer2 = true;
    static audioPlayer = new AudioPlayer('./assets/effects');

    // List of audio files to be loaded
    static audioFiles = [
        'explosion.wav',
        'fastinvader1.wav',
        'fastinvader2.wav',
        'fastinvader3.wav',
        'fastinvader4.wav',
        'invaderkilled.wav',
        'shoot.wav',
        'ufo_highpitch.wav',
        'ufo_lowpitch.wav'
    ];

    // Method to load all audio files
    async loadAllAudioFiles() {
        for (const filename of Game.audioFiles) {
            try {
                await Game.audioPlayer.loadAudio(filename);
                console.log(`Sound cached: ${filename}`);
            } catch (error) {
                console.error(`Error loading ${filename}:`, error);
            }
        }
    }

    constructor() {
        // Load all audio files
        this.loadAllAudioFiles().then(() => {
            console.log("All audio files have been loaded and cached.");
        });

        console.log(Game.audioPlayer.audioCache);

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

        // Static cookie name & path for consistency
        this.cookieName = Cookies.sanitizeCookieName(currentDir);
        this.cookiePath = "/";
        this.getHighScoreCookie();

        // Items to move into the player
        this.gameEnemies = new Map();
        this.gameEnemiesBottom = new Array(enemyConfig.colSize).fill(null);
        this.enemyBombs = [];
        this.shields = [];
        this.grounds = [];

        // Non-player items
        this.laser = null;
        this.enemyShip = EnemyShip.getInstance();

        this.attractMode = new AttractMode();
    }

    // Method to get the high score cookie
    getHighScoreCookie(initScore = 0) {
        // Try to get the cookie value
        let cookie = Cookies.get(this.cookieName, { path: this.cookiePath });
        console.log("Retrieved cookie:", cookie);

        if (cookie === null) {
            // Set the high score cookie if it doesn't exist
            this.setHighScoreCookie(initScore);

            // Immediate retrieval to ensure the cookie is accessible
            cookie = Cookies.get(this.cookieName, { path: this.cookiePath });
            if (cookie === null) {
                console.error("Failed to set the cookie!", this.cookieName, this.cookiePath);
            } else {
                console.log("Set new cookie:", cookie);
            }
        } else {
            console.log("Cookie found:", cookie);
        }

        // Convert the cookie to a number and store it as the high score
        if (cookie !== null) {
            this.highScore = parseInt(cookie, 10);
            if (isNaN(this.highScore)) {
                console.error("Error: Cookie value is not a valid number");
                this.highScore = 0; // Default fallback
            } else {
                console.log("Parsed high score:", this.highScore);
            }
        } else {
            this.highScore = 0; // Default fallback for null
        }
    }
    
    // Method to set the high score cookie
    setHighScoreCookie(score) {
        Cookies.set(this.cookieName, score, {
            expires: 7, // Expires in 7 days
            path: this.cookiePath // Root path for simplicity
        });
        console.log(`Cookie set: ${this.cookieName}=${score}`);
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
        if (Enemy.nextID === 0) {
            Game.audioPlayer.playAudio('fastinvader1.wav');
        }
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

    updateBombs(deltaTime) {
        this.EnemiesDropBomb(deltaTime);
        this.enemyBombs.forEach(enemyBomb => {
            enemyBomb.update(deltaTime);
        });
    }

    drawScore() {
        const color = 'yellow';
        const pixelSize = 5;

        // Draw score labels
        CanvasUtils.drawText(50, 30, "SCORE-1", pixelSize, 'red');
        CanvasUtils.drawText(300, 30, "MIDWAY", pixelSize, 'red');
        CanvasUtils.drawText(550, 30, "SCORE-2", pixelSize, 'red');

        // Display Player 1's score if Game.scoreOn is true and current player is 1
        if (Game.scoreOnPlayer1) {
            CanvasUtils.drawNumber(90, 80, this.players[0].score, pixelSize, color, 4, '0');
        }

        // Display high score
        CanvasUtils.drawNumber(340, 80, this.highScore, pixelSize, color, 4, '0');

        // Display Player 2's score if Game.scoreOn is true and current player is 2
        if (Game.scoreOnPlayer2) {
            CanvasUtils.drawNumber(590, 80, this.players[1].score, pixelSize, color, 4, '0');
        }
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
        CanvasUtils.drawSprite(825, dwn, LevelFrames.frames[player.level - 1], 2.0); // current 0-9
    }

    drawGround() {
        this.grounds.forEach(ground => {
            ground.draw();
        });
    }

    drawEnemies() {
        this.gameEnemies.forEach((enemy, key) => {
            enemy.draw();
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
            this.setHighScoreCookie(this.player.score);
            // let cookie = Cookies.get(this.cookieName, { path: this.cookiePath });
            // console.log("new high score", cookie);
        }
    }

    checkLaserEnemyCollision() {
        if (this.laser) {
            let hitDetected = false;
            this.gameEnemies.forEach((enemy, key) => {
                if (enemy.processCollisionWith(this.laser)) {
                    this.updatePlayerScore(enemy.value);
                    enemy.setHit();
                    hitDetected = true;
                    Game.audioPlayer.playAudio('invaderkilled.wav');
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

    checkEnemyShip(deltaTime) {
        this.enemyShip.update(deltaTime, this.laser);
        if (this.enemyShip.getStartAudio()) {
            Game.audioPlayer.playAudio('ufo_highpitch.wav', true);
        }

        if (this.enemyShip.getStopAudio()) {
            Game.audioPlayer.stopLooping('ufo_highpitch.wav');
        }

        const value = this.enemyShip.getValue();

        if (value > 0) {
            Game.audioPlayer.playAudio('ufo_lowpitch.wav');
            this.updatePlayerScore(value);
            this.laser = null;
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
        this.gameEnemies.forEach((enemy) => {
            if (enemy.isDead()) {
                foundID = enemy.enemyID;
                foundDead = this.gameEnemies.delete(enemy.key);
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
                    Game.audioPlayer.playAudio('explosion.wav');

                    this.player.setIsDying();
                    enemyBomb.setIsDying();
                    enemyBomb.x -= 20;
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
                Game.audioPlayer.playAudio('shoot.wav');
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
    gameLoop(deltaTime) {

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

            case "player1":
                // Flash player 1 score
                this.player1up();
                break;

            case "player2":
                // flash player 2 score
                this.player2up();
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

            case "resetPlayers":
                this.resetPlayers();
                break;

            default:
                console.log("bad gameState: ", this.gameState);
                break;
        }
    }

    // Display Functions
    displayAttractMode() {
        this.attractMode.update();
        this.attractMode.draw();
        this.drawScore();
        CanvasUtils.drawSprite(127, 800, Player.frame[0], spriteConfig.pixelSize);

        const dwn = 900;
        const color = 'white';
        const pixelSize = 5;
        CanvasUtils.drawNumber(15, dwn, 0, pixelSize, color, 2, '0');
        CanvasUtils.drawSprite(95, dwn, Player.frame[0], spriteConfig.pixelSize);

        if (this.keyboardInput.getkeysPressed().includes('Enter')) {
            AttractMode.count = 0;
            this.resetPlayers();
            this.gameState = "playerSelect";
        }
    }

    displayPlayerSelect() {
        CanvasUtils.drawText(150, 200, "Select Player Mode", 3.5, "white");
        CanvasUtils.drawText(150, 250, "Press `1` for One Player", 3.5, "white");
        CanvasUtils.drawText(150, 300, "Press `2` for Two Players", 3.5, "white");

        if (this.keyboardInput.getkeysPressed().includes('Digit1')) {
            this.playerCount = 1;
            this.gameState = "initGameShield";
        } else if (this.keyboardInput.getkeysPressed().includes('Digit2')) {
            this.playerCount = 2;
            this.gameState = "initGameShield";
        }
    }

    displayGameOver() {
        console.log("game over");

        Game.audioPlayer.stopAllLooping();

        this.drawGame();

        // Set the fill style to black with 50% alpha
        const alpha = "88";
        CanvasUtils.ctx.fillStyle = canvasConfig.backgroundColor + alpha;
        CanvasUtils.ctx.fillRect(0, 0, canvasConfig.width, canvasConfig.height); // Adjust the position and size as needed

        const x = canvasConfig.width / 2 - 100;
        const y = canvasConfig.height / 2 - 100;

        CanvasUtils.drawText(x, y, "Game Over.", 3.5, "white");
        CanvasUtils.drawText(x - 150, y + 60, "Press `Enter` to Restart", 3.5, "#ffffffff");

        if (this.keyboardInput.getkeysPressed().includes('Enter') ||
            this.backToAttractCounter++ > this.backToAttract) {
            this.gameState = "resetPlayers";
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
            this.gameState = "player1";

            Enemy.enemyID = 0;

        }
        this.drawGame();
    }

    flashPlayerScore() {
        // Increment flash counter
        if (Game.scoreFlash++ > 10) {
            Game.scoreFlash = 0;
            // Toggle the score visibility
            Game.scoreOn = !Game.scoreOn;

            // Delay the flashing effect
            if (Game.scoreDelay++ > 20) {
                // Reset counters after flashing sequence
                Game.scoreFlash = 0;
                Game.scoreDelay = 0;
                this.gameState = "playGame";
                Game.scoreOn = true; // Ensure score is visible at the end of flashing
            }
        }
    }

    player1up() {
        // this.currentPlayer = 1;
        // Game.scoreFlash = 0;    // Reset flash counter
        // Game.scoreDelay = 0;    // Reset delay counter
        // Game.scoreOn = false;   // Start with score invisible
        this.flashPlayerScore();
        Game.scoreOnPlayer1 = Game.scoreOn;
        this.drawGame();
    }

    player2up() {
        // this.currentPlayer = 2;
        // Game.scoreFlash = 0;    // Reset flash counter
        // Game.scoreDelay = 0;    // Reset delay counter
        // Game.scoreOn = false;   // Start with score invisible
        this.flashPlayerScore();
        Game.scoreOnPlayer2 = Game.scoreOn;
        this.drawGame();
    }

    // Draw Game
    drawGame() {
        // Draw scores
        this.drawScore();
        this.drawLevel(this.player);

        // Draw enemy ship
        this.enemyShip.draw();

        // Draw all bombs
        this.enemyBombs.forEach(enemyBomb => enemyBomb.draw());

        this.drawEnemies();

        // Draw shields
        this.shields.forEach(shield => { shield.draw(); });

        // Draw Laser
        if (this.laser) {
            this.laser.draw();
        }

        // Draw player
        this.player.draw();

        this.drawGround();

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

        const laserFirePoint = this.player.update(this.keyboardInput.getKeysDown(), this.keyboardInput.getkeysPressed());
        this.checkLaser(deltaTime, laserFirePoint);
        this.checkLaserEnemyCollision(this.player);
        this.checkLaserBombCollision();

        this.drawGame();
    }

    checkGamePause() {
        if (this.keyboardInput.getkeysPressed().includes('KeyP')) {
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

    killBombs() {
        this.enemyBombs.forEach(enemyBomb => {
            enemyBomb.setIsDying();
            console.log(enemyBomb);
        });
    }

    playGame(deltaTime) {
        this.checkGamePause();

        console.log("play game");

        this.playGameLogic(deltaTime);

        // // Display current player status using Player class properties
        const x = canvasConfig.width / 5;
        const y = canvasConfig.height - 75;
        CanvasUtils.drawText(x, y, "Press `P` to pause game", 3.5, "white");

        // Simulate losing a life with 'D' key
        if (this.player.isDead()) {

            // Decrease current player's life
            this.player.decrementLives();
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
                        this.gameState = "player" + this.currentPlayer;
                    }
                }
            } else {
                // Alternate players if the current one still has lives
                if (this.playerCount === 2) {
                    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
                    this.resetCurrentPlayer();
                    console.log(`Swapping to Player ${this.currentPlayer}.`);
                    this.gameState = "player" + this.currentPlayer;
                } else {
                    this.resetCurrentPlayer();
                }
            }
        } else {
            if (this.gameEnemies.size <= 0) {
                // reset player field
                this.player.incLevel();
                this.killBombs();
                Enemy.unsetEnemiesInitialized()
                this.initializeGameShields();
                this.initializeGameGround();
                this.initializeGameEnemy();
            }
        }

        if (this.keyboardInput.getkeysPressed().includes('KeyD')) {
            this.killBombs();
        }
    }

    //resetGame() {
    resetPlayers() {
        console.log("Resetting Game...");

        this.backToAttractCounter = 0;

        // Initialize players as an array of player instances
        this.players = [new Player(), new Player()]; // Array holding player1 and player2
        this.player = this.players[0]; // Current player

        this.gameEnemies = new Map();
        this.gameEnemiesBottom = new Array(enemyConfig.colSize).fill(null);

        // Items to move into the player
        this.gameEnemies = new Map();
        this.gameEnemiesBottom = new Array(enemyConfig.colSize).fill(null);
        this.enemyBombs = [];
        this.shields = [];
        this.grounds = [];
        this.laser = null;

        Enemy.unsetEnemiesInitialized();
        this.gameState = "attract";
    }

}

export default Game;

// Canvas needs to know the current directory to game.js for dynamic imports
const currentDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
window.canvasPath = currentDir;
