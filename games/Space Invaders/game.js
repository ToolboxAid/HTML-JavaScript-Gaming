// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// game.js - Space Invaders

import { canvasConfig, spriteConfig, enemyConfig, performanceConfig, fullscreenConfig, playerSelect, shieldConfig } from './global.js'; // Assuming these contain canvas and sprite details

import GameBase from '../../engine/core/gameBase.js';

import CanvasUtils from '../../engine/core/canvasUtils.js'; // Required for dynamic canvas operations, used in animate()
import CanvasSprite from '../../engine/core/canvasSprite.js';
import CanvasText from '../../engine/core/canvasText.js';
import GamePlayerSelectUi from '../../engine/game/gamePlayerSelectUi.js';
import GameCollision from '../../engine/game/gameCollision.js';
import GameUtils from '../../engine/game/gameUtils.js';
import PrimitiveRenderer from '../../engine/renderers/primitiveRenderer.js';
import AudioPlayer from '../../engine/output/audioPlayer.js';
import Cookies from '../../engine/misc/cookies.js';
import RandomUtils from '../../engine/math/randomUtils.js';
import Sprite from '../../engine/core/sprite.js';
import SystemUtils from '../../engine/utils/systemUtils.js';

const drawPixelText = CanvasText.bindDrawText(CanvasSprite.bindDrawSprite());
const drawPixelNumber = CanvasText.bindDrawNumber(CanvasSprite.bindDrawSprite());

import AttractMode from './attractMode.js';

import Player from './player.js';
import Shield from './shield.js';
import Laser from './laser.js';
import Ground from './ground.js';

import LevelFrames from './levelFrames.js';

import KeyboardInput from '../../engine/input/keyboard.js';
import GameControllers from '../../engine/input/controller/gameControllers.js';

import Enemy from './enemy.js';
import EnemySquid from './enemySquid.js';
import EnemyCrab from './enemyCrab.js';
import EnemyOctopus from './enemyOctopus.js';
import EnemyShip from './enemyShip.js';
import EnemyBomb1 from './enemyBomb1.js';
import EnemyBomb2 from './enemyBomb2.js';
import EnemyBomb3 from './enemyBomb3.js';


class Game extends GameBase {

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

    constructor() {
        super(canvasConfig, performanceConfig, fullscreenConfig);
    }

