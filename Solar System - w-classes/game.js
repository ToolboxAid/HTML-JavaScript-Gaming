// ToolboxAid.com
// David Quesenberry
// game.js
// 10/16/2024

import { canvasConfig, performanceConfig, fullscreenConfig, solarSystemConfig } from './global.js';
import CelestialBody from './celestialBody.js';
import GameBase from '../scripts/gamebase.js';

// Celestial bodies array (as defined previously)
const celestialBodies = [
  new CelestialBody("Sun", solarSystemConfig.sunRadius, 0.01, "yellow", 0.01, 0.01),
  new CelestialBody("Mercury", 3, 50, "gray", Math.random() * Math.PI * 2, 0.02, [
    { radius: 0.5, distance: 5, angle: Math.random() * Math.PI * 2, speed: 5.0 }
  ]),
  new CelestialBody("Venus", 5, 75, "orange", Math.random() * Math.PI * 2, 0.015, [
    { radius: 1, distance: 10, angle: Math.random() * Math.PI * 2, speed: 3.0 }
  ]),
  new CelestialBody("Earth", 6, 115, "blue", Math.random() * Math.PI * 2, 0.01, [
    { radius: 1.5, distance: 12, angle: Math.random() * Math.PI * 2, speed: 5.0 }
  ]),
  new CelestialBody("Mars", 5, 150, "red", Math.random() * Math.PI * 2, 0.008, [
    { radius: 0.8, distance: 10, angle: Math.random() * Math.PI * 2, speed: 2.5 },
    { radius: 0.5, distance: 3, angle: Math.random() * Math.PI * 2, speed: 4.0 }
  ]),
  new CelestialBody("Jupiter", 15, 200, "orange", Math.random() * Math.PI * 2, 0.005, [
    { radius: 2.5, distance: 28, angle: Math.random() * Math.PI * 2, speed: 1.5 },
    { radius: 2, distance: 23, angle: Math.random() * Math.PI * 2, speed: 2.0 },
    { radius: 1.5, distance: 18, angle: Math.random() * Math.PI * 2, speed: 3.0 }
  ]),
  new CelestialBody("Saturn", 12, 260, "gold", Math.random() * Math.PI * 2, 0.003, [
    { radius: 2, distance: 20, angle: Math.random() * Math.PI * 2, speed: 1.0 },
    { radius: 1.5, distance: 17, angle: Math.random() * Math.PI * 2, speed: 1.5 },
    { radius: 1, distance: 15, angle: Math.random() * Math.PI * 2, speed: 2.0 }
  ], { ringRadius: 21, color: "rgba(220, 220, 220, 0.5)" }),
  new CelestialBody("Uranus", 8, 310, "lightblue", Math.random() * Math.PI * 2, 0.002, [
    { radius: 1.2, distance: 18, angle: Math.random() * Math.PI * 2, speed: 1.0 },
    { radius: 0.8, distance: 14, angle: Math.random() * Math.PI * 2, speed: 1.5 }
  ], { ringRadius: 14, color: "rgba(150, 170, 190, 0.5)" }),
  new CelestialBody("Neptune", 8, 370, "blue", Math.random() * Math.PI * 2, 0.001, [
    { radius: 1, distance: 22, angle: Math.random() * Math.PI * 2, speed: 1.0 },
    { radius: 0.7, distance: 18, angle: Math.random() * Math.PI * 2, speed: 2.0 }
  ], { ringRadius: 14, color: "rgba(100, 120, 140, 0.5)" }),
];

class SolarSystem extends GameBase {
  constructor() {
    super(canvasConfig, performanceConfig, fullscreenConfig);
  }

  async onInitialize() {
    console.log("onInit");
    this.celestialBodies = celestialBodies;
  }

  moveSolarSystem(deltaTime) {
    const centerX = canvasConfig.width / 2;
    const centerY = canvasConfig.height / 2;

    this.celestialBodies.forEach(body => {
      // Update the planet's position and rotation
      body.angle += body.speed;
      const x = centerX + body.distance * Math.cos(body.angle);
      const y = centerY + body.distance * Math.sin(body.angle);

      // Update the planet and its moons' positions
      body.update(deltaTime);

      // Draw the planet and its moons
      body.draw();
    });
  }

  gameLoop(deltaTime) {
    // Update and Draw solar system.
    this.moveSolarSystem(deltaTime);
  }
}

export default SolarSystem;

const solarSystem = new SolarSystem();
