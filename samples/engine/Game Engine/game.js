// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// game.js

import DebugFlag from '../../../engine/utils/debugFlag.js';
import DebugLog from '../../../engine/utils/debugLog.js';
import { canvasConfig, performanceConfig, fullscreenConfig, playerSelect } from './global.js';
import GameBase from '../../../engine/core/gameBase.js';
import KeyboardInput from '../../../engine/input/keyboard.js';
import {
    displayAttractMode,
    displayGameOver,
    displayPlayerSelect,
    initGame,
    initializeEnemy,
    pauseGame,
    playGame,
    resetGame
} from './gameStates.js';

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
                displayAttractMode(this);
                break;
            case Game.STATES.PLAYER_SELECT:
                displayPlayerSelect(this);
                break;
            case Game.STATES.INIT_GAME:
                initGame(this);
                break;
            case Game.STATES.INIT_ENEMY:
                if (!this.enemyInitialized) {
                    initializeEnemy(this);
                }
                break;
            case Game.STATES.PLAY_GAME:
                playGame(this);
                break;
            case Game.STATES.PAUSE_GAME:
                pauseGame(this);
                break;
            case Game.STATES.GAME_OVER:
                displayGameOver(this);
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

    onDestroy() {
        this.resetRuntimeState();
        this.keyboardInput = null;
    }
}

export default Game;
const game = new Game();
