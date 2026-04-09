/*
Toolbox Aid
David Quesenberry
03/25/2026
AITargetDummyWorld.js
*/
import AITargetDummyConfig from './AITargetDummyConfig.js';
import AITargetDummyController from './AITargetDummyController.js';
import { clamp } from '/src/engine/utils/math.js';
import { safeNormalize } from '../../../src/shared/math/vectorNormalizeUtils.js';

const MAX_STEP_SECONDS = 1 / 120;

export default class AITargetDummyWorld {
  constructor({ width = 960, height = 720, config = AITargetDummyConfig } = {}) {
    this.width = width;
    this.height = height;
    this.config = config;
    this.playfield = {
      left: 56,
      right: width - 56,
      top: 96,
      bottom: height - 56,
    };
    this.status = 'menu';
    this.player = {
      x: width * 0.36,
      y: height * 0.56,
      radius: 14,
      speed: 240,
    };
    this.dummy = {
      x: width * 0.68,
      y: height * 0.42,
      radius: 16,
      vx: 0,
      vy: 0,
      headingRad: 0,
      state: 'idle',
      lastDistance: 0,
    };
    this.controller = new AITargetDummyController({ config: this.config });
    this.telemetry = {
      stateChanged: false,
      dummyState: 'idle',
      playerDistance: 0,
      decisionTimeMs: 0,
      velocity: 0,
      lastKnownTarget: null,
    };
    this.resetGame();
  }

  resetActorPositions() {
    this.player.x = this.width * 0.36;
    this.player.y = this.height * 0.56;
    this.dummy.x = this.width * 0.68;
    this.dummy.y = this.height * 0.42;
    this.controller.reset(this.dummy);
  }

  resetGame() {
    this.status = 'menu';
    this.resetActorPositions();
    this.telemetry = this.createEvent();
  }

  startGame() {
    if (this.status !== 'menu') {
      return;
    }
    this.status = 'playing';
    this.resetActorPositions();
  }

  createEvent() {
    return {
      status: this.status,
      started: false,
      reset: false,
      stateChanged: false,
      dummyState: this.dummy.state,
      playerDistance: this.dummy.lastDistance || 0,
      decisionTimeMs: this.telemetry?.decisionTimeMs || 0,
      velocity: this.telemetry?.velocity || 0,
      lastKnownTarget: this.telemetry?.lastKnownTarget || null,
    };
  }

  mergeEvents(base, next) {
    return {
      status: next.status,
      started: base.started || next.started,
      reset: base.reset || next.reset,
      stateChanged: base.stateChanged || next.stateChanged,
      dummyState: next.dummyState,
      playerDistance: next.playerDistance,
      decisionTimeMs: next.decisionTimeMs,
      velocity: next.velocity,
      lastKnownTarget: next.lastKnownTarget,
    };
  }

  movePlayer(stepSeconds, controls) {
    const axis = safeNormalize(controls.moveX ?? 0, controls.moveY ?? 0);
    this.player.x += axis.x * this.player.speed * stepSeconds;
    this.player.y += axis.y * this.player.speed * stepSeconds;
    this.player.x = clamp(this.player.x, this.playfield.left + this.player.radius, this.playfield.right - this.player.radius);
    this.player.y = clamp(this.player.y, this.playfield.top + this.player.radius, this.playfield.bottom - this.player.radius);
  }

  updateStep(stepSeconds, controls) {
    const event = this.createEvent();
    this.movePlayer(stepSeconds, controls);
    const telemetry = this.controller.update(stepSeconds, {
      dummy: this.dummy,
      player: this.player,
      playfield: this.playfield,
    });
    this.telemetry = telemetry;
    event.stateChanged = telemetry.stateChanged;
    event.dummyState = telemetry.dummyState;
    event.playerDistance = telemetry.playerDistance;
    event.decisionTimeMs = telemetry.decisionTimeMs;
    event.velocity = telemetry.velocity;
    event.lastKnownTarget = telemetry.lastKnownTarget;
    event.status = this.status;
    return event;
  }

  update(dtSeconds, controls = {}) {
    let remaining = Math.max(0, Number(dtSeconds) || 0);
    let event = this.createEvent();

    if (controls.resetPressed) {
      this.resetGame();
      event.reset = true;
      event.status = this.status;
      return event;
    }

    if (controls.startPressed && this.status === 'menu') {
      this.startGame();
      event.started = true;
    }

    if (this.status !== 'playing') {
      return event;
    }

    while (remaining > 0) {
      const step = Math.min(remaining, MAX_STEP_SECONDS);
      event = this.mergeEvents(event, this.updateStep(step, controls));
      remaining -= step;
      controls = {
        ...controls,
        startPressed: false,
      };
    }

    if (dtSeconds === 0) {
      event = this.mergeEvents(event, this.updateStep(0, controls));
    }

    return event;
  }
}
