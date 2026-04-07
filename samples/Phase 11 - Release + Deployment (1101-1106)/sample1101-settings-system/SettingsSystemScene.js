/*
Toolbox Aid
David Quesenberry
03/22/2026
SettingsSystemScene.js
*/
import { Scene } from '../../../src/engine/scenes/index.js';
import { drawFrame, drawPanel } from '../../../src/engine/debug/index.js';
import { Theme, ThemeTokens } from '../../../src/engine/theme/index.js';

const theme = new Theme(ThemeTokens);
const DIFFICULTIES = ['easy', 'normal', 'hard'];

export default class SettingsSystemScene extends Scene {
  constructor(settings) {
    super();
    this.settings = settings;
    this.status = 'Load, change, and save settings through the reusable service.';
  }

  load() {
    this.settings.load();
    this.status = 'Loaded saved preferences into the active runtime snapshot.';
  }

  save() {
    this.settings.save();
    this.status = 'Saved current preferences.';
  }

  bumpVolume() {
    const next = Math.min(1, this.settings.get('audio.musicVolume', 0.8) + 0.1);
    this.settings.set('audio.musicVolume', Number(next.toFixed(2)), { autoApply: true });
    this.status = `Music volume set to ${Math.round(next * 100)}%.`;
  }

  toggleFullscreenPref() {
    const next = !this.settings.get('video.fullscreenPreferred', false);
    this.settings.set('video.fullscreenPreferred', next);
    this.status = `Fullscreen preference ${next ? 'enabled' : 'disabled'}.`;
  }

  cycleDifficulty() {
    const current = this.settings.get('gameplay.difficulty', 'normal');
    const index = DIFFICULTIES.indexOf(current);
    const next = DIFFICULTIES[(index + 1) % DIFFICULTIES.length];
    this.settings.set('gameplay.difficulty', next);
    this.status = `Difficulty set to ${next}.`;
  }

  reset() {
    this.settings.reset();
    this.status = 'Reset settings to defaults.';
  }

  render(renderer) {
    const snapshot = this.settings.getSnapshot();
    const volumeWidth = 320;

    drawFrame(renderer, theme, [
      'Engine sample 1101',
      'Settings persist separately from scene logic and can be applied by category.',
      this.status,
    ]);

    renderer.drawRect(100, 220, 420, 190, '#0f172a');
    renderer.drawText('Audio', 120, 255, { color: '#e2e8f0', font: '18px monospace' });
    renderer.drawRect(120, 280, volumeWidth, 18, '#334155');
    renderer.drawRect(120, 280, volumeWidth * snapshot.audio.musicVolume, 18, '#14b8a6');

    renderer.drawText('Video', 120, 335, { color: '#e2e8f0', font: '18px monospace' });
    renderer.drawRect(120, 350, 160, 34, snapshot.video.fullscreenPreferred ? '#22c55e' : '#475569');
    renderer.drawText(snapshot.video.fullscreenPreferred ? 'Fullscreen On' : 'Windowed', 200, 373, {
      color: '#ffffff',
      font: '15px monospace',
      textAlign: 'center',
    });

    renderer.drawText('Gameplay', 320, 335, { color: '#e2e8f0', font: '18px monospace' });
    renderer.drawRect(320, 350, 120, 34, '#7c3aed');
    renderer.drawText(snapshot.gameplay.difficulty.toUpperCase(), 380, 373, {
      color: '#ffffff',
      font: '15px monospace',
      textAlign: 'center',
    });

    drawPanel(renderer, 600, 40, 300, 220, 'Settings Snapshot', [
      `Music Volume: ${Math.round(snapshot.audio.musicVolume * 100)}%`,
      `Fullscreen Preferred: ${snapshot.video.fullscreenPreferred}`,
      `Difficulty: ${snapshot.gameplay.difficulty}`,
      `Saved Namespace: ${this.settings.namespace}`,
      `Last Applied: ${this.settings.lastApplied ? 'yes' : 'no'}`,
    ]);
  }
}
