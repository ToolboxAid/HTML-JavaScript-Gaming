// ToolboxAid.com
// David Quesenberry
// 03/15/2026
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
        this.backToAttractFrames = 600;
        this.stateHandlers = {
            [Game.STATES.ATTRACT]: () => displayAttractMode(this),
            [Game.STATES.PLAYER_SELECT]: () => displayPlayerSelect(this),
            [Game.STATES.INIT_GAME]: () => initGame(this),
            [Game.STATES.INIT_ENEMY]: () => this.runInitEnemy(),
            [Game.STATES.PLAY_GAME]: () => playGame(this),
            [Game.STATES.PAUSE_GAME]: () => pauseGame(this),
            [Game.STATES.GAME_OVER]: () => displayGameOver(this)
        };
        this.applyRuntimeState(this.createRuntimeState());
    }

    async onInitialize() {
        this.keyboardInput = new KeyboardInput();
        this.resetRuntimeState();
        DebugLog.info(Game.DEBUG, 'Game', 'Sample initialized');
    }

    resetRuntimeState() {
        const playerSlots = Math.max(1, this.playerSelect.maxPlayers);
        this.applyRuntimeState(this.createRuntimeState(playerSlots));
    }

    gameLoop() {
        this.keyboardInput.update();
        this.logStateIfChanged();
        this.runStateHandler();
    }

    logStateIfChanged() {
        if (this.gameState === this.lastLoggedState) {
            return;
        }

        this.lastLoggedState = this.gameState;
        DebugLog.log(Game.DEBUG, 'Game', `State: ${this.gameState}`);
    }

    runInitEnemy() {
        if (!this.enemyInitialized) {
            initializeEnemy(this);
        }
    }

    createRuntimeState(playerSlots = Math.max(1, this.playerSelect.maxPlayers)) {
        return {
            gameState: Game.STATES.ATTRACT,
            lastLoggedState: null,
            playerCount: 1,
            currentPlayer: 0,
            playerLives: Array(playerSlots).fill(this.playerSelect.lives),
            score: Array(playerSlots).fill(0),
            gameInitialized: false,
            enemyInitialized: false,
            backToAttractCounter: 0
        };
    }

    applyRuntimeState(state) {
        Object.assign(this, state);
    }

    runStateHandler() {
        const handler = this.stateHandlers[this.gameState];
        if (typeof handler === 'function') {
            handler();
            return;
        }

        this.gameState = Game.STATES.ATTRACT;
    }

    onDestroy() {
        this.resetRuntimeState();
    }
}

export default Game;
const game = new Game();
