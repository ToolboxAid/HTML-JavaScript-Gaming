/*
Toolbox Aid
David Quesenberry
03/22/2026
AsteroidsWorld.js
*/
import Asteroid from '../entities/Asteroid.js';
import Bullet from '../entities/Bullet.js';
import Ship from '../entities/Ship.js';
import Ufo from '../entities/Ufo.js';
import { arePolygonsColliding } from '../../../engine/collision/polygon.js';
import { distance } from '../../../engine/utils/math.js';
import { randomRange } from '../utils/math.js';

const WAVE_ASTEROID_COUNTS = [4, 6, 8];
const RESPAWN_SAFE_DISTANCE = 100;
const ASTEROID_SAFE_RECTS = [
  { x: 30, y: 10, width: 240, height: 110 },
  { x: 330, y: 10, width: 300, height: 110 },
  { x: 690, y: 10, width: 240, height: 110 },
  { x: 260, y: 180, width: 440, height: 240 },
];

export default class AsteroidsWorld {
  constructor(bounds) {
    this.bounds = bounds;
    this.starfield = Array.from({ length: 70 }, () => ({
      x: randomRange(0, bounds.width),
      y: randomRange(0, bounds.height),
      size: Math.random() > 0.7 ? 2 : 1,
    }));
    this.ship = new Ship(bounds.width / 2, bounds.height / 2);
    this.startGame();
  }

  startGame() {
    this.wave = 1;
    this.shipActive = true;
    this.respawnDelay = 0;
    this.respawnLocked = false;
    this.fireHeld = false;
    this.ufo = null;
    this.ufoBullets = [];
    this.ufoSpawnTimer = this.getUfoSpawnDelay();
    this.resetRound();
  }

  createAsteroidFromState(state) {
    const asteroid = new Asteroid(state.x, state.y, state.size);
    asteroid.vx = state.vx;
    asteroid.vy = state.vy;
    asteroid.angle = state.angle;
    asteroid.spin = state.spin;
    asteroid.size = state.size;
    asteroid.sizeLabel = state.sizeLabel;
    asteroid.scale = state.scale;
    asteroid.radius = state.radius;
    return asteroid;
  }

  createBulletFromState(state) {
    return new Bullet(state.x, state.y, state.vx, state.vy, state.life);
  }

  createUfoFromState(state) {
    if (!state) {
      return null;
    }

    const ufo = new Ufo(this.bounds, state.type, state.level ?? this.wave);
    ufo.direction = state.direction;
    ufo.x = state.x;
    ufo.y = state.y;
    ufo.vx = state.vx;
    ufo.vy = state.vy;
    ufo.radius = state.radius;
    ufo.points = state.points;
    ufo.turnTimer = state.turnTimer;
    ufo.fireTimer = state.fireTimer;
    ufo.alive = state.alive;
    return ufo;
  }

  getState() {
    return {
      wave: this.wave,
      shipActive: this.shipActive,
      respawnDelay: this.respawnDelay,
      respawnLocked: this.respawnLocked,
      fireHeld: this.fireHeld,
      fireCooldown: this.fireCooldown,
      status: this.status,
      ufoSpawnTimer: this.ufoSpawnTimer,
      ship: {
        x: this.ship.x,
        y: this.ship.y,
        vx: this.ship.vx,
        vy: this.ship.vy,
        angle: this.ship.angle,
        invulnerable: this.ship.invulnerable,
        thrusting: this.ship.thrusting,
      },
      asteroids: this.asteroids.map((asteroid) => ({
        x: asteroid.x,
        y: asteroid.y,
        vx: asteroid.vx,
        vy: asteroid.vy,
        angle: asteroid.angle,
        spin: asteroid.spin,
        size: asteroid.size,
        sizeLabel: asteroid.sizeLabel,
        scale: asteroid.scale,
        radius: asteroid.radius,
      })),
      bullets: this.bullets.map((bullet) => ({
        x: bullet.x,
        y: bullet.y,
        vx: bullet.vx,
        vy: bullet.vy,
        life: bullet.life,
      })),
      ufoBullets: this.ufoBullets.map((bullet) => ({
        x: bullet.x,
        y: bullet.y,
        vx: bullet.vx,
        vy: bullet.vy,
        life: bullet.life,
      })),
      ufo: this.ufo ? {
        type: this.ufo.type,
        level: this.wave,
        direction: this.ufo.direction,
        x: this.ufo.x,
        y: this.ufo.y,
        vx: this.ufo.vx,
        vy: this.ufo.vy,
        radius: this.ufo.radius,
        points: this.ufo.points,
        turnTimer: this.ufo.turnTimer,
        fireTimer: this.ufo.fireTimer,
        alive: this.ufo.alive,
      } : null,
    };
  }

