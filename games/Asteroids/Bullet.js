/*
Toolbox Aid
David Quesenberry
03/22/2026
Bullet.js
*/
import { wrap } from './math.js';

export default class Bullet {
  constructor(x, y, vx, vy) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.life = 1.1;
  }

  update(dtSeconds, bounds) {
    this.x = wrap(this.x + this.vx * dtSeconds, bounds.width);
    this.y = wrap(this.y + this.vy * dtSeconds, bounds.height);
    this.life -= dtSeconds;
  }

  isAlive() {
    return this.life > 0;
  }
}
