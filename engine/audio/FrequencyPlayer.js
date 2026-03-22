/*
Toolbox Aid
David Quesenberry
03/22/2026
FrequencyPlayer.js
*/
export default class FrequencyPlayer {
  constructor(audioService) {
    this.audioService = audioService;
  }

  play(id, frequencies = [], options = {}) {
    const notes = frequencies.map((entry) => ({
      frequency: entry.frequency,
      durationSeconds: entry.durationSeconds ?? 0.25,
      volume: entry.volume ?? options.volume ?? 0.2,
      waveform: entry.waveform ?? options.waveform ?? 'square',
    }));

    return this.audioService.playSequence(id, {
      notes,
      loop: options.loop ?? false,
      category: 'frequency',
      volume: options.volume ?? 0.2,
    });
  }
}
