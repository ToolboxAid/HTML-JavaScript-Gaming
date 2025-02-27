// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// game.js - Template Game Engine

import { canvasConfig, performanceConfig, fullscreenConfig } from './global.js';
import GameBase from '../scripts/gamebase.js';

import ParticleExplosion from '../scripts/gfx/particleExplosion.js';

class Game extends GameBase {

  // Enable debug mode: game.html?game
  static DEBUG = new URLSearchParams(window.location.search).has('game');

  constructor() {
    super(canvasConfig, performanceConfig, fullscreenConfig);
  }

  async onInitialize() {

    console.log("onInit");

    this.particleExplosion = null;
  }

  // Create an explosion when an asteroid is hit
  static explosions = [];
  static lastExplosionTime = 0;
  static EXPLOSION_INTERVAL = 5000; // 5 seconds in milliseconds

  // Test: Create new explosion every 0.5 seconds
  static newParticleExplosion(x, y, startRadius, endRadius, duration = 1.75, particleRadius = 3.5, shape = "circle") {
    const explosion = new ParticleExplosion(
      x,               // x position
      y,               // y position
      startRadius,     // start radius
      endRadius,       // end radius
      duration,        // duration in seconds
      endRadius / 4,      // number of particles
      particleRadius,  // Particle Radius
    );
    if (shape !== "circle") explosion.setShapeSquare();
    Game.explosions.push(explosion);
  }

  gameLoop(deltaTime) {
    // Update and draw all explosions with proper cleanup
    Game.explosions = Game.explosions.filter(explosion => {
      if (!explosion || explosion.isDone) {
        if (explosion) {
          explosion.destroy();
        }
        return false;
      }

      if (explosion.update(deltaTime)) {
        explosion.destroy();
        return false;
      }
      explosion.draw();
      return true;
    });

    const currentTime = Date.now();
    if (currentTime - Game.lastExplosionTime > Game.EXPLOSION_INTERVAL) {

      //x, y, startRadius, endRadius, duration = 1.75, particleRadius = 3.5
      Game.newParticleExplosion( 50, 100,  0,  50, 1.5);
      Game.newParticleExplosion(150, 100,  0,  50, 3.5, 1.5);
      Game.newParticleExplosion(350, 100,  0,  10, 1.5, 1.5);
      Game.newParticleExplosion(500, 100, 10,  60, 4.5, 2.5, "square");
      Game.newParticleExplosion(300, 300,  2, 100, 1.5, 2.5);
      Game.newParticleExplosion(600, 400,  4, 200, 1.5, 1.5);
      Game.lastExplosionTime = currentTime;
    }
  }

}

export default Game;

const game = new Game();
