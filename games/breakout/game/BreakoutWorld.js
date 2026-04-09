/*
Toolbox Aid
David Quesenberry
03/24/2026
BreakoutWorld.js
*/
import { clamp } from '/src/engine/utils/math.js';

const MAX_STEP_SECONDS = 1 / 120;

const DEFAULT_COLORS = [
  '#ff595e',
  '#ff924c',
  '#ffca3a',
  '#8ac926',
  '#1982c4',
  '#6a4c93',
];

function createBrickLayout(width) {
  const columns = 10;
  const rows = 6;
  const gap = 6;
  const brickWidth = 78;
  const brickHeight = 24;
  const totalWidth = (columns * brickWidth) + ((columns - 1) * gap);
  const startX = Math.round((width - totalWidth) / 2);
  const startY = 96;
  const bricks = [];

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      bricks.push({
        x: startX + (column * (brickWidth + gap)),
        y: startY + (row * (brickHeight + gap)),
        width: brickWidth,
        height: brickHeight,
        color: DEFAULT_COLORS[row % DEFAULT_COLORS.length],
        points: (rows - row) * 10,
        alive: true,
      });
    }
  }

  return bricks;
}

export default class BreakoutWorld {
  constructor({ width = 960, height = 720 } = {}) {
    this.width = width;
    this.height = height;
    this.wallThickness = 18;
    this.topBoundary = 56;
    this.paddle = this.createPaddle();
    this.ball = this.createBall();
    this.lives = 3;
    this.score = 0;
    this.status = 'menu';
    this.bricks = [];
    this.remainingBricks = 0;
    this.resetBoard();
    this.resetPaddleAndBall();
  }

  createPaddle() {
    return {
      width: 118,
      height: 18,
      x: 0,
      y: this.height - 62,
      speed: 680,
      velocityX: 0,
      color: '#f8f8f2',
    };
  }

  createBall() {
    return {
      size: 14,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      color: '#f8f8f2',
    };
  }

  resetBoard() {
    this.bricks = createBrickLayout(this.width);
    this.remainingBricks = this.bricks.length;
  }

  resetGame() {
    this.score = 0;
    this.lives = 3;
    this.status = 'menu';
    this.resetBoard();
    this.resetPaddleAndBall();
  }

  resetPaddleAndBall() {
    this.paddle.x = (this.width - this.paddle.width) / 2;
    this.paddle.velocityX = 0;
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.lockBallToPaddle();
  }

  lockBallToPaddle() {
    this.ball.x = this.paddle.x + (this.paddle.width / 2) - (this.ball.size / 2);
    this.ball.y = this.paddle.y - this.ball.size - 8;
  }

  startGame() {
    if (this.status === 'menu' || this.status === 'won' || this.status === 'lost') {
      this.score = 0;
      this.lives = 3;
      this.resetBoard();
      this.resetPaddleAndBall();
      this.status = 'serve';
      return;
    }

    if (this.status === 'serve') {
      this.launchBall();
    }
  }

  launchBall() {
    if (this.status !== 'serve') {
      return;
    }

    this.ball.vx = 180;
    this.ball.vy = -430;
    this.status = 'playing';
  }

  update(dt, controls = {}) {
    let remaining = Math.max(0, Number(dt) || 0);
    let latestEvent = this.createEvent();
    let discreteControls = {
      ...controls,
      servePressed: Boolean(controls.servePressed),
      exitPressed: Boolean(controls.exitPressed),
    };

    while (remaining > 0) {
      const step = Math.min(remaining, MAX_STEP_SECONDS);
      latestEvent = this.mergeEvents(latestEvent, this.updateStep(step, discreteControls));
      remaining -= step;
      discreteControls = {
        ...discreteControls,
        servePressed: false,
        exitPressed: false,
      };
    }

    if (dt === 0) {
      latestEvent = this.updateStep(0, controls);
    }

    return latestEvent;
  }

  updateStep(dt, controls = {}) {
    const event = this.createEvent();
    const axis = clamp(Number(controls.moveAxis) || 0, -1, 1);
    this.updatePaddle(dt, axis);

    if (controls.exitPressed && this.status !== 'menu') {
      this.resetGame();
      event.status = this.status;
      event.returnedToMenu = true;
      return event;
    }

    if (controls.servePressed) {
      if (this.status === 'menu' || this.status === 'won' || this.status === 'lost') {
        this.startGame();
        event.served = this.status === 'serve';
      } else if (this.status === 'serve') {
        this.launchBall();
        event.served = true;
      }
    }

    if (this.status === 'menu' || this.status === 'won' || this.status === 'lost') {
      event.status = this.status;
      return event;
    }

    if (this.status === 'serve') {
      this.lockBallToPaddle();
      event.status = this.status;
      return event;
    }

    this.ball.x += this.ball.vx * dt;
    this.ball.y += this.ball.vy * dt;

    if (this.handleWallCollision()) {
      event.wallHit = true;
    }

    if (this.handlePaddleCollision(axis)) {
      event.paddleHit = true;
    }

    if (this.handleBrickCollision()) {
      event.brickHit = true;
      event.scoreDelta = this.lastBrickScoreDelta;
      if (this.status === 'won') {
        event.won = true;
      }
    }

    if (this.ball.y > this.height) {
      this.lives -= 1;
      if (this.lives <= 0) {
        this.status = 'lost';
        event.lost = true;
      } else {
        this.status = 'serve';
        this.resetPaddleAndBall();
        event.lifeLost = true;
      }
    }

    event.status = this.status;
    return event;
  }

