/*
Toolbox Aid
David Quesenberry
03/24/2026
MultiBallChaosAudio.js
*/
const CHAOS_SFX = {
  start: {
    frequency: 420,
    durationSeconds: 0.06,
    waveform: 'square',
    volume: 0.08,
  },
  bounce: {
    frequency: 300,
    durationSeconds: 0.04,
    waveform: 'triangle',
    volume: 0.05,
  },
  preset: {
    frequency: 520,
    durationSeconds: 0.05,
    waveform: 'sine',
    volume: 0.05,
  },
  reset: {
    frequency: 180,
    durationSeconds: 0.08,
    waveform: 'sawtooth',
    volume: 0.06,
  },
};

export default class MultiBallChaosAudio {
  constructor(audioService = null) {
    this.audioService = audioService;
  }

  setAudioService(audioService) {
    this.audioService = audioService;
  }

  playStart() {
    return this.audioService?.playOneShot?.('multi-ball-chaos:start', CHAOS_SFX.start);
  }

  playBounce() {
    return this.audioService?.playOneShot?.('multi-ball-chaos:bounce', CHAOS_SFX.bounce);
  }

  playPreset() {
    return this.audioService?.playOneShot?.('multi-ball-chaos:preset', CHAOS_SFX.preset);
  }

  playReset() {
    return this.audioService?.playOneShot?.('multi-ball-chaos:reset', CHAOS_SFX.reset);
  }
}
