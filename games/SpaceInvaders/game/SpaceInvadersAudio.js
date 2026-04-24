/*
Toolbox Aid
David Quesenberry
03/24/2026
SpaceInvadersAudio.js
*/
import { resolveWorkspaceGameAssetPath } from "../../shared/workspaceGameAssetCatalog.js";

const SPACE_INVADERS_GAME_ID = "SpaceInvaders";
const EFFECT_ASSET_IDS = Object.freeze({
  shoot: "audio.space-invaders.shoot",
  invaderkilled: "audio.space-invaders.invaderkilled",
  explosion: "audio.space-invaders.explosion",
  fastinvader1: "audio.space-invaders.fastinvader1",
  fastinvader2: "audio.space-invaders.fastinvader2",
  fastinvader3: "audio.space-invaders.fastinvader3",
  fastinvader4: "audio.space-invaders.fastinvader4",
  ufo_lowpitch: "audio.space-invaders.ufo-lowpitch",
  ufo_highpitch: "audio.space-invaders.ufo-highpitch"
});

export default class SpaceInvadersAudio {
  constructor({ baseUrl = import.meta.url } = {}) {
    this.baseUrl = baseUrl;
    this.enabled = typeof Audio !== 'undefined';
    this.muted = false;
    this.ufoLoop = null;
    this.ufoLoopId = null;
  }

  resolveEffectPath(effectId) {
    const assetId = EFFECT_ASSET_IDS[effectId];
    if (!assetId) {
      return "";
    }
    return resolveWorkspaceGameAssetPath(SPACE_INVADERS_GAME_ID, assetId);
  }

  setMuted(muted) {
    this.muted = Boolean(muted);
    if (this.muted) {
      this.stopUfoLoop();
    }
  }

  play(effectId) {
    const path = this.resolveEffectPath(effectId);
    if (!this.enabled || this.muted || !path) {
      return null;
    }

    try {
      const audio = new Audio(new URL(path, this.baseUrl).href);
      audio.volume = effectId.startsWith('ufo_') ? 0.32 : 0.42;
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
    const path = this.resolveEffectPath(desiredId);
    if (!path) {
      return;
    }
    const audio = new Audio(new URL(path, this.baseUrl).href);
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
