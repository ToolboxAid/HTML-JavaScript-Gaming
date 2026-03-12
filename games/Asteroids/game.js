// ToolboxAid.com
// David Quesenberry
// 11/15/2024
// game.js - asteroids

import { canvasConfig, performanceConfig, fullscreenConfig, playerSelect } from './global.js';
import GameBase from '../../engine/gameBase.js';

import CanvasUtils from '../../engine/canvas.js';
import KeyboardInput from '../../engine/input/keyboard.js';
import GameUtils from '../../engine/game/gameUtils.js';

import GameAttract from './gameAttract.js';
import AsteroidsHud from './asteroidsHud.js';
import AsteroidsSession from './asteroidsSession.js';

import AudioPlayer from '../../engine/output/audioPlayer.js';
import Cookies from '../../engine/misc/cookies.js';

class Game extends GameBase {
    static gameAttract = null;

    // Enable debug mode: game.html?game
    static DEBUG = new URLSearchParams(window.location.search).has('game');

    static audioPlayer = new AudioPlayer('./assets/effects');

    // List of audio files to be loaded
    static audioFiles = [
        'bangLarge.wav',
        'bangMedium.wav',
        'bangSmall.wav',
        'beat1.wav',
        'beat2.wav',
        'extraShip.wav',
        'fire.wav',
        'saucerBig.wav',
        'saucerSmall.wav',
        'thrust.wav',
    ];

    static FLASH_INTERVAL = 200;
    static FLASH_DURATION = 3000;

