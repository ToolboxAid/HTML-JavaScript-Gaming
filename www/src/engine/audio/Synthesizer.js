/*
Toolbox Aid
David Quesenberry
03/22/2026
Synthesizer.js
*/
export default class Synthesizer {
  constructor(audioService) {
    this.audioService = audioService;
  }

  async playNote(id, {
    frequency = 440,
    durationSeconds = 0.4,
    waveform = 'sawtooth',
    volume = 0.22,
  } = {}) {
    return this.audioService.triggerSfx(id, {
      frequency,
      durationSeconds,
      waveform,
      volume,
    });
  }
}
