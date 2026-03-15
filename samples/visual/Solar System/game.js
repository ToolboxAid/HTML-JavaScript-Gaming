// ToolboxAid.com
// David Quesenberry
// game.js
// 10/16/2024

import {
  canvasConfig,
  performanceConfig,
  fullscreenConfig,
  solarSystemConfig
} from './global.js';
import { solarSystemBodies } from './solarSystemData.js';
import GameBase from '../../../engine/core/gameBase.js';
import KeyboardInput from '../../../engine/input/keyboard.js';
import {
  applyInitialSimulationState,
  destroySimulationWorld,
  initializeSimulationWorld,
  resetGameObjectSystem
} from './solarSystemRuntime.js';
import { createStateHandlers } from './solarSystemStateHandlers.js';

class Game extends GameBase {
  constructor() {
    super(canvasConfig, performanceConfig, fullscreenConfig);
    this.keyboardInput = null;
    this.gameObjectSystem = null;
    applyInitialSimulationState(this);
    this.isAnyKeyPressed = (keyCodes) => keyCodes.some((code) => this.keyboardInput.isKeyPressed(code));
    this.resetBodies = () => resetGameObjectSystem(this.gameObjectSystem, solarSystemBodies);
    this.stateHandlers = createStateHandlers(this);
  }

  async onInitialize() {
    this.keyboardInput = new KeyboardInput();
    initializeSimulationWorld(this, solarSystemBodies);
  }

  gameLoop(deltaTime) {
    this.keyboardInput.update();

    const handler = this.stateHandlers[this.gameState];
    if (typeof handler === 'function') {
      handler(deltaTime);
      return;
    }

    this.gameState = solarSystemConfig.states.attract;
    this.stateHandlers[this.gameState]();
  }

  onDestroy() {
    destroySimulationWorld(this);
  }
}

export default Game;
const game = new Game();
