/*
Toolbox Aid
David Quesenberry
03/21/2026
Engine.js
*/
import { CanvasRenderer } from '../render/index.js';
import RuntimeMetrics from './RuntimeMetrics.js';
import EventBus from '../events/EventBus.js';
import { FullscreenService } from '../runtime/index.js';
import { AudioService } from '../audio/index.js';
import { Logger } from '../logging/index.js';
import { SettingsSystem } from '../release/index.js';

export default class Engine {
  constructor({ canvas, width = 960, height = 540, fixedStepMs = 1000 / 60, input = null, events = null, metrics = null, fullscreen = null, audio = null, logger = null } = {}) {
    if (!canvas) {
      throw new Error('Engine requires a canvas.');
    }

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.canvas.width = width;
    this.canvas.height = height;

    this.renderer = new CanvasRenderer(this.ctx);
    this.input = input;
    this.events = events || new EventBus();
    this.metrics = metrics || new RuntimeMetrics();
    this.fullscreen = fullscreen || new FullscreenService({ target: canvas });
    this.audio = audio || new AudioService();
    this.logger = logger || new Logger({ channel: 'engine' });
    this.settings = new SettingsSystem({
      namespace: 'toolboxaid:engine-settings',
      defaults: {
        audio: { musicVolume: 0.8, sfxVolume: 0.8 },
        video: { fullscreenPreferred: false },
        gameplay: { difficulty: 'normal' },
      },
    });
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
    if (this.fullscreen && typeof this.fullscreen.attach === 'function') {
      this.fullscreen.attach(this.canvas);
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
    if (this.fullscreen && typeof this.fullscreen.detach === 'function') {
      this.fullscreen.detach();
    }
  }

  tick(now) {
    const deltaMs = now - this.lastTime;
    const frameStart = performance.now();
    this.lastTime = now;
    this.accumulator += deltaMs;
    let updateDurationMs = 0;
    let renderDurationMs = 0;
    let fixedUpdates = 0;

    if (this.input && typeof this.input.update === 'function') {
      this.input.update(deltaMs / 1000);
    }
    if (this.audio && typeof this.audio.update === 'function') {
      this.audio.update(deltaMs / 1000);
    }

    const updateStart = performance.now();
    while (this.accumulator >= this.fixedStepMs) {
      if (this.scene && typeof this.scene.update === 'function') {
        this.scene.update(this.fixedStepSeconds, this);
      }

      this.accumulator -= this.fixedStepMs;
      fixedUpdates += 1;
    }
    updateDurationMs = performance.now() - updateStart;

    const renderStart = performance.now();
    if (this.scene && typeof this.scene.render === 'function') {
      this.scene.render(this.renderer, this);
    }
    renderDurationMs = performance.now() - renderStart;

    this.metrics.recordFrame({
      dtSeconds: deltaMs / 1000,
      frameMs: performance.now() - frameStart,
      updateMs: updateDurationMs,
      renderMs: renderDurationMs,
      fixedUpdates,
    });

    this.rafId = requestAnimationFrame(this.tick);
  }
}
