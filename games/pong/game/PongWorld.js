/*
Toolbox Aid
David Quesenberry
03/24/2026
PongWorld.js
*/
import { clamp } from '/src/engine/utils/math.js';

const MAX_STEP_SECONDS = 1 / 120;
const PADDLE_MARGIN = 44;

function sign(value) {
  if (value === 0) {
    return 0;
  }
  return value > 0 ? 1 : -1;
}

export const PONG_MODE_LIST = [
  {
    key: 'tennis',
    title: 'Tennis',
    description: 'Classic left-vs-right rally play with quick paddle angle control.',
    accent: '#7dd3fc',
    arenaColor: '#102336',
    scoreToWin: 7,
    hasOpponent: true,
    allowHorizontal: false,
    goalType: 'open-sides',
    serveSpeed: 470,
    minHorizontalSpeed: 260,
    maxBallSpeed: 860,
    speedGain: 1.04,
    deflection: 0.86,
    englishVelocityFactor: 0.32,
    spinGain: 180,
    spinFromVelocity: 0.38,
    spinDecay: 1.5,
    wallSpinTransfer: 0.05,
    ballRadius: 10,
    paddle: { width: 18, height: 122, speed: 560 },
    opponent: { width: 18, height: 122, speed: 520 },
  },
  {
    key: 'hockey',
    title: 'Hockey',
    description: 'A puck-style variant with free 2D paddle motion and open goal mouths.',
    accent: '#93c5fd',
    arenaColor: '#0b1f2f',
    scoreToWin: 5,
    hasOpponent: true,
    allowHorizontal: true,
    goalType: 'goal-mouth',
    goalHeight: 200,
    serveSpeed: 520,
    minHorizontalSpeed: 180,
    maxBallSpeed: 900,
    speedGain: 1.02,
    deflection: 0.72,
    englishVelocityFactor: 0.22,
    spinGain: 110,
    spinFromVelocity: 0.18,
    spinDecay: 1.25,
    wallSpinTransfer: 0.04,
    ballRadius: 11,
    paddle: { width: 22, height: 92, speed: 520 },
    opponent: { width: 22, height: 92, speed: 500 },
  },
  {
    key: 'handball',
    title: 'Handball',
    description: 'One paddle, one front wall, three misses. Build a return streak.',
    accent: '#fca5a5',
    arenaColor: '#2a1515',
    targetScore: 9,
    lives: 3,
    hasOpponent: false,
    allowHorizontal: false,
    goalType: 'front-wall',
    serveSpeed: 500,
    minHorizontalSpeed: 280,
    maxBallSpeed: 900,
    speedGain: 1.03,
    deflection: 0.84,
    englishVelocityFactor: 0.34,
    spinGain: 190,
    spinFromVelocity: 0.42,
    spinDecay: 1.45,
    wallSpinTransfer: 0.06,
    ballRadius: 10,
    paddle: { width: 20, height: 136, speed: 570 },
  },
  {
    key: 'jaiAlai',
    title: 'Jai-Alai',
    description: 'Handball rules pushed faster, with heavier english and tighter control.',
    accent: '#fbbf24',
    arenaColor: '#2b1d0f',
    targetScore: 11,
    lives: 3,
    hasOpponent: false,
    allowHorizontal: false,
    goalType: 'front-wall',
    serveSpeed: 610,
    minHorizontalSpeed: 340,
    maxBallSpeed: 1080,
    speedGain: 1.06,
    deflection: 0.92,
    englishVelocityFactor: 0.42,
    spinGain: 240,
    spinFromVelocity: 0.52,
    spinDecay: 1.25,
    wallSpinTransfer: 0.08,
    ballRadius: 9,
    paddle: { width: 18, height: 144, speed: 600 },
  },
];

function getModeByKey(modeKey) {
  return PONG_MODE_LIST.find((mode) => mode.key === modeKey) ?? PONG_MODE_LIST[0];
}

