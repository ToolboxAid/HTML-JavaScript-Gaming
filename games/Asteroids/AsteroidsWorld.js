/*
Toolbox Aid
David Quesenberry
03/22/2026
AsteroidsWorld.js
*/
import Asteroid from './Asteroid.js';
import Bullet from './Bullet.js';
import Ship from './Ship.js';
import { distance, randomRange } from './math.js';

export default class AsteroidsWorld {
  constructor(bounds) {
    this.bounds = bounds;
    this.starfield = Array.from({ length: 70 }, () => ({
      x: randomRange(0, bounds.width),
      y: randomRange(0, bounds.height),
      size: Math.random() > 0.7 ? 2 : 1,
    }));
    this.ship = new Ship(bounds.width / 2, bounds.height / 2);
    this.reset();
  }

  createWave(count = 4) {
    return Array.from({ length: count }, () => new Asteroid(
      randomRange(80, this.bounds.width - 80),
      randomRange(80, this.bounds.height - 80),
      3,
    ));
  }

  reset() {
    this.ship.reset();
    this.bullets = [];
    this.asteroids = [
      new Asteroid(140, 120, 3),
      new Asteroid(780, 160, 3),
      new Asteroid(180, 430, 3),
      new Asteroid(760, 420, 3),
    ];
    this.score = 0;
    this.lives = 3;
    this.fireCooldown = 0;
    this.gameOver = false;
    this.status = 'Clear the asteroid field.';
  }

  fire() {
    this.bullets.push(new Bullet(
      this.ship.x + Math.cos(this.ship.angle) * 20,
      this.ship.y + Math.sin(this.ship.angle) * 20,
      this.ship.vx + Math.cos(this.ship.angle) * 340,
      this.ship.vy + Math.sin(this.ship.angle) * 340,
    ));
    this.fireCooldown = 0.18;
  }

  splitAsteroid(index) {
    const asteroid = this.asteroids[index];
    this.asteroids.splice(index, 1);
    this.score += asteroid.size === 3 ? 20 : asteroid.size === 2 ? 50 : 100;

    if (asteroid.size > 1) {
      this.asteroids.push(new Asteroid(asteroid.x, asteroid.y, asteroid.size - 1));
      this.asteroids.push(new Asteroid(asteroid.x, asteroid.y, asteroid.size - 1));
    }

    if (this.asteroids.length === 0) {
      this.status = 'Wave cleared. New asteroids inbound.';
      this.asteroids = this.createWave(3);
    }
  }

  destroyShip() {
    this.lives -= 1;
    if (this.lives <= 0) {
      this.gameOver = true;
      this.status = 'Ship destroyed. Press Enter to restart.';
      return;
    }

    this.ship.reset();
    this.status = `Ship hit. ${this.lives} lives remaining.`;
  }

  update(dtSeconds, input) {
    if (this.gameOver) {
      return;
    }

    this.ship.update(dtSeconds, this.bounds, input);

    this.fireCooldown = Math.max(0, this.fireCooldown - dtSeconds);
    if (input?.isDown('Space') && this.fireCooldown === 0) {
      this.fire();
    }

    this.bullets.forEach((bullet) => bullet.update(dtSeconds, this.bounds));
    this.bullets = this.bullets.filter((bullet) => bullet.isAlive());

    this.asteroids.forEach((asteroid) => asteroid.update(dtSeconds, this.bounds));

    for (let bulletIndex = this.bullets.length - 1; bulletIndex >= 0; bulletIndex -= 1) {
      const bullet = this.bullets[bulletIndex];
      let hit = false;
      for (let asteroidIndex = this.asteroids.length - 1; asteroidIndex >= 0; asteroidIndex -= 1) {
        if (distance(bullet, this.asteroids[asteroidIndex]) < this.asteroids[asteroidIndex].radius + 2) {
          this.bullets.splice(bulletIndex, 1);
          this.splitAsteroid(asteroidIndex);
          this.status = 'Direct hit.';
          hit = true;
          break;
        }
      }
      if (hit) {
        continue;
      }
    }

    if (this.ship.invulnerable === 0) {
      for (const asteroid of this.asteroids) {
        if (distance(this.ship, asteroid) < asteroid.radius + 10) {
          this.destroyShip();
          break;
        }
      }
    }
  }
}
