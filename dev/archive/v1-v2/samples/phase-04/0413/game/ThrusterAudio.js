/*
Toolbox Aid
David Quesenberry
03/24/2026
ThrusterAudio.js
*/
const THRUSTER_SFX = {
  start: {
    frequency: 420,
    durationSeconds: 0.05,
    waveform: 'square',
    volume: 0.08,
  },
  thrust: {
    frequency: 260,
    durationSeconds: 0.035,
    waveform: 'triangle',
    volume: 0.05,
  },
  wallBounce: {
    frequency: 320,
    durationSeconds: 0.04,
    waveform: 'square',
    volume: 0.06,
  },
  reset: {
    frequency: 180,
    durationSeconds: 0.08,
    waveform: 'sine',
    volume: 0.06,
  },
};

export default class ThrusterAudio {
  constructor(audioService = null) {
    this.audioService = audioService;
  }

  setAudioService(audioService) {
    this.audioService = audioService;
  }

  playStart() {
    return this.audioService?.playOneShot?.('thruster:start', THRUSTER_SFX.start);
  }

  playThrust() {
    return this.audioService?.playOneShot?.('thruster:thrust', THRUSTER_SFX.thrust);
  }

  playWallBounce() {
    return this.audioService?.playOneShot?.('thruster:wall-bounce', THRUSTER_SFX.wallBounce);
  }

  playReset() {
    return this.audioService?.playOneShot?.('thruster:reset', THRUSTER_SFX.reset);
  }
}
