/*
Toolbox Aid
David Quesenberry
03/22/2026
Ship.js
*/
import { wrap } from './math.js';

const SMALL_VECTOR_MAP = [
  [14, 0],
  [-10, -8],
  [-6, -3],
  [-6, 3],
  [-10, 8],
  [14, 0],
];

function rotatePoint(x, y, angle) {
  return {
    x: x * Math.cos(angle) - y * Math.sin(angle),
    y: x * Math.sin(angle) + y * Math.cos(angle),
  };
}

export default class Ship {
  constructor(x, y) {
    this.spawnX = x;
    this.spawnY = y;
    this.reset();
  }

  reset() {
    this.x = this.spawnX;
    this.y = this.spawnY;
    this.vx = 0;
    this.vy = 0;
    this.angle = -Math.PI / 2;
    this.invulnerable = 2;
    this.thrusting = false;
  }

  update(dtSeconds, bounds, input) {
    if (input?.isDown('ArrowLeft')) {
      this.angle -= 3.8 * dtSeconds;
    }
    if (input?.isDown('ArrowRight')) {
      this.angle += 3.8 * dtSeconds;
    }

    this.thrusting = Boolean(input?.isDown('ArrowUp'));
    if (this.thrusting) {
      this.vx += Math.cos(this.angle) * 170 * dtSeconds;
      this.vy += Math.sin(this.angle) * 170 * dtSeconds;
    }

    this.vx *= 0.992;
    this.vy *= 0.992;
    this.x = wrap(this.x + this.vx * dtSeconds, bounds.width);
    this.y = wrap(this.y + this.vy * dtSeconds, bounds.height);
    this.invulnerable = Math.max(0, this.invulnerable - dtSeconds);
  }

  getPoints() {
    return SMALL_VECTOR_MAP.map(([x, y]) => {
      const rotated = rotatePoint(x, y, this.angle);
      return {
        x: this.x + rotated.x,
        y: this.y + rotated.y,
      };
    });
  }

  getFlamePoints() {
    const rear = this.angle + Math.PI;
    return [
      { x: this.x + Math.cos(rear) * 18, y: this.y + Math.sin(rear) * 18 },
      { x: this.x + Math.cos(this.angle + 2.7) * 8, y: this.y + Math.sin(this.angle + 2.7) * 8 },
      { x: this.x + Math.cos(this.angle - 2.7) * 8, y: this.y + Math.sin(this.angle - 2.7) * 8 },
    ];
  }
}
