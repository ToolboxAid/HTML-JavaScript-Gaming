/*
Toolbox Aid
David Quesenberry
03/24/2026
SpaceInvadersAudio.js
*/
const EFFECTS = {
  shoot: ['../assets/fx/shoot.wav', '../assets/effects/shoot.wav'],
  invaderkilled: ['../assets/fx/invaderkilled.wav', '../assets/effects/invaderkilled.wav'],
  explosion: ['../assets/fx/explosion.wav', '../assets/effects/explosion.wav'],
  fastinvader1: ['../assets/fx/fastinvader1.wav', '../assets/effects/fastinvader1.wav'],
  fastinvader2: ['../assets/fx/fastinvader2.wav', '../assets/effects/fastinvader2.wav'],
  fastinvader3: ['../assets/fx/fastinvader3.wav', '../assets/effects/fastinvader3.wav'],
  fastinvader4: ['../assets/fx/fastinvader4.wav', '../assets/effects/fastinvader4.wav'],
  ufo_lowpitch: ['../assets/fx/ufo_lowpitch.wav', '../assets/effects/ufo_lowpitch.wav'],
  ufo_highpitch: ['../assets/fx/ufo_highpitch.wav', '../assets/effects/ufo_highpitch.wav'],
};

export default class SpaceInvadersAudio {
  constructor({ baseUrl = import.meta.url } = {}) {
    this.baseUrl = baseUrl;
    this.enabled = typeof Audio !== 'undefined';
  }

  play(effectId) {
    const candidates = EFFECTS[effectId];
    if (!this.enabled || !candidates?.length) {
      return null;
    }

    try {
      const [firstCandidate, ...fallbackCandidates] = candidates;
      const audio = new Audio(new URL(firstCandidate, this.baseUrl).href);
      audio.volume = effectId.startsWith('ufo_') ? 0.32 : 0.42;
      if (fallbackCandidates.length) {
        audio.addEventListener('error', () => {
          const fallback = fallbackCandidates.shift();
          if (fallback) {
            audio.src = new URL(fallback, this.baseUrl).href;
            audio.play().catch(() => {});
          }
        }, { once: true });
      }
      audio.play().catch(() => {});
      return audio;
    } catch {
      return null;
    }
  }
}