    // async initializeGame() {
    async onInitialize() {
        try {
            // Initialize text
            // await Game.initCanvas();
            Game.initText();

            // Load audio files
            await AudioPlayer.loadAllAudioFiles(Game.audioFiles, Game.audioPlayer);
            console.log("All audio files have been loaded and cached.");
        } catch (error) {
            console.warn("Audio cache state:", Game.audioPlayer.audioCache);
            throw error; // Propagate error up
        }

        this.keyboardInput = new KeyboardInput();
        this.gameControllers = new GameControllers();

        // Game State Variables
        this.gameState = "attract"; // Possible states: attract, playerSelect, initGameShield, initGameEnemy, playGame, pauseGame, gameOver
        this.playerCount = 1;
        this.currentPlayer = 1;

        this.backToAttract = 600;
        this.backToAttractCounter = 0;

        // Static cookie name & path for consistency
        // Use current directory as name
        const currentDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));

        this.cookieName = Cookies.sanitizeCookieName(currentDir);
        this.cookiePath = "/";
        this.getHighScoreCookie();

        // Initialize players as an array of player instances
        this.players = [new Player(), new Player()]; // Array holding player1 and player2
        this.player = this.players[0]; // Current player

        // Items to move into the player
        this.playersEnimies = [new Map(), new Map()];
        this.gameEnemies = this.playersEnimies[0];

        this.playersEnemiesBottom = [new Array(enemyConfig.colSize).fill(null), new Array(enemyConfig.colSize).fill(null)];
        this.gameEnemiesBottom = this.playersEnemiesBottom[0];

        // Initialize 2D array with proper syntax
        this.playersShields = [[], []];
        this.shields = this.playersShields[0];

        this.playersGrounds = [[], []];
        this.grounds = this.playersGrounds[0];

        this.enemyBombs = [];

        this.playersEnemiesStatic = [[], []];
        this.savePlayersEnemiesStatic(0);
        this.savePlayersEnemiesStatic(1);
        // Non-player items
        this.laser = null;
        this.enemyShip = EnemyShip.getInstance();

        this.attractMode = new AttractMode();
    }

    savePlayersEnemiesStatic(player) {
        this.playersEnemiesStatic[player] =
            [
                Enemy.speed,
                Enemy.enemyID,
                Enemy.nextID,
                Enemy.remainingEnemies,
                Enemy.newSpeed,
                Enemy.enemyRow,
                Enemy.enemyCol,
                Enemy.enemiesInitialized,
                Enemy.prepSpeed,
                Enemy.doSpeed,
                Enemy.prepMoveDown,
                Enemy.doMoveDown,
                Enemy.reorgID
            ];
    }
    restorePlayersEnemiesStatic(player) {
        [
            Enemy.speed,
            Enemy.enemyID,
            Enemy.nextID,
            Enemy.remainingEnemies,
            Enemy.newSpeed,
            Enemy.enemyRow,
            Enemy.enemyCol,
            Enemy.enemiesInitialized,
            Enemy.prepSpeed,
            Enemy.doSpeed,
            Enemy.prepMoveDown,
            Enemy.doMoveDown,
            Enemy.reorgID
        ] = this.playersEnemiesStatic[player];
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
                break;
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
                    const bombType = RandomUtils.randomRange(0, 2, true); // Generate a random bomb type (0 to 2)
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
                            console.warn("Unexpected bombType:", bombType);
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

        // Draw score text labels
        CanvasSprite.drawSpriteRGB(30, 30, Game.scoreTextFrame.layers[0].data, pixelSize);

        // Display Player 1's score if Game.scoreOn is true and current player is 1
        if (Game.scoreOnPlayer1) {
            drawPixelNumber(90, 80, this.players[0].score, pixelSize, color, 4, '0');
        }

        // Display high score
        drawPixelNumber(410, 80, this.highScore, pixelSize, color, 4, '0');

        // Display Player 2's score if Game.scoreOn is true and current player is 2
        if (Game.scoreOnPlayer2) {
            drawPixelNumber(750, 80, this.players[1].score, pixelSize, color, 4, '0');
        }
    }

    drawLives(player) {
        const acr = spriteConfig.livesX;
        const dwn = spriteConfig.livesY;
        const color = spriteConfig.livesColor || 'red';
        const pixelSize = 5;
        drawPixelNumber(acr, dwn, player.lives, pixelSize, color, 2, '0');
        CanvasSprite.drawSprite(acr + 80, dwn - 10, Player.frame[0], spriteConfig.pixelSize);
    }

    drawLevel(player) {
        const acr = spriteConfig.levelX;
        const dwn = spriteConfig.levelY;
        CanvasSprite.drawSprite(acr, dwn, LevelFrames.frames[player.level - 1], 2.0); // current 0-9
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
            PrimitiveRenderer.drawBounds(Game.o1.x, Game.o1.y, Game.o1.width, Game.o1.height, "red", 3);
            PrimitiveRenderer.drawBounds(Game.o2.x, Game.o2.y, Game.o2.width, Game.o2.height, "pink", 3);
        }
        if (Game.o3) {
            PrimitiveRenderer.drawBounds(Game.o3.x, Game.o3.y, Game.o3.width, Game.o3.height, "orange", 3);
        }
    }

    updatePlayerScore(score) {
        this.player.updateScore(score);
        if (this.player.score > this.highScore) {
            this.highScore = this.player.score;
            this.setHighScoreCookie(this.player.score);
        }
    }

