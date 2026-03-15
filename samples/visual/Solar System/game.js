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
  getFocusedBody,
  getFocusLabel,
  populateGameObjectSystem,
  renderBodies,
  updateAttractGameState,
  updatePausedGameState,
  updateSimulationGameState
} from './solarSystemRuntime.js';
import {
  renderAttractHud,
  renderPausedHud,
  renderSimulationHud
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
    if (this.gameObjectSystem) {
      this.gameObjectSystem.clear();
    }

    populateGameObjectSystem(this.gameObjectSystem, solarSystemBodies);
  }

  getActiveBodies() {
    return this.gameObjectSystem?.getActiveGameObjects() ?? [];
  }

  wasAnyKeyPressed(keyCodes = []) {
    return keyCodes.some((code) => this.keyboardInput.isKeyPressed(code));
  }

  updateInput() {
    this.keyboardInput.update();
  }

  runAttractState() {
    updateAttractGameState(this, (keyCodes) => this.wasAnyKeyPressed(keyCodes));
    renderBodies(this.getActiveBodies(), this.focusIndex, this.zoom, this.showOrbits, this.showLabels);
    renderAttractHud();
  }

  runSimulationState(deltaTime) {
    updateSimulationGameState(
      this,
      (keyCodes) => this.wasAnyKeyPressed(keyCodes),
      () => this.resetSimulation(),
      deltaTime
    );
    renderBodies(this.getActiveBodies(), this.focusIndex, this.zoom, this.showOrbits, this.showLabels);
    renderSimulationHud(
      this.simulationSpeed,
      getFocusLabel(getFocusedBody(this.getActiveBodies(), this.focusIndex)),
      this.zoom,
      this.showOrbits,
      this.showLabels
    );
  }

  runPausedState() {
    updatePausedGameState(this, (keyCodes) => this.wasAnyKeyPressed(keyCodes), () => this.resetSimulation());
    renderBodies(this.getActiveBodies(), this.focusIndex, this.zoom, this.showOrbits, this.showLabels);
    renderPausedHud();
  }

  gameLoop(deltaTime, runtimeContext = this.runtimeContext) {
    this.runtimeContext = runtimeContext;
    this.updateInput();

    const handler = this.stateHandlers[this.gameState];
    if (typeof handler === 'function') {
      handler(deltaTime);
      return;
    }

    this.gameState = solarSystemConfig.states.attract;
    this.runAttractState();
  }

  onDestroy() {
    if (this.gameObjectSystem?.destroy) {
      this.gameObjectSystem.destroy();
    }

    this.gameObjectSystem = null;
    this.focusIndex = -1;
  }
}

export default Game;
const game = new Game();
