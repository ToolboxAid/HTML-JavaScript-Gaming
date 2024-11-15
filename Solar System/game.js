// ToolboxAid.com
// David Quesenberry
// SolarSystem.js
// 11/15/2024

import { canvasConfig, solarSystem } from './global.js';
import CanvasUtils from '../scripts/canvas.js';
import Fullscreen from '../scripts/fullscreen.js';

class Game {
  constructor() {
    this.centerX = canvasConfig.width / 2;
    this.centerY = canvasConfig.height / 2;
    this.celestialBodies = [
      { name: "Sun", radius: solarSystem.sunRadius, distance: 0, color: "yellow", angle: 0, speed: 0 },
      { name: "Mercury", radius: 3, distance: 50, color: "gray", angle: Math.random() * Math.PI * 2, speed: 0.02, moons: [{ radius: 0.5, distance: 5, angle: Math.random() * Math.PI * 2, speed: 0.05 }] },
      { name: "Venus", radius: 5, distance: 75, color: "orange", angle: Math.random() * Math.PI * 2, speed: 0.015, moons: [{ radius: 1, distance: 10, angle: Math.random() * Math.PI * 2, speed: 0.03 }] },
      { name: "Earth", radius: 6, distance: 115, color: "blue", angle: Math.random() * Math.PI * 2, speed: 0.01, moons: [{ radius: 1.5, distance: 12, angle: Math.random() * Math.PI * 2, speed: 0.02 }] },
      { name: "Mars", radius: 5, distance: 150, color: "red", angle: Math.random() * Math.PI * 2, speed: 0.008, moons: [{ radius: 0.8, distance: 10, angle: Math.random() * Math.PI * 2, speed: 0.025 }, { radius: 0.5, distance: 3, angle: Math.random() * Math.PI * 2, speed: 0.04 }] },
      { name: "Jupiter", radius: 15, distance: 200, color: "orange", angle: Math.random() * Math.PI * 2, speed: 0.005, moons: [{ radius: 2.5, distance: 28, angle: Math.random() * Math.PI * 2, speed: 0.015 }] },
      { name: "Saturn", radius: 12, distance: 260, color: "gold", angle: Math.random() * Math.PI * 2, speed: 0.003, ring: { outerRadius: 21, innerRadius: 14, color: "rgba(220, 220, 220, 0.5)" } },
      { name: "Uranus", radius: 8, distance: 310, color: "lightblue", angle: Math.random() * Math.PI * 2, speed: 0.002, ring: { outerRadius: 14, innerRadius: 10, color: "rgba(150, 170, 190, 0.5)" } },
      { name: "Neptune", radius: 8, distance: 370, color: "blue", angle: Math.random() * Math.PI * 2, speed: 0.001, ring: { outerRadius: 14, innerRadius: 10, color: "rgba(100, 120, 140, 0.5)" } }
    ];
  }

  update() {
    this.celestialBodies.forEach(body => {
      body.angle += body.speed;
      const x = this.centerX + body.distance * Math.cos(body.angle);
      const y = this.centerY + body.distance * Math.sin(body.angle);

      this.drawOrbitPath(body.distance);
      if (body.ring) this.drawRing(x, y, body.ring);
      this.drawCircle(x, y, body.radius, body.color);

      if (body.moons) {
        body.moons.forEach(moon => {
          moon.angle += moon.speed;
          const moonX = x + moon.distance * Math.cos(moon.angle);
          const moonY = y + moon.distance * Math.sin(moon.angle);
          this.drawCircle(moonX, moonY, moon.radius, this.getRandomGrayColor());
        });
      }
    });
  }

  drawCircle(x, y, radius, color) {
    CanvasUtils.ctx.beginPath();
    CanvasUtils.ctx.arc(x, y, radius, 0, Math.PI * 2);
    CanvasUtils.ctx.fillStyle = color;
    CanvasUtils.ctx.fill();
    CanvasUtils.ctx.closePath();
  }

  drawRing(x, y, ring) {
    const { outerRadius, innerRadius, color } = ring;
    CanvasUtils.ctx.beginPath();
    CanvasUtils.ctx.arc(x, y, outerRadius, 0, Math.PI * 2);
    CanvasUtils.ctx.arc(x, y, innerRadius, 0, Math.PI * 2, true);
    CanvasUtils.ctx.closePath();
    CanvasUtils.ctx.fillStyle = color;
    CanvasUtils.ctx.fill();
  }

  drawOrbitPath(radius) {
    CanvasUtils.ctx.beginPath();
    CanvasUtils.ctx.arc(this.centerX, this.centerY, radius, 0, Math.PI * 2);
    CanvasUtils.ctx.strokeStyle = "rgba(200, 200, 200, 0.35)";
    CanvasUtils.ctx.lineWidth = 1;
    CanvasUtils.ctx.setLineDash([5, 5]);
    CanvasUtils.ctx.stroke();
  }

  getRandomGrayColor() {
    const shade = Math.floor(Math.random() * 128) + 128;
    return `rgb(${shade}, ${shade}, ${shade})`;
  }

  gameLoop() {
    this.update();
  }
}

// Export the Game class
export default Game;

// Canvas needs to know the current directory to game.js
const currentDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
window.canvasPath = currentDir;
