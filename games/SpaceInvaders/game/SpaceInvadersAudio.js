/*
Toolbox Aid
David Quesenberry
03/24/2026
SpaceInvadersAudio.js
*/
const EFFECTS = {
  // Serve from existing effects directory; fx paths kept as fallback if ever added.
  shoot: ['../assets/effects/shoot.wav', '../assets/fx/shoot.wav'],
  invaderkilled: ['../assets/effects/invaderkilled.wav', '../assets/fx/invaderkilled.wav'],
  explosion: ['../assets/effects/explosion.wav', '../assets/fx/explosion.wav'],
  fastinvader1: ['../assets/effects/fastinvader1.wav', '../assets/fx/fastinvader1.wav'],
  fastinvader2: ['../assets/effects/fastinvader2.wav', '../assets/fx/fastinvader2.wav'],
  fastinvader3: ['../assets/effects/fastinvader3.wav', '../assets/fx/fastinvader3.wav'],
  fastinvader4: ['../assets/effects/fastinvader4.wav', '../assets/fx/fastinvader4.wav'],
  ufo_lowpitch: ['../assets/effects/ufo_lowpitch.wav', '../assets/fx/ufo_lowpitch.wav'],
  ufo_highpitch: ['../assets/effects/ufo_highpitch.wav', '../assets/fx/ufo_highpitch.wav'],
};

export default class SpaceInvadersAudio {
  constructor({ baseUrl = import.meta.url } = {}) {
    this.baseUrl = baseUrl;
    this.enabled = typeof Audio !== 'undefined';
    this.muted = false;
    this.ufoLoop = null;
    this.ufoLoopId = null;
  }

  setMuted(muted) {
    this.muted = Boolean(muted);
    if (this.muted) {
      this.stopUfoLoop();
    }
  }

  play(effectId) {
    const candidates = EFFECTS[effectId];
    if (!this.enabled || this.muted || !candidates?.length) {
      return null;
    }

    try {
      const [firstCandidate, ...fallbackCandidates] = candidates;
      const audio = new Audio(new URL(firstCandidate, this.baseUrl).href);
      audio.volume = effectId.startsWith('ufo_') ? 0.32 : 0.42;
      if (fallbackCandidates.length && typeof audio.addEventListener === 'function') {
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

  startUfoLoop(direction = 1) {
    if (!this.enabled || this.muted) {
      return;
    }
    const desiredId = direction > 0 ? 'ufo_lowpitch' : 'ufo_highpitch';
    if (this.ufoLoop && this.ufoLoopId === desiredId) {
      // If we already have the right loop but it paused for any reason, resume it.
      if (this.ufoLoop.paused || this.ufoLoop.ended) {
        this.ufoLoop.currentTime = 0;
        this.ufoLoop.play().catch(() => {});
      } else {
        // Nudge playback to avoid browsers suspending background loops.
        this.ufoLoop.play().catch(() => {});
      }
      return;
    }
    this.stopUfoLoop();
    const candidates = EFFECTS[desiredId] ?? [];
    if (!candidates.length) {
      return;
    }
    const audio = new Audio(new URL(candidates[0], this.baseUrl).href);
    audio.loop = true;
    audio.volume = 0.35;
    if (typeof audio.addEventListener === 'function') {
      audio.addEventListener('timeupdate', () => {
        // Manually tighten the loop to avoid gaps; rewind slightly before file end.
        if (audio.duration && audio.currentTime > audio.duration - 0.018) {
          audio.currentTime = 0.01;
          if (audio.paused) {
            audio.play().catch(() => {});
          }
        }
      });
      audio.addEventListener('ended', () => {
        if (this.ufoLoop === audio && !this.muted) {
          audio.currentTime = 0;
          audio.play().catch(() => {});
        }
      });
    }
    audio.play().catch(() => {});
    this.ufoLoop = audio;
    this.ufoLoopId = desiredId;
  }

  stopUfoLoop() {
    if (this.ufoLoop) {
      this.ufoLoop.pause();
      this.ufoLoop.currentTime = 0;
      this.ufoLoop = null;
      this.ufoLoopId = null;
    }
  }
}
