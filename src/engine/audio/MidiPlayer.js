/*
Toolbox Aid
David Quesenberry
03/22/2026
MidiPlayer.js
*/
function midiToFrequency(noteNumber) {
  return 440 * (2 ** ((noteNumber - 69) / 12));
}

export default class MidiPlayer {
  constructor(audioService) {
    this.audioService = audioService;
  }

  play(id, sequence = [], options = {}) {
    const notes = sequence.map((entry) => ({
      frequency: midiToFrequency(entry.noteNumber),
      durationSeconds: entry.durationSeconds ?? 0.25,
      volume: entry.volume ?? options.volume ?? 0.18,
      waveform: entry.waveform ?? options.waveform ?? 'triangle',
    }));

    return this.audioService.playSequence(id, {
      notes,
      loop: options.loop ?? false,
      category: 'midi',
      volume: options.volume ?? 0.18,
    });
  }

  stop(id) {
    return this.audioService.stop(id);
  }
}
