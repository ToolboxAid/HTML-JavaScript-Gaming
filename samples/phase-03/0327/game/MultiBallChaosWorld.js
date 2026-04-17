/*
Toolbox Aid
David Quesenberry
03/24/2026
MultiBallChaosWorld.js
*/
import { clamp } from '/src/engine/utils/math.js';

const MAX_STEP_SECONDS = 1 / 120;

const PRESET_ORDER = ['three', 'six', 'ten', 'fast'];

const PRESETS = {
  three: {
    label: '3 Balls',
    description: 'A calm three-ball setup for learning the basic bounded motion loop.',
    count: 3,
    baseSpeed: 210,
    speedStep: 18,
    size: 24,
  },
  six: {
    label: '6 Balls',
    description: 'A busier field that still stays readable for beginner-friendly motion study.',
    count: 6,
    baseSpeed: 250,
    speedStep: 16,
    size: 22,
  },
  ten: {
    label: '10 Balls',
    description: 'Dense but stable wall-bounce motion with no ball-ball collision rules.',
    count: 10,
    baseSpeed: 285,
    speedStep: 14,
    size: 20,
  },
  fast: {
    label: 'Fast Chaos',
    description: 'Higher starting speed to stress long-run wall bounce stability.',
    count: 8,
    baseSpeed: 400,
    speedStep: 22,
    size: 18,
  },
};

const BALL_COLORS = [
  '#f59e0b',
  '#38bdf8',
  '#f472b6',
  '#34d399',
  '#fde047',
  '#c084fc',
  '#fb7185',
  '#60a5fa',
  '#f97316',
  '#2dd4bf',
];

function createBall(index, size, x, y, vx, vy) {
  return {
    id: index,
    size,
    x,
    y,
    vx,
    vy,
    color: BALL_COLORS[index % BALL_COLORS.length],
  };
}

export default class MultiBallChaosWorld {
  constructor({ width = 960, height = 720 } = {}) {
    this.width = width;
    this.height = height;
    this.wallThickness = 18;
    this.playfield = {
      left: 52,
      right: 650,
      top: 96,
      bottom: height - 54,
    };
    this.status = 'menu';
    this.elapsedSeconds = 0;
    this.selectedPresetId = PRESET_ORDER[0];
    this.statusMessage = 'Select a preset, then start the chamber.';
    this.balls = [];
    this.resetGame();
  }

  getPresetIds() {
    return [...PRESET_ORDER];
  }

  getSelectedPreset() {
    return PRESETS[this.selectedPresetId];
  }

  createEvent() {
    return {
      status: this.status,
      started: false,
      reset: false,
      presetChanged: false,
      presetId: null,
      bounceCount: 0,
    };
  }

  resetGame() {
    this.status = 'menu';
    this.elapsedSeconds = 0;
    this.balls = this.createBallsForPreset(this.getSelectedPreset());
    this.statusMessage = `Ready: ${this.getSelectedPreset().label}`;
  }

  startGame() {
    if (this.status === 'menu') {
      this.status = 'playing';
      this.statusMessage = `${this.getSelectedPreset().label} in motion.`;
    }
  }

  selectPreset(presetId) {
    if (!PRESETS[presetId]) {
      return false;
    }

    this.selectedPresetId = presetId;
    this.resetGame();
    this.statusMessage = `Preset: ${this.getSelectedPreset().label}`;
    return true;
  }

  createBallsForPreset(preset) {
    const columns = Math.min(4, Math.ceil(Math.sqrt(preset.count)));
    const rows = Math.ceil(preset.count / columns);
    const horizontalSpace = this.playfield.right - this.playfield.left;
    const verticalSpace = this.playfield.bottom - this.playfield.top;
    const xStep = horizontalSpace / (columns + 1);
    const yStep = verticalSpace / (rows + 1);

    return Array.from({ length: preset.count }, (_, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const angle = (((index * 73) + (row * 31) + 18) * Math.PI) / 180;
      const speed = preset.baseSpeed + (((index % 5) - 2) * preset.speedStep);
      const size = preset.size;
      const minX = this.playfield.left;
      const minY = this.playfield.top;
      const maxX = this.playfield.right - size;
      const maxY = this.playfield.bottom - size;
      const x = clamp(
        this.playfield.left + ((column + 1) * xStep) - (size / 2),
        minX,
        maxX,
      );
      const y = clamp(
        this.playfield.top + ((row + 1) * yStep) - (size / 2),
        minY,
        maxY,
      );

      return createBall(
        index,
        size,
        x,
        y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
      );
    });
  }

  update(dt, controls = {}) {
    const safeDt = Math.max(0, Number(dt) || 0);
    let remaining = safeDt;
    let event = this.createEvent();

    if (controls.resetPressed) {
      this.resetGame();
      event.reset = true;
      event.status = this.status;
      return event;
    }

    if (controls.presetPressed) {
      const changed = this.selectPreset(controls.presetPressed);
      if (changed) {
        event.presetChanged = true;
        event.presetId = this.selectedPresetId;
      }
      event.status = this.status;
      return event;
    }

    if (controls.startPressed && this.status === 'menu') {
      this.startGame();
      event.started = true;
    }

    if (this.status !== 'playing') {
      event.status = this.status;
      return event;
    }

    while (remaining > 0) {
      const step = Math.min(remaining, MAX_STEP_SECONDS);
      event.bounceCount += this.updateStep(step);
      this.elapsedSeconds += step;
      remaining -= step;
    }

    event.status = this.status;
    return event;
  }

  updateStep(dt) {
    let bounceCount = 0;

    this.balls.forEach((ball) => {
      const maxX = this.playfield.right - ball.size;
      const maxY = this.playfield.bottom - ball.size;
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;

      if (ball.x <= this.playfield.left) {
        ball.x = this.playfield.left;
        ball.vx = Math.abs(ball.vx);
        bounceCount += 1;
      } else if (ball.x >= maxX) {
        ball.x = maxX;
        ball.vx = -Math.abs(ball.vx);
        bounceCount += 1;
      }

      if (ball.y <= this.playfield.top) {
        ball.y = this.playfield.top;
        ball.vy = Math.abs(ball.vy);
        bounceCount += 1;
      } else if (ball.y >= maxY) {
        ball.y = maxY;
        ball.vy = -Math.abs(ball.vy);
        bounceCount += 1;
      }
    });

    return bounceCount;
  }
}

export { PRESET_ORDER, PRESETS };