checkLaserEnemyCollision() {
    if (!this.laser) {
        return;
    }

    let hitDetected = false;

    this.gameEnemies.forEach((enemy) => {
        if (!enemy || !enemy.isAlive()) {
            return;
        }

        if (GameCollision.intersects(enemy, this.laser)) {
            this.updatePlayerScore(enemy.value);
            enemy.setHit();
            hitDetected = true;
            Game.audioPlayer.playAudio('invaderkilled.wav');
        }
    });

    if (hitDetected) {
        this.destroyLaser();
    }
}

    checkLaserBombCollision() {
        if (this.laser) {
            // Check for collisions and remove hit laser and bomb
            let hitBomb = false;
            this.enemyBombs.forEach(enemyBomb => {
                if (GameCollision.intersects(enemyBomb, this.laser)) {
                    hitBomb = true;
                    if (enemyBomb.constructor.name !== "EnemyBomb3") {
                        enemyBomb.setIsDying();
                        enemyBomb.x -= 20;
                    }
                }
            });
            if (hitBomb) {
                this.destroyLaser();
            }
        }
    }

    checkLaserShieldCollision() {
        let hit = false;
        this.shields.forEach(shield => {
            if (GameCollision.intersects(shield, this.laser)) {
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
            Game.audioPlayer.playAudio('ufo_highpitch.wav', 1.0, true);
        }

        if (this.enemyShip.getStopAudio()) {
            Game.audioPlayer.stopLooping('ufo_highpitch.wav');
        }

        const value = this.enemyShip.getValue();

        if (value > 0) {
            Game.audioPlayer.playAudio('ufo_lowpitch.wav');
            this.updatePlayerScore(value);
            this.destroyLaser();
        }
    }

    checkBombShieldCollision() {
        this.enemyBombs.forEach(enemyBomb => {
            this.shields.forEach(shield => {
                if (GameCollision.intersects(enemyBomb, shield)) {
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
                if (GameCollision.intersects(enemy, shield)) {
                    if (shield.applyBigBoom(enemy, false)) {
                    }
                }
            });
        });
    }

    checkEnemyPlayerCollision() {
        this.gameEnemies.forEach((enemy, key) => {
            if (GameCollision.intersects(enemy, this.player)) {
                if (enemy.isAlive()) {
                    // Deal with enemy
                    enemy.setHit();

                    // Deal with player
                    console.log("enemy player Collision");
                    Game.audioPlayer.playAudio('explosion.wav');
                    this.player.setIsDying();
                }
            }
        });
    }

    checkBombGroundCollision() {
        this.enemyBombs.forEach(enemyBomb => {
            this.grounds.forEach(ground => {
                if (GameCollision.intersects(enemyBomb, ground)) {
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
        if (enemy && enemy.isDead()) {
            foundID = enemy.enemyID;
            SystemUtils.destroy(enemy);
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

        this.gameEnemies.forEach((enemy) => {
            enemy.reorgID();
        });

        this.findBottom();
    }
}

removeDeadBomb() {
    for (let i = this.enemyBombs.length - 1; i >= 0; i--) {
        const enemyBomb = this.enemyBombs[i];

        if (enemyBomb && enemyBomb.isDead()) {
            SystemUtils.destroy(enemyBomb);
            this.enemyBombs.splice(i, 1);
        }
    }
}

    checkBombPlayerCollision() {
        this.enemyBombs.forEach(enemyBomb => {
            if (enemyBomb.isAlive() && this.player.isAlive()) {
                if (GameCollision.intersects(this.player, enemyBomb)) {
                    console.log("playerhit");
                    Game.audioPlayer.playAudio('explosion.wav');

                    this.player.setIsDying();
                    enemyBomb.setIsDying();
                    enemyBomb.x -= 20;
                    //Game.o1 = new ObjectStatic(this.player.x, this.player.y, this.player.width, this.player.height);
                    //Game.o2 = new ObjectStatic(enemyBomb.x, enemyBomb.y, enemyBomb.width, enemyBomb.height);
                }
            }
        });
    }

checkLaser(deltaTime, laserFirePoint) {
    if (!this.laser) {
        if (laserFirePoint) {
            this.laser = new Laser(laserFirePoint.x, laserFirePoint.y - 10);
            Game.audioPlayer.playAudio('shoot.wav');
        }
        return;
    }

    if (this.laser.isDead && this.laser.isDead()) {
        this.destroyLaser();
        return;
    }

    if (this.laser.update(deltaTime)) {
        this.destroyLaser();
        return;
    }

    if (this.checkLaserShieldCollision()) {
        this.destroyLaser();
    }
}

    findBottom() {
        const cols = enemyConfig.colSize;

        for (let col = 0; col < cols; col++) {
            this.setGameEnemiesBottom(col);
        }
    }

    // Example: object.position += object.velocity * deltaTime;
    gameLoop(deltaTime) {
        //  console.log("gameLoop");

        this.keyboardInput.update();
        this.gameControllers.update();

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

            case "player1": // Flash player 1 score
                this.player1up();
                break;

            case "player2": // flash player 2 score
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
                console.warn("bad gameState: ", this.gameState);
                break;
        }
    }

    // Display
    displayAttractMode() {
        console.log("attract mode");

        this.attractMode.update(CanvasUtils.gfxPercentUsage);
        this.attractMode.draw();

        this.drawScore();
        const x = spriteConfig.playerX;
        const y = spriteConfig.playerY;
        // -20 because of offset in x and height elsewhere
        CanvasSprite.drawSprite(x, y - 20, Player.frame[0], spriteConfig.pixelSize);

        const acr = spriteConfig.livesX;
        const dwn = spriteConfig.livesY;
        const color = spriteConfig.livesColor;
        const pixelSize = 5;
        drawPixelNumber(acr, dwn, 0, pixelSize, color, 2, '0');
        CanvasSprite.drawSprite(acr + 80, dwn - 10, Player.frame[0], spriteConfig.pixelSize);

        if (this.keyboardInput.getKeysPressed().includes('Enter') ||
            this.keyboardInput.getKeysPressed().includes('NumpadEnter') ||
            this.gameControllers.wasButtonIndexPressed(0, 9)) {
            AttractMode.count = 0;
            this.resetPlayers();
            this.gameState = "playerSelect";
        }
    }

    displayPlayerSelect(deltaTime) {
        console.log("player select");
        drawPixelText(40, 400, "Keyboard <left arrow> key to move left.", 3.5, "yellow");
        drawPixelText(40, 440, "Keyboard <right arrow> key to move right.", 3.5, "yellow");
        drawPixelText(40, 480, "Keyboard <spacebar> to fire.", 3.5, "yellow");
        
        drawPixelText(40, 600, "GameController <left D-pad> to move left.", 3.5, "yellow");
        drawPixelText(40, 640, "GameController <right D-bay> to move right.", 3.5, "yellow");
        drawPixelText(40, 680, "GameController <A> to fire.", 3.5, "yellow");

        const config = GameUtils.getPlayerSelectConfig(canvasConfig, playerSelect);
        GamePlayerSelectUi.drawPlayerSelection(config, this.gameControllers);
        const result = GameUtils.resolvePlayerSelection(this.keyboardInput, this.gameControllers, config);
        if (result) {
            this.playerCount = result.playerCount;
            this.gameState = "initGameShield";
        }
    }

    displayGameOver() {
        console.log("game over");

        Game.audioPlayer.stopAllLooping();

        this.drawGame();

        // Set the fill style to black with 50% alpha
        PrimitiveRenderer.drawOverlay( canvasConfig.width, canvasConfig.height, canvasConfig.backgroundColor, 0.53 );

        const x = canvasConfig.width / 2 - 100;
        const y = canvasConfig.height / 2 - 100;

        drawPixelText(x, y, "Game Over.", 3.5, "white");
        drawPixelText(x - 300, y + 60, "Press Keyboard `Enter` to Restart", 3.5, "#ffffffff");
        drawPixelText(x - 350, y + 90, "Press GameController `Start` to Restart", 3.5, "#ffffffff");

        if (this.keyboardInput.getKeysPressed().includes('Enter') ||
            this.keyboardInput.getKeysPressed().includes('NumpadEnter') ||
            this.gameControllers.wasButtonIndexPressed(0, 9) ||
            this.backToAttractCounter++ > this.backToAttract) {
            this.gameState = "resetPlayers";
        }
    }

    //        // Initialize 2D array with proper syntax
    // this.playersShields = [[], []];
    // this.shields = this.playersShields[0];

    initializeGameShields() {
        console.log("Initializing Game Shields...");
        let shieldCount = shieldConfig?.count ?? 1;
        for (let i = 0; i < shieldCount; i++) {
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
                console.warn("Unknown enemy type!");
                break;
        }

        this.gameEnemies.set(enemy.key, enemy);

        if (Enemy.isEnemiesInitialized()) {
            Enemy.remainingEnemies = this.gameEnemies.size;
            this.findBottom();
            this.gameState = "player" + this.currentPlayer;
            Enemy.enemyID = 0;
        }
        this.drawGame();
    }

    flashPlayerScore() {
        // Increment flash counter
        if (Game.scoreFlash++ >= 8) {
            Game.scoreFlash = 0;
            // Toggle the score visibility
            Game.scoreOn = !Game.scoreOn;

            // Delay the flashing effect
            if (Game.scoreDelay++ >= 20) {
                // Reset counters after flashing sequence
                Game.scoreDelay = 0;
                this.gameState = "playGame";
                Game.scoreOn = true; // Ensure score is visible at the end of flashing
            }
        }
    }

    player1up() {
        this.flashPlayerScore();
        Game.scoreOnPlayer1 = Game.scoreOn;
        this.drawGame();
    }

    player2up() {
        this.flashPlayerScore();
        Game.scoreOnPlayer2 = Game.scoreOn;
        this.drawGame();
    }

    // Draw Game
    drawGame() {

        console.log("player", {
            dead: this.player?.isDead?.(),
            x: this.player?.x,
            y: this.player?.y,
            width: this.player?.width,
            height: this.player?.height,
            color: this.player?.spriteColor,
            status: this.player?.status,
            frames: this.player?.livingFrames,
            enemyCount: this.gameEnemies?.size,
            bombCount: this.enemyBombs?.length
        });

        // Draw scores
        this.drawScore();
        this.drawLevel(this.player);

        // Draw enemy ship
        if (this.enemyShip) {
            this.enemyShip.draw();
        }

        // Draw all bombs
        this.enemyBombs.forEach(enemyBomb => {
            if (enemyBomb) {
                enemyBomb.draw();
            }
        });

        // TEMP DEBUG: force enemy colors before drawing
        for (const enemy of this.gameEnemies.values()) {
            if (enemy && enemy.isAlive()) {
                enemy.setSpriteColor(enemy.spriteColor || "red");
            }
        }

        // Draw enemies
        this.drawEnemies();

        // Draw shields
        this.shields.forEach(shield => {
            if (shield) {
                shield.draw();
            }
        });

        // Draw laser
        if (this.laser) {
            this.laser.draw();
        }

        // TEMP DEBUG: force player color before drawing
        if (this.player) {
            this.player.setSpriteColor("white");
            this.player.draw();
        }

        this.drawGround();
        this.drawLives(this.player);
    }
    // Game loop function
    playGameLogic(deltaTime) {
        this.removeDeadEnemy();

        this.EnemiesUpdate(deltaTime);
        this.checkEnemyShieldCollision();
        this.checkEnemyPlayerCollision()

        // Update, Remove and Check bombs
        this.removeDeadBomb();
        this.updateBombs(deltaTime);
        this.checkBombShieldCollision();
        this.checkBombGroundCollision();
        this.checkBombPlayerCollision();

        this.checkEnemyShip(deltaTime);

        const laserFirePoint = this.player.update(
            this.keyboardInput.getKeysDown(),
            this.keyboardInput.getKeysPressed(),
            this.gameControllers);
        this.checkLaser(deltaTime, laserFirePoint);
        this.checkLaserEnemyCollision(this.player);
        this.checkLaserBombCollision();

        this.drawGame();
    }
    checkGamePause() {
        // Keyboard input
        if (this.keyboardInput.getKeysPressed().includes('KeyP')) {
            if (this.gameState === "playGame") {
                this.gameState = "pauseGame";
                Game.audioPlayer.stopAllLooping();
            } else if (this.gameState === "pauseGame") {
                this.gameState = "playGame";
            }
        }

        // GameController input
        if (this.gameControllers.wasButtonIndexPressed(0, 8)) {
            if (this.gameState === "playGame") {
                this.gameState = "pauseGame";
                Game.audioPlayer.stopAllLooping();
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
        PrimitiveRenderer.drawOverlay(canvasConfig.width, canvasConfig.height, canvasConfig.backgroundColor, 0.53);

        const x1 = canvasConfig.width / 5;
        const y1 = canvasConfig.height - 120 + 35;

        const x2 = canvasConfig.width / 5 - 170;
        const y2 = canvasConfig.height - 40;

        drawPixelText(x1, y1, "Game Paused.", 3.5, "white");
        CanvasSprite.drawSpriteRGB(x2, y2, Game.upauseFrame.layers[0].data, 3.5);
    }

    // Initialize player based on current player index
    resetCurrentPlayer() {
        if (this.enemyShip) {
            this.enemyShip.setIsDead();
        }

        SystemUtils.cleanupArray(this.enemyBombs);
        this.enemyBombs = [];

        this.destroyLaser();

        const currentPlayer = this.currentPlayer - 1;

        this.restorePlayersEnemiesStatic(currentPlayer);

        this.player = this.players[currentPlayer];
        this.gameEnemies = this.playersEnimies[currentPlayer];
        this.gameEnemiesBottom = this.playersEnemiesBottom[currentPlayer];
        this.shields = this.playersShields[currentPlayer];
        this.grounds = this.playersGrounds[currentPlayer];

        this.enemyShip = EnemyShip.getInstance();

        this.player.setPosition(spriteConfig.playerX, spriteConfig.playerY);
        this.player.setSpriteColor(spriteConfig.playerColor);
        this.player.setIsAlive();
    }

    static scoreTextFrame = null;
    static scoreNumbFrame = null;
    static pauseFrame = null;
    static upauseFrame = null;

    static initText() {
        Game.scoreTextFrame = Sprite.getTextRGB("SCORE<1>    MIDWAY    SCORE<2>", Game.redPalette);
        Game.scoreNumbFrame = null;
        Game.pauseFrame = Sprite.getTextRGB("Pause game Keyboard `P` / GameController `Select`", Game.redPalette);
        Game.upauseFrame = Sprite.getTextRGB("Unpause game Keyboard `P` / GameController `Select`", Game.whitePalette);
    }
    static redPalette = {
        custom: [
            { "symbol": "0", "hex": "#00000000", "name": "Transparent" },
            { "symbol": "1", "hex": "#FF0000", "name": "red" },
        ]
    };
    static yellowPalette = {
        custom: [
            { "symbol": "0", "hex": "#00000000", "name": "Transparent" },
            { "symbol": "1", "hex": "#FFFF00", "name": "yellow" },
        ]
    };
    static whitePalette = {
        custom: [
            { "symbol": "0", "hex": "#00000000", "name": "Transparent" },
            { "symbol": "1", "hex": "#FFFFFF", "name": "White" },
        ]
    };

    playGame(deltaTime) {
        this.checkGamePause();

        console.log("play game");

        this.playGameLogic(deltaTime);

        // // Display current player status using Player class properties
        const x = canvasConfig.width / 5 - 170;
        const y = canvasConfig.height - 40;
        CanvasSprite.drawSpriteRGB(x, y, Game.pauseFrame.layers[0].data, 3.5);

        // Simulate losing a life with 'D' key
        if (this.player.isDead()) {
            this.gameState = "player" + this.currentPlayer;

            this.savePlayersEnemiesStatic(this.currentPlayer - 1);

            // Decrease current player's life
            this.player.decrementLives();
            SystemUtils.cleanupArray(this.enemyBombs);
            this.enemyBombs = [];
            console.log(`Player ${this.currentPlayer} lost a life!`);

            // Check if current player is out of lives
            if (this.player.lives <= 0) {
                console.log(`Player ${this.currentPlayer} is out of lives.`);

                // If it's a single-player game, game over
                if (this.playerCount === 1) {
                    console.log("Player 1 is out of lives. Game Over!");
                    this.gameState = "gameOver";
                    this.currentPlayer = 1;
                    return;
                }

                // In multiplayer mode, check if the other player is out of lives
                if (this.playerCount === 2) {
                    // Check if both players are out of lives
                    if (this.players[0].lives <= 0 && this.players[1].lives <= 0) {
                        console.log("Both players are out of lives. Game Over!");
                        this.gameState = "gameOver";
                        this.currentPlayer = 1;
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
                SystemUtils.cleanupArray(this.enemyBombs);
                Enemy.reset();
                Enemy.unsetEnemiesInitialized();
                this.initializeGameShields();
                this.initializeGameGround();
                this.initializeGameEnemy();
            }
        }

        // Easter Egg
        if (this.keyboardInput.getKeysPressed().includes('KeyD')) {
            SystemUtils.cleanupArray(this.enemyBombs);
        }
    }

    resetPlayers() {
        console.log("Resetting Game...");

        this.backToAttractCounter = 0;
        this.playerCount = 1;
        this.currentPlayer = 1;

        if (this.players?.[0]) {
            SystemUtils.destroy(this.players[0]);
        }
        if (this.players?.[1]) {
            SystemUtils.destroy(this.players[1]);
        }

        SystemUtils.cleanupMap(this.playersEnimies[0]);
        SystemUtils.cleanupMap(this.playersEnimies[1]);

        SystemUtils.cleanupArray(this.playersShields[0]);
        SystemUtils.cleanupArray(this.playersShields[1]);

        SystemUtils.cleanupArray(this.playersGrounds[0]);
        SystemUtils.cleanupArray(this.playersGrounds[1]);

        SystemUtils.cleanupArray(this.enemyBombs);
        this.enemyBombs = [];

        this.destroyLaser();

        Enemy.reset();
        Enemy.unsetEnemiesInitialized();

        this.players = [new Player(), new Player()];
        this.player = this.players[0];

        this.playersEnimies = [new Map(), new Map()];
        this.gameEnemies = this.playersEnimies[0];

        this.playersEnemiesBottom = [
            new Array(enemyConfig.colSize).fill(null),
            new Array(enemyConfig.colSize).fill(null)
        ];
        this.gameEnemiesBottom = this.playersEnemiesBottom[0];

        this.playersShields = [[], []];
        this.shields = this.playersShields[0];

        this.playersGrounds = [[], []];
        this.grounds = this.playersGrounds[0];

        this.playersEnemiesStatic = [[], []];
        this.savePlayersEnemiesStatic(0);
        this.savePlayersEnemiesStatic(1);

        this.enemyShip = EnemyShip.getInstance();
        this.enemyShip.setIsDead();

        this.attractMode.reset();
        this.gameState = "attract";
    }

destroyLaser() {
    if (!this.laser) {
        return;
    }

    const laser = this.laser;
    this.laser = null;

    if (
        laser.ID === null ||
        laser.x === null ||
        laser.y === null ||
        laser.width === null ||
        laser.height === null ||
        laser.isDestroyed === true
    ) {
        return;
    }

    if (typeof laser.destroy === "function") {
        try {
            laser.destroy();
        } catch (error) {
            console.warn("Laser destroy failed, clearing reference anyway.", laser, error);
        }
    }
}

}

export default Game;

const game = new Game();