  createEvent() {
    return {
      status: this.status,
      served: false,
      wallHit: false,
      paddleHit: false,
      brickHit: false,
      scoreDelta: 0,
      lifeLost: false,
      won: false,
      lost: false,
      returnedToMenu: false,
    };
  }

  mergeEvents(base, next) {
    return {
      status: next.status,
      served: base.served || next.served,
      wallHit: base.wallHit || next.wallHit,
      paddleHit: base.paddleHit || next.paddleHit,
      brickHit: base.brickHit || next.brickHit,
      scoreDelta: base.scoreDelta + next.scoreDelta,
      lifeLost: base.lifeLost || next.lifeLost,
      won: base.won || next.won,
      lost: base.lost || next.lost,
      returnedToMenu: base.returnedToMenu || next.returnedToMenu,
    };
  }

  updatePaddle(dt, axis) {
    this.paddle.velocityX = axis * this.paddle.speed;
    this.paddle.x += this.paddle.velocityX * dt;
    this.paddle.x = clamp(this.paddle.x, this.wallThickness, this.width - this.wallThickness - this.paddle.width);
  }

  handleWallCollision() {
    let collided = false;
    if (this.ball.x <= this.wallThickness) {
      this.ball.x = this.wallThickness;
      this.ball.vx = Math.abs(this.ball.vx);
      collided = true;
    }

    if (this.ball.x + this.ball.size >= this.width - this.wallThickness) {
      this.ball.x = this.width - this.wallThickness - this.ball.size;
      this.ball.vx = -Math.abs(this.ball.vx);
      collided = true;
    }

    if (this.ball.y <= this.topBoundary) {
      this.ball.y = this.topBoundary;
      this.ball.vy = Math.abs(this.ball.vy);
      collided = true;
    }

    return collided;
  }

  handlePaddleCollision(axis) {
    const paddleTop = this.paddle.y;
    const paddleBottom = this.paddle.y + this.paddle.height;
    const paddleLeft = this.paddle.x;
    const paddleRight = this.paddle.x + this.paddle.width;
    const ballBottom = this.ball.y + this.ball.size;
    const ballTop = this.ball.y;
    const ballLeft = this.ball.x;
    const ballRight = this.ball.x + this.ball.size;

    const overlaps =
      ballRight >= paddleLeft &&
      ballLeft <= paddleRight &&
      ballBottom >= paddleTop &&
      ballTop <= paddleBottom;

    if (!overlaps || this.ball.vy <= 0) {
      return false;
    }

    const paddleCenter = this.paddle.x + (this.paddle.width / 2);
    const ballCenter = this.ball.x + (this.ball.size / 2);
    const hitOffset = clamp((ballCenter - paddleCenter) / (this.paddle.width / 2), -1, 1);
    const english = clamp(axis, -1, 1) * 0.28;
    const nextSpeed = Math.min(560, Math.hypot(this.ball.vx, this.ball.vy) + 12);
    this.ball.vx = nextSpeed * clamp(hitOffset * 0.86 + english, -0.9, 0.9);
    this.ball.vy = -Math.max(280, nextSpeed * (0.72 + (Math.abs(hitOffset) * 0.08)));
    this.ball.y = this.paddle.y - this.ball.size - 1;
    return true;
  }

  handleBrickCollision() {
    this.lastBrickScoreDelta = 0;
    for (const brick of this.bricks) {
      if (!brick.alive) {
        continue;
      }

      const overlaps =
        this.ball.x + this.ball.size >= brick.x &&
        this.ball.x <= brick.x + brick.width &&
        this.ball.y + this.ball.size >= brick.y &&
        this.ball.y <= brick.y + brick.height;

      if (!overlaps) {
        continue;
      }

      brick.alive = false;
      this.remainingBricks -= 1;
      this.score += brick.points;
      this.lastBrickScoreDelta = brick.points;

      const ballCenterX = this.ball.x + (this.ball.size / 2);
      const ballCenterY = this.ball.y + (this.ball.size / 2);
      const brickCenterX = brick.x + (brick.width / 2);
      const brickCenterY = brick.y + (brick.height / 2);
      const overlapX = ((brick.width + this.ball.size) / 2) - Math.abs(ballCenterX - brickCenterX);
      const overlapY = ((brick.height + this.ball.size) / 2) - Math.abs(ballCenterY - brickCenterY);

      if (overlapX < overlapY) {
        this.ball.vx = ballCenterX < brickCenterX ? -Math.abs(this.ball.vx) : Math.abs(this.ball.vx);
      } else {
        this.ball.vy = ballCenterY < brickCenterY ? -Math.abs(this.ball.vy) : Math.abs(this.ball.vy);
      }

      if (this.remainingBricks <= 0) {
        this.status = 'won';
        this.ball.vx = 0;
        this.ball.vy = 0;
      }

      return true;
    }

    return false;
  }
}
