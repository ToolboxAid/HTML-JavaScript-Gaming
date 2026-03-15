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
  createCelestialBodies,
  getFocusedBody,
  getFocusLabel,
  getRenderOptions,
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

    const celestialBodies = createCelestialBodies(solarSystemBodies);
    celestialBodies.forEach((body) => {
      this.gameObjectSystem.addGameObject(body);
    });
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

  isAnyKeyPressed(keyCodes = []) {
    return this.wasAnyKeyPressed(keyCodes);
  }

  getFocusedBody() {
    return getFocusedBody(this.getActiveBodies(), this.focusIndex);
  }

  getRenderOptions() {
    return getRenderOptions(this.getFocusedBody(), this.zoom, this.showOrbits, this.showLabels);
  }

  getFocusLabel() {
    return getFocusLabel(this.getFocusedBody());
  }

  updateAttractState() {
    updateAttractGameState(this, (keyCodes) => this.isAnyKeyPressed(keyCodes));
  }

  updateSimulationState(deltaTime) {
    updateSimulationGameState(
      this,
      (keyCodes) => this.isAnyKeyPressed(keyCodes),
      () => this.resetSimulation(),
      deltaTime
    );
  }

  updatePausedState() {
    updatePausedGameState(this, (keyCodes) => this.isAnyKeyPressed(keyCodes), () => this.resetSimulation());
  }

  renderSimulation() {
    const renderOptions = this.getRenderOptions();
    this.getActiveBodies().forEach(body => {
      body.draw(renderOptions);
    });
  }

  runAttractState() {
    this.updateAttractState();
    this.renderAttractState();
  }

  runSimulationState(deltaTime) {
    this.updateSimulationState(deltaTime);
    this.renderSimulation();
    this.renderSimulationHud();
  }

  runPausedState() {
    this.updatePausedState();
    this.renderPausedState();
  }

  renderAttractState() {
    this.renderSimulation();
    renderAttractHud();
  }

  renderPausedState() {
    this.renderSimulation();
    renderPausedHud();
  }

  renderSimulationHud() {
    renderSimulationHud(
      this.simulationSpeed,
      this.getFocusLabel(),
      this.zoom,
      this.showOrbits,
      this.showLabels
    );
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

