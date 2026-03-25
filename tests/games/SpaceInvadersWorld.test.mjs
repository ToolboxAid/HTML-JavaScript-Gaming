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
    debugPressed: false,
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

function spawnAll(world) {
  while (!world.formationReady && world.spawnQueue.length > 0) {
    world.update(0.01, createControls());
  }
}

function testFormationReversesAndDescendsAtEdge() {
  const world = createWorld();
  world.startGame();
  world.entryDelay = 0;
  spawnAll(world);
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
  spawnAll(world);
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
  spawnAll(world);
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

function testBombBehaviorUsesOriginalThreeTypesAndBombDeaths() {
  const world = createWorld();
  world.startGame();
  world.entryDelay = 0;
  spawnAll(world);

  world.fireAlienShot();
  world.fireAlienShot();
  world.fireAlienShot();

  assert.deepEqual(
    world.alienShots.map((shot) => shot.type),
    ['bomb1', 'bomb2', 'bomb3'],
  );

  const bomb = world.alienShots[0];
  world.playerShot = {
    x: bomb.x,
    y: bomb.y,
    width: 3,
    height: 30,
    vy: -520,
    owner: 'player',
    type: 'laser',
    animationFrame: 0,
    animationElapsed: 0,
  };

  world.update(0, createControls());
  assert.equal(world.alienShots.length, 2);
  assert.equal(world.bombDeaths.length, 1);
}

function testWaveAndGameOverStability() {
  const waveWorld = createWorld();
  waveWorld.startGame();
  waveWorld.entryDelay = 0;
  spawnAll(waveWorld);
  waveWorld.aliens.forEach((alien) => {
    alien.alive = false;
  });
  const waveEvent = waveWorld.update(0, createControls());
  assert.equal(waveEvent.waveCleared, true);
  assert.equal(waveWorld.wave, 2);
  waveWorld.update(1.2, createControls());
  spawnAll(waveWorld);
  assert.equal(waveWorld.isWaveTransition, false);
  assert.equal(waveWorld.getAliveAliens().length > 0, true);

  const gameOverWorld = createWorld();
  gameOverWorld.startGame();
  gameOverWorld.entryDelay = 0;
  spawnAll(gameOverWorld);
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

function testBoundingBoxToggle() {
  const world = createWorld();
  world.startGame();
  world.entryDelay = 0;
  spawnAll(world);
  assert.equal(world.debugBoxes, false);
  world.update(0, createControls({ debugPressed: true }));
  assert.equal(world.debugBoxes, true);
  world.update(0, createControls({ debugPressed: true }));
  assert.equal(world.debugBoxes, false);
}

function testBomb3SurvivesLaser() {
  const world = createWorld();
  world.startGame();
  world.entryDelay = 0;
  spawnAll(world);
  world.fireAlienShot();
  world.fireAlienShot();
  world.fireAlienShot(); // bomb3
  const bomb = world.alienShots.find((shot) => shot.type === 'bomb3');
  world.playerShot = {
    x: bomb.x,
    y: bomb.y,
    width: 3,
    height: 30,
    vy: -520,
    owner: 'player',
    type: 'laser',
    animationFrame: 0,
    animationElapsed: 0,
  };
  world.update(0, createControls());
  assert.equal(world.alienShots.some((shot) => shot.type === 'bomb3'), true);
  assert.equal(world.playerShot, null);
}

function testSpawnSequencingAndFormationDelay() {
  const world = createWorld();
  world.startGame();
  world.entryDelay = 0;

  const spawnDelay = 0.016*10;

  // Before spawning completes, formation should not be ready and march timer should not tick.
  const initialMarchTimer = world.marchTimer;
  world.update(spawnDelay, createControls());
  assert.equal(world.formationReady, false);
  assert.equal(world.getAliveAliens().length, 1);
  assert.equal(world.marchTimer, initialMarchTimer);

  // First spawn should be bottom row, leftmost column.
  const first = world.getAliveAliens()[0];
  assert.equal(first.row, 4);
  assert.equal(first.column, 0);

  // Spawn second alien and verify ordering (still bottom row, next column).
  world.update(spawnDelay, createControls());
  const bottomAliens = world.getAliveAliens().filter((a) => a.row === 4);
  assert.equal(bottomAliens.length, 2);
  assert.equal(bottomAliens.some((a) => a.column === 1), true);

  // Finish spawning and ensure formation becomes ready.
  spawnAll(world);
  assert.equal(world.formationReady, true);
  assert.equal(world.getAliveAliens().length, 55);
}

function testUfoScoreCycle() {
  const expected = [100, 50, 50];
  expected.forEach((value, index) => {
    const world = createWorld();
    world.startGame();
    world.entryDelay = 0;
    world.spawnQueue = [];
    world.formationReady = true;
    world.playerShotsFired = index + 1;
    world.ufo = { x: 120, y: 80, width: 48, height: 24, speed: 0 };
    world.playerShot = world.createShot({ x: 120, y: 80, vy: -520, owner: 'player' });
    const before = world.score;
    world.update(0, createControls());
    assert.equal(world.score - before, value);
  });
}

function testUfoScorePopupVisibleThenRemoved() {
  const world = createWorld();
  world.startGame();
  world.entryDelay = 0;
  world.spawnQueue = [];
  world.formationReady = true;

  world.ufo = { x: 140, y: 90, width: 48, height: 24, speed: 0 };
  world.playerShotsFired += 1;
  world.playerShot = world.createShot({ x: 140, y: 90, vy: -520, owner: 'player' });

  world.update(0, createControls());
  // Advance past death frames to reveal popup.
  world.update(0.4, createControls());
  assert.equal(world.ufoScorePopups.length > 0, true);
  // Advance beyond popup lifetime to remove.
  world.update(1.2, createControls());
  assert.equal(world.ufoScorePopups.length, 0);
}

export function run() {
  testFormationReversesAndDescendsAtEdge();
  testPlayerShootingDisciplineLimitsShots();
  testAlienShootingLimitAndHitRemoval();
  testBombBehaviorUsesOriginalThreeTypesAndBombDeaths();
  testWaveAndGameOverStability();
  testBoundingBoxToggle();
  testBomb3SurvivesLaser();
  testSpawnSequencingAndFormationDelay();
  testUfoScoreCycle();
  testUfoScorePopupVisibleThenRemoved();
}
