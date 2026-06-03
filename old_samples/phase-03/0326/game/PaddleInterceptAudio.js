/*
Toolbox Aid
David Quesenberry
03/24/2026
PaddleInterceptAudio.js
*/
const SFX = {
  start: { frequency: 410, durationSeconds: 0.06, waveform: 'square', volume: 0.08 },
  wallBounce: { frequency: 270, durationSeconds: 0.04, waveform: 'triangle', volume: 0.05 },
  intercept: { frequency: 520, durationSeconds: 0.05, waveform: 'sine', volume: 0.06 },
  reset: { frequency: 180, durationSeconds: 0.08, waveform: 'sawtooth', volume: 0.06 },
};

export default class PaddleInterceptAudio {
  constructor(audioService = null) {
    this.audioService = audioService;
  }

  setAudioService(audioService) {
    this.audioService = audioService;
  }

  playStart() {
    return this.audioService?.playOneShot?.('paddle-intercept:start', SFX.start);
  }

  playWallBounce() {
    return this.audioService?.playOneShot?.('paddle-intercept:wall', SFX.wallBounce);
  }

  playIntercept() {
    return this.audioService?.playOneShot?.('paddle-intercept:intercept', SFX.intercept);
  }

  playReset() {
    return this.audioService?.playOneShot?.('paddle-intercept:reset', SFX.reset);
  }
}
