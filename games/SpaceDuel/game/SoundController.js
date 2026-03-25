/*
Toolbox Aid
David Quesenberry
03/25/2026
SoundController.js
*/
const EFFECTS = {
  thrust: '../assets/effects/thrust.wav',
  fire: '../assets/effects/fire.wav',
  explosion: '../assets/effects/explosion.wav',
  playerDeath: '../assets/effects/player_death.wav',
  enemySplit: '../assets/effects/enemy_split.wav',
  bonus: '../assets/effects/bonus.wav',
  start: '../assets/effects/start.wav',
  gameOver: '../assets/effects/game_over.wav',
};

export default class SoundController {
  constructor({ baseUrl = import.meta.url } = {}) {
    this.baseUrl = baseUrl;
    this.enabled = typeof Audio !== 'undefined';
    this.lastThrustAt = 0;
    this.lastPlayedAt = new Map();
  }

  play(effectId, { volume = 0.42 } = {}) {
    const path = EFFECTS[effectId];
    if (!this.enabled || !path) {
      return null;
    }

    const now = (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
    const minInterval = effectId === 'fire'
      ? 0.045
      : effectId === 'enemySplit'
        ? 0.06
        : 0;
    const since = now - (this.lastPlayedAt.get(effectId) ?? -999);
    if (since < minInterval) {
      return null;
    }
    this.lastPlayedAt.set(effectId, now);

    try {
      const audio = new Audio(new URL(path, this.baseUrl).href);
      audio.volume = volume;
      audio.play().catch(() => {});
      return audio;
    } catch {
      return null;
    }
  }

  playThrustBurst(nowSeconds) {
    if (!this.enabled) {
      return;
    }

    if (nowSeconds - this.lastThrustAt < 0.08) {
      return;
    }

    this.lastThrustAt = nowSeconds;
    this.play('thrust', { volume: 0.3 });
  }
}
