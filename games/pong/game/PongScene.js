/*
Toolbox Aid
David Quesenberry
03/24/2026
PongScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import PongInputController from './PongInputController.js';
import PongAudio from './PongAudio.js';
import { getPongModes } from './PongModeConfig.js';

const COURT = {
  width: 960,
  height: 720,
  top: 68,
  bottom: 692,
  left: 28,
  right: 932,
  centerX: 480,
  centerY: 380,
};

const COLORS = {
  background: '#05070a',
  ink: '#f4f7fb',
  muted: '#a6b0bf',
  accent: '#7de2ff',
  good: '#8bf0c8',
  warn: '#ffd37d',
  danger: '#ff9a9a',
};

function wrapOverlayText(text, maxCharacters = 44) {
  const paragraphs = String(text ?? '').split('\n');
  const lines = [];

  paragraphs.forEach((paragraph) => {
    const words = paragraph.split(/\s+/).filter(Boolean);
    let currentLine = '';

    words.forEach((word) => {
      const nextLine = currentLine ? `${currentLine} ${word}` : word;
      if (nextLine.length > maxCharacters && currentLine) {
        lines.push(currentLine);
        currentLine = word;
        return;
      }
      currentLine = nextLine;
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    if (!words.length) {
      lines.push('');
    }
  });

  return lines;
}

export default class PongScene extends Scene {
  constructor() {
    super();
    this.modes = getPongModes();
    this.modeIndex = 0;
    this.mode = this.modes[this.modeIndex];
    this.inputController = null;
    this.audio = new PongAudio();
    this.isPaused = false;
    this.roundOver = true;
    this.winnerText = '';
    this.messageText = 'Press Space, Enter, or gamepad south button to serve.';
    this.score = { left: 0, right: 0, rally: 0, bestRally: 0 };
    this.serveDirection = 1;
    this.leftPaddle = this.createPaddle('left');
    this.rightPaddle = this.createPaddle('right');
    this.ball = this.createBall();
  }

  enter(engine) {
    this.inputController = new PongInputController(engine.input);
    this.audio.setAudioService(engine.audio ?? null);
    this.applyMode();
  }

  update(dt, engine) {
    const frame = this.inputController.getFrameState({ soloMode: !this.mode.twoPaddles });

    if (frame.exitPressed) {
      this.isPaused = false;
      this.applyMode();
      return;
    }

    if (!this.roundOver && frame.pausePressed) {
      this.isPaused = !this.isPaused;
    }

    if (frame.nextModePressed) {
      this.setMode(this.modeIndex + 1);
      return;
    }

    if (frame.previousModePressed) {
      this.setMode(this.modeIndex - 1);
      return;
    }

    if (this.isPaused) {
      return;
    }

    this.updatePaddles(dt, frame);

    if (this.roundOver) {
      if (frame.servePressed) {
        this.startRound();
        this.audio.playServe();
      }
      return;
    }

    this.updateBall(dt);
    const bouncedOnWall = this.handleTopBottomWalls();
    const leftPaddleHit = this.handlePaddleCollision(this.leftPaddle, 1);
    if (bouncedOnWall) {
      this.audio.playWallHit();
    }
    if (leftPaddleHit) {
      this.audio.playPaddleHit();
    }

    if (this.mode.twoPaddles) {
      const rightPaddleHit = this.handlePaddleCollision(this.rightPaddle, -1);
      if (rightPaddleHit) {
        this.audio.playPaddleHit();
      }
    } else {
      const soloWallHit = this.handleSoloWall();
      if (soloWallHit) {
        this.audio.playWallHit();
      }
    }

    const endZoneEvent = this.handleEndZones();
    if (endZoneEvent === 'score') {
      this.audio.playScore();
    } else if (endZoneEvent === 'wall') {
      this.audio.playWallHit();
    }
  }

  render(renderer) {
    renderer.clear(COLORS.background);
    this.drawCourt(renderer);
    this.drawHud(renderer);
    this.drawPaddle(renderer, this.leftPaddle);
    if (this.mode.twoPaddles) {
      this.drawPaddle(renderer, this.rightPaddle);
    }
    renderer.drawCircle(this.ball.x, this.ball.y, this.ball.radius, COLORS.ink);

    if (this.isPaused) {
      renderer.drawRect(0, 0, COURT.width, COURT.height, 'rgba(0, 0, 0, 0.5)');
      this.drawOverlay(renderer, 'Paused', 'Press P or Start to resume.');
    } else if (this.roundOver) {
      this.drawOverlay(renderer, this.winnerText || this.mode.name, this.messageText);
    }
  }

  createPaddle(side) {
    return {
      side,
      x: side === 'left' ? 54 : 892,
      y: COURT.centerY - 56,
      width: 14,
      height: 112,
      speed: 540,
      velocityY: 0,
      color: COLORS.ink,
    };
  }

  createBall() {
    return {
      x: COURT.centerX,
      y: COURT.centerY,
      radius: 8,
      vx: 0,
      vy: 0,
      color: COLORS.ink,
    };
  }

  applyMode() {
    this.mode = this.modes[this.modeIndex];
    this.score = { left: 0, right: 0, rally: 0, bestRally: 0 };
    this.leftPaddle.height = this.mode.leftPaddleHeight;
    this.rightPaddle.height = this.mode.rightPaddleHeight;
    this.leftPaddle.x = 54;
    this.rightPaddle.x = 892;
    this.leftPaddle.y = COURT.centerY - this.leftPaddle.height / 2;
    this.rightPaddle.y = COURT.centerY - Math.max(1, this.rightPaddle.height) / 2;
    this.roundOver = true;
    this.winnerText = '';
    this.messageText = `${this.mode.description}\nPress Space, Enter, or south button to serve.`;
    this.isPaused = false;
    this.resetBall();
  }

  setMode(index) {
    this.modeIndex = ((index % this.modes.length) + this.modes.length) % this.modes.length;
    this.applyMode();
  }

  resetBall() {
    this.ball.x = COURT.centerX;
    this.ball.y = COURT.centerY;
    this.ball.vx = 0;
    this.ball.vy = 0;
  }

  startRound() {
    const angleSpread = this.mode.twoPaddles ? 0.6 : 0.75;
    const direction = this.mode.twoPaddles ? this.serveDirection : 1;
    const random = (Math.random() * 2 - 1) * angleSpread;
    this.ball.x = COURT.centerX;
    this.ball.y = COURT.centerY + (Math.random() * 80 - 40);
    this.ball.vx = this.mode.startSpeed * direction;
    this.ball.vy = this.mode.startSpeed * 0.55 * random;
    this.roundOver = false;
    this.winnerText = '';
    this.messageText = 'Active rally';
    this.score.rally = 0;
  }

  updatePaddles(dt, frame) {
    this.movePaddle(this.leftPaddle, frame.playerMoveY, dt, frame.playerMoveX ?? 0);
    if (this.mode.twoPaddles) {
      this.movePaddle(this.rightPaddle, frame.opponentMoveY, dt);
    }
  }

  movePaddle(paddle, axis, dt, horizontalAxis = 0) {
    const amount = (Number(axis) || 0) * paddle.speed;
    paddle.velocityY = amount;
    paddle.y += amount * dt;
    paddle.y = Math.max(COURT.top, Math.min(COURT.bottom - paddle.height, paddle.y));

    if (this.mode.key === 'hockey' && paddle.side === 'left') {
      const horizontalAmount = (Number(horizontalAxis) || 0) * paddle.speed;
      paddle.x += horizontalAmount * dt;
      paddle.x = Math.max(54, Math.min(COURT.centerX - 44, paddle.x));
      return;
    }

    paddle.x = paddle.side === 'left' ? 54 : 892;
  }

  updateBall(dt) {
    this.ball.x += this.ball.vx * dt;
    this.ball.y += this.ball.vy * dt;
  }

  handleTopBottomWalls() {
    let collided = false;
    if (this.ball.y - this.ball.radius <= COURT.top) {
      this.ball.y = COURT.top + this.ball.radius;
      this.ball.vy = Math.abs(this.ball.vy);
      collided = true;
    }

    if (this.ball.y + this.ball.radius >= COURT.bottom) {
      this.ball.y = COURT.bottom - this.ball.radius;
      this.ball.vy = -Math.abs(this.ball.vy);
      collided = true;
    }

    return collided;
  }

  handlePaddleCollision(paddle, direction) {
    if (!paddle || paddle.height <= 0) {
      return;
    }

    const ballLeft = this.ball.x - this.ball.radius;
    const ballRight = this.ball.x + this.ball.radius;
    const ballTop = this.ball.y - this.ball.radius;
    const ballBottom = this.ball.y + this.ball.radius;
    const paddleLeft = paddle.x;
    const paddleRight = paddle.x + paddle.width;
    const paddleTop = paddle.y;
    const paddleBottom = paddle.y + paddle.height;

    const overlaps =
      ballRight >= paddleLeft &&
      ballLeft <= paddleRight &&
      ballBottom >= paddleTop &&
      ballTop <= paddleBottom;

    const approaching = direction > 0 ? this.ball.vx < 0 : this.ball.vx > 0;
    if (!overlaps || !approaching) {
      return false;
    }

    const hitOffset = (this.ball.y - (paddle.y + paddle.height / 2)) / (paddle.height / 2);
    const clampedOffset = Math.max(-1, Math.min(1, hitOffset));
    const english = (paddle.velocityY / paddle.speed) * 0.6;
    const speed = Math.min(this.mode.maxSpeed, this.getBallSpeed() + this.mode.speedStep);
    const horizontal = Math.max(speed * 0.72, Math.abs(this.ball.vx));
    const vertical = speed * Math.max(-0.92, Math.min(0.92, clampedOffset * 0.82 + english * 0.55));

    this.ball.vx = horizontal * direction;
    this.ball.vy = vertical;
    this.ball.x = direction > 0 ? paddleRight + this.ball.radius : paddleLeft - this.ball.radius;

    if (this.mode.soloScoring) {
      this.score.left += 1;
      this.score.rally += 1;
      this.score.bestRally = Math.max(this.score.bestRally, this.score.rally);
    }

    return true;
  }

  handleSoloWall() {
    if (!this.mode.rightWallClosed) {
      return false;
    }

    if (this.ball.x + this.ball.radius < COURT.right) {
      return false;
    }

    const speed = Math.min(this.mode.maxSpeed, this.getBallSpeed() + this.mode.speedStep * 0.5);
    this.ball.x = COURT.right - this.ball.radius;
    this.ball.vx = -Math.max(speed * 0.76, Math.abs(this.ball.vx));

    const wallInfluence = this.mode.key === 'jai-alai' ? 0.22 : 0.12;
    const relativeY = (this.ball.y - COURT.centerY) / ((COURT.bottom - COURT.top) / 2);
    this.ball.vy += speed * relativeY * wallInfluence;
    this.ball.vy = Math.max(-this.mode.maxSpeed * 0.9, Math.min(this.mode.maxSpeed * 0.9, this.ball.vy));
    return true;
  }

  handleEndZones() {
    if (this.mode.key === 'hockey') {
      return this.handleHockeyGoals();
    }

    if (this.mode.twoPaddles) {
      if (this.ball.x + this.ball.radius < COURT.left) {
        this.onPointScored('right');
        return 'score';
      } else if (this.ball.x - this.ball.radius > COURT.right) {
        this.onPointScored('left');
        return 'score';
      }
      return null;
    }

    if (this.ball.x + this.ball.radius < COURT.left) {
      this.roundOver = true;
      this.winnerText = this.mode.name;
      this.messageText = `Missed return. Best rally: ${this.score.bestRally}. Press serve to try again.`;
      this.score.rally = 0;
      this.resetBall();
      return 'score';
    }

    return null;
  }

  handleHockeyGoals() {
    const goalTop = COURT.centerY - this.mode.goalHeight / 2;
    const goalBottom = COURT.centerY + this.mode.goalHeight / 2;
    const inGoalLane = this.ball.y >= goalTop && this.ball.y <= goalBottom;

    if (this.ball.x - this.ball.radius <= COURT.left + this.mode.wallInset) {
      if (inGoalLane) {
        this.onPointScored('right');
        return 'score';
      } else {
        this.ball.x = COURT.left + this.mode.wallInset + this.ball.radius;
        this.ball.vx = Math.abs(this.ball.vx);
        return 'wall';
      }
    }

    if (this.ball.x + this.ball.radius >= COURT.right - this.mode.wallInset) {
      if (inGoalLane) {
        this.onPointScored('left');
        return 'score';
      } else {
        this.ball.x = COURT.right - this.mode.wallInset - this.ball.radius;
        this.ball.vx = -Math.abs(this.ball.vx);
        return 'wall';
      }
    }

    return null;
  }

  onPointScored(side) {
    if (side === 'left') {
      this.score.left += 1;
      this.serveDirection = -1;
    } else {
      this.score.right += 1;
      this.serveDirection = 1;
    }

    if (this.isMatchWon(side)) {
      this.roundOver = true;
      this.winnerText = `${side === 'left' ? 'Left' : 'Right'} player wins`;
      this.messageText = `Final score ${this.score.left} - ${this.score.right}. Press serve to restart or M for next mode.`;
      this.score.left = 0;
      this.score.right = 0;
    } else {
      this.roundOver = true;
      this.winnerText = `${side === 'left' ? 'Left' : 'Right'} player scores`;
      this.messageText = `Score ${this.score.left} - ${this.score.right}. Press serve for the next rally.`;
    }

    this.resetBall();
  }

  isMatchWon(side) {
    if (this.mode.soloScoring) {
      return false;
    }

    const value = side === 'left' ? this.score.left : this.score.right;
    const other = side === 'left' ? this.score.right : this.score.left;
    if (value < this.mode.targetScore) {
      return false;
    }

    if (!this.mode.winByTwo) {
      return true;
    }

    return value - other >= 2;
  }

  getBallSpeed() {
    return Math.hypot(this.ball.vx, this.ball.vy);
  }

  drawCourt(renderer) {
    renderer.strokeRect(COURT.left, COURT.top, COURT.right - COURT.left, COURT.bottom - COURT.top, COLORS.ink, 2);
    for (let y = COURT.top + 16; y < COURT.bottom; y += 28) {
      renderer.drawRect(COURT.centerX - 2, y, 4, 14, '#6a7482');
    }

    if (this.mode.key === 'hockey') {
      const goalTop = COURT.centerY - this.mode.goalHeight / 2;
      renderer.drawRect(COURT.left - 2, goalTop, 4, this.mode.goalHeight, COLORS.accent);
      renderer.drawRect(COURT.right - 2, goalTop, 4, this.mode.goalHeight, COLORS.accent);
    }
  }

  drawHud(renderer) {
    renderer.drawText('PONG', 34, 24, { color: COLORS.ink, font: 'bold 26px monospace', textBaseline: 'top' });
    renderer.drawText(this.mode.name.toUpperCase(), COURT.centerX, 24, {
      color: COLORS.accent,
      font: 'bold 22px monospace',
      textAlign: 'center',
      textBaseline: 'top',
    });

    if (this.mode.twoPaddles) {
      renderer.drawText(String(this.score.left), 426, 118, {
        color: COLORS.ink,
        font: 'bold 44px monospace',
        textAlign: 'right',
      });
      renderer.drawText(String(this.score.right), 534, 118, {
        color: COLORS.ink,
        font: 'bold 44px monospace',
      });
    } else {
      renderer.drawText(`Score ${this.score.left}`, 34, 88, {
        color: COLORS.good,
        font: 'bold 20px monospace',
        textBaseline: 'top',
      });
      renderer.drawText(`Best ${this.score.bestRally}`, 34, 114, {
        color: COLORS.warn,
        font: '18px monospace',
        textBaseline: 'top',
      });
    }

    if (!this.roundOver || this.winnerText) {
      renderer.drawText('P pause', 926, 24, {
        color: COLORS.muted,
        font: '16px monospace',
        textAlign: 'right',
        textBaseline: 'top',
      });
      renderer.drawText('X menu', 926, 48, {
        color: COLORS.muted,
        font: '16px monospace',
        textAlign: 'right',
        textBaseline: 'top',
      });
    }
  }

  drawPaddle(renderer, paddle) {
    renderer.drawRect(paddle.x, paddle.y, paddle.width, paddle.height, paddle.color);
  }

  drawOverlay(renderer, title, body) {
    const showModeList = this.roundOver && !this.winnerText;
    const bodySections = String(body ?? '').split('\n');
    const descriptionLines = wrapOverlayText(bodySections[0] ?? '', showModeList ? 46 : 50);
    const promptLines = wrapOverlayText(bodySections.slice(1).join(' ').trim(), 46);
    const bodyLines = showModeList ? descriptionLines : wrapOverlayText(body, 50);
    const panelHeight = showModeList ? 346 : Math.max(150, 112 + (bodyLines.length * 26));
    renderer.drawRect(160, 250, 640, panelHeight, 'rgba(8, 12, 18, 0.86)');
    renderer.strokeRect(160, 250, 640, panelHeight, COLORS.ink, 2);
    renderer.drawText(title, COURT.centerX, 288, {
      color: COLORS.ink,
      font: 'bold 28px monospace',
      textAlign: 'center',
      textBaseline: 'top',
    });

    bodyLines.forEach((line, index) => {
      renderer.drawText(line, COURT.centerX, 330 + (index * 24), {
        color: COLORS.muted,
        font: '18px monospace',
        textAlign: 'center',
        textBaseline: 'top',
      });
    });

    if (!showModeList) {
      return;
    }

    const modeHeaderY = 364 + ((descriptionLines.length - 1) * 24);
    renderer.drawText('Modes: M next, N previous', COURT.centerX, modeHeaderY, {
      color: COLORS.accent,
      font: '16px monospace',
      textAlign: 'center',
      textBaseline: 'top',
    });

    this.modes.forEach((mode, index) => {
      renderer.drawText(
        `${index === this.modeIndex ? '>' : ' '} ${mode.name}`,
        COURT.centerX,
        modeHeaderY + 28 + (index * 26),
        {
          color: index === this.modeIndex ? COLORS.good : COLORS.muted,
          font: '18px monospace',
          textAlign: 'center',
          textBaseline: 'top',
        },
      );
    });

    promptLines.forEach((line, index) => {
      renderer.drawText(line, COURT.centerX, modeHeaderY + 146 + (index * 22), {
        color: COLORS.warn,
        font: '16px monospace',
        textAlign: 'center',
        textBaseline: 'top',
      });
    });
  }
}
