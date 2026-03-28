/*
Toolbox Aid
David Quesenberry
03/21/2026
AnimationController.js
*/
export default class AnimationController {
  constructor({ animations = {}, initial = null, playbackOrderOverride = null } = {}) {
    this.animations = animations;
    this.current = initial || Object.keys(animations)[0] || null;
    this.playbackOrderOverride = playbackOrderOverride;
    this.time = 0;
    this.frameIndex = 0;
    this.finished = false;
  }

  normalizePlaybackOrderOverride(override, frameCount) {
    if (Array.isArray(override)) {
      const order = override
        .map((idx) => Number(idx))
        .filter((idx) => Number.isInteger(idx) && idx >= 0 && idx < frameCount);
      return order.length ? order : null;
    }
    if (!override || typeof override !== 'object' || override.enabled === false || !Array.isArray(override.order)) {
      return null;
    }
    const order = override.order
      .map((idx) => Number(idx))
      .filter((idx) => Number.isInteger(idx) && idx >= 0 && idx < frameCount);
    return order.length ? order : null;
  }

  getResolvedFrames(animation) {
    const frames = Array.isArray(animation?.frames) ? animation.frames : [];
    if (!frames.length) return [];
    const localOverride = Object.prototype.hasOwnProperty.call(animation, 'playbackOrderOverride')
      ? animation.playbackOrderOverride
      : this.playbackOrderOverride;
    const order = this.normalizePlaybackOrderOverride(localOverride, frames.length);
    if (!order) return frames;
    return order.map((index) => frames[index]);
  }

  play(name, { restart = false } = {}) {
    if (!this.animations[name]) {
      return;
    }

    if (this.current !== name || restart) {
      this.current = name;
      this.time = 0;
      this.frameIndex = 0;
      this.finished = false;
    }
  }

  update(dt) {
    const animation = this.animations[this.current];
    const frames = this.getResolvedFrames(animation);
    if (!animation || frames.length === 0) {
      return;
    }

    if (this.finished && animation.loop === false) {
      return;
    }

    const frameDuration = animation.frameDuration ?? 0.15;
    this.time += dt;

    while (this.time >= frameDuration) {
      this.time -= frameDuration;

      if (this.frameIndex < frames.length - 1) {
        this.frameIndex += 1;
        continue;
      }

      if (animation.loop === false) {
        this.finished = true;
        this.frameIndex = frames.length - 1;
        break;
      }

      this.frameIndex = 0;
    }
  }

  isFinished() {
    return this.finished;
  }

  getFrame() {
    const animation = this.animations[this.current];
    const frames = this.getResolvedFrames(animation);
    if (!animation || frames.length === 0) {
      return null;
    }
    if (this.frameIndex < 0) this.frameIndex = 0;
    if (this.frameIndex > frames.length - 1) this.frameIndex = frames.length - 1;
    return frames[this.frameIndex];
  }

  getStateName() {
    return this.current;
  }
}
