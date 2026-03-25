/*
Toolbox Aid
David Quesenberry
03/25/2026
AITargetDummyWorld.js
*/
const MAX_STEP_SECONDS = 1 / 120;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function safeNormalize(x, y) {
  const length = Math.hypot(x, y);
  if (length <= 1e-6) {
    return { x: 0, y: 0, length: 0 };
  }
  return { x: x / length, y: y / length, length };
}

export default class AITargetDummyWorld {
  constructor({ width = 960, height = 720 } = {}) {
    this.width = width;
    this.height = height;
    this.playfield = {
      left: 56,
      right: width - 56,
      top: 96,
      bottom: height - 56,
    };
    this.status = 'menu';
    this.stateTimer = 0;
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
      speed: 170,
      state: 'idle',
      senseRadius: 280,
      attackRadius: 62,
      attackWindupSeconds: 0.22,
      cooldownSeconds: 0.65,
      recoverSeconds: 0.2,
      attacksLanded: 0,
      lastDistance: 0,
    };
    this.resetGame();
  }

  resetActorPositions() {
    this.player.x = this.width * 0.36;
    this.player.y = this.height * 0.56;
    this.dummy.x = this.width * 0.68;
    this.dummy.y = this.height * 0.42;
    this.dummy.state = 'idle';
    this.dummy.attacksLanded = 0;
    this.stateTimer = 0;
  }

  resetGame() {
    this.status = 'menu';
    this.resetActorPositions();
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
      attackTriggered: false,
      stateChanged: false,
      dummyState: this.dummy.state,
      playerDistance: this.dummy.lastDistance || 0,
    };
  }

  mergeEvents(base, next) {
    return {
      status: next.status,
      started: base.started || next.started,
      reset: base.reset || next.reset,
      attackTriggered: base.attackTriggered || next.attackTriggered,
      stateChanged: base.stateChanged || next.stateChanged,
      dummyState: next.dummyState,
      playerDistance: next.playerDistance,
    };
  }

  setDummyState(nextState, event) {
    if (this.dummy.state === nextState) {
      return;
    }
    this.dummy.state = nextState;
    event.stateChanged = true;
  }

  movePlayer(stepSeconds, controls) {
    const axis = safeNormalize(controls.moveX ?? 0, controls.moveY ?? 0);
    this.player.x += axis.x * this.player.speed * stepSeconds;
    this.player.y += axis.y * this.player.speed * stepSeconds;
    this.player.x = clamp(this.player.x, this.playfield.left + this.player.radius, this.playfield.right - this.player.radius);
    this.player.y = clamp(this.player.y, this.playfield.top + this.player.radius, this.playfield.bottom - this.player.radius);
  }

  updateDummy(stepSeconds, event) {
    const toPlayerX = this.player.x - this.dummy.x;
    const toPlayerY = this.player.y - this.dummy.y;
    const toPlayer = safeNormalize(toPlayerX, toPlayerY);
    this.dummy.lastDistance = toPlayer.length;
    event.playerDistance = toPlayer.length;

    const disengageDistance = this.dummy.senseRadius * 1.12;
    if (toPlayer.length > disengageDistance && this.dummy.state !== 'attack') {
      this.setDummyState('idle', event);
    }

    if (this.dummy.state === 'idle') {
      if (toPlayer.length <= this.dummy.senseRadius) {
        this.setDummyState('chase', event);
      }
      event.dummyState = this.dummy.state;
      return;
    }

    if (this.dummy.state === 'chase') {
      this.dummy.x += toPlayer.x * this.dummy.speed * stepSeconds;
      this.dummy.y += toPlayer.y * this.dummy.speed * stepSeconds;
      this.dummy.x = clamp(this.dummy.x, this.playfield.left + this.dummy.radius, this.playfield.right - this.dummy.radius);
      this.dummy.y = clamp(this.dummy.y, this.playfield.top + this.dummy.radius, this.playfield.bottom - this.dummy.radius);
      if (toPlayer.length <= this.dummy.attackRadius) {
        this.setDummyState('attack', event);
        this.stateTimer = this.dummy.attackWindupSeconds;
      }
      event.dummyState = this.dummy.state;
      return;
    }

    if (this.dummy.state === 'attack') {
      this.stateTimer = Math.max(0, this.stateTimer - stepSeconds);
      if (this.stateTimer === 0) {
        this.dummy.attacksLanded += 1;
        event.attackTriggered = true;
        this.setDummyState('cooldown', event);
        this.stateTimer = this.dummy.cooldownSeconds;
      }
      event.dummyState = this.dummy.state;
      return;
    }

    if (this.dummy.state === 'cooldown') {
      this.stateTimer = Math.max(0, this.stateTimer - stepSeconds);
      if (this.stateTimer === 0) {
        this.setDummyState('recover', event);
        this.stateTimer = this.dummy.recoverSeconds;
      }
      event.dummyState = this.dummy.state;
      return;
    }

    if (this.dummy.state === 'recover') {
      this.stateTimer = Math.max(0, this.stateTimer - stepSeconds);
      if (this.stateTimer === 0) {
        this.setDummyState(toPlayer.length <= this.dummy.attackRadius ? 'attack' : 'chase', event);
        this.stateTimer = this.dummy.state === 'attack' ? this.dummy.attackWindupSeconds : 0;
      }
      event.dummyState = this.dummy.state;
    }
  }

  updateStep(stepSeconds, controls) {
    const event = this.createEvent();
    this.movePlayer(stepSeconds, controls);
    this.updateDummy(stepSeconds, event);
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
      event.status = this.status;
      event.dummyState = this.dummy.state;
      event.playerDistance = this.dummy.lastDistance;
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
