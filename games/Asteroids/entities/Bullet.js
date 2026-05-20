/*
Toolbox Aid
David Quesenberry
03/22/2026
Bullet.js
*/
import { wrap } from '/src/shared/math/scalars.js';
import { transformCollisionPoints } from '/src/engine/collision/index.js';
import { normalizePoints } from '/src/shared/math/geometry.js';

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
    return transformCollisionPoints(this.collisionPoints, {
      x: this.x,
      y: this.y,
      rotation: this.angle,
      rotationUnit: 'radians',
    });
  }
}