  loadState(state) {
    if (!state) {
      this.startGame();
      return;
    }

    this.wave = state.wave ?? 1;
    this.shipActive = state.shipActive ?? true;
    this.respawnDelay = state.respawnDelay ?? 0;
    this.respawnLocked = state.respawnLocked ?? false;
    this.fireHeld = state.fireHeld ?? false;
    this.fireCooldown = state.fireCooldown ?? 0;
    this.status = state.status ?? '';
    this.ufoSpawnTimer = state.ufoSpawnTimer ?? this.getUfoSpawnDelay();

    this.ship.reset();
    Object.assign(this.ship, state.ship ?? {});

    this.asteroids = (state.asteroids ?? []).map((asteroid) => this.createAsteroidFromState(asteroid));
    this.bullets = (state.bullets ?? []).map((bullet) => this.createBulletFromState(bullet));
    this.ufoBullets = (state.ufoBullets ?? []).map((bullet) => this.createBulletFromState(bullet));
    this.ufo = this.createUfoFromState(state.ufo);
  }

  getWaveAsteroidCount() {
    return WAVE_ASTEROID_COUNTS[this.wave - 1] || 10;
  }

  getWaveSpeedMultiplier() {
    return 1 + (this.wave - 1) * 0.16;
  }

  getUfoSpawnDelay() {
    return randomRange(7, 12);
  }

  isInsideSafeRect(x, y, radius = 0) {
    return ASTEROID_SAFE_RECTS.some((rect) => (
      x + radius > rect.x
      && x - radius < rect.x + rect.width
      && y + radius > rect.y
      && y - radius < rect.y + rect.height
    ));
  }

  createWave(count = this.getWaveAsteroidCount()) {
    return Array.from({ length: count }, () => {
      let asteroid = null;
      for (let attempt = 0; attempt < 40; attempt += 1) {
        const candidate = new Asteroid(
          randomRange(80, this.bounds.width - 80),
          randomRange(120, this.bounds.height - 80),
          3,
        );
        if (!this.isInsideSafeRect(candidate.x, candidate.y, candidate.radius + 24)) {
          asteroid = candidate;
          break;
        }
      }

      asteroid ||= new Asteroid(
        randomRange(80, this.bounds.width - 80),
        randomRange(160, this.bounds.height - 80),
        3,
      );
      asteroid.vx *= this.getWaveSpeedMultiplier();
      asteroid.vy *= this.getWaveSpeedMultiplier();
      asteroid.spin *= 1 + (this.wave - 1) * 0.08;
      return asteroid;
    });
  }

  resetRound() {
    this.ship.reset();
    this.shipActive = true;
    this.respawnDelay = 0;
    this.respawnLocked = false;
    this.fireHeld = false;
    this.bullets = [];
    this.ufoBullets = [];
    this.ufo = null;
    this.ufoSpawnTimer = this.getUfoSpawnDelay();
    this.asteroids = this.createWave();
    this.fireCooldown = 0;
    this.status = `Wave ${this.wave}. Clear the asteroid field.`;
  }

  resetShip() {
    this.ship.reset();
    this.shipActive = true;
    this.respawnDelay = 0;
    this.respawnLocked = false;
    this.fireHeld = false;
    this.bullets = [];
  }

  queueRespawn() {
    this.shipActive = false;
    this.respawnDelay = 5;
    this.respawnLocked = false;
    this.fireHeld = false;
    this.bullets = [];
    this.ship.thrusting = false;
    this.status = 'Stand by for safe respawn.';
  }

  setRespawnLocked(locked) {
    this.respawnLocked = !!locked;
  }

  prepareTurnStart() {
    if (!this.shipActive) {
      this.respawnDelay = 0;
    }
  }

