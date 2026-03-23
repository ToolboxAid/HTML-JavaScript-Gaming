/*
Toolbox Aid
David Quesenberry
03/23/2026
GravityWellScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { drawPanel } from '../../../engine/debug/index.js';
import { drawVectorShape } from '../../../engine/vector/index.js';
import GravityWellWorld from './GravityWellWorld.js';

const theme = new Theme(ThemeTokens);
const STAR_COUNT = 48;

function createStars(width, height) {
  return Array.from({ length: STAR_COUNT }, (_, index) => ({
    x: ((index * 173) % (width - 80)) + 40,
    y: ((index * 97) % (height - 80)) + 40,
    radius: 1 + (index % 3),
    color: index % 4 === 0 ? '#1d4ed8' : '#1e293b',
  }));
}

export default class GravityWellScene extends Scene {
  constructor() {
    super();
    this.world = new GravityWellWorld({ width: 960, height: 720 });
    this.stars = createStars(this.world.width, this.world.height);
    this.phase = 'menu';
    this.lastEnterPressed = false;
  }

  enter(engine) {
    if (engine?.canvas) {
      engine.canvas.style.cursor = 'none';
    }
  }

  exit(engine) {
    if (engine?.canvas) {
      engine.canvas.style.cursor = 'default';
    }
  }

  startRun() {
    this.world.reset();
    this.phase = 'playing';
  }

  update(dtSeconds, engine) {
    const enterPressed = Boolean(engine.input?.isDown('Enter'));

    if (this.phase === 'menu') {
      if (enterPressed && !this.lastEnterPressed) {
        this.startRun();
      }
      this.lastEnterPressed = enterPressed;
      return;
    }

    if (this.phase === 'won' || this.phase === 'lost') {
      if (enterPressed && !this.lastEnterPressed) {
        this.startRun();
      }
      this.lastEnterPressed = enterPressed;
      return;
    }

    const result = this.world.update(dtSeconds, engine.input);
    if (result.status === 'won') {
      this.phase = 'won';
    } else if (result.status === 'lost') {
      this.phase = 'lost';
    }

    this.lastEnterPressed = enterPressed;
  }

  render(renderer) {
    renderer.clear(theme.getColor('canvasBackground'));
    renderer.drawRect(16, 16, this.world.width - 32, this.world.height - 32, '#081121');
    renderer.strokeRect(16, 16, this.world.width - 32, this.world.height - 32, '#244266', 2);

    this.stars.forEach((star) => {
      renderer.drawCircle(star.x, star.y, star.radius, star.color);
    });

    this.renderTrail(renderer);
    this.renderPlanets(renderer);
    this.renderBeacons(renderer);
    this.renderShip(renderer);
    this.renderHud(renderer);
    this.renderOverlay(renderer);
  }

  renderTrail(renderer) {
    for (let index = 1; index < this.world.trail.length; index += 1) {
      const previous = this.world.trail[index - 1];
      const current = this.world.trail[index];
      const alpha = index / this.world.trail.length;
      renderer.drawLine(
        previous.x,
        previous.y,
        current.x,
        current.y,
        `rgba(96, 165, 250, ${alpha * 0.34})`,
        1,
      );
    }
  }

  renderPlanets(renderer) {
    this.world.planets.forEach((planet) => {
      renderer.drawCircle(planet.x, planet.y, planet.radius + 18, 'rgba(30, 41, 59, 0.42)');
      renderer.drawCircle(planet.x, planet.y, planet.radius, planet.color);
      renderer.drawCircle(planet.x + 8, planet.y - 10, Math.max(10, planet.radius * 0.34), 'rgba(255, 255, 255, 0.12)');
    });
  }

  renderBeacons(renderer) {
    this.world.beacons.forEach((beacon) => {
      if (beacon.collected) {
        renderer.drawCircle(beacon.x, beacon.y, 8, 'rgba(134, 239, 172, 0.24)');
        return;
      }

      drawVectorShape(renderer, this.world.getBeaconPoints(beacon), {
        strokeColor: beacon.color,
        lineWidth: 2,
      });
      renderer.drawCircle(beacon.x, beacon.y, 3, beacon.color);
    });
  }

  renderShip(renderer) {
    drawVectorShape(renderer, this.world.getShipPoints(), {
      strokeColor: '#f8fafc',
      lineWidth: 2,
    });

    if (this.phase === 'playing' && this.world.ship.thrusting) {
      drawVectorShape(renderer, this.world.getFlamePoints(), {
        strokeColor: '#fbbf24',
        lineWidth: 2,
      });
    }

    renderer.drawLine(
      this.world.ship.x,
      this.world.ship.y,
      this.world.ship.x + this.world.ship.vx * 0.22,
      this.world.ship.y + this.world.ship.vy * 0.22,
      'rgba(125, 211, 252, 0.65)',
      1,
    );
  }

  renderHud(renderer) {
    drawPanel(renderer, 620, 28, 300, 176, 'Gravity Well', [
      `Phase: ${this.phase.toUpperCase()}`,
      `Beacons: ${this.world.collectedCount}/${this.world.beacons.length}`,
      `Speed: ${this.world.getShipSpeed().toFixed(1)}`,
      `Field: ${(this.world.getGravityPercent() * 100).toFixed(0)}%`,
      `Time: ${this.world.elapsedSeconds.toFixed(1)}s`,
      'Left/Right rotate',
      'Up thrusts, Space brakes',
    ]);

    renderer.drawText('Slingshot around the wells and collect every beacon.', 42, 48, {
      color: theme.getColor('textCanvs'),
      font: '18px monospace',
    });
  }

  renderOverlay(renderer) {
    if (this.phase === 'playing') {
      return;
    }

    renderer.drawRect(180, 244, 600, 180, 'rgba(8, 15, 28, 0.88)');
    renderer.strokeRect(180, 244, 600, 180, '#60a5fa', 2);

    const title = this.phase === 'menu'
      ? 'GRAVITY WELL'
      : this.phase === 'won'
        ? 'RUN COMPLETE'
        : 'SHIP LOST';

    const lines = this.phase === 'menu'
      ? [
          'Collect every beacon while surviving the gravity wells.',
          'Use orbital pull and short thrust burns to build speed.',
          'Press Enter to launch.',
        ]
      : [
          this.world.statusMessage,
          'Press Enter to try another run.',
        ];

    renderer.drawText(title, 480, 292, {
      color: '#f8fafc',
      font: '32px monospace',
      textAlign: 'center',
    });

    lines.forEach((line, index) => {
      renderer.drawText(line, 480, 338 + (index * 28), {
        color: '#cbd5e1',
        font: '18px monospace',
        textAlign: 'center',
      });
    });
  }
}
