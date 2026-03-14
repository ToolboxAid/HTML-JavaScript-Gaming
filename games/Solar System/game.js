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
import GameBase from '../../engine/core/gameBase.js';

const celestialBodies = [
  new CelestialBody("Sun", solarSystemConfig.simulation.sunRadius, 0.01, "yellow", 0.01, 0.01),
  new CelestialBody("Mercury", 3, 50, "gray", Math.random() * Math.PI * 2, 0.16, [
    { radius: 0.5, distance: 5, angle: Math.random() * Math.PI * 2, speed: 1.0 }
  ]),
  new CelestialBody("Venus", 5, 75, "orange", Math.random() * Math.PI * 2, 0.12, [
    { radius: 1, distance: 10, angle: Math.random() * Math.PI * 2, speed: 0.75 }
  ]),
  new CelestialBody("Earth", 6, 115, "blue", Math.random() * Math.PI * 2, 0.08, [
    { radius: 1.5, distance: 12, angle: Math.random() * Math.PI * 2, speed: 1.0 }
  ]),
  new CelestialBody("Mars", 5, 150, "red", Math.random() * Math.PI * 2, 0.064, [
    { radius: 0.8, distance: 10, angle: Math.random() * Math.PI * 2, speed: 0.5 },
    { radius: 0.5, distance: 3, angle: Math.random() * Math.PI * 2, speed: 0.8 }
  ]),
  new CelestialBody("Jupiter", 15, 200, "orange", Math.random() * Math.PI * 2, 0.04, [
    { radius: 2.5, distance: 28, angle: Math.random() * Math.PI * 2, speed: 0.3 },
    { radius: 2, distance: 23, angle: Math.random() * Math.PI * 2, speed: 0.4 },
    { radius: 1.5, distance: 18, angle: Math.random() * Math.PI * 2, speed: 0.6 }
  ]),
  new CelestialBody("Saturn", 12, 260, "gold", Math.random() * Math.PI * 2, 0.024, [
    { radius: 2, distance: 20, angle: Math.random() * Math.PI * 2, speed: 0.2 },
    { radius: 1.5, distance: 17, angle: Math.random() * Math.PI * 2, speed: 0.3 },
    { radius: 1, distance: 15, angle: Math.random() * Math.PI * 2, speed: 0.4 }
  ], { ringRadius: 21, color: "rgba(220, 220, 220, 0.5)" }),
  new CelestialBody("Uranus", 8, 310, "lightblue", Math.random() * Math.PI * 2, 0.016, [
    { radius: 1.2, distance: 18, angle: Math.random() * Math.PI * 2, speed: 0.2 },
    { radius: 0.8, distance: 14, angle: Math.random() * Math.PI * 2, speed: 0.3 }
  ], { ringRadius: 14, color: "rgba(150, 170, 190, 0.5)" }),
  new CelestialBody("Neptune", 8, 370, "blue", Math.random() * Math.PI * 2, 0.008, [
    { radius: 1, distance: 22, angle: Math.random() * Math.PI * 2, speed: 0.2 },
    { radius: 0.7, distance: 18, angle: Math.random() * Math.PI * 2, speed: 0.4 }
  ], { ringRadius: 14, color: "rgba(100, 120, 140, 0.5)" }),
];

class SolarSystemSample extends GameBase {
  constructor() {
    super(canvasConfig, performanceConfig, fullscreenConfig);
  }

  async onInitialize(runtimeContext = this.runtimeContext) {
    this.runtimeContext = runtimeContext;
    this.celestialBodies = celestialBodies;
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