    constructor() {
        super(canvasConfig, performanceConfig, fullscreenConfig);

        const currentDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));

        this.cookieName = Cookies.sanitizeCookieName(currentDir);
        this.cookiePath = '/';
        this.getHighScoreCookie();
    }

    async onInitialize() {
        console.log('onInit');

        this.keyboardInput = new KeyboardInput();

        this.session = null;
        this.playerCount = 0;
        this.selectedPlayerLives = null;

        this.gameState = 'initAttract';

        this.backToAttract = 180;
        this.backToAttractCounter = 0;

        this.flashStartTime = null;
        this.flashOff = false;

        await AudioPlayer.loadAllAudioFiles(Game.audioFiles, Game.audioPlayer);

        if (Game.DEBUG) {
            console.log('All audio files have been loaded and cached.');
        }
    }

    gameLoop(deltaTime) {
        if (Game.DEBUG) {
            console.log(`this.gameState: '${this.gameState}'`);
        }

        this.keyboardInput.update();

        this.updateCurrentState(deltaTime);
        this.drawCurrentState(deltaTime);
    }

    updateCurrentState(deltaTime) {
        switch (this.gameState) {
            case 'initAttract':
                Game.gameAttract = new GameAttract();
                this.gameState = 'attract';
                break;

            case 'attract':
                this.updateAttract(deltaTime);
                break;

            case 'playerSelect':
                this.updatePlayerSelect(deltaTime);
                break;

            case 'initGame':
                this.initGame();
                break;

            case 'flashScore':
                this.updateFlashScore(deltaTime);
                break;

            case 'safeSpawn':
                this.updateSafeSpawn(deltaTime);
                break;

            case 'playGame':
                this.updatePlayGame(deltaTime);
                break;

            case 'pauseGame':
                this.updatePauseGame(deltaTime);
                break;

            case 'gameOver':
                this.updateGameOver(deltaTime);
                break;
        }
    }

    drawCurrentState(deltaTime) {
        switch (this.gameState) {
            case 'attract':
                this.drawAttract(deltaTime);
                break;

            case 'playerSelect':
                this.drawPlayerSelect(deltaTime);
                break;

            case 'flashScore':
                this.drawFlashScore();
                break;

            case 'safeSpawn':
                this.drawSafeSpawn();
                break;

            case 'playGame':
                this.drawPlayGame();
                break;

            case 'pauseGame':
                this.drawPauseGame();
                break;

            case 'gameOver':
                this.drawGameOver();
                break;
        }
    }

    updateAttract(deltaTime) {
        Game.gameAttract.update(deltaTime);

        if (this.keyboardInput.getkeysPressed().includes('Enter')) {
            this.gameState = 'playerSelect';
        }
    }

    drawAttract(deltaTime) {
        Game.gameAttract.draw();
    }

    updatePlayerSelect(deltaTime) {
        Game.gameAttract.update(deltaTime);

        const result = GameUtils.selectNumberOfPlayers(
            CanvasUtils.ctx,
            canvasConfig,
            playerSelect,
            this.keyboardInput
        );

        if (result) {
            this.playerCount = result.playerCount;
            this.selectedPlayerLives = result.playerLives;
            this.gameState = 'initGame';
        }
    }

    drawPlayerSelect(deltaTime) {
        Game.gameAttract.draw(false);
    }

    initGame() {
        this.session = new AsteroidsSession(Game.audioPlayer);
        this.session.initialize(this.playerCount, this.selectedPlayerLives);

        this.gameState = 'flashScore';
    }

    drawLivesScores() {
        AsteroidsHud.draw(this.session, this.highScore, this.flashOff, Game.DEBUG);
    }

    updateFlashScore() {
        if (!this.flashStartTime) {
            this.flashStartTime = Date.now();
            this.flashOff = false;
            console.log('Flash Started:', { startTime: this.flashStartTime });
        }

        const elapsedTime = Date.now() - this.flashStartTime;
        this.flashOff = Math.floor(elapsedTime / Game.FLASH_INTERVAL) % 2 === 0;

        if (elapsedTime >= Game.FLASH_DURATION) {
            console.log('Flash Complete');
            this.flashStartTime = null;
            this.flashOff = false;
            this.gameState = 'safeSpawn';
        }
    }

    drawFlashScore() {
        this.drawLivesScores();
    }

    updateSafeSpawn(deltaTime) {
        const ship = this.session.getCurrentShip();
        const world = this.session.getCurrentWorld();
        world.stepForSpawn(deltaTime, ship);
        const safe = world.isSafeSpawn(ship);
        if (safe) {
            this.gameState = 'playGame';
        }
    }

    drawSafeSpawn() {
        this.session.getCurrentWorld().drawSafeSpawn();
        this.drawLivesScores();
    }

    getHighScoreCookie(initScore = 0) {
        let cookie = Cookies.get(this.cookieName, { path: this.cookiePath });
        console.log('Retrieved cookie:', cookie);

        if (cookie === null) {
            this.setHighScoreCookie(initScore);

            cookie = Cookies.get(this.cookieName, { path: this.cookiePath });
            if (cookie === null) {
                console.error('Failed to set the cookie!', this.cookieName, this.cookiePath);
            } else {
                console.log('Set new cookie:', cookie);
            }
        } else {
            console.log('Cookie found:', cookie);
        }

        if (cookie !== null) {
            this.highScore = parseInt(cookie, 10);
            if (isNaN(this.highScore)) {
                console.error('Error: Cookie value is not a valid number');
                this.highScore = 0;
            } else {
                console.log('Parsed high score:', this.highScore);
            }
        } else {
            this.highScore = 0;
        }
    }

    setHighScoreCookie(score) {
        if (score > this.highScore) {
            this.highScore = score;
            Cookies.set(this.cookieName, score, {
                expires: 7,
                path: this.cookiePath
            });
            console.log(`Cookie set: ${this.cookieName}=${score}`);
        }
    }

    updatePlayGame(deltaTime) {
        this.gamePauseCheck();

        const ship = this.session.getCurrentShip();
        const world = this.session.getCurrentWorld();

        ship.update(deltaTime, this.keyboardInput);
        world.step(deltaTime, ship, this.keyboardInput);

        if (ship.isDying() && world.canFinalizeActorDeath()) {
            if (Game.DEBUG) {
                console.log('Ship death confirmed - UFO destroyed');
            }

            ship.setShipDead();
        }

        const score = this.session.addCurrentPlayerScore(world.consumeScore());
        this.setHighScoreCookie(score);

        if (this.session.handleCurrentPlayerDeath((newState) => { this.gameState = newState; })) {
            if (this.gameState === 'playGame') {
                this.gameState = 'flashScore';
            }
        }
    }

    drawPlayGame() {
        this.session.getCurrentShip().draw();
        this.session.getCurrentWorld().draw();
        this.drawLivesScores();
    }

    updatePauseGame(deltaTime) {
        this.gamePauseCheck();
    }

    drawPauseGame() {
        this.session.getCurrentShip().draw();
        this.session.getCurrentWorld().draw();
        CanvasUtils.drawText(150, 200, 'Game Paused.', 3.5, 'white');
        CanvasUtils.drawText(150, 250, 'Press `P` to unpause game', 3.5, 'white');
    }

    gamePauseCheck() {
        if (this.keyboardInput.getkeysPressed().includes('KeyP')) {
            this.gameState = this.gameState === 'playGame' ? 'pauseGame' : 'playGame';
        }
    }

    updateGameOver(deltaTime) {
        if (
            this.keyboardInput.getkeysPressed().includes('Enter') ||
            this.backToAttractCounter++ > this.backToAttract
        ) {
            this.resetGame();
        }
    }

    drawGameOver() {
        const ctx = CanvasUtils.ctx;

        ctx.fillStyle = 'white';
        ctx.textAlign = 'left';
        ctx.font = '20px "Vector Battle"';

        const xOffset = CanvasUtils.getConfigWidth() / 2 - 200;

        ctx.fillText('Game Over', xOffset + 110, 250);
        ctx.fillText('Press `Enter` to Restart', xOffset, 300);
    }

    resetGame() {
        this.gameState = 'initAttract';
        this.backToAttractCounter = 0;
    }
}

export default Game;

const game = new Game();
