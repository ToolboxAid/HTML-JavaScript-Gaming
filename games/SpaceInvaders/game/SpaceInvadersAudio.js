/*
Toolbox Aid
David Quesenberry
03/24/2026
SpaceInvadersAudio.js
*/
const EFFECTS = {
  shoot: '../assets/effects/shoot.wav',
  invaderkilled: '../assets/effects/invaderkilled.wav',
  explosion: '../assets/effects/explosion.wav',
  fastinvader1: '../assets/effects/fastinvader1.wav',
  fastinvader2: '../assets/effects/fastinvader2.wav',
  fastinvader3: '../assets/effects/fastinvader3.wav',
  fastinvader4: '../assets/effects/fastinvader4.wav',
  ufo_lowpitch: '../assets/effects/ufo_lowpitch.wav',
  ufo_highpitch: '../assets/effects/ufo_highpitch.wav',
};

export default class SpaceInvadersAudio {
  constructor({ baseUrl = import.meta.url } = {}) {
    this.baseUrl = baseUrl;
    this.enabled = typeof Audio !== 'undefined';
  }

  play(effectId) {
    if (!this.enabled || !EFFECTS[effectId]) {
      return null;
    }

    try {
      const audio = new Audio(new URL(EFFECTS[effectId], this.baseUrl).href);
      audio.volume = effectId.startsWith('ufo_') ? 0.32 : 0.42;
      audio.play().catch(() => {});
      return audio;
    } catch {
      return null;
    }
  }
}