function createPaddle(x, y, config) {
  return {
    x,
    y,
    vx: 0,
    vy: 0,
    width: config.width,
    height: config.height,
    speed: config.speed,
  };
}

export default class PongWorld {
  constructor({ width = 960, height = 720 } = {}) {
    this.width = width;
    this.height = height;
    this.mode = getModeByKey('tennis');
    this.trail = [];
    this.setMode(this.mode.key);
  }

  setMode(modeKey) {
    this.mode = getModeByKey(modeKey);
    this.modeKey = this.mode.key;
    this.resetMatch();
  }

  resetMatch() {
    this.player = createPaddle(
      this.mode.allowHorizontal ? this.width * 0.24 : PADDLE_MARGIN + (this.mode.paddle.width * 0.5),
      this.height * 0.5,
      this.mode.paddle,
    );
    this.opponent = this.mode.hasOpponent
      ? createPaddle(
          this.mode.allowHorizontal ? this.width * 0.76 : this.width - PADDLE_MARGIN - (this.mode.opponent.width * 0.5),
          this.height * 0.5,
          this.mode.opponent,
        )
      : null;
    this.scores = [0, 0];
    this.playerLives = this.mode.lives ?? 0;
    this.server = 0;
    this.status = 'serve';
    this.winner = null;
    this.statusMessage = this.mode.hasOpponent ? 'Press serve to launch the rally.' : 'Press serve to fire at the front wall.';
    this.resetBall(this.mode.hasOpponent ? 1 : 1);
    this.trail = [];
  }

  resetBall(direction = 1) {
    this.ball = {
      x: this.width * 0.5,
      y: this.height * 0.5,
      vx: 0,
      vy: 0,
      spin: 0,
      radius: this.mode.ballRadius,
      direction,
      frontWallReady: false,
    };
    this.recordTrail();
  }

  serve() {
    if (this.status === 'won' || this.status === 'lost') {
      return;
    }

    const direction = this.mode.hasOpponent ? (this.server === 0 ? 1 : -1) : 1;
    const serveOffset = this.mode.hasOpponent ? (this.server === 0 ? -0.08 : 0.08) : -0.1;

    this.ball.direction = direction;
    this.ball.vx = direction * this.mode.serveSpeed;
    this.ball.vy = this.mode.serveSpeed * serveOffset;
    this.ball.spin = 0;
    this.ball.frontWallReady = false;
    this.status = 'playing';
    this.statusMessage = this.mode.hasOpponent ? 'Rally live.' : 'Strike the front wall to score.';
  }

  update(dtSeconds, controls = {}) {
    if (this.status === 'won' || this.status === 'lost') {
      return this.getResult(false);
    }

    if (this.status === 'serve') {
      this.updatePlayer(dtSeconds, controls);
      if (this.opponent) {
        this.updateOpponent(dtSeconds);
      }
      if (controls.servePressed) {
        this.serve();
      }
      return this.getResult(false);
    }

    let remaining = Math.max(0, dtSeconds);
    let scored = false;
    while (remaining > 0) {
      const step = Math.min(remaining, MAX_STEP_SECONDS);
      scored = this.updateStep(step, controls) || scored;
      if (this.status !== 'playing') {
        break;
      }
      remaining -= step;
    }

    return this.getResult(scored);
  }

  updateStep(dtSeconds, controls) {
    this.updatePlayer(dtSeconds, controls);
    if (this.opponent) {
      this.updateOpponent(dtSeconds);
    }

    this.ball.spin *= Math.max(0, 1 - (this.mode.spinDecay * dtSeconds));
    this.ball.vy += this.ball.spin * dtSeconds;
    this.ball.x += this.ball.vx * dtSeconds;
    this.ball.y += this.ball.vy * dtSeconds;

    this.handleWallCollisions();

    if (this.mode.allowHorizontal) {
      this.handleFreePaddleCollision(this.player);
      if (this.opponent) {
        this.handleFreePaddleCollision(this.opponent);
      }
    } else {
      this.handleVerticalPaddleCollision(this.player, 'player');
      if (this.opponent) {
        this.handleVerticalPaddleCollision(this.opponent, 'opponent');
      }
    }

    this.limitBallSpeed();
    this.recordTrail();
    return this.handleGoalsAndMisses();
  }

