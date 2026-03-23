/*
Toolbox Aid
David Quesenberry
03/22/2026
AsteroidsGameScene.js
*/
import Scene from '../../engine/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../engine/debug/index.js';
import AsteroidsWorld from './AsteroidsWorld.js';

const theme = new Theme(ThemeTokens);

export default class AsteroidsGameScene extends Scene {
  constructor() {
    super();
    this.world = new AsteroidsWorld({ width: 960, height: 540 });
    this.lastRestartPressed = false;
  }

  reset() {
    this.world.reset();
    this.lastRestartPressed = false;
  }

  update(dtSeconds, engine) {
    const restartPressed = engine.input?.isDown('Enter');
    if (this.world.gameOver) {
      if (restartPressed && !this.lastRestartPressed) {
        this.reset();
      }
      this.lastRestartPressed = restartPressed;
      return;
    }
    this.lastRestartPressed = restartPressed;
    this.world.update(dtSeconds, engine.input);
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine Asteroids',
      'Playable Asteroids game built on the existing engine loop, input, and canvas rendering flow.',
      this.world.status,
    ]);

    renderer.drawRect(0, 0, this.world.bounds.width, this.world.bounds.height, '#020617');
    this.world.starfield.forEach((star) => {
      renderer.drawRect(star.x, star.y, star.size, star.size, '#94a3b8');
    });

    this.world.asteroids.forEach((asteroid) => {
      renderer.drawPolygon(asteroid.getPoints(), {
        fillColor: null,
        strokeColor: '#cbd5e1',
        lineWidth: 2,
      });
    });

    this.world.bullets.forEach((bullet) => {
      renderer.drawRect(bullet.x - 2, bullet.y - 2, 4, 4, '#f8fafc');
    });

    if (this.world.ship.thrusting && !this.world.gameOver) {
      renderer.drawPolygon(this.world.ship.getFlamePoints(), {
        fillColor: null,
        strokeColor: '#f97316',
        lineWidth: 2,
      });
    }
    renderer.drawPolygon(this.world.ship.getPoints(), {
      fillColor: null,
      strokeColor: '#ffffff',
      lineWidth: 2,
    });

    if (this.world.gameOver) {
      renderer.drawText('GAME OVER', 480, 310, {
        color: '#f87171',
        font: '28px monospace',
        textAlign: 'center',
      });
    }

    drawPanel(renderer, 620, 34, 280, 160, 'Asteroids', [
      `Score: ${this.world.score}`,
      `Lives: ${this.world.lives}`,
      `Asteroids: ${this.world.asteroids.length}`,
      `Bullets: ${this.world.bullets.length}`,
      this.world.gameOver ? 'Press Enter to restart.' : 'Stay moving and keep firing.',
    ]);
  }
}
