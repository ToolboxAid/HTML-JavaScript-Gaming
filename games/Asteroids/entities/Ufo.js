/*
Toolbox Aid
David Quesenberry
03/22/2026
Ufo.js
*/
import Bullet from './Bullet.js';
import { distance } from '../../../engine/utils/math.js';
import { randomRange } from '../utils/math.js';

const UFO_PROFILES = {
  large: {
    radius: 26,
    speed: 88,
    points: 200,
    fireInterval: [1.8, 2.8],
    aimJitter: 0.55,
  },
  small: {
    radius: 18,
    speed: 126,
    points: 1000,
    fireInterval: [1.1, 1.8],
    aimJitter: 0.16,
  },
};

const VECTOR_MAPS = {
  small: [
    [-14, 3], [14, 3], [9, 9], [-9, 9], [-14, 3], [-9, -3],
    [-5, -3], [-5, -6], [-2, -9], [2, -9], [5, -6], [5, -3], [-5, -3],
    [9, -3], [14, 3],
  ],
  large: [
    [-21, 4.5], [21, 4.5], [13.5, 13.5], [-13.5, 13.5], [-21, 4.5], [-13.5, -4.5],
    [-7.5, -4.5], [-7.5, -9], [-3, -13.5], [3, -13.5], [7.5, -9], [7.5, -4.5], [-7.5, -4.5],
    [13.5, -4.5], [21, 4.5],
  ],
};

export default class Ufo {
  constructor(bounds, type = 'large', level = 1, rng = Math.random) {
    this.bounds = bounds;
    this.rng = typeof rng === 'function' ? rng : Math.random;
    this.type = UFO_PROFILES[type] ? type : 'large';
    this.profile = UFO_PROFILES[this.type];
    this.direction = this.rng() > 0.5 ? 1 : -1;
    this.x = this.direction > 0 ? -48 : bounds.width + 48;
    this.y = randomRange(120, bounds.height - 140, this.rng);
    this.vx = this.profile.speed * (1 + (level - 1) * 0.05) * this.direction;
    this.vy = randomRange(-26, 26, this.rng);
    this.radius = this.profile.radius;
    this.points = this.profile.points;
    this.turnTimer = randomRange(1.2, 2.4, this.rng);
    this.fireTimer = randomRange(...this.profile.fireInterval, this.rng);
    this.alive = true;
  }

  update(dtSeconds) {
    this.x += this.vx * dtSeconds;
    this.y += this.vy * dtSeconds;

    this.turnTimer -= dtSeconds;
    if (this.turnTimer <= 0) {
      this.turnTimer = randomRange(1.1, 2.2, this.rng);
      this.vy = randomRange(-52, 52, this.rng);
    }

    if (this.y < 88) {
      this.y = 88;
      this.vy = Math.abs(this.vy);
    } else if (this.y > this.bounds.height - 120) {
      this.y = this.bounds.height - 120;
      this.vy = -Math.abs(this.vy);
    }

    this.fireTimer -= dtSeconds;
    if (this.direction > 0 && this.x > this.bounds.width + 60) {
      this.alive = false;
    } else if (this.direction < 0 && this.x < -60) {
      this.alive = false;
    }
  }

  canFire() {
    return this.fireTimer <= 0;
  }

  fireAt(target) {
    this.fireTimer = randomRange(...this.profile.fireInterval, this.rng);
    const aimAngle = Math.atan2(target.y - this.y, target.x - this.x) + randomRange(-this.profile.aimJitter, this.profile.aimJitter, this.rng);
    const muzzleX = this.x + Math.cos(aimAngle) * (this.radius - 2);
    const muzzleY = this.y + Math.sin(aimAngle) * (this.radius - 2);
    const shotSpeed = 250;
    const fullScreenLife = Math.max(1.1, this.bounds.width / shotSpeed);
    return new Bullet(
      muzzleX,
      muzzleY,
      Math.cos(aimAngle) * shotSpeed,
      Math.sin(aimAngle) * shotSpeed,
      fullScreenLife,
    );
  }

  collidesWithPoint(point, padding = 0) {
    return distance(this, point) <= this.radius + padding;
  }

  getCollisionPolygon() {
    return VECTOR_MAPS[this.type].map(([x, y]) => ({
      x: this.x + x,
      y: this.y + y,
    }));
  }

  getBodyLines() {
    return [
      this.getCollisionPolygon(),
    ];
  }
}
