/*
Toolbox Aid
David Quesenberry
03/22/2026
Bullet.js
*/
import { wrap } from '../utils/math.js';
import { transformPoints } from '../../../src/engine/rendering/index.js';

function normalizePoints(points) {
  return Array.isArray(points)
    ? points.map((point) => ({
      x: Number(point?.x ?? 0),
      y: Number(point?.y ?? 0),
    })).filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y))
    : [];
}

export default class Bullet {
  constructor(x, y, vx, vy, life = 1.1, { angle = 0, collisionPoints = [] } = {}) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.life = life;
    this.angle = Number.isFinite(angle) ? angle : 0;
    this.collisionPoints = normalizePoints(collisionPoints);
    if (this.collisionPoints.length < 3) {
      throw new Error('Asteroids Bullet requires manifest-loaded bullet object geometry.');
    }
  }

  update(dtSeconds, bounds) {
    this.x = wrap(this.x + this.vx * dtSeconds, bounds.width);
    this.y = wrap(this.y + this.vy * dtSeconds, bounds.height);
    this.life -= dtSeconds;
  }

  isAlive() {
    return this.life > 0;
  }

  getCollisionPolygon() {
    return transformPoints(this.collisionPoints, {
      x: this.x,
      y: this.y,
    });
  }
}
