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
  createInitialSimulationState,
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
    Object.assign(this, createInitialSimulationState());
    this.stateHandlers = {
      [solarSystemConfig.states.attract]: (deltaTime) => this.runAttractState(deltaTime),
      [solarSystemConfig.states.simulation]: (deltaTime) => this.runSimulationState(deltaTime),
      [solarSystemConfig.states.paused]: () => this.runPausedState()
    };
    this.isAnyKeyPressed = (keyCodes) => keyCodes.some((code) => this.keyboardInput.isKeyPressed(code));
    this.resetBodies = () => this.resetSimulation();
  }

  async onInitialize(runtimeContext = this.runtimeContext) {
    this.runtimeContext = runtimeContext;
    this.keyboardInput = new KeyboardInput();
    this.gameObjectSystem = new GameObjectSystem(false);
    this.resetRuntimeState();
  }

  resetRuntimeState() {
    Object.assign(this, createInitialSimulationState());
    this.resetSimulation();
  }

  resetSimulation() {
    resetGameObjectSystem(this.gameObjectSystem, solarSystemBodies);
  }

  runAttractState() {
    updateAttractGameState(this, this.isAnyKeyPressed);
    renderAttractScreen(this.gameObjectSystem, this.focusIndex, this.zoom, this.showOrbits, this.showLabels);
  }

  runSimulationState(deltaTime) {
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
  }

  runPausedState() {
    updatePausedGameState(this, this.isAnyKeyPressed, this.resetBodies);
    renderPausedScreen(this.gameObjectSystem, this.focusIndex, this.zoom, this.showOrbits, this.showLabels);
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
    this.runAttractState();
  }

  onDestroy() {
    destroyGameObjectSystem(this.gameObjectSystem);
    this.gameObjectSystem = null;
    this.focusIndex = -1;
  }
}

export default Game;
const game = new Game();
