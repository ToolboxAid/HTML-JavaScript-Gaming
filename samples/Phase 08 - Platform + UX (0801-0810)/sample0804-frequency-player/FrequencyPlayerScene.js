/*
Toolbox Aid
David Quesenberry
03/22/2026
FrequencyPlayerScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../../engine/debug/index.js';
import { FrequencyPlayer } from '../../../engine/audio/index.js';

const theme = new Theme(ThemeTokens);

export default class FrequencyPlayerScene extends Scene {
  constructor() {
    super();
    this.player = null;
    this.mapping = [
      { frequency: 261.63, durationSeconds: 0.14 },
      { frequency: 329.63, durationSeconds: 0.14 },
      { frequency: 392.0, durationSeconds: 0.14 },
    ];
    this.status = 'Play a frequency sweep through the engine-owned frequency player.';
  }

  ensurePlayer(engine) {
    if (!this.player) {
      this.player = new FrequencyPlayer(engine.audio);
    }
  }

  async play(engine) {
    this.ensurePlayer(engine);
    await engine.audio.resume();
    this.player.play('sample125-frequencies', this.mapping, { volume: 0.18 });
    this.status = 'Frequency sweep triggered.';
  }

  render(renderer, engine) {
    const track = engine.audio.getTrackState('sample125-frequencies');
    drawFrame(renderer, theme, [
      'Engine Sample125',
      'Specific frequencies are scheduled through a reusable playback contract.',
      this.status,
    ]);

    renderer.drawRect(90, 220, 480, 170, '#111827');
    this.mapping.forEach((tone, index) => {
      const active = track?.playing && track.noteIndex === index;
      renderer.drawRect(130 + index * 120, 360 - tone.frequency / 8, 54, tone.frequency / 10, active ? '#22c55e' : '#64748b');
    });

    drawPanel(renderer, 620, 34, 300, 160, 'Frequency Player', [
      `Triggered: ${track?.triggeredCount ?? 0}`,
      `Playing: ${track?.playing ?? false}`,
      `Step: ${track?.noteIndex ?? 0}`,
      'C4: 261.63Hz',
      'E4: 329.63Hz',
      'G4: 392.00Hz',
    ]);
  }
}
