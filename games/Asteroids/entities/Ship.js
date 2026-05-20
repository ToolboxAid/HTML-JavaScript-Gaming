/*
Toolbox Aid
David Quesenberry
03/22/2026
Ship.js
*/
import { wrap } from '/src/shared/utils/mathUtils.js';
import { transformCollisionPoints } from '/src/engine/collision/index.js';
import { normalizePoints } from '/src/shared/utils/geometryUtils.js';

export default class Ship {
  constructor(x, y, { collisionPoints = [] } = {}) {
    this.spawnX = x;
    this.spawnY = y;
    this.collisionPoints = normalizePoints(collisionPoints);
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
    return transformCollisionPoints(this.collisionPoints, {
      x: this.x,
      y: this.y,
      rotation: this.angle,
      rotationUnit: 'radians',
    });
  }
}
