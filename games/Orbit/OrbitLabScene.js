/*
Toolbox Aid
David Quesenberry
03/24/2026
OrbitLabScene.js
*/
import { Scene } from '../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../engine/debug/index.js';
import OrbitLabModel from './OrbitLabModel.js';

const theme = new Theme(ThemeTokens);

const PRESET_KEY_MAP = {
  Digit1: 'stable',
  Digit2: 'elliptical',
  Digit3: 'fall',
  Digit4: 'escape',
};

export default class OrbitLabScene extends Scene {
  constructor() {
    super();
    this.model = new OrbitLabModel({ width: 960, height: 540 });
    this.isPaused = false;
    this.lastPausePressed = false;
  }

  update(dt, engine) {
    const pausePressed = Boolean(engine.input?.isDown?.('KeyP'));
    if (pausePressed && !this.lastPausePressed) {
      this.isPaused = !this.isPaused;
    }
    this.lastPausePressed = pausePressed;

    if (this.isPaused) {
      return;
    }

    this.model.update(dt, {
      resetPressed: Boolean(engine.input?.isDown?.('KeyR')),
      presetPressed: this.readPresetSelection(engine.input),
    });
  }

  readPresetSelection(input) {
    for (const [code, presetId] of Object.entries(PRESET_KEY_MAP)) {
      if (input?.isDown?.(code)) {
        return presetId;
      }
    }
    return null;
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine Orbit',
      'Orbit demonstrates central-body gravity, trajectory shaping, and preset comparisons.',
      'Use 1-4 to swap scenarios, P to pause, and R to reset the current run.',
      `Body state: ${this.model.status}`,
      'Designed as a sample-track orbit study with minimal presentation.',
    ]);

    const { bounds, attractor } = this.model.world;
    renderer.strokeRect(bounds.left, bounds.top, bounds.right - bounds.left, bounds.bottom - bounds.top, '#d8d5ff', 3);

    for (let index = 1; index < this.model.trail.length; index += 1) {
      const previous = this.model.trail[index - 1];
      const current = this.model.trail[index];
      const alpha = index / this.model.trail.length;
      renderer.drawLine(
        previous.x,
        previous.y,
        current.x,
        current.y,
        `rgba(96, 165, 250, ${alpha * 0.55})`,
        1,
      );
    }

    renderer.drawCircle(attractor.x, attractor.y, attractor.radius + 12, 'rgba(59, 130, 246, 0.18)');
    renderer.drawCircle(attractor.x, attractor.y, attractor.radius, '#fbbf24');
    renderer.drawCircle(this.model.body.x, this.model.body.y, this.model.body.radius, '#f8fafc');
    renderer.drawLine(
      this.model.body.x,
      this.model.body.y,
      this.model.body.x + (this.model.body.vx * 0.18),
      this.model.body.y + (this.model.body.vy * 0.18),
      '#34d399',
      2,
    );

    const preset = this.model.getSelectedPreset();
    drawPanel(renderer, 620, 146, 286, 168, 'Orbit Lab', [
      `Preset: ${preset.label}`,
      preset.description,
      `Time: ${this.model.elapsedSeconds.toFixed(1)}s`,
      `Min radius: ${this.model.minDistance.toFixed(1)}`,
      `Max radius: ${this.model.maxDistance.toFixed(1)}`,
      `State: ${this.model.status}`,
    ]);

    drawPanel(renderer, 620, 326, 286, 150, 'Preset Keys', [
      '1 Stable Orbit',
      '2 Elliptical Orbit',
      '3 Fall Inward',
      '4 Escape Path',
      'R reset current preset',
    ]);

    renderer.drawText(this.model.statusMessage, 56, 515, {
      color: '#f8fafc',
      font: '16px monospace',
    });

    if (this.isPaused) {
      renderer.drawRect(0, 0, 960, 540, 'rgba(0, 0, 0, 0.45)');
      renderer.drawText('PAUSED', 480, 252, {
        color: '#f8fafc',
        font: 'bold 28px monospace',
        textAlign: 'center',
      });
      renderer.drawText('Press P to resume the orbit lab.', 480, 288, {
        color: '#cbd5e1',
        font: '18px monospace',
        textAlign: 'center',
      });
    }
  }
}
