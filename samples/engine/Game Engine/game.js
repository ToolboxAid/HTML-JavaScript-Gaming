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
        this.stateHandlers = {
            [Game.STATES.ATTRACT]: () => displayAttractMode(this),
            [Game.STATES.PLAYER_SELECT]: () => displayPlayerSelect(this),
            [Game.STATES.INIT_GAME]: () => initGame(this),
            [Game.STATES.INIT_ENEMY]: () => { if (!this.enemyInitialized) { initializeEnemy(this); }},
            [Game.STATES.PLAY_GAME]: () => playGame(this),
            [Game.STATES.PAUSE_GAME]: () => pauseGame(this),
            [Game.STATES.GAME_OVER]: () => displayGameOver(this)
        };
    }

    async onInitialize() {
        this.keyboardInput = new KeyboardInput();
        this.resetRuntimeState();
        DebugLog.info(Game.DEBUG, 'Game', 'Sample initialized');
    }

    resetRuntimeState() {
        const playerSlots = Math.max(1, this.playerSelect.maxPlayers);
        this.gameState = Game.STATES.ATTRACT;
        this.lastLoggedState = null;
        this.playerCount = 1;
        this.currentPlayer = 0;
        this.playerLives = Array(playerSlots).fill(this.playerSelect.lives);
        this.score = Array(playerSlots).fill(0);
        this.gameInitialized = false;
        this.enemyInitialized = false;
        this.backToAttractCounter = 0;
    }

    gameLoop() {
        this.keyboardInput.update();
        this.logStateIfChanged();

        const handler = this.stateHandlers[this.gameState];
        if (typeof handler === 'function') {
            handler();
            return;
        }

        this.gameState = Game.STATES.ATTRACT;
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
    }
}

export default Game;
const game = new Game();
