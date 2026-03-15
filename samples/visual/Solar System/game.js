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
import GameObjectSystem from '../../../engine/game/gameObjectSystem.js';
import KeyboardInput from '../../../engine/input/keyboard.js';
import {
  applyInitialSimulationState,
  destroyGameObjectSystem,
  resetGameObjectSystem,
  updateAttractGameState,
  updatePausedGameState,
  updateSimulationGameState
} from './solarSystemRuntime.js';
import {
  renderAttractScreen,
  renderPausedScreen,
  renderSimulationScreen
} from './solarSystemHud.js';

class Game extends GameBase {
  constructor() {
    super(canvasConfig, performanceConfig, fullscreenConfig);
    this.keyboardInput = null;
    this.gameObjectSystem = null;
    applyInitialSimulationState(this);
    this.isAnyKeyPressed = (keyCodes) => keyCodes.some((code) => this.keyboardInput.isKeyPressed(code));
    this.resetBodies = () => resetGameObjectSystem(this.gameObjectSystem, solarSystemBodies);
    this.stateHandlers = {
      [solarSystemConfig.states.attract]: () => {
        updateAttractGameState(this, this.isAnyKeyPressed);
        renderAttractScreen(this.gameObjectSystem, this.focusIndex, this.zoom, this.showOrbits, this.showLabels);
      },
      [solarSystemConfig.states.simulation]: (deltaTime) => {
        updateSimulationGameState(
          this,
          this.isAnyKeyPressed,
          this.resetBodies,
          deltaTime
        );
        renderSimulationScreen(
          this.gameObjectSystem,
          this.simulationSpeed,
          this.focusIndex,
          this.zoom,
          this.showOrbits,
          this.showLabels
        );
      },
      [solarSystemConfig.states.paused]: () => {
        updatePausedGameState(this, this.isAnyKeyPressed, this.resetBodies);
        renderPausedScreen(this.gameObjectSystem, this.focusIndex, this.zoom, this.showOrbits, this.showLabels);
      }
    };
  }

  async onInitialize(runtimeContext = this.runtimeContext) {
    this.runtimeContext = runtimeContext;
    this.keyboardInput = new KeyboardInput();
    this.gameObjectSystem = new GameObjectSystem(false);
    applyInitialSimulationState(this);
    this.resetBodies();
  }

  gameLoop(deltaTime, runtimeContext = this.runtimeContext) {
    this.runtimeContext = runtimeContext;
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
    destroyGameObjectSystem(this.gameObjectSystem);
    this.gameObjectSystem = null;
    this.focusIndex = -1;
  }
}

export default Game;
const game = new Game();