  isSpawnAreaSafe() {
    const spawnPoint = { x: this.ship.spawnX, y: this.ship.spawnY };
    const asteroidTooClose = this.asteroids.some((asteroid) => distance(asteroid, spawnPoint) < asteroid.radius + RESPAWN_SAFE_DISTANCE);
    const ufoTooClose = this.ufo && this.ufo.alive && distance(this.ufo, spawnPoint) < this.ufo.radius + RESPAWN_SAFE_DISTANCE;
    const enemyBulletTooClose = this.ufoBullets.some((bullet) => distance(bullet, spawnPoint) < RESPAWN_SAFE_DISTANCE * 0.75);
    return !asteroidTooClose && !ufoTooClose && !enemyBulletTooClose;
  }

  tryRespawn() {
    if (this.shipActive) {
      return false;
    }

    if (this.respawnLocked || this.respawnDelay > 0 || !this.isSpawnAreaSafe()) {
      this.status = 'Waiting for a safe respawn window.';
      return false;
    }

    this.resetShip();
    this.status = `Wave ${this.wave}. Back in action.`;
    return true;
  }

  maybeSpawnUfo() {
    if (this.ufo || this.asteroids.length === 0) {
      return;
    }

    this.ufoSpawnTimer -= 0;
    const type = this.wave >= 3 ? 'small' : 'large';
    this.ufo = new Ufo(this.bounds, type, this.wave);
    this.status = type === 'small' ? 'Small saucer inbound.' : 'Large saucer inbound.';
  }

  getUfoTarget() {
    if (!this.ufo) {
      return null;
    }

    if (this.ufo.type === 'small') {
      const shotSpeed = 250;
      const distanceToShip = Math.max(1, distance(this.ufo, this.ship));
      const leadTime = distanceToShip / shotSpeed;
      return {
        x: this.ship.x + this.ship.vx * leadTime,
        y: this.ship.y + this.ship.vy * leadTime,
      };
    }

    if (this.asteroids.length > 0) {
      return this.asteroids.reduce((closest, asteroid) => (
        !closest || distance(this.ufo, asteroid) < distance(this.ufo, closest)
          ? asteroid
          : closest
      ), null);
    }

    return this.ship;
  }

  fire() {
    if (this.bullets.length >= 5) {
      return false;
    }

    const shotSpeed = 340;
    const fullScreenLife = Math.max(1.1, (this.bounds.height * 0.9) / shotSpeed);
    this.bullets.push(new Bullet(
      this.ship.x + Math.cos(this.ship.angle) * 20,
      this.ship.y + Math.sin(this.ship.angle) * 20,
      this.ship.vx + Math.cos(this.ship.angle) * shotSpeed,
      this.ship.vy + Math.sin(this.ship.angle) * shotSpeed,
      fullScreenLife,
    ));
    this.fireCooldown = 0.18;
    return true;
  }

  splitAsteroid(index) {
    const asteroid = this.asteroids[index];
    this.asteroids.splice(index, 1);
    const points = asteroid.size === 3 ? 20 : asteroid.size === 2 ? 50 : 100;

    if (asteroid.size > 1) {
      this.asteroids.push(new Asteroid(asteroid.x, asteroid.y, asteroid.size - 1));
      this.asteroids.push(new Asteroid(asteroid.x, asteroid.y, asteroid.size - 1));
    }

    let waveCleared = false;
    if (this.asteroids.length === 0 && !this.ufo) {
      this.wave += 1;
      this.status = `Wave ${this.wave - 1} cleared. Wave ${this.wave} inbound.`;
      this.asteroids = this.createWave();
      this.ufo = null;
      this.ufoBullets = [];
      this.ufoSpawnTimer = this.getUfoSpawnDelay();
      waveCleared = true;
    }
    return {
      points,
      waveCleared,
      explosion: {
        x: asteroid.x,
        y: asteroid.y,
        size: asteroid.size,
      },
    };
  }

  destroyShip() {
    this.status = 'Ship destroyed.';
  }

