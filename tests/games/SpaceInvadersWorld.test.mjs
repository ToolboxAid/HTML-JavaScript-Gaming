/*
Toolbox Aid
David Quesenberry
03/24/2026
SpaceInvadersWorld.test.mjs
*/
import assert from 'node:assert/strict';
import SpaceInvadersWorld from '../../games/SpaceInvaders/game/SpaceInvadersWorld.js';

function createControls(overrides = {}) {
  return {
    moveAxis: 0,
    firePressed: false,
    startPressed: false,
    ...overrides,
  };
}

function createWorld() {
  const values = [0.15, 0.45, 0.75, 0.25];
  let index = 0;
  return new SpaceInvadersWorld({
    width: 960,
    height: 720,
    rng: () => {
      const value = values[index % values.length];
      index += 1;
      return value;
    },
  });
}

function testFormationReversesAndDescendsAtEdge() {
  const world = createWorld();
  world.startGame();
  const alive = world.getAliveAliens();
  const shift = 896 - Math.max(...alive.map((alien) => alien.x + alien.width)) - world.formationStepX + 1;
  alive.forEach((alien) => {
    alien.x += shift;
  });
  const beforeY = alive[0].y;
  world.marchFormation();
  assert.equal(world.formationDirection, -1);
  assert.equal(alive[0].y, beforeY + 22);
}

function testPlayerShootingDisciplineLimitsShots() {
  const world = createWorld();
  world.startGame();
  world.entryDelay = 0;
  const firstShotEvent = world.update(0, createControls({ firePressed: true }));
  const firstShot = world.playerShot;
  assert.equal(firstShotEvent.playerFired, true);
  assert.notEqual(firstShot, null);

  const secondShotEvent = world.update(0, createControls({ firePressed: true }));
  assert.equal(secondShotEvent.playerFired, false);
  assert.equal(world.playerShot, firstShot);
}

function testAlienShootingLimitAndHitRemoval() {
  const world = createWorld();
  world.startGame();
  world.entryDelay = 0;
  assert.equal(world.fireAlienShot(), true);
  assert.equal(world.fireAlienShot(), true);
  assert.equal(world.fireAlienShot(), true);
  assert.equal(world.fireAlienShot(), false);
  assert.equal(world.alienShots.length, 3);

  const target = world.getAliveAliens()[0];
  world.playerShot = {
    x: target.x,
    y: target.y,
    width: 4,
    height: 16,
    vy: -520,
    owner: 'player',
  };
  const beforeScore = world.score;
  const event = world.update(0, createControls());
  assert.equal(event.alienHit, true);
  assert.equal(target.alive, false);
  assert.equal(world.score, beforeScore + target.points);
  assert.equal(world.playerShot, null);
}

function testWaveAndGameOverStability() {
  const waveWorld = createWorld();
  waveWorld.startGame();
  waveWorld.entryDelay = 0;
  waveWorld.aliens.forEach((alien) => {
    alien.alive = false;
  });
  const waveEvent = waveWorld.update(0, createControls());
  assert.equal(waveEvent.waveCleared, true);
  assert.equal(waveWorld.wave, 2);
  waveWorld.update(1.2, createControls());
  assert.equal(waveWorld.isWaveTransition, false);
  assert.equal(waveWorld.getAliveAliens().length > 0, true);

  const gameOverWorld = createWorld();
  gameOverWorld.startGame();
  gameOverWorld.entryDelay = 0;
  gameOverWorld.lives = 1;
  gameOverWorld.player.invulnerabilityTimer = 0;
  gameOverWorld.alienShots = [{
    x: gameOverWorld.player.x,
    y: gameOverWorld.player.y,
    width: 6,
    height: 18,
    vy: 0,
    owner: 'alien',
  }];
  const lossEvent = gameOverWorld.update(0, createControls());
  assert.equal(lossEvent.playerHit, true);
  assert.equal(lossEvent.gameOver, true);
  assert.equal(gameOverWorld.status, 'game-over');

  const stableEvent = gameOverWorld.update(0.5, createControls());
  assert.equal(stableEvent.gameOver, false);
  assert.equal(gameOverWorld.status, 'game-over');
}

export function run() {
  testFormationReversesAndDescendsAtEdge();
  testPlayerShootingDisciplineLimitsShots();
  testAlienShootingLimitAndHitRemoval();
  testWaveAndGameOverStability();
}
