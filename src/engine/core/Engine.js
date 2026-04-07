/*
Toolbox Aid
David Quesenberry
03/21/2026
Engine.js
*/
import { CanvasRenderer } from '../render/index.js';
import RuntimeMetrics from './RuntimeMetrics.js';
import FrameClock from './FrameClock.js';
import FixedTicker from './FixedTicker.js';
import EventBus from '../events/EventBus.js';
import { FullscreenService } from '../runtime/index.js';
import { AudioService } from '../audio/index.js';
import { Logger } from '../logging/index.js';
import { SettingsSystem } from '../release/index.js';

export default class Engine {
  constructor({
    canvas,
    width = 960,
    height = 540,
    fixedStepMs = 1000 / 60,
    input = null,
    events = null,
    metrics = null,
    frameClock = null,
    fixedTicker = null,
    fullscreen = null,
    audio = null,
    logger = null,
  } = {}) {
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
    this.frameClock = frameClock || new FrameClock({ maxDeltaMs: Number.POSITIVE_INFINITY });
    this.fixedTicker = fixedTicker || new FixedTicker({
      stepMs: fixedStepMs,
      maxCatchUpSteps: Number.POSITIVE_INFINITY,
    });
    this.fullscreen = fullscreen || FullscreenService.fromBrowser({
      documentRef: globalThis.document ?? null,
      target: canvas,
    });
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

    this.rafId = null;

    this.tick = this.tick.bind(this);
  }

  setScene(scene) {
    if (scene === this.scene) {
      return;
    }

    const previousScene = this.scene;

    if (previousScene && typeof previousScene.exit === 'function') {
      previousScene.exit(this);
    }

    this.scene = scene;

    if (this.scene && typeof this.scene.enter === 'function') {
      this.scene.enter(this);
    }
  }

  start() {
    if (this.input && typeof this.input.attach === 'function') {
      this.input.attach();
    }
    if (this.audio && typeof this.audio.attach === 'function') {
      this.audio.attach(this.canvas);
    }
    if (this.fullscreen && typeof this.fullscreen.attach === 'function') {
      this.fullscreen.attach(this.canvas);
    }

    this.frameClock.reset();
    this.fixedTicker.reset();
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
    if (this.audio && typeof this.audio.detach === 'function') {
      this.audio.detach();
    }
    if (this.fullscreen && typeof this.fullscreen.detach === 'function') {
      this.fullscreen.detach();
    }
  }

  tick(now) {
    const { deltaMs, deltaSeconds } = this.frameClock.tick(now);
    const frameStart = performance.now();
    let updateDurationMs = 0;
    let renderDurationMs = 0;
    let fixedUpdates = 0;

    if (this.input && typeof this.input.update === 'function') {
      this.input.update(deltaSeconds);
    }
    if (this.audio && typeof this.audio.update === 'function') {
      this.audio.update(deltaSeconds);
    }

    const updateStart = performance.now();
    const tickerResult = this.fixedTicker.advance(deltaMs, (stepSeconds) => {
      if (this.scene && typeof this.scene.update === 'function') {
        this.scene.update(stepSeconds, this);
      }
    });
    fixedUpdates = tickerResult.steps;
    updateDurationMs = performance.now() - updateStart;

    const renderStart = performance.now();
    if (this.scene && typeof this.scene.render === 'function') {
      this.scene.render(this.renderer, this);
    }
    renderDurationMs = performance.now() - renderStart;

    this.metrics.recordFrame({
      dtSeconds: deltaSeconds,
      frameMs: performance.now() - frameStart,
      updateMs: updateDurationMs,
      renderMs: renderDurationMs,
      fixedUpdates,
    });

    this.rafId = requestAnimationFrame(this.tick);
  }
}
