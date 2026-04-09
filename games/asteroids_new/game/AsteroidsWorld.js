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
import { arePolygonsColliding } from '../../../src/engine/collision/index.js';
import { distance } from '../../../src/engine/utils/index.js';
import { randomRange } from '../../Asteroids/utils/math.js';
import { sanitizeFiniteNumber, sanitizePositiveNumber } from '../../../src/shared/math/numberNormalization.js';

const WAVE_ASTEROID_COUNTS = [4, 6, 8];
const RESPAWN_SAFE_DISTANCE = 100;
const ASTEROID_SAFE_RECTS = [
  { x: 30, y: 10, width: 240, height: 110 },
  { x: 330, y: 10, width: 300, height: 110 },
  { x: 690, y: 10, width: 240, height: 110 },
  { x: 260, y: 180, width: 440, height: 240 },
];

const DEFAULT_WORLD_WIDTH = 960;
const DEFAULT_WORLD_HEIGHT = 720;
const ASTEROID_SIZE_MIN = 1;
const ASTEROID_SIZE_MAX = 3;
const WAVE_SPAWN_MARGIN_X = 80;
const WAVE_SPAWN_MARGIN_Y = 120;
const WAVE_SPAWN_ATTEMPTS = 60;
const ASTEROID_SPAWN_SAFE_PADDING = 24;
const MAX_UPDATE_STEP_SECONDS = 1 / 60;

function sanitizeBoolean(value, fallback = false) {
  return typeof value === 'boolean' ? value : fallback;
}

function sanitizeInteger(value, fallback, { min = -Infinity, max = Infinity } = {}) {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, Math.trunc(value)));
}

function sanitizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function sanitizeStatus(value, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function sanitizeUfoType(type) {
  return type === 'small' || type === 'large'
    ? type
    : 'large';
}

function sanitizeDirection(value, fallback = 1) {
  if (!Number.isFinite(value) || value === 0) {
    return fallback < 0 ? -1 : 1;
  }

  return value < 0 ? -1 : 1;
}

function sanitizeBounds(bounds) {
  const source = bounds && typeof bounds === 'object'
    ? bounds
    : {};

  const width = Math.max(1, sanitizeFiniteNumber(source.width, DEFAULT_WORLD_WIDTH));
  const height = Math.max(1, sanitizeFiniteNumber(source.height, DEFAULT_WORLD_HEIGHT));

  return { width, height };
}

function createWorldEvents() {
  return {
    explosions: [],
    scoreEvents: [],
    shipDestroyed: false,
    shipDestroyedState: null,
    shipRespawned: false,
    waveCleared: false,
    sfx: [],
  };
}

function mergeWorldEvents(target, stepEvents) {
  if (!stepEvents) {
    return target;
  }

  target.explosions.push(...(stepEvents.explosions || []));
  target.scoreEvents.push(...(stepEvents.scoreEvents || []));
  target.shipDestroyed = target.shipDestroyed || !!stepEvents.shipDestroyed;
  if (!target.shipDestroyedState && stepEvents.shipDestroyedState) {
    target.shipDestroyedState = stepEvents.shipDestroyedState;
  }
  target.shipRespawned = target.shipRespawned || !!stepEvents.shipRespawned;
  target.waveCleared = target.waveCleared || !!stepEvents.waveCleared;
  target.sfx.push(...(stepEvents.sfx || []));
  return target;
}

function getRectOverlapDepth(x, y, radius, rect) {
  const overlaps = (
    x + radius > rect.x
    && x - radius < rect.x + rect.width
    && y + radius > rect.y
    && y - radius < rect.y + rect.height
  );

  if (!overlaps) {
    return 0;
  }

  const overlapLeft = (x + radius) - rect.x;
  const overlapRight = (rect.x + rect.width) - (x - radius);
  const overlapTop = (y + radius) - rect.y;
  const overlapBottom = (rect.y + rect.height) - (y - radius);

  return Math.max(0, Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom));
}