  update(dtSeconds, input) {
    const events = {
      explosions: [],
      scoreEvents: [],
      shipDestroyed: false,
      shipDestroyedState: null,
      shipRespawned: false,
      waveCleared: false,
      sfx: [],
    };

    if (this.shipActive) {
      this.ship.update(dtSeconds, this.bounds, input);
    } else {
      if (!this.respawnLocked) {
        this.respawnDelay = Math.max(0, this.respawnDelay - dtSeconds);
      }
      events.shipRespawned = this.tryRespawn();
    }

    const firePressed = !!input?.isDown('Space');
    this.fireCooldown = Math.max(0, this.fireCooldown - dtSeconds);
    if (this.shipActive && firePressed && !this.fireHeld && this.fireCooldown === 0) {
      if (this.fire()) {
        events.sfx.push('fire');
      }
    }
    this.fireHeld = firePressed;

    this.bullets.forEach((bullet) => bullet.update(dtSeconds, this.bounds));
    this.bullets = this.bullets.filter((bullet) => bullet.isAlive());

    this.asteroids.forEach((asteroid) => asteroid.update(dtSeconds, this.bounds));

    if (this.shipActive) {
      this.ufoSpawnTimer -= dtSeconds;
    }
    if (this.shipActive && !this.ufo && this.ufoSpawnTimer <= 0) {
      const type = this.wave >= 3 ? 'small' : 'large';
      this.ufo = new Ufo(this.bounds, type, this.wave);
      this.status = type === 'small' ? 'Small saucer inbound.' : 'Large saucer inbound.';
    }

    if (this.ufo) {
      this.ufo.update(dtSeconds);
      if (this.ufo.alive && this.shipActive && this.ufo.canFire()) {
        const target = this.getUfoTarget();
        if (target) {
          this.ufoBullets.push(this.ufo.fireAt(target));
        }
      }
      if (!this.ufo.alive) {
        this.ufo = null;
        this.ufoSpawnTimer = this.getUfoSpawnDelay();
        if (this.asteroids.length === 0) {
          this.wave += 1;
          this.status = `Wave ${this.wave - 1} cleared. Wave ${this.wave} inbound.`;
          this.asteroids = this.createWave();
          this.ufoBullets = [];
          events.waveCleared = true;
        }
      }
    }

    this.ufoBullets.forEach((bullet) => bullet.update(dtSeconds, this.bounds));
    this.ufoBullets = this.ufoBullets.filter((bullet) => bullet.isAlive());

    if (this.ufo) {
      const ufoPolygon = this.ufo.getCollisionPolygon();
      for (let asteroidIndex = this.asteroids.length - 1; asteroidIndex >= 0; asteroidIndex -= 1) {
        const asteroid = this.asteroids[asteroidIndex];
        if (arePolygonsColliding(ufoPolygon, asteroid.getPoints())) {
          const result = this.splitAsteroid(asteroidIndex);
          events.explosions.push(result.explosion);
          events.waveCleared = events.waveCleared || result.waveCleared;
          events.explosions.push({
            x: this.ufo.x,
            y: this.ufo.y,
            size: this.ufo.type === 'small' ? 1 : 2,
            source: 'ufo',
          });
          this.ufo = null;
          this.ufoSpawnTimer = this.getUfoSpawnDelay();
          events.sfx.push(result.points === 20 ? 'bangLarge' : result.points === 50 ? 'bangMedium' : 'bangSmall');
          events.sfx.push('bangMedium');
          this.status = 'Saucer and asteroid destroyed on impact.';
          break;
        }
      }
    }

    for (let bulletIndex = this.bullets.length - 1; bulletIndex >= 0; bulletIndex -= 1) {
      const bullet = this.bullets[bulletIndex];
      const bulletPolygon = bullet.getCollisionPolygon();
      let hit = false;

      if (this.ufo && arePolygonsColliding(bulletPolygon, this.ufo.getCollisionPolygon())) {
        this.bullets.splice(bulletIndex, 1);
        events.scoreEvents.push(this.ufo.points);
        events.explosions.push({
          x: this.ufo.x,
          y: this.ufo.y,
          size: this.ufo.type === 'small' ? 1 : 2,
          source: 'ufo',
        });
        events.sfx.push(this.ufo.type === 'small' ? 'bangSmall' : 'bangMedium');
        this.ufo = null;
        this.ufoSpawnTimer = this.getUfoSpawnDelay();
        this.status = 'Saucer destroyed.';
        continue;
      }

      for (let asteroidIndex = this.asteroids.length - 1; asteroidIndex >= 0; asteroidIndex -= 1) {
        if (arePolygonsColliding(bulletPolygon, this.asteroids[asteroidIndex].getPoints())) {
          this.bullets.splice(bulletIndex, 1);
          const result = this.splitAsteroid(asteroidIndex);
          events.scoreEvents.push(result.points);
          events.explosions.push(result.explosion);
          events.waveCleared = events.waveCleared || result.waveCleared;
          events.sfx.push(result.points === 20 ? 'bangLarge' : result.points === 50 ? 'bangMedium' : 'bangSmall');
          this.status = 'Direct hit.';
          hit = true;
          break;
        }
      }
      if (hit) {
        continue;
      }
    }

    if (this.ufo) {
      for (let bulletIndex = this.ufoBullets.length - 1; bulletIndex >= 0; bulletIndex -= 1) {
        const bulletPolygon = this.ufoBullets[bulletIndex].getCollisionPolygon();
        let hit = false;

        for (let asteroidIndex = this.asteroids.length - 1; asteroidIndex >= 0; asteroidIndex -= 1) {
          if (arePolygonsColliding(bulletPolygon, this.asteroids[asteroidIndex].getPoints())) {
            this.ufoBullets.splice(bulletIndex, 1);
            const result = this.splitAsteroid(asteroidIndex);
            events.explosions.push(result.explosion);
            events.waveCleared = events.waveCleared || result.waveCleared;
            events.sfx.push(result.points === 20 ? 'bangLarge' : result.points === 50 ? 'bangMedium' : 'bangSmall');
            this.status = 'Saucer fire hit an asteroid.';
            hit = true;
            break;
          }
        }

        if (hit) {
          continue;
        }

        if (arePolygonsColliding(bulletPolygon, this.ufo.getCollisionPolygon())) {
          this.ufoBullets.splice(bulletIndex, 1);
          events.explosions.push({
            x: this.ufo.x,
            y: this.ufo.y,
            size: this.ufo.type === 'small' ? 1 : 2,
            source: 'ufo',
          });
          this.ufo = null;
          this.ufoSpawnTimer = this.getUfoSpawnDelay();
          events.sfx.push('bangMedium');
          this.status = 'Saucer destroyed by crossfire.';
          break;
        }
      }
    }

    if (this.shipActive && this.ship.invulnerable === 0) {
      const shipPolygon = this.ship.getPoints();
      for (let asteroidIndex = this.asteroids.length - 1; asteroidIndex >= 0; asteroidIndex -= 1) {
        const asteroid = this.asteroids[asteroidIndex];
        if (arePolygonsColliding(shipPolygon, asteroid.getPoints())) {
          const result = this.splitAsteroid(asteroidIndex);
          this.destroyShip();
          events.scoreEvents.push(result.points);
          events.explosions.push(result.explosion);
          events.waveCleared = events.waveCleared || result.waveCleared;
          events.shipDestroyed = true;
          events.sfx.push('bangLarge');
          break;
        }
      }
    }

    if (this.shipActive && !events.shipDestroyed && this.ufo && this.ship.invulnerable === 0 && arePolygonsColliding(this.ship.getPoints(), this.ufo.getCollisionPolygon())) {
      events.scoreEvents.push(this.ufo.points);
      events.explosions.push({
        x: this.ufo.x,
        y: this.ufo.y,
        size: this.ufo.type === 'small' ? 1 : 2,
        source: 'ufo',
      });
      this.ufo = null;
      this.ufoSpawnTimer = this.getUfoSpawnDelay();
      this.destroyShip();
      events.shipDestroyed = true;
      events.sfx.push('bangLarge');
    }

    if (this.shipActive && !events.shipDestroyed && this.ship.invulnerable === 0) {
      const shipPolygon = this.ship.getPoints();
      for (const bullet of this.ufoBullets) {
        if (arePolygonsColliding(bullet.getCollisionPolygon(), shipPolygon)) {
          this.destroyShip();
          events.shipDestroyed = true;
          events.sfx.push('bangLarge');
          break;
        }
      }
    }

    if (events.shipDestroyed) {
      events.shipDestroyedState = {
        x: this.ship.x,
        y: this.ship.y,
        angle: this.ship.angle,
        vx: this.ship.vx,
        vy: this.ship.vy,
      };
      this.queueRespawn();
    }

    return events;
  }
}