  updatePlayer(dtSeconds, controls) {
    if (this.mode.allowHorizontal) {
      this.movePaddle(
        this.player,
        controls.moveX ?? 0,
        controls.moveY ?? 0,
        {
          minX: 28,
          maxX: (this.width * 0.5) - 36,
          minY: 24,
          maxY: this.height - 24,
        },
        dtSeconds,
      );
      return;
    }

    this.movePaddle(
      this.player,
      0,
      controls.moveY ?? 0,
      {
        minX: this.player.x,
        maxX: this.player.x,
        minY: 24,
        maxY: this.height - 24,
      },
      dtSeconds,
    );
  }

  updateOpponent(dtSeconds) {
    if (!this.opponent) {
      return;
    }

    if (this.mode.allowHorizontal) {
      const targetX = this.ball.x > (this.width * 0.55)
        ? clamp(this.ball.x, this.width * 0.58, this.width - 36)
        : this.width * 0.74;
      const targetY = this.ball.y;
      this.movePaddleToward(this.opponent, targetX, targetY, {
        minX: (this.width * 0.5) + 36,
        maxX: this.width - 28,
        minY: 24,
        maxY: this.height - 24,
      }, dtSeconds);
      return;
    }

    const targetY = this.status === 'playing'
      ? clamp(this.ball.y + (this.ball.vy * 0.03), 48, this.height - 48)
      : this.height * 0.5;
    this.movePaddleToward(this.opponent, this.opponent.x, targetY, {
      minX: this.opponent.x,
      maxX: this.opponent.x,
      minY: 24,
      maxY: this.height - 24,
    }, dtSeconds);
  }

  movePaddleToward(paddle, targetX, targetY, bounds, dtSeconds) {
    const moveX = Math.abs(targetX - paddle.x) < 8 ? 0 : sign(targetX - paddle.x);
    const moveY = Math.abs(targetY - paddle.y) < 8 ? 0 : sign(targetY - paddle.y);
    this.movePaddle(paddle, moveX, moveY, bounds, dtSeconds);
  }

  movePaddle(paddle, moveX, moveY, bounds, dtSeconds) {
    const previousX = paddle.x;
    const previousY = paddle.y;

    const minCenterX = bounds.minX + (paddle.width * 0.5);
    const maxCenterX = bounds.maxX - (paddle.width * 0.5);
    if (maxCenterX < minCenterX) {
      paddle.x = previousX;
    } else {
      paddle.x = clamp(
        paddle.x + (moveX * paddle.speed * dtSeconds),
        minCenterX,
        maxCenterX,
      );
    }

    const minCenterY = bounds.minY + (paddle.height * 0.5);
    const maxCenterY = bounds.maxY - (paddle.height * 0.5);
    if (maxCenterY < minCenterY) {
      paddle.y = previousY;
    } else {
      paddle.y = clamp(
        paddle.y + (moveY * paddle.speed * dtSeconds),
        minCenterY,
        maxCenterY,
      );
    }

    paddle.vx = dtSeconds > 0 ? (paddle.x - previousX) / dtSeconds : 0;
    paddle.vy = dtSeconds > 0 ? (paddle.y - previousY) / dtSeconds : 0;
  }