export default class AsteroidsWorld {
  constructor(bounds, { rng = Math.random } = {}) {
    this.rng = typeof rng === 'function' ? rng : Math.random;
    this.bounds = sanitizeBounds(bounds);
    this.starfield = Array.from({ length: 70 }, () => ({
      x: randomRange(0, this.bounds.width, this.rng),
      y: randomRange(0, this.bounds.height, this.rng),
      size: this.rng() > 0.7 ? 2 : 1,
    }));
    this.ship = new Ship(this.bounds.width / 2, this.bounds.height / 2);
    this.startGame();
  }

  createAsteroidEntity(x, y, size = 3) {
    return new Asteroid(x, y, size, this.rng);
  }

  createUfoEntity(type = 'large', level = 1) {
    return new Ufo(this.bounds, type, level, this.rng);
  }

  createRandomAsteroid(size = 3, minX = WAVE_SPAWN_MARGIN_X, maxX = this.bounds.width - WAVE_SPAWN_MARGIN_X, minY = WAVE_SPAWN_MARGIN_Y, maxY = this.bounds.height - WAVE_SPAWN_MARGIN_X) {
    return this.createAsteroidEntity(
      randomRange(minX, maxX, this.rng),
      randomRange(minY, maxY, this.rng),
      size,
    );
  }

  getSpawnAnchors() {
    return [
      { x: WAVE_SPAWN_MARGIN_X, y: this.bounds.height - WAVE_SPAWN_MARGIN_X },
      { x: this.bounds.width - WAVE_SPAWN_MARGIN_X, y: this.bounds.height - WAVE_SPAWN_MARGIN_X },
      { x: this.bounds.width * 0.5, y: this.bounds.height - WAVE_SPAWN_MARGIN_X },
      { x: WAVE_SPAWN_MARGIN_X, y: this.bounds.height * 0.5 },
      { x: this.bounds.width - WAVE_SPAWN_MARGIN_X, y: this.bounds.height * 0.5 },
    ];
  }

  getSafeRectPenalty(x, y, radius = 0) {
    return ASTEROID_SAFE_RECTS.reduce((total, rect) => (
      total + getRectOverlapDepth(x, y, radius, rect)
    ), 0);
  }

  pickWaveAsteroid(size = 3) {
    let bestCandidate = null;
    let bestPenalty = Number.POSITIVE_INFINITY;

    for (let attempt = 0; attempt < WAVE_SPAWN_ATTEMPTS; attempt += 1) {
      const candidate = this.createRandomAsteroid(size);
      const penalty = this.getSafeRectPenalty(
        candidate.x,
        candidate.y,
        candidate.radius + ASTEROID_SPAWN_SAFE_PADDING,
      );

      if (penalty === 0) {
        return candidate;
      }

      if (penalty < bestPenalty) {
        bestCandidate = candidate;
        bestPenalty = penalty;
      }
    }

    for (const anchor of this.getSpawnAnchors()) {
      const candidate = this.createAsteroidEntity(anchor.x, anchor.y, size);
      const penalty = this.getSafeRectPenalty(
        candidate.x,
        candidate.y,
        candidate.radius + ASTEROID_SPAWN_SAFE_PADDING,
      );

      if (penalty === 0) {
        return candidate;
      }

      if (penalty < bestPenalty) {
        bestCandidate = candidate;
        bestPenalty = penalty;
      }
    }

    return bestCandidate || this.createAsteroidEntity(
      this.bounds.width * 0.5,
      this.bounds.height - WAVE_SPAWN_MARGIN_X,
      size,
    );
  }

