/*
Toolbox Aid
David Quesenberry
03/22/2026
MidiPlayerScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../../engine/debug/index.js';
import { MidiPlayer } from '../../../engine/audio/index.js';

const theme = new Theme(ThemeTokens);

export default class MidiPlayerScene extends Scene {
  constructor() {
    super();
    this.player = null;
    this.sequence = [
      { noteNumber: 60, durationSeconds: 0.16 },
      { noteNumber: 64, durationSeconds: 0.16 },
      { noteNumber: 67, durationSeconds: 0.16 },
      { noteNumber: 72, durationSeconds: 0.26 },
    ];
    this.status = 'Use the controls to play or stop the MIDI phrase.';
  }

  ensurePlayer(engine) {
    if (!this.player) {
      this.player = new MidiPlayer(engine.audio);
    }
  }

  async play(engine) {
    this.ensurePlayer(engine);
    await engine.audio.resume();
    this.player.play('sample123-midi', this.sequence, { loop: true, volume: 0.16 });
    this.status = 'MIDI phrase playing.';
  }

  stop(engine) {
    this.ensurePlayer(engine);
    this.player.stop('sample123-midi');
    this.status = 'MIDI phrase stopped.';
  }

  render(renderer, engine) {
    const track = engine.audio.getTrackState('sample123-midi');
    drawFrame(renderer, theme, [
      'Engine sample 0802',
      'Timed note playback is routed through a reusable MIDI player.',
      this.status,
    ]);

    renderer.drawRect(90, 220, 480, 180, '#0f172a');
    this.sequence.forEach((entry, index) => {
      const active = track?.playing && track.noteIndex === index;
      renderer.drawRect(120 + index * 90, 360 - (entry.noteNumber - 56) * 4, 40, 110, active ? '#34d399' : '#475569');
    });

    drawPanel(renderer, 620, 34, 300, 150, 'MIDI Player', [
      `Playing: ${track?.playing ?? false}`,
      `Loop: ${track?.loop ?? false}`,
      `Triggered: ${track?.triggeredCount ?? 0}`,
      `Current Step: ${track?.noteIndex ?? 0}`,
      'Sequence timing lives in engine audio paths.',
    ]);
  }
}
