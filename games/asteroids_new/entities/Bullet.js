/*
Toolbox Aid
David Quesenberry
03/22/2026
Bullet.js
*/
import { wrap } from '../../Asteroids/utils/math.js';

export default class Bullet {
  constructor(x, y, vx, vy, life = 1.1) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.life = life;
    this.radius = 2;
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
    return [
      { x: this.x - this.radius, y: this.y - this.radius },
      { x: this.x + this.radius, y: this.y - this.radius },
      { x: this.x + this.radius, y: this.y + this.radius },
      { x: this.x - this.radius, y: this.y + this.radius },
    ];
  }
}
