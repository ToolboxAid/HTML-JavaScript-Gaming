/*
Toolbox Aid
David Quesenberry
03/24/2026
GravityWorld.js
*/
const MAX_STEP_SECONDS = 1 / 120;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export default class GravityWorld {
  constructor({ width = 960, height = 720 } = {}) {
    this.width = width;
    this.height = height;
    this.wallThickness = 18;
    this.playfield = {
      left: 48,
      right: width - 48,
      top: 92,
      bottom: height - 42,
    };
    this.gravity = 980;
    this.horizontalAcceleration = 720;
    this.horizontalDrag = 1.8;
    this.wallBounceDamping = 0.94;
    this.floorBounceDamping = 0.68;
    this.ceilingBounceDamping = 0.9;
    this.restThreshold = 115;
    this.status = 'menu';
    this.ball = this.createBall();
    this.resetBall();
  }

  createBall() {
    return {
      size: 26,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      resting: false,
    };
  }

  resetBall() {
    this.ball.x = (this.width / 2) - (this.ball.size / 2);
    this.ball.y = 156;
    this.ball.vx = 60;
    this.ball.vy = 0;
    this.ball.resting = false;
  }

  resetGame() {
    this.status = 'menu';
    this.resetBall();
  }

  startGame() {
    if (this.status === 'menu') {
      this.status = 'playing';
    }
  }

  update(dt, controls = {}) {
    let remaining = Math.max(0, Number(dt) || 0);
    let latestEvent = this.createEvent();

    if (controls.resetPressed) {
      this.resetGame();
      latestEvent.reset = true;
      latestEvent.status = this.status;
      return latestEvent;
    }

    if (controls.startPressed && this.status === 'menu') {
      this.startGame();
      latestEvent.started = true;
    }

    if (this.status !== 'playing') {
      latestEvent.status = this.status;
      return latestEvent;
    }

    while (remaining > 0) {
      const step = Math.min(remaining, MAX_STEP_SECONDS);
      latestEvent = this.mergeEvents(latestEvent, this.updateStep(step, controls));
      remaining -= step;
    }

    if (dt === 0) {
      latestEvent = this.mergeEvents(latestEvent, this.updateStep(0, controls));
    }

    latestEvent.status = this.status;
    return latestEvent;
  }

  createEvent() {
    return {
      status: this.status,
      started: false,
      reset: false,
      wallBounced: false,
      floorBounced: false,
      bounceCount: 0,
      settled: false,
    };
  }

  mergeEvents(base, next) {
    return {
      status: next.status,
      started: base.started || next.started,
      reset: base.reset || next.reset,
      wallBounced: base.wallBounced || next.wallBounced,
      floorBounced: base.floorBounced || next.floorBounced,
      bounceCount: base.bounceCount + next.bounceCount,
      settled: base.settled || next.settled,
    };
  }

  updateStep(dt, controls = {}) {
    const event = this.createEvent();
    const maxX = this.playfield.right - this.ball.size;
    const maxY = this.playfield.bottom - this.ball.size;
    const horizontal = clamp(Number(controls.horizontal) || 0, -1, 1);

    if (this.ball.resting && horizontal === 0) {
      this.ball.x = clamp(this.ball.x, this.playfield.left, maxX);
      this.ball.y = maxY;
      event.status = this.status;
      return event;
    }

    this.ball.resting = false;
    this.ball.vx += horizontal * this.horizontalAcceleration * dt;
    this.ball.vx *= Math.max(0, 1 - (this.horizontalDrag * dt));
    this.ball.vy += this.gravity * dt;

    this.ball.x += this.ball.vx * dt;
    this.ball.y += this.ball.vy * dt;

    if (this.ball.x <= this.playfield.left) {
      this.ball.x = this.playfield.left;
      this.ball.vx = Math.abs(this.ball.vx) * this.wallBounceDamping;
      event.wallBounced = true;
      event.bounceCount += 1;
    } else if (this.ball.x >= maxX) {
      this.ball.x = maxX;
      this.ball.vx = -Math.abs(this.ball.vx) * this.wallBounceDamping;
      event.wallBounced = true;
      event.bounceCount += 1;
    }

    if (this.ball.y <= this.playfield.top) {
      this.ball.y = this.playfield.top;
      this.ball.vy = Math.abs(this.ball.vy) * this.ceilingBounceDamping;
      event.wallBounced = true;
      event.bounceCount += 1;
    } else if (this.ball.y >= maxY) {
      const impactSpeed = Math.abs(this.ball.vy);
      this.ball.y = maxY;
      if (impactSpeed <= this.restThreshold) {
        this.ball.vy = 0;
        this.ball.resting = true;
        event.settled = true;
      } else {
        this.ball.vy = -impactSpeed * this.floorBounceDamping;
        event.floorBounced = true;
        event.bounceCount += 1;
      }
    }

    this.ball.x = clamp(this.ball.x, this.playfield.left, maxX);
    this.ball.y = clamp(this.ball.y, this.playfield.top, maxY);
    event.status = this.status;
    return event;
  }
}
