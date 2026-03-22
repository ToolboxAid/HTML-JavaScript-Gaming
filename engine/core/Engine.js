/*
Toolbox Aid
David Quesenberry
03/21/2026
Engine.js
*/
import { CanvasRenderer } from '../render/index.js';

export default class Engine {
  constructor({ canvas, width = 960, height = 540, fixedStepMs = 1000 / 60, input = null } = {}) {
    if (!canvas) {
      throw new Error('Engine requires a canvas.');
    }

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.canvas.width = width;
    this.canvas.height = height;

    this.renderer = new CanvasRenderer(this.ctx);
    this.input = input;
    this.fixedStepMs = fixedStepMs;
    this.fixedStepSeconds = fixedStepMs / 1000;
    this.scene = null;

    this.lastTime = 0;
    this.accumulator = 0;
    this.rafId = null;

    this.tick = this.tick.bind(this);
  }

  setScene(scene) {
    this.scene = scene;

    if (this.scene && typeof this.scene.enter === 'function') {
      this.scene.enter(this);
    }
  }

  start() {
    if (this.input && typeof this.input.attach === 'function') {
      this.input.attach();
    }

    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    if (this.input && typeof this.input.detach === 'function') {
      this.input.detach();
    }
  }

  tick(now) {
    const deltaMs = now - this.lastTime;
    this.lastTime = now;
    this.accumulator += deltaMs;

    if (this.input && typeof this.input.update === 'function') {
      this.input.update(deltaMs / 1000);
    }

    while (this.accumulator >= this.fixedStepMs) {
      if (this.scene && typeof this.scene.update === 'function') {
        this.scene.update(this.fixedStepSeconds, this);
      }

      this.accumulator -= this.fixedStepMs;
    }

    if (this.scene && typeof this.scene.render === 'function') {
      this.scene.render(this.renderer, this);
    }

    this.rafId = requestAnimationFrame(this.tick);
  }
}
