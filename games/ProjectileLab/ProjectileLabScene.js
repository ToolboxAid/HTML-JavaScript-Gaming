/*
Toolbox Aid
David Quesenberry
03/24/2026
ProjectileLabScene.js
*/
import { Scene } from '/src/engine/scenes/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';
import ProjectileLabModel from './ProjectileLabModel.js';

const theme = new Theme(ThemeTokens);

const PRESET_KEY_MAP = {
  Digit1: 'single',
  Digit2: 'fast',
  Digit3: 'slow',
  Digit4: 'burst',
  Digit5: 'angled',
};

export default class ProjectileLabScene extends Scene {
  constructor() {
    super();
    this.model = new ProjectileLabModel({ width: 960, height: 540 });
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
      fireDown: Boolean(engine.input?.isDown?.('Space') || engine.input?.isDown?.('KeyF')),
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
      'Engine Projectile Lab',
      'Projectile Lab demonstrates spawn, travel, lifetime cleanup, and preset comparisons.',
      'Use 1-5 to swap presets, Space or F to fire, P to pause, and R to reset.',
      `Active projectiles: ${this.model.projectiles.length}`,
      'Designed as a sample-track lab for projectile stability work.',
    ]);

    const { bounds, launcher } = this.model;
    renderer.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height, '#d8d5ff', 3);
    renderer.drawRect(launcher.x, launcher.y, launcher.width, launcher.height, '#60a5fa');
    renderer.strokeRect(launcher.x, launcher.y, launcher.width, launcher.height, '#ffffff', 1);
    renderer.drawText('Launcher', launcher.x - 6, launcher.y - 12, { color: '#ffffff', font: '14px monospace' });

    renderer.drawLine(
      launcher.x + launcher.width,
      launcher.y + (launcher.height / 2),
      bounds.x + bounds.width - 24,
      launcher.y + (launcher.height / 2),
      '#334155',
      1,
    );

    this.model.projectiles.forEach((projectile) => {
      renderer.drawRect(projectile.x, projectile.y, projectile.width, projectile.height, projectile.color);
      renderer.strokeRect(projectile.x, projectile.y, projectile.width, projectile.height, '#ffffff', 1);
    });

    const preset = this.model.getSelectedPreset();
    drawPanel(renderer, 612, 166, 292, 170, 'Projectile Lab', [
      `Preset: ${preset.label}`,
      preset.description,
      `Total fired: ${this.model.totalFired}`,
      `Active: ${this.model.projectiles.length}`,
      `Elapsed: ${this.model.elapsedSeconds.toFixed(1)}s`,
      this.isPaused ? 'State: paused' : 'State: live',
    ]);

    drawPanel(renderer, 612, 348, 292, 146, 'Preset Keys', [
      '1 Single Shot',
      '2 Fast Short-Life',
      '3 Slow Long-Life',
      '4 Burst',
      '5 Angled Shot',
    ]);

    renderer.drawText(this.model.statusMessage, 72, 498, {
      color: '#f8fafc',
      font: '16px monospace',
    });

    if (this.isPaused) {
      renderer.drawRect(0, 0, 960, 540, 'rgba(0, 0, 0, 0.45)');
      renderer.drawText('PAUSED', 480, 250, {
        color: '#f8fafc',
        font: 'bold 28px monospace',
        textAlign: 'center',
      });
      renderer.drawText('Press P to resume the projectile lab.', 480, 286, {
        color: '#cbd5e1',
        font: '18px monospace',
        textAlign: 'center',
      });
    }
  }
}
