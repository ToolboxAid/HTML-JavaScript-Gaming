/*
Toolbox Aid
David Quesenberry
03/24/2026
GravityAudio.js
*/
const GRAVITY_SFX = {
  start: {
    frequency: 360,
    durationSeconds: 0.06,
    waveform: 'square',
    volume: 0.08,
  },
  wallBounce: {
    frequency: 280,
    durationSeconds: 0.04,
    waveform: 'triangle',
    volume: 0.06,
  },
  floorBounce: {
    frequency: 220,
    durationSeconds: 0.06,
    waveform: 'sine',
    volume: 0.07,
  },
  reset: {
    frequency: 180,
    durationSeconds: 0.08,
    waveform: 'sawtooth',
    volume: 0.06,
  },
};

export default class GravityAudio {
  constructor(audioService = null) {
    this.audioService = audioService;
  }

  setAudioService(audioService) {
    this.audioService = audioService;
  }

  playStart() {
    return this.audioService?.playOneShot?.('gravity:start', GRAVITY_SFX.start);
  }

  playWallBounce() {
    return this.audioService?.playOneShot?.('gravity:wall-bounce', GRAVITY_SFX.wallBounce);
  }

  playFloorBounce() {
    return this.audioService?.playOneShot?.('gravity:floor-bounce', GRAVITY_SFX.floorBounce);
  }

  playReset() {
    return this.audioService?.playOneShot?.('gravity:reset', GRAVITY_SFX.reset);
  }
}
