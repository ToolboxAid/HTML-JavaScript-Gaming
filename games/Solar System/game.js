// ToolboxAid.com
// David Quesenberry
// game.js
// 10/16/2024

import {
  canvasConfig,
  performanceConfig,
  fullscreenConfig
} from './global.js';
import CelestialBody from './celestialBody.js';
import { solarSystemBodies } from './solarSystemData.js';
import GameBase from '../../engine/core/gameBase.js';

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
    this.celestialBodies = createCelestialBodies(solarSystemBodies);
  }

  updateSimulation(deltaTime) {
    this.celestialBodies.forEach(body => {
      body.update(deltaTime);
    });
  }

  renderSimulation() {
    this.celestialBodies.forEach(body => {
      body.draw();
    });
  }

  gameLoop(deltaTime, runtimeContext = this.runtimeContext) {
    this.runtimeContext = runtimeContext;
    this.updateSimulation(deltaTime);
    this.renderSimulation();
  }
}

export default SolarSystemSample;

const solarSystemSample = new SolarSystemSample();

