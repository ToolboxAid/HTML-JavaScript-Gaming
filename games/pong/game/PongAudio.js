/*
Toolbox Aid
David Quesenberry
03/24/2026
PongAudio.js

Recommended Defaults
- Serve: frequency 440 Hz, duration 0.06 s, wave square, volume 0.10
- Paddle hit: frequency 660 Hz, duration 0.05 s, wave square, volume 0.09
- Wall hit: frequency 320 Hz, duration 0.04 s, wave triangle, volume 0.07
- Score: frequency 880 Hz, duration 0.10 s, wave sine, volume 0.11
*/
const PONG_SFX = {
  serve: {
    frequency: 440,
    durationSeconds: 0.06,
    waveform: 'square',
    volume: 0.1,
  },
  paddleHit: {
    frequency: 660,
    durationSeconds: 0.05,
    waveform: 'square',
    volume: 0.09,
  },
  wallHit: {
    frequency: 320,
    durationSeconds: 0.04,
    waveform: 'triangle',
    volume: 0.07,
  },
  score: {
    frequency: 880,
    durationSeconds: 0.3,
    waveform: 'sine',
    volume: 0.11,
  },
};

export default class PongAudio {
  constructor(audioService = null) {
    this.audioService = audioService;
  }

  setAudioService(audioService) {
    this.audioService = audioService;
  }

  playServe() {
    return this.audioService?.playOneShot?.('pong:serve', PONG_SFX.serve);
  }

  playPaddleHit() {
    return this.audioService?.playOneShot?.('pong:paddle-hit', PONG_SFX.paddleHit);
  }

  playWallHit() {
    return this.audioService?.playOneShot?.('pong:wall-hit', PONG_SFX.wallHit);
  }

  playScore() {
    return this.audioService?.playOneShot?.('pong:score', PONG_SFX.score);
  }
}
