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
    fireHeld: false,
    startPressed: false,
    debugPressed: false,
    select1Pressed: false,
    select2Pressed: false,
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

function countPixels(frame) {
  return frame.reduce(
    (sum, row) => sum + Array.from(row).filter((cell) => cell === '1').length,
    0,
  );
}

function spawnAll(world) {
  world.introBlinkTimer = 0;
  while (!world.formationReady && world.spawnQueue.length > 0) {
    world.update(0.01, createControls());
  }
}

function testFormationReversesAndDescendsAtEdge() {
  const world = createWorld();
  world.startGame();
  world.introBlinkTimer = 0;
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
  world.introBlinkTimer = 0;
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
  world.introBlinkTimer = 0;
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
  world.introBlinkTimer = 0;
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
  waveWorld.introBlinkTimer = 0;
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
  gameOverWorld.introBlinkTimer = 0;
  gameOverWorld.entryDelay = 0;
  spawnAll(gameOverWorld);
  gameOverWorld.lives = 1;
  gameOverWorld.player.invulnerabilityTimer = 0;
  gameOverWorld.alienShots = [{
    x: gameOverWorld.player.x,
    y: gameOverWorld.player.y - 12,
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
  world.introBlinkTimer = 0;
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
  world.introBlinkTimer = 0;
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
  world.introBlinkTimer = 0;
  world.entryDelay = 0;

  const spawnDelay = 0.016;

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
    world.introBlinkTimer = 0;
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
  world.introBlinkTimer = 0;
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

function testShieldsSpawnAndSitAbovePlayer() {
  const world = createWorld();
  world.startGame();
  world.introBlinkTimer = 0;
  world.entryDelay = 0;
  assert.equal(world.shields.length, 4);
  world.shields.forEach((shield, index) => {
    assert.equal(shield.frame.length > 0, true);
    assert.equal(shield.y < world.player.y, true);
    if (index > 0) {
      assert.equal(shield.x > world.shields[index - 1].x, true);
    }
  });
}

function testShieldTakesBombDamageAndRemovesShot() {
  const world = createWorld();
  world.startGame();
  world.introBlinkTimer = 0;
  world.entryDelay = 0;
  const shield = world.shields[0];
  const beforePixels = countPixels(shield.frame);
  world.alienShots = [{
    x: shield.x + (shield.width / 2),
    y: shield.y + 1,
    width: 9,
    height: 24,
    vy: 0,
    owner: 'alien',
    type: 'bomb1',
    animationFrame: 0,
    animationElapsed: 0,
    active: true,
  }];
  world.update(0, createControls());
  const afterPixels = countPixels(shield.frame);
  assert.equal(world.alienShots.length, 0);
  assert.equal(afterPixels < beforePixels, true);
}

function testGroundDestructsOnBombHit() {
  const world = createWorld();
  world.startGame();
  world.introBlinkTimer = 0;
  world.entryDelay = 0;
  const ground = world.ground;
  const beforePixels = countPixels(ground.frame);
  world.alienShots = [{
    x: ground.x + 3,
    y: ground.y - 23,
    width: 9,
    height: 24,
    vy: 0,
    owner: 'alien',
    type: 'bomb2',
    animationFrame: 0,
    animationElapsed: 0,
    active: true,
  }];
  world.update(0, createControls());
  const afterPixels = countPixels(ground.frame);
  assert.equal(world.alienShots.length, 0);
  assert.equal(afterPixels < beforePixels, true);
}

function testBombCadenceIncreased() {
  const world = createWorld();
  world.startGame();
  world.introBlinkTimer = 0;
  world.entryDelay = 0;
  spawnAll(world);
  world.marchTimer = 0;
  const before = world.alienShots.length;
  world.update(0.01, createControls());
  assert.equal(world.formationReady, true);
  assert.equal(world.alienShots.length > before, true);
}

function testBombStrongerShieldDamage() {
  const world = createWorld();
  world.startGame();
  world.introBlinkTimer = 0;
  world.entryDelay = 0;
  const shield = world.shields[0];
  const beforePixels = countPixels(shield.frame);
  world.alienShots = [{
    x: shield.x + (shield.width / 2),
    y: shield.y + 2,
    width: 9,
    height: 24,
    vy: 0,
    owner: 'alien',
    type: 'bomb1',
    animationFrame: 0,
    animationElapsed: 0,
    active: true,
  }];
  world.update(0, createControls());
  const afterPixels = countPixels(shield.frame);
  assert.equal(world.alienShots.length, 0);
  assert.equal(afterPixels <= beforePixels - 20, true);
}

function testAlienErodesShieldOnOverlap() {
  const world = createWorld();
  world.startGame();
  world.introBlinkTimer = 0;
  world.entryDelay = 0;
  spawnAll(world);
  const shield = world.shields[0];
  const alien = world.getAliveAliens()[0];
  alien.x = shield.x;
  alien.y = shield.y;
  const beforePixels = countPixels(shield.frame);
  world.erodeShieldsUnderAliens();
  const afterPixels = countPixels(shield.frame);
  assert.equal(afterPixels < beforePixels, true);
}

function testMenuSelectionStartsTwoPlayerGame() {
  const world = createWorld();
  assert.equal(world.status, 'menu');
  world.update(0, createControls({ select2Pressed: true }));
  assert.equal(world.selectedPlayerCount, 2);
  world.update(0, createControls({ startPressed: true }));
  assert.equal(world.playerCount, 2);
  assert.equal(world.players.length, 2);
  assert.equal(world.currentPlayerIndex, 0);
  assert.equal(world.status, 'playing');
}

function testExtraLifeAwardedAt1500() {
  const world = createWorld();
  world.startGame();
  world.introBlinkTimer = 0;
  world.score = 1490;
  world.lives = 2;
  world.extraLifeAwarded = false;
  world.syncActivePlayerMeta();
  const event = {
    sfx: [],
    playerFired: false,
    alienFired: false,
    alienHit: false,
    playerHit: false,
    waveStarted: false,
    waveCleared: false,
    gameOver: false,
    scoreDelta: 0,
    ufoSpawned: false,
    ufoHit: false,
    extraLifeAwarded: false,
    playerSwitched: false,
  };
  world.awardScore(20, event);
  assert.equal(world.score, 1510);
  assert.equal(world.lives, 3);
  assert.equal(world.extraLifeAwarded, true);
  assert.equal(event.extraLifeAwarded, true);
}

function testTwoPlayerDeathSwitchesTurnAndPreservesScore() {
  const world = createWorld();
  world.startGame(2);
  world.introBlinkTimer = 0;
  world.entryDelay = 0;
  spawnAll(world);
  world.score = 120;
  world.players[0].score = 120;
  world.players[1].score = 40;
  world.lives = 2;
  world.players[0].lives = 2;
  world.players[1].lives = 3;
  world.player.invulnerabilityTimer = 0;
  world.alienShots = [{
    x: world.player.x,
    y: world.player.y - 12,
    width: 6,
    height: 18,
    vy: 0,
    owner: 'alien',
    type: 'bomb1',
    animationFrame: 0,
    animationElapsed: 0,
    active: true,
  }];
  const lossEvent = world.update(0, createControls());
  assert.equal(lossEvent.playerHit, true);
  assert.equal(world.pendingTurnSwitch?.targetIndex, 1);
  world.update(5.1, createControls());
  assert.equal(world.currentPlayerIndex, 1);
  assert.equal(world.score, 40);
  assert.equal(world.players[0].score, 120);
  assert.equal(world.players[0].lives, 1);
}

function testGameOverStartReturnsToPlayerSelect() {
  const world = createWorld();
  world.setSelectedPlayerCount(2);
  world.startGame(2);
  world.introBlinkTimer = 0;
  world.status = 'game-over';
  world.gameOver = true;
  const event = world.update(0, createControls({ startPressed: true }));
  assert.equal(event.waveStarted, true);
  assert.equal(world.status, 'menu');
  assert.equal(world.selectedPlayerCount, 2);
}

function testResetGameClearsActiveBoardButKeepsMenuSelection() {
  const world = createWorld();
  world.setSelectedPlayerCount(2);
  world.startGame(2);
  world.introBlinkTimer = 0;
  world.entryDelay = 0;
  spawnAll(world);
  assert.equal(world.getAliveAliens().length > 0, true);
  world.resetGame();
  assert.equal(world.status, 'menu');
  assert.equal(world.selectedPlayerCount, 2);
  assert.equal(world.getAliveAliens().length, 0);
  assert.equal(world.shields.length, 0);
  assert.equal(world.ground, null);
}

function testPlayerSwapBlinksTenTimesOverFiveSeconds() {
  const world = createWorld();
  world.startGame(2);
  world.introBlinkTimer = 0;
  world.queuePlayerSwitch(1);
  const visibilities = [];
  for (let index = 0; index < 10; index += 1) {
    visibilities.push(world.getPlayerSwapBlinkVisible());
    world.update(0.5, createControls());
  }
  visibilities.forEach((visible, index) => {
    assert.equal(visible, index % 2 === 0);
  });
  assert.equal(world.currentPlayerIndex, 1);
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
  testShieldsSpawnAndSitAbovePlayer();
  testShieldTakesBombDamageAndRemovesShot();
  testGroundDestructsOnBombHit();
  testBombCadenceIncreased();
  testBombStrongerShieldDamage();
  testAlienErodesShieldOnOverlap();
  testMenuSelectionStartsTwoPlayerGame();
  testExtraLifeAwardedAt1500();
  testTwoPlayerDeathSwitchesTurnAndPreservesScore();
  testGameOverStartReturnsToPlayerSelect();
  testResetGameClearsActiveBoardButKeepsMenuSelection();
  testPlayerSwapBlinksTenTimesOverFiveSeconds();
}
