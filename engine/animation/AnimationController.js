export default class AnimationController {
  constructor({ animations = {}, initial = null } = {}) {
    this.animations = animations;
    this.current = initial || Object.keys(animations)[0] || null;
    this.time = 0;
    this.frameIndex = 0;
  }

  play(name) {
    if (!this.animations[name]) {
      return;
    }

    if (this.current !== name) {
      this.current = name;
      this.time = 0;
      this.frameIndex = 0;
    }
  }

  update(dt) {
    const animation = this.animations[this.current];
    if (!animation || !animation.frames || animation.frames.length === 0) {
      return;
    }

    const frameDuration = animation.frameDuration ?? 0.15;
    this.time += dt;

    while (this.time >= frameDuration) {
      this.time -= frameDuration;
      this.frameIndex = (this.frameIndex + 1) % animation.frames.length;
    }
  }

  getFrame() {
    const animation = this.animations[this.current];
    if (!animation || !animation.frames || animation.frames.length === 0) {
      return null;
    }

    return animation.frames[this.frameIndex];
  }

  getStateName() {
    return this.current;
  }
}