  applyShipState(shipState) {
    if (!shipState || typeof shipState !== 'object') {
      return;
    }

    this.ship.x = sanitizeFiniteNumber(shipState.x, this.ship.x);
    this.ship.y = sanitizeFiniteNumber(shipState.y, this.ship.y);
    this.ship.vx = sanitizeFiniteNumber(shipState.vx, this.ship.vx);
    this.ship.vy = sanitizeFiniteNumber(shipState.vy, this.ship.vy);
    this.ship.angle = sanitizeFiniteNumber(shipState.angle, this.ship.angle);
    this.ship.invulnerable = Math.max(0, sanitizeFiniteNumber(shipState.invulnerable, this.ship.invulnerable));
    this.ship.thrusting = sanitizeBoolean(shipState.thrusting, this.ship.thrusting);
  }

  startGame() {
    this.wave = 1;
    this.shipActive = true;
    this.respawnDelay = 0;
    this.respawnLocked = false;
    this.fireHeld = false;
    this.waveClearPending = false;
    this.ufo = null;
    this.ufoBullets = [];
    this.ufoSpawnTimer = this.getUfoSpawnDelay();
    this.resetRound();
  }

  createAsteroidFromState(state) {
    const source = state && typeof state === 'object' ? state : {};
    const size = sanitizeInteger(source.size, 3, { min: ASTEROID_SIZE_MIN, max: ASTEROID_SIZE_MAX });
    const asteroid = this.createAsteroidEntity(
      sanitizeFiniteNumber(source.x, this.bounds.width * 0.5),
      sanitizeFiniteNumber(source.y, this.bounds.height * 0.5),
      size,
    );

    asteroid.vx = sanitizeFiniteNumber(source.vx, asteroid.vx);
    asteroid.vy = sanitizeFiniteNumber(source.vy, asteroid.vy);
    asteroid.angle = sanitizeFiniteNumber(source.angle, asteroid.angle);
    asteroid.spin = sanitizeFiniteNumber(source.spin, asteroid.spin);
    asteroid.size = size;
    asteroid.sizeLabel = typeof source.sizeLabel === 'string' ? source.sizeLabel : asteroid.sizeLabel;
    asteroid.scale = sanitizePositiveNumber(source.scale, asteroid.scale);
    asteroid.radius = sanitizePositiveNumber(source.radius, asteroid.radius);
    return asteroid;
  }

  createBulletFromState(state) {
    const source = state && typeof state === 'object' ? state : {};
    return new Bullet(
      sanitizeFiniteNumber(source.x, this.bounds.width * 0.5),
      sanitizeFiniteNumber(source.y, this.bounds.height * 0.5),
      sanitizeFiniteNumber(source.vx, 0),
      sanitizeFiniteNumber(source.vy, 0),
      Math.max(0, sanitizeFiniteNumber(source.life, 1.1)),
    );
  }

  createUfoFromState(state) {
    if (!state || typeof state !== 'object') {
      return null;
    }

    const type = sanitizeUfoType(state.type);
    const level = sanitizeInteger(state.level ?? this.wave, this.wave, { min: 1, max: 9999 });
    const ufo = this.createUfoEntity(type, level);
    ufo.direction = sanitizeDirection(state.direction, ufo.direction);
    ufo.x = sanitizeFiniteNumber(state.x, ufo.x);
    ufo.y = sanitizeFiniteNumber(state.y, ufo.y);
    ufo.vx = sanitizeFiniteNumber(state.vx, ufo.vx);
    ufo.vy = sanitizeFiniteNumber(state.vy, ufo.vy);
    ufo.radius = sanitizePositiveNumber(state.radius, ufo.radius);
    ufo.points = sanitizeInteger(state.points, ufo.points, { min: 0, max: Number.MAX_SAFE_INTEGER });
    ufo.turnTimer = Math.max(0, sanitizeFiniteNumber(state.turnTimer, ufo.turnTimer));
    ufo.fireTimer = Math.max(0, sanitizeFiniteNumber(state.fireTimer, ufo.fireTimer));
    ufo.alive = sanitizeBoolean(state.alive, ufo.alive);
    return ufo;
  }