  handleWallCollisions() {
    if ((this.ball.y - this.ball.radius) <= 0) {
      this.ball.y = this.ball.radius;
      this.ball.vy = Math.abs(this.ball.vy);
      this.ball.vx += this.ball.spin * this.mode.wallSpinTransfer;
      this.ball.spin *= 0.92;
    } else if ((this.ball.y + this.ball.radius) >= this.height) {
      this.ball.y = this.height - this.ball.radius;
      this.ball.vy = -Math.abs(this.ball.vy);
      this.ball.vx += this.ball.spin * this.mode.wallSpinTransfer;
      this.ball.spin *= 0.92;
    }

    if (this.mode.goalType !== 'goal-mouth') {
      return;
    }

    const goalHalfHeight = this.mode.goalHeight * 0.5;
    const inGoalMouth = Math.abs(this.ball.y - (this.height * 0.5)) <= goalHalfHeight;

    if ((this.ball.x - this.ball.radius) <= 0 && !inGoalMouth) {
      this.ball.x = this.ball.radius;
      this.ball.vx = Math.abs(this.ball.vx);
    } else if ((this.ball.x + this.ball.radius) >= this.width && !inGoalMouth) {
      this.ball.x = this.width - this.ball.radius;
      this.ball.vx = -Math.abs(this.ball.vx);
    }
  }

  handleVerticalPaddleCollision(paddle, paddleKey) {
    if (!paddle) {
      return;
    }

    const halfWidth = paddle.width * 0.5;
    const halfHeight = paddle.height * 0.5;
    const withinVerticalRange = this.ball.y + this.ball.radius >= paddle.y - halfHeight
      && this.ball.y - this.ball.radius <= paddle.y + halfHeight;
    const withinHorizontalRange = this.ball.x + this.ball.radius >= paddle.x - halfWidth
      && this.ball.x - this.ball.radius <= paddle.x + halfWidth;
    if (!withinVerticalRange || !withinHorizontalRange) {
      return;
    }

    if (paddleKey === 'player' && this.ball.vx >= 0) {
      return;
    }

    if (paddleKey === 'opponent' && this.ball.vx <= 0) {
      return;
    }

    const direction = paddleKey === 'player' ? 1 : -1;
    this.ball.x = paddle.x + ((halfWidth + this.ball.radius + 0.5) * direction);
    const impact = clamp((this.ball.y - paddle.y) / halfHeight, -1, 1);
    const currentSpeed = Math.max(this.mode.minHorizontalSpeed, Math.hypot(this.ball.vx, this.ball.vy) * this.mode.speedGain);
    this.ball.vx = direction * Math.max(this.mode.minHorizontalSpeed, currentSpeed * 0.84);
    this.ball.vy = (currentSpeed * impact * this.mode.deflection) + (paddle.vy * this.mode.englishVelocityFactor);
    this.ball.spin = clamp(
      this.ball.spin + (impact * this.mode.spinGain) + (paddle.vy * this.mode.spinFromVelocity),
      -this.mode.maxBallSpeed,
      this.mode.maxBallSpeed,
    );
    this.ball.frontWallReady = paddleKey === 'player' && !this.mode.hasOpponent;
  }

  handleFreePaddleCollision(paddle) {
    if (!paddle) {
      return;
    }

    const nearestX = clamp(this.ball.x, paddle.x - (paddle.width * 0.5), paddle.x + (paddle.width * 0.5));
    const nearestY = clamp(this.ball.y, paddle.y - (paddle.height * 0.5), paddle.y + (paddle.height * 0.5));
    let dx = this.ball.x - nearestX;
    let dy = this.ball.y - nearestY;
    const distanceSquared = (dx * dx) + (dy * dy);
    if (distanceSquared > (this.ball.radius * this.ball.radius)) {
      return;
    }

    const distance = Math.sqrt(distanceSquared) || 1;
    dx /= distance;
    dy /= distance;

    const approach = (this.ball.vx * dx) + (this.ball.vy * dy);
    if (approach >= 0) {
      return;
    }

    const penetration = this.ball.radius - distance;
    this.ball.x += dx * penetration;
    this.ball.y += dy * penetration;
    this.ball.vx -= 2 * approach * dx;
    this.ball.vy -= 2 * approach * dy;
    this.ball.vx += paddle.vx * 0.28;
    this.ball.vy += paddle.vy * 0.28;
    this.ball.spin = clamp(
      this.ball.spin + (paddle.vy * this.mode.spinFromVelocity) + ((this.ball.y - paddle.y) * 0.6),
      -this.mode.maxBallSpeed,
      this.mode.maxBallSpeed,
    );
  }

