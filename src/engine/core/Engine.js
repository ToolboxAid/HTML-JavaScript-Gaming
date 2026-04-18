/*
Toolbox Aid
David Quesenberry
03/21/2026
Engine.js
*/
import { CanvasRenderer } from '../rendering/index.js';
import RuntimeMetrics from './RuntimeMetrics.js';
import FrameClock from './FrameClock.js';
import FixedTicker from './FixedTicker.js';
import EventBus from '../events/EventBus.js';
import { Camera3D } from '../camera/index.js';
import { backgroundImage, fullscreenBezel, FullscreenService, resolvePreferredFullscreenTarget } from '../runtime/index.js';
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
    backgroundImageLayer = null,
    fullscreenBezelLayer = null,
    audio = null,
    logger = null,
    camera3D = null,
    runtimeHooks = null,
  } = {}) {
    if (!canvas) {
      throw new Error('Engine requires a canvas.');
    }

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.canvas.width = width;
    this.canvas.height = height;

    this.renderer = new CanvasRenderer(this.ctx);
    this.documentRef = globalThis.document ?? null;
    this.fullscreenTarget = resolvePreferredFullscreenTarget({
      canvas,
      documentRef: this.documentRef,
    }) || canvas;
    this.input = input;
    this.events = events || new EventBus();
    this.metrics = metrics || new RuntimeMetrics();
    this.frameClock = frameClock || new FrameClock({ maxDeltaMs: Number.POSITIVE_INFINITY });
    this.fixedTicker = fixedTicker || new FixedTicker({
      stepMs: fixedStepMs,
      maxCatchUpSteps: Number.POSITIVE_INFINITY,
    });
    this.fullscreen = fullscreen || FullscreenService.fromBrowser({
      documentRef: this.documentRef,
      target: this.fullscreenTarget,
    });
    this.backgroundImageLayer = backgroundImageLayer || new backgroundImage({
      documentRef: this.documentRef
    });
    this.fullscreenBezelLayer = fullscreenBezelLayer || new fullscreenBezel({
      canvas,
      host: this.fullscreenTarget,
      documentRef: this.documentRef
    });
    this.audio = audio || new AudioService();
    this.logger = logger || new Logger({ channel: 'engine' });
    this.runtimeHooks = {
      onError: typeof runtimeHooks?.onError === 'function' ? runtimeHooks.onError : null,
      onPerformance: typeof runtimeHooks?.onPerformance === 'function' ? runtimeHooks.onPerformance : null,
    };
    this.camera3D = camera3D || new Camera3D();
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
    this.attachScene3DCamera(this.scene);

    if (this.scene && typeof this.scene.enter === 'function') {
      this.scene.enter(this);
    }
  }

  attachScene3DCamera(scene) {
    if (!scene || !this.camera3D) {
      return;
    }

    if (typeof scene.setCamera3D === 'function') {
      try {
        scene.setCamera3D(this.camera3D, this);
      } catch (error) {
        this.trackRuntimeError('scene.setCamera3D', error, {
          severity: 'warn',
          isolated: true,
          message: 'Engine scene setCamera3D hook failed.',
        });
      }
      return;
    }

    if (scene.camera3D !== undefined && scene.camera3D !== null) {
      return;
    }

    try {
      scene.camera3D = this.camera3D;
    } catch (error) {
      this.trackRuntimeError('scene.camera3D.assign', error, {
        severity: 'warn',
        isolated: true,
        message: 'Engine scene camera3D assignment failed.',
      });
    }
  }

  trackRuntimeError(stage, error, { severity = 'error', isolated = false, context = {}, message = null } = {}) {
    const payload = {
      stage,
      isolated: isolated === true,
      severity,
      error: error?.message || String(error),
      timestamp: new Date().toISOString(),
      context: { ...context },
    };

    const loggerMethod = severity === 'warn' ? 'warn' : 'error';
    this.logger?.[loggerMethod]?.(message || 'Engine runtime issue tracked.', {
      event: 'engine.runtime.error',
      stage: payload.stage,
      isolated: payload.isolated,
      error: payload.error,
      ...payload.context,
    });

    this.events?.emit?.('engine:runtime-error', payload);
    this.runtimeHooks.onError?.(payload);
    return payload;
  }

  publishPerformanceFrame(frameData) {
    const snapshot = typeof this.metrics?.getSnapshot === 'function' ? this.metrics.getSnapshot() : null;
    const payload = {
      ...frameData,
      snapshot: snapshot ? { ...snapshot } : null,
      timestamp: new Date().toISOString(),
    };
    this.events?.emit?.('engine:performance-frame', payload);
    this.runtimeHooks.onPerformance?.(payload);
    return payload;
  }

  start() {
    if (this.input && typeof this.input.attach === 'function') {
      this.input.attach();
    }
    if (this.audio && typeof this.audio.attach === 'function') {
      this.audio.attach(this.canvas);
    }
    if (this.fullscreen && typeof this.fullscreen.attach === 'function') {
      this.fullscreen.attach(this.fullscreenTarget);
    }
    if (this.fullscreenBezelLayer && typeof this.fullscreenBezelLayer.attach === 'function') {
      this.fullscreenBezelLayer.attach();
      const fullscreenActive = this.fullscreen?.getState?.().active === true;
      const fullscreenElement = this.fullscreen?.documentRef?.fullscreenElement
        || this.documentRef?.fullscreenElement
        || null;
      this.fullscreenBezelLayer.sync({ fullscreenActive, fullscreenElement });
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
    if (this.fullscreenBezelLayer && typeof this.fullscreenBezelLayer.detach === 'function') {
      this.fullscreenBezelLayer.detach();
    }
  }

  tick(now) {
    const { deltaMs, deltaSeconds } = this.frameClock.tick(now);
    const frameStart = performance.now();
    let updateDurationMs = 0;
    let renderDurationMs = 0;
    let fixedUpdates = 0;

    if (this.input && typeof this.input.update === 'function') {
      try {
        this.input.update(deltaSeconds);
      } catch (error) {
        this.trackRuntimeError('input.update', error, { severity: 'error' });
        throw error;
      }
    }
    if (this.audio && typeof this.audio.update === 'function') {
      try {
        this.audio.update(deltaSeconds);
      } catch (error) {
        this.trackRuntimeError('audio.update', error, { severity: 'error' });
        throw error;
      }
    }

    const updateStart = performance.now();
    const tickerResult = this.fixedTicker.advance(deltaMs, (stepSeconds) => {
      if (this.scene && typeof this.scene.step3DPhysics === 'function') {
        try {
          this.scene.step3DPhysics(stepSeconds, this);
        } catch (error) {
          this.trackRuntimeError('scene.step3DPhysics', error, {
            severity: 'warn',
            isolated: true,
            message: 'Engine scene step3DPhysics hook failed.',
          });
        }
      }

      if (this.scene && typeof this.scene.update === 'function') {
        try {
          this.scene.update(stepSeconds, this);
        } catch (error) {
          this.trackRuntimeError('scene.update', error, { severity: 'error' });
          throw error;
        }
      }
    });
    fixedUpdates = tickerResult.steps;
    updateDurationMs = performance.now() - updateStart;

    const renderStart = performance.now();
    this.renderer.clear();
    this.backgroundImageLayer?.render?.(this.renderer, { scene: this.scene, engine: this });
    if (this.scene && typeof this.scene.render === 'function') {
      try {
        this.scene.render(this.renderer, this);
      } catch (error) {
        this.trackRuntimeError('scene.render', error, { severity: 'error' });
        throw error;
      }
    }
    const fullscreenActive = this.fullscreen?.getState?.().active === true;
    const fullscreenElement = this.fullscreen?.documentRef?.fullscreenElement
      || this.documentRef?.fullscreenElement
      || null;
    this.fullscreenBezelLayer?.sync?.({ fullscreenActive, fullscreenElement });
    renderDurationMs = performance.now() - renderStart;

    const frameData = {
      dtSeconds: deltaSeconds,
      frameMs: performance.now() - frameStart,
      updateMs: updateDurationMs,
      renderMs: renderDurationMs,
      fixedUpdates,
    };
    this.metrics.recordFrame(frameData);
    this.publishPerformanceFrame(frameData);

    this.rafId = requestAnimationFrame(this.tick);
  }
}
