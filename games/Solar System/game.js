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
    this.celestialBodies = [];
    this.resetSimulation();
  }

  resetSimulation() {
    this.celestialBodies = createCelestialBodies(solarSystemBodies);
  }

  wasAnyKeyPressed(keyCodes = []) {
    return keyCodes.some((code) => this.keyboardInput.isKeyPressed(code));
  }

  updateInput() {
    this.keyboardInput.update();
  }

  updateAttractState() {
    if (this.wasAnyKeyPressed(solarSystemConfig.controls.startKeys)) {
      this.gameState = solarSystemConfig.states.simulation;
    }
  }

  updateSimulation(deltaTime) {
    this.celestialBodies.forEach(body => {
      body.update(deltaTime);
    });
  }

  updateSimulationState(deltaTime) {
    if (this.wasAnyKeyPressed(solarSystemConfig.controls.pauseKeys)) {
      this.gameState = solarSystemConfig.states.paused;
      return;
    }

    if (this.wasAnyKeyPressed(solarSystemConfig.controls.resetKeys)) {
      this.resetSimulation();
    }

    this.updateSimulation(deltaTime);
  }

  updatePausedState() {
    if (this.wasAnyKeyPressed(solarSystemConfig.controls.pauseKeys)) {
      this.gameState = solarSystemConfig.states.simulation;
      return;
    }

    if (this.wasAnyKeyPressed(solarSystemConfig.controls.resetKeys)) {
      this.resetSimulation();
    }
  }

  renderSimulation() {
    this.celestialBodies.forEach(body => {
      body.draw();
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
    this.drawHudLine("Press R to reset the current system", 28, 178, solarSystemConfig.display.hudMutedColor, 18);
  }

  renderPausedState() {
    this.renderSimulation();
    this.drawHudLine("Paused", 28, 44, solarSystemConfig.display.hudAccentColor, 30);
    this.drawHudLine("Press P to resume", 28, 80);
    this.drawHudLine("Press R to reset", 28, 110, solarSystemConfig.display.hudMutedColor, 18);
  }

  renderSimulationHud() {
    this.drawHudLine("Simulation running", 28, 38, solarSystemConfig.display.hudAccentColor, 22);
    this.drawHudLine("P: pause  R: reset", 28, 66, solarSystemConfig.display.hudMutedColor, 16);
  }

  gameLoop(deltaTime, runtimeContext = this.runtimeContext) {
    this.runtimeContext = runtimeContext;
    this.updateInput();

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

