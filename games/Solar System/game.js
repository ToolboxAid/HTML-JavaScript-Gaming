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
import CelestialBody from './celestialBody.js';
import { solarSystemBodies } from './solarSystemData.js';
import GameBase from '../../engine/core/gameBase.js';
import GameObjectSystem from '../../engine/game/gameObjectSystem.js';
import KeyboardInput from '../../engine/input/keyboard.js';
import CanvasUtils from '../../engine/core/canvas.js';

function createCelestialBodies(bodyDefinitions) {
  return bodyDefinitions.map((body) => new CelestialBody(
    body.name,
    body.radius,
    body.distance,
    body.color,
    body.angle,
    body.speed,
    body.moons ?? [],
    body.ring ?? null
  ));
}

class SolarSystemSample extends GameBase {
  constructor() {
    super(canvasConfig, performanceConfig, fullscreenConfig);
  }

  async onInitialize(runtimeContext = this.runtimeContext) {
    this.runtimeContext = runtimeContext;
    this.keyboardInput = new KeyboardInput();
    this.gameState = solarSystemConfig.states.attract;
    this.gameObjectSystem = new GameObjectSystem(false);
    this.simulationSpeed = solarSystemConfig.simulation.speedMultiplier;
    this.showOrbits = true;
    this.showLabels = false;
    this.zoom = solarSystemConfig.simulation.zoomDefault;
    this.focusIndex = -1;
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

  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  cycleFocus(step) {
    const maxIndex = this.getActiveBodies().length - 1;

    if (this.focusIndex === -1 && step > 0) {
      this.focusIndex = 0;
      return;
    }

    if (this.focusIndex === -1 && step < 0) {
      this.focusIndex = maxIndex;
      return;
    }

    this.focusIndex += step;

    if (this.focusIndex > maxIndex) {
      this.focusIndex = -1;
    } else if (this.focusIndex < -1) {
      this.focusIndex = maxIndex;
    }
  }

  updateInteractiveControls() {
    if (this.wasAnyKeyPressed(solarSystemConfig.controls.speedUpKeys)) {
      this.simulationSpeed = this.clamp(
        this.simulationSpeed + solarSystemConfig.simulation.speedStep,
        solarSystemConfig.simulation.minSpeedMultiplier,
        solarSystemConfig.simulation.maxSpeedMultiplier
      );
    }

    if (this.wasAnyKeyPressed(solarSystemConfig.controls.speedDownKeys)) {
      this.simulationSpeed = this.clamp(
        this.simulationSpeed - solarSystemConfig.simulation.speedStep,
        solarSystemConfig.simulation.minSpeedMultiplier,
        solarSystemConfig.simulation.maxSpeedMultiplier
      );
    }

    if (this.wasAnyKeyPressed(solarSystemConfig.controls.toggleOrbitKeys)) {
      this.showOrbits = !this.showOrbits;
    }

    if (this.wasAnyKeyPressed(solarSystemConfig.controls.toggleLabelKeys)) {
      this.showLabels = !this.showLabels;
    }

    if (this.wasAnyKeyPressed(solarSystemConfig.controls.zoomInKeys)) {
      this.zoom = this.clamp(
        this.zoom + solarSystemConfig.simulation.zoomStep,
        solarSystemConfig.simulation.minZoom,
        solarSystemConfig.simulation.maxZoom
      );
    }

    if (this.wasAnyKeyPressed(solarSystemConfig.controls.zoomOutKeys)) {
      this.zoom = this.clamp(
        this.zoom - solarSystemConfig.simulation.zoomStep,
        solarSystemConfig.simulation.minZoom,
        solarSystemConfig.simulation.maxZoom
      );
    }

    if (this.wasAnyKeyPressed(solarSystemConfig.controls.focusNextKeys)) {
      this.cycleFocus(1);
    }

    if (this.wasAnyKeyPressed(solarSystemConfig.controls.focusPrevKeys)) {
      this.cycleFocus(-1);
    }
  }

  getFocusedBody() {
    const activeBodies = this.getActiveBodies();

    if (this.focusIndex < 0 || this.focusIndex >= activeBodies.length) {
      return null;
    }

    return activeBodies[this.focusIndex];
  }

  getRenderOptions() {
    const centerX = canvasConfig.width / 2;
    const centerY = canvasConfig.height / 2;
    const focusedBody = this.getFocusedBody();

    // Keep the selected body centered while preserving zoom/toggle settings.
    if (!focusedBody) {
      return {
        centerX,
        centerY,
        zoom: this.zoom,
        showOrbits: this.showOrbits,
        showLabels: this.showLabels
      };
    }

    return {
      centerX: centerX - (focusedBody.x * this.zoom),
      centerY: centerY - (focusedBody.y * this.zoom),
      zoom: this.zoom,
      showOrbits: this.showOrbits,
      showLabels: this.showLabels
    };
  }

  getFocusLabel() {
    const focusedBody = this.getFocusedBody();
    return focusedBody ? focusedBody.name : "System Center";
  }

  updateAttractState() {
    if (this.wasAnyKeyPressed(solarSystemConfig.controls.startKeys)) {
      this.gameState = solarSystemConfig.states.simulation;
    }
  }

  updateSimulation(deltaTime) {
    this.getActiveBodies().forEach(body => {
      body.update(deltaTime);
    });
  }

  updateSimulationState(deltaTime) {
    if (this.wasAnyKeyPressed(solarSystemConfig.controls.pauseKeys)) {
      this.gameState = solarSystemConfig.states.paused;
      return;
    }

    this.updateInteractiveControls();

    if (this.wasAnyKeyPressed(solarSystemConfig.controls.resetKeys)) {
      this.resetSimulation();
    }

    this.updateSimulation(deltaTime * this.simulationSpeed);
  }

  updatePausedState() {
    this.updateInteractiveControls();

    if (this.wasAnyKeyPressed(solarSystemConfig.controls.pauseKeys)) {
      this.gameState = solarSystemConfig.states.simulation;
      return;
    }

    if (this.wasAnyKeyPressed(solarSystemConfig.controls.resetKeys)) {
      this.resetSimulation();
    }
  }

  renderSimulation() {
    const renderOptions = this.getRenderOptions();
    this.getActiveBodies().forEach(body => {
      body.draw(renderOptions);
    });
  }

  drawHudLine(text, x, y, color = solarSystemConfig.display.hudColor, size = 24) {
    const ctx = CanvasUtils.ctx;
    ctx.fillStyle = color;
    ctx.font = `${size}px Arial`;
    ctx.fillText(text, x, y);
  }

  renderAttractState() {
    this.renderSimulation();
    this.drawHudLine(solarSystemConfig.meta.title, 28, 44, solarSystemConfig.display.hudAccentColor, 30);
    this.drawHudLine(solarSystemConfig.meta.subtitle, 28, 76, solarSystemConfig.display.hudMutedColor, 18);
    this.drawHudLine("Press Enter or Space to start the simulation", 28, 122);
    this.drawHudLine("Press P to pause once running", 28, 152, solarSystemConfig.display.hudMutedColor, 18);
    this.drawHudLine("O: orbits  L: labels  [ ]: zoom  < >: focus", 28, 178, solarSystemConfig.display.hudMutedColor, 18);
  }

  renderPausedState() {
    this.renderSimulation();
    this.drawHudLine("Paused", 28, 44, solarSystemConfig.display.hudAccentColor, 30);
    this.drawHudLine("Press P to resume", 28, 80);
    this.drawHudLine("R: reset  +/-: speed  O: orbits  L: labels", 28, 110, solarSystemConfig.display.hudMutedColor, 18);
  }

  renderSimulationHud() {
    this.drawHudLine("Simulation running", 28, 38, solarSystemConfig.display.hudAccentColor, 22);
    this.drawHudLine(`Speed: ${this.simulationSpeed.toFixed(2)}x`, 28, 66, solarSystemConfig.display.hudMutedColor, 16);
    this.drawHudLine(`Focus: ${this.getFocusLabel()}  Zoom: ${this.zoom.toFixed(2)}x`, 28, 88, solarSystemConfig.display.hudMutedColor, 16);
    this.drawHudLine(`Orbits: ${this.showOrbits ? 'on' : 'off'}  Labels: ${this.showLabels ? 'on' : 'off'}`, 28, 110, solarSystemConfig.display.hudMutedColor, 16);
    this.drawHudLine("P: pause  R: reset  +/-: speed  O: orbits  L: labels  [ ]: zoom  < >: focus", 28, 132, solarSystemConfig.display.hudMutedColor, 14);
  }

  gameLoop(deltaTime, runtimeContext = this.runtimeContext) {
    this.runtimeContext = runtimeContext;
    this.updateInput();

    // The sample keeps state handling in the game shell so input/update/render flow
    // stays easy to compare with the general GameBase pattern used elsewhere.
    switch (this.gameState) {
      case solarSystemConfig.states.attract:
        this.updateAttractState();
        this.renderAttractState();
        break;

      case solarSystemConfig.states.simulation:
        this.updateSimulationState(deltaTime);
        this.renderSimulation();
        this.renderSimulationHud();
        break;

      case solarSystemConfig.states.paused:
        this.updatePausedState();
        this.renderPausedState();
        break;

      default:
        this.gameState = solarSystemConfig.states.attract;
        this.renderAttractState();
        break;
    }
  }
}

export default SolarSystemSample;

const solarSystemSample = new SolarSystemSample();

