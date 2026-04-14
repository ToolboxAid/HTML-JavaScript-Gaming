/*
Toolbox Aid
David Quesenberry
03/24/2026
SolarSystemScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import SolarSystemWorld from './SolarSystemWorld.js';

const VIEW = { width: 960, height: 720 };

const COLORS = {
  background: '#030712',
  frame: '#dbeafe',
  orbit: '#334155',
  text: '#dbeafe',
  muted: '#94a3b8',
  panel: '#07101d',
};

export default class SolarSystemScene extends Scene {
  constructor() {
    super();
    this.world = new SolarSystemWorld(VIEW);
    this.isPaused = false;
    this.lastPausePressed = false;
    this.lastLabelsPressed = false;
    this.lastResetPressed = false;
  }

  update(dt, engine) {
    const pausePressed = Boolean(engine.input?.isDown?.('KeyP'));
    const labelsPressed = Boolean(engine.input?.isDown?.('KeyL'));
    const resetPressed = Boolean(engine.input?.isDown?.('KeyR'));
    if (pausePressed && !this.lastPausePressed) {
      this.isPaused = !this.isPaused;
    }
    this.lastPausePressed = pausePressed;

    if (this.isPaused) {
      this.lastLabelsPressed = labelsPressed;
      this.lastResetPressed = resetPressed;
      return;
    }

    this.world.update(dt, {
      resetPressed: resetPressed && !this.lastResetPressed,
      toggleLabelsPressed: labelsPressed && !this.lastLabelsPressed,
      timeScaleIndex: this.readTimeScaleIndex(engine.input),
    });

    this.lastLabelsPressed = labelsPressed;
    this.lastResetPressed = resetPressed;
  }

  readTimeScaleIndex(input) {
    if (input?.isDown?.('Digit1')) return 0;
    if (input?.isDown?.('Digit2')) return 1;
    if (input?.isDown?.('Digit3')) return 2;
    if (input?.isDown?.('Digit4')) return 3;
    return null;
  }

  render(renderer) {
    renderer.clear(COLORS.background);
    this.drawFrame(renderer);
    this.drawOrbits(renderer);
    this.drawBodies(renderer);
    this.drawHud(renderer);

    if (this.isPaused) {
      renderer.drawRect(0, 0, VIEW.width, VIEW.height, 'rgba(0, 0, 0, 0.42)');
      renderer.drawText('PAUSED', VIEW.width / 2, 324, {
        color: COLORS.text,
        font: 'bold 30px monospace',
        textAlign: 'center',
      });
      renderer.drawText('Press P to resume the solar system.', VIEW.width / 2, 360, {
        color: '#cbd5e1',
        font: '18px monospace',
        textAlign: 'center',
      });
    }
  }

  drawFrame(renderer) {
    const { bounds } = this.world;
    renderer.drawRect(0, 0, VIEW.width, 18, COLORS.frame);
    renderer.drawRect(0, VIEW.height - 18, VIEW.width, 18, COLORS.frame);
    renderer.drawRect(0, 0, 18, VIEW.height, COLORS.frame);
    renderer.drawRect(VIEW.width - 18, 0, 18, VIEW.height, COLORS.frame);
    renderer.strokeRect(bounds.left, bounds.top, bounds.right - bounds.left, bounds.bottom - bounds.top, COLORS.frame, 2);
  }

  drawOrbits(renderer) {
    this.world.planets.forEach((planet) => {
      this.drawOrbitRing(renderer, this.world.center.x, this.world.center.y, planet.orbitRadius, planet.orbitRadius * 0.72);
    });
  }

  drawOrbitRing(renderer, centerX, centerY, radiusX, radiusY, color = COLORS.orbit, lineWidth = 1) {
    const segments = 48;
    let previous = null;

    for (let index = 0; index <= segments; index += 1) {
      const angle = (index / segments) * Math.PI * 2;
      const point = {
        x: centerX + (Math.cos(angle) * radiusX),
        y: centerY + (Math.sin(angle) * radiusY),
      };

      if (previous) {
        renderer.drawLine(previous.x, previous.y, point.x, point.y, color, lineWidth);
      }

      previous = point;
    }
  }

  drawBodies(renderer) {
    renderer.drawCircle(this.world.sun.x, this.world.sun.y, this.world.sun.radius, this.world.sun.color);
    if (this.world.labelsVisible) {
      this.drawLabel(renderer, this.world.sun.name, this.world.sun.x + 36, this.world.sun.y - 10);
    }

    this.world.planets.forEach((planet) => {
      if (planet.ring) {
        this.drawPlanetRing(renderer, planet);
      }
      renderer.drawCircle(planet.x, planet.y, planet.radius, planet.color);
      if (this.world.labelsVisible) {
        this.drawLabel(renderer, planet.name, planet.x + planet.radius + 8, planet.y - planet.radius - 4);
      }
    });

    this.world.moons.forEach((moon) => {
      renderer.drawCircle(moon.x, moon.y, moon.radius, moon.color);
      if (this.world.labelsVisible && (moon.parentId === 'earth' || moon.parentId === 'jupiter' || moon.parentId === 'saturn')) {
        this.drawLabel(renderer, moon.name, moon.x + 8, moon.y + 8, '12px monospace');
      }
    });
  }

  drawPlanetRing(renderer, planet) {
    const ringScaleY = 0.38;
    this.drawOrbitRing(
      renderer,
      planet.x,
      planet.y,
      planet.ring.outerRadius,
      planet.ring.outerRadius * ringScaleY,
      planet.ring.color,
      2,
    );
    this.drawOrbitRing(
      renderer,
      planet.x,
      planet.y,
      planet.ring.innerRadius,
      planet.ring.innerRadius * ringScaleY,
      planet.ring.color,
      2,
    );
  }

  drawLabel(renderer, text, x, y, font = '14px monospace') {
    renderer.drawText(text, x, y, {
      color: COLORS.text,
      font,
      textBaseline: 'top',
    });
  }

  drawHud(renderer) {
    const { bounds } = this.world;
    renderer.drawText('SOLAR SYSTEM', 28, 24, {
      color: COLORS.text,
      font: 'bold 24px monospace',
      textBaseline: 'top',
    });

    renderer.drawRect(642, 128, 264, 168, COLORS.panel);
    renderer.strokeRect(642, 128, 264, 168, COLORS.frame, 2);
    renderer.drawText('System View', 660, 148, {
      color: COLORS.text,
      font: 'bold 18px monospace',
      textBaseline: 'top',
    });
    renderer.drawText(`Time: ${this.world.elapsedDays.toFixed(1)} days`, 660, 182, {
      color: COLORS.text,
      font: '16px monospace',
      textBaseline: 'top',
    });
    renderer.drawText(`Rate: ${this.world.getTimeScale().label}`, 660, 208, {
      color: COLORS.text,
      font: '16px monospace',
      textBaseline: 'top',
    });
    renderer.drawText(`Labels: ${this.world.labelsVisible ? 'ON' : 'OFF'}`, 660, 234, {
      color: COLORS.text,
      font: '16px monospace',
      textBaseline: 'top',
    });
    renderer.drawText(`Bodies: ${1 + this.world.planets.length + this.world.moons.length}`, 660, 260, {
      color: COLORS.text,
      font: '16px monospace',
      textBaseline: 'top',
    });

    renderer.drawRect(642, 314, 264, 192, COLORS.panel);
    renderer.strokeRect(642, 314, 264, 192, COLORS.frame, 2);
    renderer.drawText('Controls', 660, 334, {
      color: COLORS.text,
      font: 'bold 18px monospace',
      textBaseline: 'top',
    });
    renderer.drawText('P pause / resume', 660, 368, { color: COLORS.muted, font: '16px monospace', textBaseline: 'top' });
    renderer.drawText('L toggle labels', 660, 394, { color: COLORS.muted, font: '16px monospace', textBaseline: 'top' });
    renderer.drawText('R reset clock', 660, 420, { color: COLORS.muted, font: '16px monospace', textBaseline: 'top' });
    renderer.drawText('1 x1   2 x2', 660, 446, { color: COLORS.muted, font: '16px monospace', textBaseline: 'top' });
    renderer.drawText('3 x3   4 x4', 660, 472, { color: COLORS.muted, font: '16px monospace', textBaseline: 'top' });

    renderer.drawText('Readable orbital motion, not exact scale.', bounds.left, 686, {
      color: COLORS.muted,
      font: '16px monospace',
      textBaseline: 'top',
    });
  }
}
