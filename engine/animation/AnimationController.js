/*
Toolbox Aid
David Quesenberry
03/21/2026
AnimationController.js
*/
export default class AnimationController {
  constructor({ animations = {}, initial = null } = {}) {
    this.animations = animations;
    this.current = initial || Object.keys(animations)[0] || null;
    this.time = 0;
    this.frameIndex = 0;
    this.finished = false;
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
    if (!animation || !Array.isArray(animation.frames) || animation.frames.length === 0) {
      return;
    }

    if (this.finished && animation.loop === false) {
      return;
    }

    const frameDuration = animation.frameDuration ?? 0.15;
    this.time += dt;

    while (this.time >= frameDuration) {
      this.time -= frameDuration;

      if (this.frameIndex < animation.frames.length - 1) {
        this.frameIndex += 1;
        continue;
      }

      if (animation.loop === false) {
        this.finished = true;
        this.frameIndex = animation.frames.length - 1;
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
    if (!animation || !Array.isArray(animation.frames) || animation.frames.length === 0) {
      return null;
    }

    return animation.frames[this.frameIndex];
  }

  getStateName() {
    return this.current;
  }
}
