/*
Toolbox Aid
David Quesenberry
03/25/2026
SoundController.js
*/
import { resolveWorkspaceGameAssetPath } from "../../shared/workspaceGameAssetCatalog.js";

const SPACE_DUEL_GAME_ID = "SpaceDuel";
const EFFECT_ASSET_IDS = Object.freeze({
  thrust: "audio.space-duel.thrust",
  fire: "audio.space-duel.fire",
  explosion: "audio.space-duel.explosion",
  playerDeath: "audio.space-duel.player-death",
  enemySplit: "audio.space-duel.enemy-split",
  bonus: "audio.space-duel.bonus",
  start: "audio.space-duel.start",
  gameOver: "audio.space-duel.game-over"
});

export default class SoundController {
  constructor({ baseUrl = import.meta.url } = {}) {
    this.baseUrl = baseUrl;
    this.enabled = typeof Audio !== 'undefined';
    this.lastThrustAt = 0;
    this.lastPlayedAt = new Map();
  }

  resolveEffectPath(effectId) {
    const assetId = EFFECT_ASSET_IDS[effectId];
    if (!assetId) {
      return "";
    }
    return resolveWorkspaceGameAssetPath(SPACE_DUEL_GAME_ID, assetId);
  }

  play(effectId, { volume = 0.42 } = {}) {
    const path = this.resolveEffectPath(effectId);
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
