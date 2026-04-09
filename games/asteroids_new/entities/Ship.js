/*
Toolbox Aid
David Quesenberry
03/22/2026
Ship.js
*/
import { wrap } from '../utils/math.js';
import { transformPoints } from '../../../src/engine/vector/index.js';

const SMALL_VECTOR_MAP = [
  { x: 14, y: 0 },
  { x: -10, y: -8 },
  { x: -6, y: -3 },
  { x: -6, y: 3 },
  { x: -10, y: 8 },
  { x: 14, y: 0 },
];

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
    return transformPoints(SMALL_VECTOR_MAP, {
      x: this.x,
      y: this.y,
      rotation: this.angle,
    });
  }

  getFlamePoints(pulse = 1) {
    const rear = this.angle + Math.PI;
    const flameReach = (18 + pulse * 9) * 0.5;
    const wingSpread = (8 + pulse * 2) * 0.5;
    return [
      { x: this.x + Math.cos(rear) * flameReach, y: this.y + Math.sin(rear) * flameReach },
      { x: this.x + Math.cos(this.angle + 2.7) * wingSpread, y: this.y + Math.sin(this.angle + 2.7) * wingSpread },
      { x: this.x + Math.cos(this.angle - 2.7) * wingSpread, y: this.y + Math.sin(this.angle - 2.7) * wingSpread },
    ];
  }
}
