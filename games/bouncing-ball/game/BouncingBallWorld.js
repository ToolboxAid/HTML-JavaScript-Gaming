/*
Toolbox Aid
David Quesenberry
03/24/2026
BouncingBallWorld.js
*/
import { clamp } from '/src/engine/utils/math.js';

const MAX_STEP_SECONDS = 1 / 120;
const DEFAULT_BOUNCING_BALL_WORLD_SKIN = Object.freeze({
  colors: {
    ball: '#f4f4ef'
  },
  sizing: {
    wallThickness: 18,
    ballSize: 22
  }
});

function toObject(value) {
  return value && typeof value === 'object' ? value : {};
}

function toFiniteNumber(value, fallback) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function sanitizeBouncingBallWorldSkin(skin) {
  const colors = toObject(skin?.colors);
  const sizing = toObject(skin?.sizing);
  return {
    colors: {
      ball: typeof colors.ball === 'string' && colors.ball.trim() ? colors.ball.trim() : DEFAULT_BOUNCING_BALL_WORLD_SKIN.colors.ball
    },
    sizing: {
      wallThickness: Math.max(8, toFiniteNumber(sizing.wallThickness, DEFAULT_BOUNCING_BALL_WORLD_SKIN.sizing.wallThickness)),
      ballSize: Math.max(8, toFiniteNumber(sizing.ballSize, DEFAULT_BOUNCING_BALL_WORLD_SKIN.sizing.ballSize))
    }
  };
}

export default class BouncingBallWorld {
  constructor({ width = 960, height = 720, skin = null } = {}) {
    this.width = width;
    this.height = height;
    this.skin = sanitizeBouncingBallWorldSkin(skin);
    this.wallThickness = this.skin.sizing.wallThickness;
    this.playfield = { left: 42, right: width - 42, top: 82, bottom: height - 42 };
    this.updatePlayfield();
    this.status = 'menu';
    this.ball = this.createBall();
    this.resetBall();
  }

  updatePlayfield() {
    const sideInset = this.wallThickness + 24;
    const topInset = this.wallThickness + 64;
    const bottomInset = this.wallThickness + 24;
    this.playfield = {
      left: sideInset,
      right: this.width - sideInset,
      top: topInset,
      bottom: this.height - bottomInset
    };
  }

  applySkin(nextSkin) {
    this.skin = sanitizeBouncingBallWorldSkin(nextSkin);
    this.wallThickness = this.skin.sizing.wallThickness;
    this.updatePlayfield();
    this.ball.size = this.skin.sizing.ballSize;
    this.ball.color = this.skin.colors.ball;
    this.resetBall();
  }

  createBall() {
    return {
      size: this.skin.sizing.ballSize,
      x: 0,
      y: 0,
      vx: 280,
      vy: 220,
      color: this.skin.colors.ball,
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
