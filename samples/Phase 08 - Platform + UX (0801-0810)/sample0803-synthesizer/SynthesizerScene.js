/*
Toolbox Aid
David Quesenberry
03/22/2026
SynthesizerScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../../engine/debug/index.js';
import { Synthesizer } from '../../../engine/audio/index.js';

const theme = new Theme(ThemeTokens);

export default class SynthesizerScene extends Scene {
  constructor() {
    super();
    this.waveform = 'sawtooth';
    this.status = 'Choose a waveform and play a generated tone.';
    this.synth = null;
  }

  ensureSynth(engine) {
    if (!this.synth) {
      this.synth = new Synthesizer(engine.audio);
    }
  }

  setWaveform(next) {
    this.waveform = next;
    this.status = `Waveform set to ${next}.`;
  }

  async play(engine, frequency = 440) {
    this.ensureSynth(engine);
    await engine.audio.resume();
    await this.synth.playNote('sample124-note', {
      frequency,
      waveform: this.waveform,
      durationSeconds: 0.45,
      volume: 0.22,
    });
    this.status = `Played ${frequency}Hz with ${this.waveform}.`;
  }

  render(renderer, engine) {
    const note = engine.audio.getTrackState('sample124-note');
    drawFrame(renderer, theme, [
      'Engine sample 0803',
      'Generated tones come from a reusable synth wrapper over engine audio.',
      this.status,
    ]);

    renderer.drawRect(90, 230, 480, 150, '#111827');
    const colors = { sine: '#38bdf8', square: '#f59e0b', sawtooth: '#ef4444', triangle: '#34d399' };
    renderer.drawRect(120, 270, 360, 40, colors[this.waveform] || '#94a3b8');
    renderer.drawRect(120, 320, note?.lastNote ? Math.min(360, note.lastNote.frequency / 2) : 0, 18, '#a78bfa');

    drawPanel(renderer, 620, 34, 300, 150, 'Synthesizer', [
      `Waveform: ${this.waveform}`,
      `Triggered: ${note?.triggeredCount ?? 0}`,
      `Last Frequency: ${note?.lastNote?.frequency ?? 'none'}`,
      `Ready: ${engine.audio.getSnapshot().ready}`,
      'Waveform selection stays above the sample layer.',
    ]);
  }
}
