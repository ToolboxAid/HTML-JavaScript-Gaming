/*
Toolbox Aid
David Quesenberry
03/24/2026
PaddleInterceptWorld.js
*/
import { clamp } from '../../../src/engine/utils/math.js';

const MAX_STEP_SECONDS = 1 / 120;

function reflectIntoLane(position, min, max) {
  const span = max - min;
  if (span <= 0) {
    return min;
  }

  const wrapped = (position - min) % (span * 2);
  const normalized = wrapped < 0 ? wrapped + (span * 2) : wrapped;
  return normalized <= span ? min + normalized : max - (normalized - span);
}

function predictFutureBallCenterY(ball, secondsAhead, minY, maxY) {
  return reflectIntoLane(ball.centerY + (ball.vy * secondsAhead), minY, maxY);
}

function predictInterceptY(ball, paddleX, minY, maxY) {
  if (ball.vx <= 0) {
    return reflectIntoLane(ball.centerY, minY, maxY);
  }

  const travelSeconds = Math.max(0, (paddleX - ball.centerX) / ball.vx);
  return predictFutureBallCenterY(ball, travelSeconds, minY, maxY);
}

export default class PaddleInterceptWorld {
  constructor({ width = 960, height = 720 } = {}) {
    this.width = width;
    this.height = height;
    this.wallThickness = 18;
    this.playfield = {
      left: 56,
      right: 682,
      top: 87,
      bottom: height - 53,
    };
    this.status = 'menu';
    this.statusMessage = 'Launch the ball and watch the paddle solve the intercept.';
    this.elapsedSeconds = 0;
    this.ball = this.createBall();
    this.paddle = this.createPaddle();
    this.interceptMarkerY = this.paddle.centerY;
    this.resetGame();
  }

  createBall() {
    return {
      size: 18,
      centerX: 0,
      centerY: 0,
      vx: 0,
      vy: 0,
    };
  }

  createPaddle() {
    const height = 120;
    return {
      x: this.playfield.right - 30,
      centerY: (this.playfield.top + this.playfield.bottom) * 0.5,
      width: 16,
      height,
      speed: 420,
      vy: 0,
    };
  }

  resetBall() {
    this.ball.centerX = this.playfield.left + 120;
    this.ball.centerY = this.playfield.top + 170;
    this.ball.vx = 310;
    this.ball.vy = 188;
  }

  resetGame() {
    this.status = 'menu';
    this.elapsedSeconds = 0;
    this.paddle.centerY = (this.playfield.top + this.playfield.bottom) * 0.5;
    this.paddle.vy = 0;
    this.resetBall();
    this.refreshInterceptMarker();
    this.statusMessage = 'Launch the ball and watch the paddle solve the intercept.';
  }

  startGame() {
    if (this.status === 'menu') {
      this.status = 'playing';
      this.statusMessage = 'Prediction live.';
    }
  }

  getBallBounds() {
    const half = this.ball.size * 0.5;
    return {
      left: this.ball.centerX - half,
      right: this.ball.centerX + half,
      top: this.ball.centerY - half,
      bottom: this.ball.centerY + half,
    };
  }

  getPaddleBounds() {
    return {
      left: this.paddle.x - (this.paddle.width * 0.5),
      right: this.paddle.x + (this.paddle.width * 0.5),
      top: this.paddle.centerY - (this.paddle.height * 0.5),
      bottom: this.paddle.centerY + (this.paddle.height * 0.5),
    };
  }

  createEvent() {
    return {
      status: this.status,
      started: false,
      reset: false,
      wallBounced: false,
      paddleIntercepted: false,
      bounceCount: 0,
    };
  }

  refreshInterceptMarker() {
    this.interceptMarkerY = predictInterceptY(
      this.ball,
      this.paddle.x,
      this.playfield.top + (this.ball.size * 0.5),
      this.playfield.bottom - (this.ball.size * 0.5),
    );
  }

  update(dt, controls = {}) {
    let remaining = Math.max(0, Number(dt) || 0);
    const event = this.createEvent();

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
      this.refreshInterceptMarker();
      event.status = this.status;
      return event;
    }

    while (remaining > 0) {
      const step = Math.min(remaining, MAX_STEP_SECONDS);
      const stepEvent = this.updateStep(step);
      event.wallBounced ||= stepEvent.wallBounced;
      event.paddleIntercepted ||= stepEvent.paddleIntercepted;
      event.bounceCount += stepEvent.bounceCount;
      this.elapsedSeconds += step;
      remaining -= step;
    }

    this.refreshInterceptMarker();
    event.status = this.status;
    return event;
  }

  updateStep(dt) {
    const event = {
      wallBounced: false,
      paddleIntercepted: false,
      bounceCount: 0,
    };

    this.updatePaddle(dt);
    this.ball.centerX += this.ball.vx * dt;
    this.ball.centerY += this.ball.vy * dt;

    const halfBall = this.ball.size * 0.5;
    if ((this.ball.centerY - halfBall) <= this.playfield.top) {
      this.ball.centerY = this.playfield.top + halfBall;
      this.ball.vy = Math.abs(this.ball.vy);
      event.wallBounced = true;
      event.bounceCount += 1;
    } else if ((this.ball.centerY + halfBall) >= this.playfield.bottom) {
      this.ball.centerY = this.playfield.bottom - halfBall;
      this.ball.vy = -Math.abs(this.ball.vy);
      event.wallBounced = true;
      event.bounceCount += 1;
    }

    if ((this.ball.centerX - halfBall) <= this.playfield.left) {
      this.ball.centerX = this.playfield.left + halfBall;
      this.ball.vx = Math.abs(this.ball.vx);
      event.wallBounced = true;
      event.bounceCount += 1;
    }

    const paddle = this.getPaddleBounds();
    if (
      (this.ball.centerX + halfBall) >= paddle.left &&
      (this.ball.centerX - halfBall) <= paddle.right &&
      (this.ball.centerY + halfBall) >= paddle.top &&
      (this.ball.centerY - halfBall) <= paddle.bottom &&
      this.ball.vx > 0
    ) {
      this.ball.centerX = paddle.left - halfBall - 0.5;
      this.ball.vx = -Math.abs(this.ball.vx);
      event.paddleIntercepted = true;
      event.bounceCount += 1;
    }

    if ((this.ball.centerX + halfBall) >= this.playfield.right) {
      this.ball.centerX = this.playfield.right - halfBall;
      this.ball.vx = -Math.abs(this.ball.vx);
      event.wallBounced = true;
      event.bounceCount += 1;
    }

    return event;
  }

  updatePaddle(dt) {
    const targetY = this.interceptMarkerY;
    const delta = targetY - this.paddle.centerY;
    const move = clamp(delta, -this.paddle.speed * dt, this.paddle.speed * dt);
    const previousY = this.paddle.centerY;
    const minY = this.playfield.top + (this.paddle.height * 0.5);
    const maxY = this.playfield.bottom - (this.paddle.height * 0.5);
    this.paddle.centerY = clamp(previousY + move, minY, maxY);
    this.paddle.vy = dt > 0 ? (this.paddle.centerY - previousY) / dt : 0;
  }
}

export { clamp, reflectIntoLane, predictFutureBallCenterY, predictInterceptY };