  getState() {
    return {
      wave: this.wave,
      shipActive: this.shipActive,
      respawnDelay: this.respawnDelay,
      respawnLocked: this.respawnLocked,
      fireHeld: this.fireHeld,
      waveClearPending: this.waveClearPending,
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
    if (!state || typeof state !== 'object') {
      this.startGame();
      return;
    }

    this.wave = sanitizeInteger(state.wave, 1, { min: 1, max: 9999 });
    this.shipActive = sanitizeBoolean(state.shipActive, true);
    this.respawnDelay = Math.max(0, sanitizeFiniteNumber(state.respawnDelay, 0));
    this.respawnLocked = sanitizeBoolean(state.respawnLocked, false);
    this.fireHeld = sanitizeBoolean(state.fireHeld, false);
    this.waveClearPending = sanitizeBoolean(state.waveClearPending, false);
    this.fireCooldown = Math.max(0, sanitizeFiniteNumber(state.fireCooldown, 0));
    this.status = sanitizeStatus(state.status, '');
    this.ufoSpawnTimer = Math.max(0, sanitizeFiniteNumber(state.ufoSpawnTimer, this.getUfoSpawnDelay()));

    this.ship.reset();
    this.applyShipState(state.ship);

    this.asteroids = sanitizeArray(state.asteroids).map((asteroid) => this.createAsteroidFromState(asteroid));
    this.bullets = sanitizeArray(state.bullets).map((bullet) => this.createBulletFromState(bullet));
    this.ufoBullets = sanitizeArray(state.ufoBullets).map((bullet) => this.createBulletFromState(bullet));
    this.ufo = this.createUfoFromState(state.ufo);
    if (!this.ufo || this.asteroids.length > 0) {
      this.waveClearPending = false;
    }
  }

  getWaveAsteroidCount() {
    return WAVE_ASTEROID_COUNTS[this.wave - 1] || 10;
  }

  getWaveSpeedMultiplier() {
    return 1 + (this.wave - 1) * 0.16;
  }

  getUfoSpawnDelay() {
    return randomRange(7, 12, this.rng);
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
    const safeCount = sanitizeInteger(count, this.getWaveAsteroidCount(), { min: 1, max: 50 });

    return Array.from({ length: safeCount }, () => {
      const asteroid = this.pickWaveAsteroid(3);
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
    this.waveClearPending = false;
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

  advanceWave() {
    this.wave += 1;
    this.status = `Wave ${this.wave - 1} cleared. Wave ${this.wave} inbound.`;
    this.asteroids = this.createWave();
    this.ufo = null;
    this.ufoBullets = [];
    this.ufoSpawnTimer = this.getUfoSpawnDelay();
    this.waveClearPending = false;
    return true;
  }

  handleAsteroidFieldCleared() {
    if (this.asteroids.length > 0) {
      return false;
    }

    if (this.ufo && this.ufo.alive) {
      this.waveClearPending = true;
      this.ufoBullets = [];
      this.status = 'Asteroids cleared. Waiting for saucer to clear.';
      return false;
    }

    return this.advanceWave();
  }

  splitAsteroid(index) {
    const asteroid = this.asteroids[index];
    this.asteroids.splice(index, 1);
    const points = asteroid.size === 3 ? 20 : asteroid.size === 2 ? 50 : 100;

    if (asteroid.size > 1) {
      this.asteroids.push(this.createAsteroidEntity(asteroid.x, asteroid.y, asteroid.size - 1));
      this.asteroids.push(this.createAsteroidEntity(asteroid.x, asteroid.y, asteroid.size - 1));
    }

    const waveCleared = this.handleAsteroidFieldCleared();
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

  updateStep(dtSeconds, input) {
    const events = createWorldEvents();

    const safeDtSeconds = Number.isFinite(dtSeconds)
      ? Math.max(0, dtSeconds)
      : 0;

    if (this.shipActive) {
      this.ship.update(safeDtSeconds, this.bounds, input);
    } else {
      if (!this.respawnLocked) {
        this.respawnDelay = Math.max(0, this.respawnDelay - safeDtSeconds);
      }
      events.shipRespawned = this.tryRespawn();
    }

    const firePressed = !!input?.isDown('Space');
    this.fireCooldown = Math.max(0, this.fireCooldown - safeDtSeconds);
    if (this.shipActive && firePressed && !this.fireHeld && this.fireCooldown <= 0) {
      if (this.fire()) {
        events.sfx.push('fire');
      }
    }
    this.fireHeld = firePressed;

    this.bullets.forEach((bullet) => bullet.update(safeDtSeconds, this.bounds));
    this.bullets = this.bullets.filter((bullet) => bullet.isAlive());

    this.asteroids.forEach((asteroid) => asteroid.update(safeDtSeconds, this.bounds));

    if (this.shipActive) {
      this.ufoSpawnTimer -= safeDtSeconds;
    }
    if (this.shipActive && this.asteroids.length > 0 && !this.waveClearPending && !this.ufo && this.ufoSpawnTimer <= 0) {
      const type = this.wave >= 3 ? 'small' : 'large';
      this.ufo = this.createUfoEntity(type, this.wave);
      this.status = type === 'small' ? 'Small saucer inbound.' : 'Large saucer inbound.';
    }

    if (this.ufo) {
      if (this.waveClearPending) {
        this.ufo.vy = 0;
        this.ufo.turnTimer = Number.POSITIVE_INFINITY;
      }
      this.ufo.update(safeDtSeconds);
      if (this.ufo.alive && this.shipActive && !this.waveClearPending && this.ufo.canFire()) {
        const target = this.getUfoTarget();
        if (target) {
          this.ufoBullets.push(this.ufo.fireAt(target));
        }
      }
      if (!this.ufo.alive) {
        this.ufo = null;
        this.ufoSpawnTimer = this.getUfoSpawnDelay();
        events.waveCleared = events.waveCleared || this.handleAsteroidFieldCleared();
      }
    }

    this.ufoBullets.forEach((bullet) => bullet.update(safeDtSeconds, this.bounds));
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
          const waveClearedNow = this.handleAsteroidFieldCleared();
          events.waveCleared = events.waveCleared || waveClearedNow;
          events.sfx.push(result.points === 20 ? 'bangLarge' : result.points === 50 ? 'bangMedium' : 'bangSmall');
          events.sfx.push('bangMedium');
          if (!waveClearedNow) {
            this.status = 'Saucer and asteroid destroyed on impact.';
          }
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
        const waveClearedNow = this.handleAsteroidFieldCleared();
        events.waveCleared = events.waveCleared || waveClearedNow;
        if (!waveClearedNow) {
          this.status = 'Saucer destroyed.';
        }
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
          const waveClearedNow = this.handleAsteroidFieldCleared();
          events.waveCleared = events.waveCleared || waveClearedNow;
          events.sfx.push('bangMedium');
          if (!waveClearedNow) {
            this.status = 'Saucer destroyed by crossfire.';
          }
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
      const waveClearedNow = this.handleAsteroidFieldCleared();
      events.waveCleared = events.waveCleared || waveClearedNow;
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

  update(dtSeconds, input) {
    const safeDtSeconds = Number.isFinite(dtSeconds)
      ? Math.max(0, dtSeconds)
      : 0;

    if (safeDtSeconds <= MAX_UPDATE_STEP_SECONDS) {
      return this.updateStep(safeDtSeconds, input);
    }

    const stepCount = Math.max(1, Math.ceil(safeDtSeconds / MAX_UPDATE_STEP_SECONDS));
    const stepSeconds = safeDtSeconds / stepCount;
    const events = createWorldEvents();

    for (let stepIndex = 0; stepIndex < stepCount; stepIndex += 1) {
      mergeWorldEvents(events, this.updateStep(stepSeconds, input));
    }

    return events;
  }
}
