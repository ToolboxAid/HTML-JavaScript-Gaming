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
import { runTests } from '../../../engine/runTest.js';
import { engineTestEntries } from '../../../tests/engine/testManifest.js';

const shouldRunSampleTests = DebugFlag.has('runTests');

async function runSampleEngineTests() {
    for (const entry of engineTestEntries) {
        const testModule = await import(`../../../tests/engine/${entry.modulePath.slice(2)}`);
        runTests(entry.name, testModule[entry.exportName]);
    }
}

if (shouldRunSampleTests) {
    runSampleEngineTests();
}

class Game extends GameBase {
    // Enable debug mode: game.html?game
    static DEBUG = DebugFlag.has('game');

    constructor() {
        super(canvasConfig, performanceConfig, fullscreenConfig);
        this.playerSelect = playerSelect;
        this.keyboardInput = null;
        this.gameState = 'attract';
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
        this.gameState = 'attract';
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
            case 'attract':
                this.displayAttractMode();
                break;
            case 'playerSelect':
                this.displayPlayerSelect();
                break;
            case 'initGame':
                this.initGame();
                break;
            case 'initEnemy':
                if (!this.enemyInitialized) {
                    this.initializeEnemy();
                }
                break;
            case 'playGame':
                this.playGame();
                break;
            case 'pauseGame':
                this.pauseGame();
                break;
            case 'gameOver':
                this.displayGameOver();
                break;
            default:
                this.gameState = 'attract';
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

        if (this.keyboardInput.getKeysPressed().includes('Enter') ||
            this.keyboardInput.getKeysPressed().includes('NumpadEnter')) {
            this.gameState = 'playerSelect';
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
            this.gameState = 'initGame';
        }
    }

    displayGameOver() {
        CanvasUtils.ctx.fillStyle = 'red';
        CanvasUtils.ctx.font = '30px Arial';
        CanvasUtils.ctx.fillText('Game Over', 300, 200);
        CanvasUtils.ctx.fillText('Press `Enter` to Restart', 250, 300);

        if (this.keyboardInput.getKeysPressed().includes('Enter') ||
            this.keyboardInput.getKeysPressed().includes('NumpadEnter') ||
            this.backToAttractCounter++ > this.backToAttractFrames) {
            this.resetGame();
        }
    }

    initGame() {
        this.gameInitialized = true;
        this.score = [0, 0, 0, 0];
        this.currentPlayer = 0;
        this.gameState = 'initEnemy';
    }

    initializeEnemy() {
        DebugLog.log(Game.DEBUG, 'Game', 'Initializing enemy');
        this.enemyInitialized = true;
        this.gameState = 'playGame';
    }

    gamePauseCheck() {
        if (this.keyboardInput.getKeysPressed().includes('KeyP')) {
            this.gameState = this.gameState === 'playGame' ? 'pauseGame' : 'playGame';
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
        this.gameState = 'attract';
        this.gameInitialized = false;
        this.enemyInitialized = false;
        this.backToAttractCounter = 0;
    }

    onDestroy() {
        this.resetRuntimeState();
        this.keyboardInput = null;
    }
}

export default Game;
const game = new Game();
