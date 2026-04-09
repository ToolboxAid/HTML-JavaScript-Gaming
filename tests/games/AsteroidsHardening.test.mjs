/*
Toolbox Aid
David Quesenberry
03/23/2026
AsteroidsHardening.test.mjs
*/
import assert from 'node:assert/strict';
import { wrap } from '/src/engine/utils/math.js';
import AsteroidsGameScene from '../../games/Asteroids/game/AsteroidsGameScene.js';
import AsteroidsSession from '../../games/Asteroids/game/AsteroidsSession.js';
import AsteroidsWorld from '../../games/Asteroids/game/AsteroidsWorld.js';

function createInput(keys = {}) {
  return {
    isDown(code) {
      return !!keys[code];
    },
  };
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

export function run() {
  assert.equal(wrap(5000, 0, 960), 200);
  assert.equal(wrap(-5000, 0, 960), 760);

  const world = new AsteroidsWorld({ width: 960, height: 720 }, { rng: () => 0.25 });
  world.loadState({
    wave: Number.NaN,
    shipActive: 'yes',
    respawnDelay: -3,
    respawnLocked: 'no',
    fireHeld: 123,
    fireCooldown: -10,
    status: 42,
    ship: { x: Number.POSITIVE_INFINITY, y: Number.NaN },
    asteroids: { invalid: true },
    bullets: null,
    ufoBullets: 'bad',
    ufo: { type: 'bad', x: Number.NaN },
  });
  assert.equal(world.wave, 1);
  assert.equal(world.shipActive, true);
  assert.equal(world.respawnLocked, false);
  assert.equal(world.fireHeld, false);
  assert.equal(world.fireCooldown, 0);
  assert.equal(world.status, '');
  assert.equal(Array.isArray(world.asteroids), true);
  assert.equal(Array.isArray(world.bullets), true);
  assert.equal(Array.isArray(world.ufoBullets), true);
  assert.equal(Number.isFinite(world.ship.x), true);
  assert.equal(Number.isFinite(world.ship.y), true);

  const roundTripWorld = new AsteroidsWorld({ width: 960, height: 720 }, { rng: () => 0.33 });
  const snapshot = roundTripWorld.getState();
  roundTripWorld.loadState(snapshot);
  assert.deepEqual(roundTripWorld.getState(), snapshot);

  const respawnWorld = new AsteroidsWorld({ width: 960, height: 720 }, { rng: () => 0.4 });
  respawnWorld.shipActive = false;
  respawnWorld.respawnDelay = 0;
  respawnWorld.respawnLocked = false;
  respawnWorld.ufo = null;
  respawnWorld.ufoBullets = [];
  respawnWorld.asteroids = [{ x: respawnWorld.ship.spawnX, y: respawnWorld.ship.spawnY, radius: 30 }];
  assert.equal(respawnWorld.tryRespawn(), false);
  respawnWorld.asteroids = [];
  assert.equal(respawnWorld.tryRespawn(), true);

  const fairnessWorld = new AsteroidsWorld({ width: 960, height: 720 }, { rng: () => 0 });
  const wave = fairnessWorld.createWave(6);
  const everySpawnSafe = wave.every((asteroid) => !fairnessWorld.isInsideSafeRect(
    asteroid.x,
    asteroid.y,
    asteroid.radius + 24,
  ));
  assert.equal(everySpawnSafe, true);

  const waveGateWorld = new AsteroidsWorld({ width: 960, height: 720 }, { rng: () => 0.6 });
  let canFireCalled = false;
  let pauseSnapshot = null;
  waveGateWorld.wave = 2;
  waveGateWorld.asteroids = [];
  waveGateWorld.ufo = {
    alive: true,
    vy: 12,
    turnTimer: 0.3,
    type: 'large',
    x: 120,
    y: 160,
    points: 200,
    radius: 20,
    update() {
      pauseSnapshot = { vy: this.vy, turnTimer: this.turnTimer };
      this.alive = false;
    },
    canFire() {
      canFireCalled = true;
      return true;
    },
    fireAt() {
      throw new Error('UFO fired during wave-clear pending state.');
    },
    getCollisionPolygon() {
      return [];
    },
    getBodyLines() {
      return [];
    },
  };
  waveGateWorld.ufoBullets = [{
    update() {},
    isAlive() {
      return true;
    },
    getCollisionPolygon() {
      return [];
    },
  }];
  assert.equal(waveGateWorld.handleAsteroidFieldCleared(), false);
  assert.equal(waveGateWorld.waveClearPending, true);
  assert.equal(waveGateWorld.ufoBullets.length, 0);
  const waveGateEvents = waveGateWorld.update(0.016, createInput());
  assert.equal(canFireCalled, false);
  assert.deepEqual(pauseSnapshot, { vy: 0, turnTimer: Number.POSITIVE_INFINITY });
  assert.equal(waveGateEvents.waveCleared, true);
  assert.equal(waveGateWorld.wave, 3);
  assert.equal(waveGateWorld.asteroids.length > 0, true);
  assert.equal(waveGateWorld.ufo, null);

  const sessionWorld = new AsteroidsWorld({ width: 960, height: 720 }, { rng: () => 0.5 });
  const session = new AsteroidsSession(sessionWorld, {
    load: () => 0,
    save: (score) => score,
  });
  session.start(0);
  assert.equal(session.players.length, 1);

  session.start(2);
  session.activePlayer.lives = 1;
  session.handleShipDestroyed();
  sessionWorld.ufo = { alive: true };
  sessionWorld.update = () => createWorldEvents();
  session.update(12.5, createInput());
  assert.equal(session.activePlayerIndex, 1);
  assert.equal(session.pendingSwapIndex, null);

  const previousLocalStorage = globalThis.localStorage;
  globalThis.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
  };
  try {
    const scene = new AsteroidsGameScene();
    scene.session.mode = 'playing';
    scene.isPaused = true;
    const drawRectCalls = [];
    const drawTextCalls = [];
    const renderer = {
      drawRect(...args) {
        drawRectCalls.push(args);
      },
      drawText(...args) {
        drawTextCalls.push(args);
      },
      drawPolygon() {},
      drawLine() {},
      drawCircle() {},
    };
    scene.render(renderer);
    assert.equal(drawRectCalls.some(([, , , , color]) => color === 'rgba(2, 6, 23, 0.58)'), true);
    assert.equal(drawTextCalls.some(([text]) => text === 'PAUSED'), true);
  } finally {
    if (previousLocalStorage === undefined) {
      delete globalThis.localStorage;
    } else {
      globalThis.localStorage = previousLocalStorage;
    }
  }
}
