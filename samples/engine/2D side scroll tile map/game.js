// ToolboxAid.com
// David Quesenberry

// 10/16/2024
// game.js - 2D side scroll tile map sample

import { canvasConfig, performanceConfig, fullscreenConfig } from './global.js';

import GameBase from '../../../engine/core/gameBase.js';
import KeyboardInput from '../../../engine/input/keyboard.js';
import GameControllers from '../../../engine/input/controller/gameControllers.js';

import GameAttract from './gameAttract.js';
import {
  displayAttractMode,
  displayPlayerSelect,
  displayGameOver,
  initGame,
  initializeEnemyIfNeeded,
  pauseGame,
  playGame
} from './sideScrollStateHandlers.js';

class Game extends GameBase {
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
  }

  async onInitialize() {
    this.keyboardInput = new KeyboardInput();
    this.gameControllers = new GameControllers();

    this.resetRuntimeState();
    this.gameAttract = new GameAttract();
    this.stateHandlers = {
      [Game.STATES.ATTRACT]: (deltaTime) => displayAttractMode(this, deltaTime),
      [Game.STATES.PLAYER_SELECT]: () => displayPlayerSelect(this),
      [Game.STATES.INIT_GAME]: () => initGame(this),
      [Game.STATES.INIT_ENEMY]: () => initializeEnemyIfNeeded(this),
      [Game.STATES.PLAY_GAME]: () => playGame(this),
      [Game.STATES.PAUSE_GAME]: () => pauseGame(this),
      [Game.STATES.GAME_OVER]: () => displayGameOver(this)
    };
  }

  resetRuntimeState() {
    this.gameState = Game.STATES.ATTRACT;
    this.playerCount = 1;
    this.currentPlayer = 0;
    this.playerLives = null;
    this.score = null;
    this.gameInitialized = false;
    this.enemyInitialized = false;
    this.onetime = true;
    this.backToAttract = 600;
    this.backToAttractCounter = 0;
  }

  gameLoop(deltaTime) {
    this.keyboardInput.update();
    this.gameControllers?.update();
    this.stateHandlers[this.gameState]?.(deltaTime);
  }

}

export default Game;

const game = new Game();


