// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// game.js

import DebugFlag from '../../../engine/utils/debugFlag.js';
import DebugLog from '../../../engine/utils/debugLog.js';
import { canvasConfig, performanceConfig, fullscreenConfig, playerSelect } from './global.js';
import GameBase from '../../../engine/core/gameBase.js';
import CanvasUtils from '../../../engine/core/canvas.js';
import GameUtils from '../../../engine/game/gameUtils.js';
import KeyboardInput from '../../../engine/input/keyboard.js';

class Game extends GameBase {
    // Enable debug mode: game.html?game
    static DEBUG = DebugFlag.has('game');
    static STATES = Object.freeze({
        ATTRACT: 'attract',
        PLAYER_SELECT: 'playerSelect',
        INIT_GAME: 'initGame',
        INIT_ENEMY: 'initEnemy',
        PLAY_GAME: 'playGame',
        PAUSE_GAME: 'pauseGame',
        GAME_OVER: 'gameOver'
    });

    constructor() {
        super(canvasConfig, performanceConfig, fullscreenConfig);
        this.playerSelect = playerSelect;
        this.keyboardInput = null;
        this.gameState = Game.STATES.ATTRACT;
        this.lastLoggedState = null;
        this.playerCount = 1;
        this.currentPlayer = 0;
        this.playerLives = [];
        this.score = [];
        this.gameInitialized = false;
        this.enemyInitialized = false;
        this.backToAttractFrames = 600;
        this.backToAttractCounter = 0;
    }

    async onInitialize() {
        this.keyboardInput = new KeyboardInput();
        this.resetRuntimeState();
        DebugLog.info(Game.DEBUG, 'Game', 'Sample initialized');
    }

    resetRuntimeState() {
        this.gameState = Game.STATES.ATTRACT;
        this.lastLoggedState = null;
        this.playerCount = 1;
        this.currentPlayer = 0;
        this.playerLives = [3, 3, 3, 3];
        this.score = [0, 0, 0, 0];
        this.gameInitialized = false;
        this.enemyInitialized = false;
        this.backToAttractCounter = 0;
    }

    gameLoop() {
        this.keyboardInput.update();
        this.logStateIfChanged();

        switch (this.gameState) {
            case Game.STATES.ATTRACT:
                this.displayAttractMode();
                break;
            case Game.STATES.PLAYER_SELECT:
                this.displayPlayerSelect();
                break;
            case Game.STATES.INIT_GAME:
                this.initGame();
                break;
            case Game.STATES.INIT_ENEMY:
                if (!this.enemyInitialized) {
                    this.initializeEnemy();
                }
                break;
            case Game.STATES.PLAY_GAME:
                this.playGame();
                break;
            case Game.STATES.PAUSE_GAME:
                this.pauseGame();
                break;
            case Game.STATES.GAME_OVER:
                this.displayGameOver();
                break;
            default:
                this.gameState = Game.STATES.ATTRACT;
                break;
        }
    }

    logStateIfChanged() {
        if (this.gameState === this.lastLoggedState) {
            return;
        }

        this.lastLoggedState = this.gameState;
        DebugLog.log(Game.DEBUG, 'Game', `State: ${this.gameState}`);
    }

    displayAttractMode() {
        CanvasUtils.ctx.fillStyle = 'white';
        CanvasUtils.ctx.font = '30px Arial';
        CanvasUtils.ctx.fillText('Welcome to the Game!', 250, 200);
        CanvasUtils.ctx.fillText('Press `Enter` to Start', 250, 300);

        if (this.isStartPressed()) {
            this.gameState = Game.STATES.PLAYER_SELECT;
        }
    }

    displayPlayerSelect() {
        const gameController = null;
        const result = GameUtils.selectNumberOfPlayers(
            CanvasUtils.ctx,
            canvasConfig,
            this.playerSelect,
            this.keyboardInput,
            gameController
        );

        if (result) {
            this.playerCount = Number.isInteger(result.playerCount) ? result.playerCount : 1;
            this.playerLives = Array.isArray(result.playerLives) ? result.playerLives : [3, 3, 3, 3];
            this.gameState = Game.STATES.INIT_GAME;
        }
    }

    displayGameOver() {
        CanvasUtils.ctx.fillStyle = 'red';
        CanvasUtils.ctx.font = '30px Arial';
        CanvasUtils.ctx.fillText('Game Over', 300, 200);
        CanvasUtils.ctx.fillText('Press `Enter` to Restart', 250, 300);

        if (this.isStartPressed() ||
            this.backToAttractCounter++ > this.backToAttractFrames) {
            this.resetGame();
        }
    }

    initGame() {
        this.gameInitialized = true;
        this.score = [0, 0, 0, 0];
        this.currentPlayer = 0;
        this.gameState = Game.STATES.INIT_ENEMY;
    }

    initializeEnemy() {
        DebugLog.log(Game.DEBUG, 'Game', 'Initializing enemy');
        this.enemyInitialized = true;
        this.gameState = Game.STATES.PLAY_GAME;
    }

    gamePauseCheck() {
        if (this.keyboardInput.getKeysPressed().includes('KeyP')) {
            this.gameState = this.gameState === Game.STATES.PLAY_GAME ? Game.STATES.PAUSE_GAME : Game.STATES.PLAY_GAME;
        }
    }

    pauseGame() {
        this.gamePauseCheck();
        CanvasUtils.drawText(150, 200, 'Game Paused.', 3.5, 'white');
        CanvasUtils.drawText(150, 250, 'Press `P` to unpause game', 3.5, 'white');
    }

    playGame() {
        this.gamePauseCheck();

        const playerInfo = `Player ${this.currentPlayer + 1} - Lives: ${this.playerLives[this.currentPlayer]} - Score: ${this.score[this.currentPlayer]}`;
        CanvasUtils.drawText(100, 200, playerInfo, 3.5, 'white');
        CanvasUtils.drawText(100, 250, 'Press `D` for player death', 3.5, 'white');
        CanvasUtils.drawText(100, 300, 'Press `S` for score', 3.5, 'white');
        CanvasUtils.drawText(100, 350, 'Press `P` to pause game', 3.5, 'white');

        if (this.keyboardInput.getKeysPressed().includes('KeyS')) {
            this.score[this.currentPlayer] += 100;
        }

        if (this.keyboardInput.getKeysPressed().includes('KeyD')) {
            const result = GameUtils.swapPlayer(
                this.playerLives,
                this.currentPlayer,
                this.playerCount,
                (newState) => {
                    this.gameState = newState;
                }
            );

            this.currentPlayer = result.updatedPlayer;
            this.playerLives = result.updatedLives;
        }
    }

    resetGame() {
        this.gameState = Game.STATES.ATTRACT;
        this.gameInitialized = false;
        this.enemyInitialized = false;
        this.backToAttractCounter = 0;
    }

    isStartPressed() {
        const keysPressed = this.keyboardInput.getKeysPressed();
        return keysPressed.includes('Enter') || keysPressed.includes('NumpadEnter');
    }

    onDestroy() {
        this.resetRuntimeState();
        this.keyboardInput = null;
    }
}

export default Game;
const game = new Game();
