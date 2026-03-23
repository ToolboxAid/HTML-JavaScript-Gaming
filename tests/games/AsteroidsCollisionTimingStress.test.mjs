/*
 Toolbox Aid
 David Quesenberry
 03/23/2026
 AsteroidsCollisionTimingStress.test.mjs
*/
import assert from 'node:assert/strict';
import AsteroidsWorld from '../../games/Asteroids/game/AsteroidsWorld.js';

function createInput(keys = {}) {
  return {
    isDown(code) {
      return !!keys[code];
    },
  };
}

function createStationaryAsteroid(world, { x, y, size }) {
  const asteroid = world.createAsteroidEntity(x, y, size);
  asteroid.vx = 0;
  asteroid.vy = 0;
  asteroid.angle = 0;
  asteroid.spin = 0;
  return asteroid;
}

function createBulletState({ x, y, vx, vy, life = 2 }) {
  return { x, y, vx, vy, life };
}

function accumulateEvents(world, totalSeconds, stepSeconds, input = createInput()) {
  const accumulated = {
    explosions: [],
    scoreEvents: [],
    shipDestroyed: false,
    shipDestroyedState: null,
    shipRespawned: false,
    waveCleared: false,
    sfx: [],
  };
  const steps = Math.round(totalSeconds / stepSeconds);

  for (let index = 0; index < steps; index += 1) {
    const events = world.update(stepSeconds, input);
    accumulated.explosions.push(...events.explosions);
    accumulated.scoreEvents.push(...events.scoreEvents);
    accumulated.shipDestroyed = accumulated.shipDestroyed || events.shipDestroyed;
    accumulated.shipDestroyedState = accumulated.shipDestroyedState || events.shipDestroyedState;
    accumulated.shipRespawned = accumulated.shipRespawned || events.shipRespawned;
    accumulated.waveCleared = accumulated.waveCleared || events.waveCleared;
    accumulated.sfx.push(...events.sfx);
  }

  return accumulated;
}

function assertClose(actual, expected, message) {
  assert.equal(Math.abs(actual - expected) < 1e-9, true, message);
}

export function run() {
  const collisionWorld = new AsteroidsWorld({ width: 960, height: 720 }, { rng: () => 0.5 });
  collisionWorld.ufoSpawnTimer = Number.POSITIVE_INFINITY;
  collisionWorld.asteroids = [createStationaryAsteroid(collisionWorld, { x: 480, y: 400, size: 3 })];
  collisionWorld.bullets = [collisionWorld.createBulletFromState(createBulletState({
    x: 480,
    y: 620,
    vx: 0,
    vy: -340,
  }))];
  const collisionEvents = collisionWorld.update(1, createInput());
  assert.deepEqual(collisionEvents.scoreEvents, [20]);
  assert.equal(collisionWorld.bullets.length, 0);
  assert.equal(collisionWorld.asteroids.length, 2);

  const waveWorld = new AsteroidsWorld({ width: 960, height: 720 }, { rng: () => 0.25 });
  waveWorld.ufoSpawnTimer = Number.POSITIVE_INFINITY;
  waveWorld.asteroids = [createStationaryAsteroid(waveWorld, { x: 480, y: 400, size: 1 })];
  waveWorld.bullets = [waveWorld.createBulletFromState(createBulletState({
    x: 480,
    y: 620,
    vx: 0,
    vy: -340,
  }))];
  const waveEvents = waveWorld.update(1, createInput());
  assert.equal(waveEvents.waveCleared, true);
  assert.equal(waveWorld.wave, 2);
  assert.equal(waveWorld.asteroids.length > 0, true);

  const respawnLargeWorld = new AsteroidsWorld({ width: 960, height: 720 }, { rng: () => 0.35 });
  respawnLargeWorld.asteroids = [createStationaryAsteroid(respawnLargeWorld, {
    x: respawnLargeWorld.ship.spawnX,
    y: respawnLargeWorld.ship.spawnY,
    size: 3,
  })];
  respawnLargeWorld.asteroids[0].vx = 300;
  respawnLargeWorld.asteroids[0].vy = 0;
  respawnLargeWorld.shipActive = false;
  respawnLargeWorld.respawnDelay = 0.4;
  respawnLargeWorld.respawnLocked = false;
  respawnLargeWorld.ufo = null;
  respawnLargeWorld.ufoBullets = [];
  const respawnLargeEvents = respawnLargeWorld.update(1, createInput());

  const respawnSteppedWorld = new AsteroidsWorld({ width: 960, height: 720 }, { rng: () => 0.35 });
  respawnSteppedWorld.asteroids = [createStationaryAsteroid(respawnSteppedWorld, {
    x: respawnSteppedWorld.ship.spawnX,
    y: respawnSteppedWorld.ship.spawnY,
    size: 3,
  })];
  respawnSteppedWorld.asteroids[0].vx = 300;
  respawnSteppedWorld.asteroids[0].vy = 0;
  respawnSteppedWorld.shipActive = false;
  respawnSteppedWorld.respawnDelay = 0.4;
  respawnSteppedWorld.respawnLocked = false;
  respawnSteppedWorld.ufo = null;
  respawnSteppedWorld.ufoBullets = [];
  const respawnSteppedEvents = accumulateEvents(respawnSteppedWorld, 1, 1 / 60, createInput());

  assert.equal(respawnLargeEvents.shipRespawned, respawnSteppedEvents.shipRespawned);
  assert.equal(respawnLargeWorld.shipActive, respawnSteppedWorld.shipActive);
  assert.equal(respawnLargeWorld.status, respawnSteppedWorld.status);

  const timingLargeWorld = new AsteroidsWorld({ width: 960, height: 720 }, { rng: () => 0.45 });
  timingLargeWorld.asteroids = [];
  timingLargeWorld.ufo = null;
  timingLargeWorld.ufoBullets = [];
  timingLargeWorld.ufoSpawnTimer = Number.POSITIVE_INFINITY;
  timingLargeWorld.ship.invulnerable = 0;
  timingLargeWorld.update(0.5, createInput({ ArrowUp: true }));

  const timingSteppedWorld = new AsteroidsWorld({ width: 960, height: 720 }, { rng: () => 0.45 });
  timingSteppedWorld.asteroids = [];
  timingSteppedWorld.ufo = null;
  timingSteppedWorld.ufoBullets = [];
  timingSteppedWorld.ufoSpawnTimer = Number.POSITIVE_INFINITY;
  timingSteppedWorld.ship.invulnerable = 0;
  accumulateEvents(timingSteppedWorld, 0.5, 1 / 60, createInput({ ArrowUp: true }));

  assertClose(timingLargeWorld.ship.x, timingSteppedWorld.ship.x, 'Ship x should stay timing-consistent under load.');
  assertClose(timingLargeWorld.ship.y, timingSteppedWorld.ship.y, 'Ship y should stay timing-consistent under load.');
  assertClose(timingLargeWorld.ship.vx, timingSteppedWorld.ship.vx, 'Ship vx should stay timing-consistent under load.');
  assertClose(timingLargeWorld.ship.vy, timingSteppedWorld.ship.vy, 'Ship vy should stay timing-consistent under load.');
}
