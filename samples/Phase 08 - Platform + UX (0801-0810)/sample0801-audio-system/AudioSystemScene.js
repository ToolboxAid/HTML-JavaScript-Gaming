/*
Toolbox Aid
David Quesenberry
03/22/2026
AudioSystemScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../../engine/debug/index.js';

const theme = new Theme(ThemeTokens);

export default class AudioSystemScene extends Scene {
  constructor() {
    super();
    this.musicNotes = [
      { frequency: 220, durationSeconds: 0.2, waveform: 'sine' },
      { frequency: 277, durationSeconds: 0.2, waveform: 'sine' },
      { frequency: 330, durationSeconds: 0.2, waveform: 'sine' },
      { frequency: 277, durationSeconds: 0.2, waveform: 'sine' },
    ];
    this.status = 'Press Resume Audio, then toggle music or fire a one-shot SFX.';
  }

  async resumeAudio(engine) {
    await engine.audio.resume();
    this.status = engine.audio.getSnapshot().ready ? 'Audio backend resumed.' : 'Audio backend unavailable.';
  }

  toggleMusic(engine) {
    const music = engine.audio.getTrackState('sample122-bgm');
    if (music?.playing) {
      engine.audio.stop('sample122-bgm');
      this.status = 'Background loop stopped.';
      return;
    }

    engine.audio.playMusic('sample122-bgm', {
      loop: true,
      volume: 0.15,
      notes: this.musicNotes,
    });
    this.status = 'Background loop started.';
  }

  async playSfx(engine) {
    await engine.audio.triggerSfx('sample122-sfx', {
      frequency: 660,
      durationSeconds: 0.18,
      waveform: 'square',
      volume: 0.2,
    });
    this.status = 'One-shot SFX triggered.';
  }

  render(renderer, engine) {
    const snapshot = engine.audio.getSnapshot();
    const music = engine.audio.getTrackState('sample122-bgm');
    const sfx = engine.audio.getTrackState('sample122-sfx');

    drawFrame(renderer, theme, [
      'Engine sample 0801',
      'Audio playback is routed through an engine-owned audio service.',
      this.status,
    ]);

    renderer.drawRect(90, 210, 480, 180, '#111827');
    renderer.drawRect(90, 390, 480, 8, music?.playing ? '#34d399' : '#475569');
    renderer.drawRect(90, 360, Math.min(480, (music?.triggeredCount ?? 0) * 40), 12, '#60a5fa');
    renderer.drawRect(130, 280, 40, 40, sfx?.lastNote ? '#f59e0b' : '#374151');

    drawPanel(renderer, 620, 34, 300, 170, 'Audio System', [
      `Supported: ${snapshot.supported}`,
      `Ready: ${snapshot.ready}`,
      `Music Playing: ${music?.playing ?? false}`,
      `Music Loop: ${music?.loop ?? false}`,
      `SFX Count: ${sfx?.triggeredCount ?? 0}`,
      `Last Error: ${snapshot.lastError || 'none'}`,
    ]);
  }
}
