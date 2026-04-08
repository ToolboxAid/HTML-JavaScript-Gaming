/*
Toolbox Aid
David Quesenberry
03/24/2026
BouncingBallWorld.js
*/
import { clamp } from '../../../src/engine/utils/math.js';

const MAX_STEP_SECONDS = 1 / 120;

export default class BouncingBallWorld {
  constructor({ width = 960, height = 720 } = {}) {
    this.width = width;
    this.height = height;
    this.wallThickness = 18;
    this.playfield = {
      left: 42,
      right: width - 42,
      top: 82,
      bottom: height - 42,
    };
    this.status = 'menu';
    this.ball = this.createBall();
    this.resetBall();
  }

  createBall() {
    return {
      size: 22,
      x: 0,
      y: 0,
      vx: 280,
      vy: 220,
      color: '#f4f4ef',
    };
  }

  resetBall() {
    this.ball.x = (this.width / 2) - (this.ball.size / 2);
    this.ball.y = (this.height / 2) - (this.ball.size / 2);
    this.ball.vx = 280;
    this.ball.vy = 220;
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
      latestEvent = this.mergeEvents(latestEvent, this.updateStep(step));
      remaining -= step;
    }

    if (dt === 0) {
      latestEvent = this.mergeEvents(latestEvent, this.updateStep(0));
    }

    latestEvent.status = this.status;
    return latestEvent;
  }

  createEvent() {
    return {
      status: this.status,
      started: false,
      bounced: false,
      bounceCount: 0,
      reset: false,
    };
  }

  mergeEvents(base, next) {
    return {
      status: next.status,
      started: base.started || next.started,
      bounced: base.bounced || next.bounced,
      bounceCount: base.bounceCount + next.bounceCount,
      reset: base.reset || next.reset,
    };
  }

  updateStep(dt) {
    const event = this.createEvent();
    this.ball.x += this.ball.vx * dt;
    this.ball.y += this.ball.vy * dt;

    const maxX = this.playfield.right - this.ball.size;
    const maxY = this.playfield.bottom - this.ball.size;

    if (this.ball.x <= this.playfield.left) {
      this.ball.x = this.playfield.left;
      this.ball.vx = Math.abs(this.ball.vx);
      event.bounced = true;
      event.bounceCount += 1;
    } else if (this.ball.x >= maxX) {
      this.ball.x = maxX;
      this.ball.vx = -Math.abs(this.ball.vx);
      event.bounced = true;
      event.bounceCount += 1;
    }

    if (this.ball.y <= this.playfield.top) {
      this.ball.y = this.playfield.top;
      this.ball.vy = Math.abs(this.ball.vy);
      event.bounced = true;
      event.bounceCount += 1;
    } else if (this.ball.y >= maxY) {
      this.ball.y = maxY;
      this.ball.vy = -Math.abs(this.ball.vy);
      event.bounced = true;
      event.bounceCount += 1;
    }

    this.ball.x = clamp(this.ball.x, this.playfield.left, maxX);
    this.ball.y = clamp(this.ball.y, this.playfield.top, maxY);
    event.status = this.status;
    return event;
  }
}