  limitBallSpeed() {
    const speed = Math.hypot(this.ball.vx, this.ball.vy);
    if (speed <= this.mode.maxBallSpeed || speed === 0) {
      return;
    }

    const scale = this.mode.maxBallSpeed / speed;
    this.ball.vx *= scale;
    this.ball.vy *= scale;
    this.ball.spin *= scale;
  }

  handleGoalsAndMisses() {
    if (this.mode.goalType === 'open-sides') {
      if ((this.ball.x + this.ball.radius) < 0) {
        this.awardCompetitivePoint(1);
        return true;
      }
      if ((this.ball.x - this.ball.radius) > this.width) {
        this.awardCompetitivePoint(0);
        return true;
      }
      return false;
    }

    if (this.mode.goalType === 'goal-mouth') {
      const goalHalfHeight = this.mode.goalHeight * 0.5;
      const inGoalMouth = Math.abs(this.ball.y - (this.height * 0.5)) <= goalHalfHeight;
      if ((this.ball.x + this.ball.radius) < 0 && inGoalMouth) {
        this.awardCompetitivePoint(1);
        return true;
      }
      if ((this.ball.x - this.ball.radius) > this.width && inGoalMouth) {
        this.awardCompetitivePoint(0);
        return true;
      }
      return false;
    }

    if (this.mode.goalType === 'front-wall') {
      if ((this.ball.x + this.ball.radius) >= this.width) {
        this.ball.x = this.width - this.ball.radius;
        this.ball.vx = -Math.abs(this.ball.vx);
        if (this.ball.frontWallReady) {
          this.scores[0] += 1;
          this.ball.frontWallReady = false;
          if (this.scores[0] >= this.mode.targetScore) {
            this.status = 'won';
            this.statusMessage = `${this.mode.title} cleared.`;
          } else {
            this.statusMessage = `Clean strike. ${this.mode.targetScore - this.scores[0]} more.`;
          }
        }
      }

      if ((this.ball.x + this.ball.radius) < 0) {
        this.playerLives -= 1;
        if (this.playerLives <= 0) {
          this.status = 'lost';
          this.statusMessage = 'Out of returns.';
        } else {
          this.status = 'serve';
          this.statusMessage = `Missed return. ${this.playerLives} lives left.`;
          this.resetBall(1);
        }
        return true;
      }
    }

    return false;
  }

  awardCompetitivePoint(playerIndex) {
    this.scores[playerIndex] += 1;
    this.server = playerIndex;
    if (this.scores[playerIndex] >= this.mode.scoreToWin) {
      this.status = playerIndex === 0 ? 'won' : 'lost';
      this.winner = playerIndex;
      this.statusMessage = playerIndex === 0 ? 'Match won.' : 'Opponent takes the match.';
      return;
    }

    this.status = 'serve';
    this.statusMessage = playerIndex === 0 ? 'Point player. Serve again.' : 'Point opponent. Receive the next serve.';
    this.resetBall(playerIndex === 0 ? 1 : -1);
  }

  recordTrail() {
    this.trail.push({ x: this.ball.x, y: this.ball.y });
    if (this.trail.length > 12) {
      this.trail.shift();
    }
  }

  getGoalBounds() {
    if (this.mode.goalType !== 'goal-mouth') {
      return null;
    }

    return {
      left: {
        x: 0,
        y: (this.height * 0.5) - (this.mode.goalHeight * 0.5),
        width: 10,
        height: this.mode.goalHeight,
      },
      right: {
        x: this.width - 10,
        y: (this.height * 0.5) - (this.mode.goalHeight * 0.5),
        width: 10,
        height: this.mode.goalHeight,
      },
    };
  }

  getResult(scored) {
    return {
      status: this.status,
      scored,
      scores: [...this.scores],
      lives: this.playerLives,
      message: this.statusMessage,
      modeKey: this.modeKey,
    };
  }
}
