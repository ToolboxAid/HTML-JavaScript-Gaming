/*
Toolbox Aid
David Quesenberry
03/24/2026
BreakoutAudio.js
*/
const BREAKOUT_SFX = {
  serve: {
    frequency: 420,
    durationSeconds: 0.05,
    waveform: 'square',
    volume: 0.09,
  },
  paddleHit: {
    frequency: 580,
    durationSeconds: 0.05,
    waveform: 'square',
    volume: 0.08,
  },
  brickHit: {
    frequency: 720,
    durationSeconds: 0.04,
    waveform: 'square',
    volume: 0.08,
  },
  wallHit: {
    frequency: 280,
    durationSeconds: 0.04,
    waveform: 'triangle',
    volume: 0.06,
  },
  loseLife: {
    frequency: 180,
    durationSeconds: 0.16,
    waveform: 'sawtooth',
    volume: 0.09,
  },
  win: {
    frequency: 880,
    durationSeconds: 0.12,
    waveform: 'square',
    volume: 0.1,
  },
};

export default class BreakoutAudio {
  constructor(audioService = null) {
    this.audioService = audioService;
  }

  setAudioService(audioService) {
    this.audioService = audioService;
  }

  playServe() {
    return this.audioService?.playOneShot?.('breakout:serve', BREAKOUT_SFX.serve);
  }

  playPaddleHit() {
    return this.audioService?.playOneShot?.('breakout:paddle-hit', BREAKOUT_SFX.paddleHit);
  }

  playBrickHit() {
    return this.audioService?.playOneShot?.('breakout:brick-hit', BREAKOUT_SFX.brickHit);
  }

  playWallHit() {
    return this.audioService?.playOneShot?.('breakout:wall-hit', BREAKOUT_SFX.wallHit);
  }

  playLoseLife() {
    return this.audioService?.playOneShot?.('breakout:lose-life', BREAKOUT_SFX.loseLife);
  }

  playWin() {
    return this.audioService?.playOneShot?.('breakout:win', BREAKOUT_SFX.win);
  }
}
