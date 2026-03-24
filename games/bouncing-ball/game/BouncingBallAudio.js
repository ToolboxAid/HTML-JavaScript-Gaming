/*
Toolbox Aid
David Quesenberry
03/24/2026
BouncingBallAudio.js
*/
const BOUNCING_BALL_SFX = {
  start: {
    frequency: 420,
    durationSeconds: 0.05,
    waveform: 'square',
    volume: 0.08,
  },
  bounce: {
    frequency: 300,
    durationSeconds: 0.04,
    waveform: 'triangle',
    volume: 0.06,
  },
  reset: {
    frequency: 220,
    durationSeconds: 0.07,
    waveform: 'sine',
    volume: 0.07,
  },
};

export default class BouncingBallAudio {
  constructor(audioService = null) {
    this.audioService = audioService;
  }

  setAudioService(audioService) {
    this.audioService = audioService;
  }

  playStart() {
    return this.audioService?.playOneShot?.('bouncing-ball:start', BOUNCING_BALL_SFX.start);
  }

  playBounce() {
    return this.audioService?.playOneShot?.('bouncing-ball:bounce', BOUNCING_BALL_SFX.bounce);
  }

  playReset() {
    return this.audioService?.playOneShot?.('bouncing-ball:reset', BOUNCING_BALL_SFX.reset);
  }
}
