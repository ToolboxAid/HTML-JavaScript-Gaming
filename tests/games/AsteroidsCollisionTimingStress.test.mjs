/*
 Toolbox Aid
 David Quesenberry
 03/23/2026
 AsteroidsCollisionTimingStress.test.mjs
*/
import assert from 'node:assert/strict';
import AsteroidsWorld from '../../games/Asteroids/game/AsteroidsWorld.js';
import {
  createAsteroidsTestGeometryProfiles,
  loadAsteroidsObjectGeometry
} from './asteroidsManifestObjectGeometry.mjs';

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
  const asteroidGeometryProfiles = createAsteroidsTestGeometryProfiles();
  const worldOptions = {
    asteroidGeometryProfiles,
    objectGeometry: loadAsteroidsObjectGeometry(),
  };
  Object.entries(asteroidGeometryProfiles).forEach(([size, profile]) => {
    assert.equal(profile.points.length >= 4, true, `Asteroid size ${size} should load polygon collision points from object-vector-studio-v2 tool geometry.`);
  });

  const collisionWorld = new AsteroidsWorld({ width: 960, height: 720 }, { rng: () => 0.5, ...worldOptions });
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

  const bulletConcaveGapWorld = new AsteroidsWorld({ width: 960, height: 720 }, { rng: () => 0.5, ...worldOptions });
  bulletConcaveGapWorld.ufoSpawnTimer = Number.POSITIVE_INFINITY;
  bulletConcaveGapWorld.asteroids = [createStationaryAsteroid(bulletConcaveGapWorld, { x: 480, y: 360, size: 3 })];
  bulletConcaveGapWorld.bullets = [bulletConcaveGapWorld.createBulletFromState(createBulletState({
    x: 461,
    y: 316,
    vx: 0,
    vy: 0,
  }))];
  const bulletConcaveGapEvents = bulletConcaveGapWorld.update(0, createInput());
  assert.deepEqual(bulletConcaveGapEvents.scoreEvents, []);
  assert.equal(bulletConcaveGapWorld.bullets.length, 1);
  assert.equal(bulletConcaveGapWorld.asteroids.length, 1);

  const shipImpactWorld = new AsteroidsWorld({ width: 960, height: 720 }, { rng: () => 0.5, ...worldOptions });
  shipImpactWorld.ufoSpawnTimer = Number.POSITIVE_INFINITY;
  shipImpactWorld.ship.invulnerable = 0;
  shipImpactWorld.asteroids = [createStationaryAsteroid(shipImpactWorld, {
    x: shipImpactWorld.ship.x,
    y: shipImpactWorld.ship.y,
    size: 3,
  })];
  const shipImpactEvents = shipImpactWorld.update(0, createInput());
  assert.equal(shipImpactEvents.shipDestroyed, true);
  assert.equal(shipImpactWorld.shipActive, false);

  const shipConcaveEdgeWorld = new AsteroidsWorld({ width: 960, height: 720 }, { rng: () => 0.5, ...worldOptions });
  shipConcaveEdgeWorld.ufoSpawnTimer = Number.POSITIVE_INFINITY;
  shipConcaveEdgeWorld.ship.invulnerable = 0;
  shipConcaveEdgeWorld.ship.x = 448;
  shipConcaveEdgeWorld.ship.y = 386;
  shipConcaveEdgeWorld.ship.vx = 0;
  shipConcaveEdgeWorld.ship.vy = 0;
  shipConcaveEdgeWorld.ship.angle = -Math.PI / 2;
  shipConcaveEdgeWorld.asteroids = [createStationaryAsteroid(shipConcaveEdgeWorld, {
    x: 480,
    y: 360,
    size: 3,
  })];
  const shipConcaveEdgeEvents = shipConcaveEdgeWorld.update(0, createInput());
  assert.equal(shipConcaveEdgeEvents.shipDestroyed, true);
  assert.equal(shipConcaveEdgeWorld.shipActive, false);

  const ufoImpactWorld = new AsteroidsWorld({ width: 960, height: 720 }, { rng: () => 0.5, ...worldOptions });
  ufoImpactWorld.ufoSpawnTimer = Number.POSITIVE_INFINITY;
  ufoImpactWorld.asteroids = [createStationaryAsteroid(ufoImpactWorld, { x: 480, y: 360, size: 3 })];
  ufoImpactWorld.ufo = ufoImpactWorld.createUfoEntity('large', 1);
  ufoImpactWorld.ufo.x = 480;
  ufoImpactWorld.ufo.y = 360;
  ufoImpactWorld.ufo.vx = 0;
  ufoImpactWorld.ufo.vy = 0;
  ufoImpactWorld.ufo.turnTimer = Number.POSITIVE_INFINITY;
  ufoImpactWorld.ufo.fireTimer = Number.POSITIVE_INFINITY;
  const ufoImpactEvents = ufoImpactWorld.update(0, createInput());
  assert.equal(ufoImpactWorld.ufo, null);
  assert.equal(ufoImpactEvents.explosions.some((explosion) => explosion.source === 'ufo'), true);

  const ufoConcaveGapWorld = new AsteroidsWorld({ width: 960, height: 720 }, { rng: () => 0.5, ...worldOptions });
  ufoConcaveGapWorld.ufoSpawnTimer = Number.POSITIVE_INFINITY;
  ufoConcaveGapWorld.asteroids = [createStationaryAsteroid(ufoConcaveGapWorld, { x: 480, y: 360, size: 3 })];
  ufoConcaveGapWorld.ufo = ufoConcaveGapWorld.createUfoEntity('large', 1);
  ufoConcaveGapWorld.ufo.x = 471;
  ufoConcaveGapWorld.ufo.y = 304;
  ufoConcaveGapWorld.ufo.vx = 0;
  ufoConcaveGapWorld.ufo.vy = 0;
  ufoConcaveGapWorld.ufo.turnTimer = Number.POSITIVE_INFINITY;
  ufoConcaveGapWorld.ufo.fireTimer = Number.POSITIVE_INFINITY;
  const ufoConcaveGapEvents = ufoConcaveGapWorld.update(0, createInput());
  assert.notEqual(ufoConcaveGapWorld.ufo, null);
  assert.equal(ufoConcaveGapWorld.asteroids.length, 1);
  assert.equal(ufoConcaveGapEvents.explosions.some((explosion) => explosion.source === 'ufo'), false);

  const ufoBulletImpactWorld = new AsteroidsWorld({ width: 960, height: 720 }, { rng: () => 0.5, ...worldOptions });
  ufoBulletImpactWorld.ufoSpawnTimer = Number.POSITIVE_INFINITY;
  ufoBulletImpactWorld.asteroids = [createStationaryAsteroid(ufoBulletImpactWorld, { x: 480, y: 360, size: 3 })];
  ufoBulletImpactWorld.ufo = ufoBulletImpactWorld.createUfoEntity('large', 1);
  ufoBulletImpactWorld.ufo.x = 80;
  ufoBulletImpactWorld.ufo.y = 80;
  ufoBulletImpactWorld.ufo.vx = 0;
  ufoBulletImpactWorld.ufo.vy = 0;
  ufoBulletImpactWorld.ufo.turnTimer = Number.POSITIVE_INFINITY;
  ufoBulletImpactWorld.ufo.fireTimer = Number.POSITIVE_INFINITY;
  ufoBulletImpactWorld.ufoBullets = [ufoBulletImpactWorld.createBulletFromState(createBulletState({
    x: 480,
    y: 360,
    vx: 0,
    vy: 0,
  }))];
  const ufoBulletImpactEvents = ufoBulletImpactWorld.update(0, createInput());
  assert.equal(ufoBulletImpactWorld.ufoBullets.length, 0);
  assert.equal(ufoBulletImpactWorld.asteroids.length, 2);
  assert.equal(ufoBulletImpactEvents.explosions.length > 0, true);

  const bulletCrossfireWorld = new AsteroidsWorld({ width: 960, height: 720 }, { rng: () => 0.5, ...worldOptions });
  bulletCrossfireWorld.ufoSpawnTimer = Number.POSITIVE_INFINITY;
  bulletCrossfireWorld.asteroids = [];
  bulletCrossfireWorld.ufo = null;
  bulletCrossfireWorld.bullets = [bulletCrossfireWorld.createBulletFromState(createBulletState({
    x: 480,
    y: 360,
    vx: 0,
    vy: 0,
  }))];
  bulletCrossfireWorld.ufoBullets = [bulletCrossfireWorld.createBulletFromState(createBulletState({
    x: 480,
    y: 360,
    vx: 0,
    vy: 0,
  }))];
  const bulletCrossfireEvents = bulletCrossfireWorld.update(0, createInput());
  assert.equal(bulletCrossfireWorld.bullets.length, 0);
  assert.equal(bulletCrossfireWorld.ufoBullets.length, 0);
  assert.equal(bulletCrossfireEvents.explosions.some((explosion) => explosion.source === 'bullet-crossfire'), true);

  const shipUfoCrashWorld = new AsteroidsWorld({ width: 960, height: 720 }, { rng: () => 0.5, ...worldOptions });
  shipUfoCrashWorld.ufoSpawnTimer = Number.POSITIVE_INFINITY;
  shipUfoCrashWorld.asteroids = [];
  shipUfoCrashWorld.ship.invulnerable = 0;
  shipUfoCrashWorld.ufo = shipUfoCrashWorld.createUfoEntity('large', 1);
  shipUfoCrashWorld.ufo.x = shipUfoCrashWorld.ship.x;
  shipUfoCrashWorld.ufo.y = shipUfoCrashWorld.ship.y;
  shipUfoCrashWorld.ufo.vx = 0;
  shipUfoCrashWorld.ufo.vy = 0;
  shipUfoCrashWorld.ufo.turnTimer = Number.POSITIVE_INFINITY;
  shipUfoCrashWorld.ufo.fireTimer = Number.POSITIVE_INFINITY;
  const shipUfoCrashEvents = shipUfoCrashWorld.update(0, createInput());
  assert.equal(shipUfoCrashEvents.shipDestroyed, true);
  assert.equal(shipUfoCrashWorld.ufo, null);

  const waveWorld = new AsteroidsWorld({ width: 960, height: 720 }, { rng: () => 0.25, ...worldOptions });
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

  const respawnLargeWorld = new AsteroidsWorld({ width: 960, height: 720 }, { rng: () => 0.35, ...worldOptions });
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

  const respawnSteppedWorld = new AsteroidsWorld({ width: 960, height: 720 }, { rng: () => 0.35, ...worldOptions });
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

  const timingLargeWorld = new AsteroidsWorld({ width: 960, height: 720 }, { rng: () => 0.45, ...worldOptions });
  timingLargeWorld.asteroids = [];
  timingLargeWorld.ufo = null;
  timingLargeWorld.ufoBullets = [];
  timingLargeWorld.ufoSpawnTimer = Number.POSITIVE_INFINITY;
  timingLargeWorld.ship.invulnerable = 0;
  timingLargeWorld.update(0.5, createInput({ ArrowUp: true }));

  const timingSteppedWorld = new AsteroidsWorld({ width: 960, height: 720 }, { rng: () => 0.45, ...worldOptions });
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
