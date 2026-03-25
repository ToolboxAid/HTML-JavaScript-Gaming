/*
Toolbox Aid
David Quesenberry
03/25/2026
SpaceDuelCore.test.mjs
*/
import assert from 'node:assert/strict';
import PhysicsController from '../../games/SpaceDuel/game/PhysicsController.js';
import PlayerController from '../../games/SpaceDuel/game/PlayerController.js';
import WaveController from '../../games/SpaceDuel/game/WaveController.js';
import ScoreManager from '../../games/SpaceDuel/game/ScoreManager.js';
import SpaceDuelScene from '../../games/SpaceDuel/game/SpaceDuelScene.js';

function createInputState({ down = [], pressed = [] } = {}) {
  const downSet = new Set(down);
  const pressedSet = new Set(pressed);
  return {
    isActionDown(action) {
      return downSet.has(action);
    },
    isActionPressed(action) {
      return pressedSet.has(action);
    },
  };
}

function testPhysicsWrap() {
  const physics = new PhysicsController({ width: 960, height: 720 });
  const body = { x: -20, y: 731, vx: 0, vy: 0, radius: 10 };
  physics.wrap(body, body.radius);
  assert.equal(body.x, 970);
  assert.equal(body.y, -10);

  const left = { x: 2, y: 350, radius: 6 };
  const right = { x: 957, y: 350, radius: 6 };
  assert.equal(physics.collidesCircle(left, right), true);
}

function testWrapAwareNearestTargeting() {
  const physics = new PhysicsController({ width: 960, height: 720 });
  const origin = { x: 954, y: 320 };
  const nearWrap = { x: 8, y: 320, alive: true };
  const farDirect = { x: 870, y: 320, alive: true };
  const nearest = physics.findNearestTarget(origin, [farDirect, nearWrap]);
  assert.equal(nearest, nearWrap);
}

function testPlayerInertiaAndFireCooldown() {
  const physics = new PhysicsController({ width: 960, height: 720 });
  const players = new PlayerController({ physics });
  const bullets = [];
  players.createPlayers(1);

  players.update({
    dtSeconds: 0.2,
    input: createInputState({ down: ['p1Thrust'], pressed: ['p1Fire'] }),
    bullets,
  });

  const player = players.players[0];
  const afterBurnVx = player.vx;
  const afterBurnVy = player.vy;
  assert.equal(bullets.length, 1);

  players.update({
    dtSeconds: 0.1,
    input: createInputState({ pressed: ['p1Fire'] }),
    bullets,
  });

  assert.equal(bullets.length, 1);
  assert.equal(player.vx, afterBurnVx);
  assert.equal(player.vy, afterBurnVy);

  players.update({
    dtSeconds: 0.12,
    input: createInputState({ pressed: ['p1Fire'] }),
    bullets,
  });

  assert.equal(bullets.length, 2);
}

function testWaveSplitAndProgression() {
  const physics = new PhysicsController({ width: 960, height: 720 });
  const wave = new WaveController({ physics });
  const score = new ScoreManager();
  score.start(1);

  wave.wave = 1;
  wave.enemies = [{
    id: 1,
    type: 'enemy',
    tier: 2,
    x: 320,
    y: 300,
    vx: 0,
    vy: 0,
    radius: 20,
    sides: 7,
    angle: 0,
    spin: 0,
    fireCooldown: 5,
    color: '#fff',
  }];
  wave.hazards = [];
  wave.enemyShots = [];

  const bullets = [{ id: 1, ownerId: 1, x: 320, y: 300, vx: 0, vy: 0, radius: 2, ttl: 1 }];
  const hit = wave.handlePlayerBulletCollisions(bullets, score);
  assert.equal(hit.destroyedEnemies, 1);
  assert.equal(wave.enemies.length, 2);
  assert.equal(score.getPlayerState(1).score, 120);

  wave.enemies = [];
  wave.hazards = [];
  const first = wave.update(0.52, []);
  assert.equal(first.waveCleared, true);
  const second = wave.update(0.6, []);
  assert.equal(second.waveStarted, false);
  const third = wave.update(0.5, []);
  assert.equal(third.waveStarted, true);
  assert.equal(wave.wave, 2);
}

function testScoreExtraLife() {
  const score = new ScoreManager();
  score.start(1);
  const beforeLives = score.getPlayerState(1).lives;
  const result = score.addScore(1, 10000);
  assert.equal(result.extraLifeAwarded, true);
  assert.equal(score.getPlayerState(1).lives, beforeLives + 1);
}

function testTwoPlayerSharedSpaceCollision() {
  const scene = new SpaceDuelScene();
  scene.startGame(2);

  scene.waveController.enemies = [];
  scene.waveController.hazards = [];
  scene.waveController.enemyShots = [];
  scene.playerBullets = [];

  const p1 = scene.players[0];
  const p2 = scene.players[1];
  p1.invulnerableTimer = 0;
  p2.invulnerableTimer = 0;
  p1.x = 420;
  p1.y = 350;
  p2.x = 420;
  p2.y = 350;

  scene.resolveShipCollisions();

  assert.equal(p1.alive, false);
  assert.equal(p2.alive, false);
  assert.equal(scene.scoreManager.getPlayerState(1).lives, 2);
  assert.equal(scene.scoreManager.getPlayerState(2).lives, 2);
}

function testAttractControllerMenuFlow() {
  const scene = new SpaceDuelScene();
  const makeInput = (down = [], pressed = []) => createInputState({ down, pressed });
  const idleTimeoutSeconds = scene.attractController.idleTimeoutMs / 1000;

  scene.update(Math.max(0, idleTimeoutSeconds - 0.001), { input: makeInput() });
  assert.equal(scene.attractController.active, false);

  scene.update(0.001, { input: makeInput() });
  assert.equal(scene.attractController.active, true);
  assert.equal(scene.attractAdapter.active, true);

  scene.attractController.setPhaseIndex?.(2);
  scene.attractAdapter.setPhase('demo');
  scene.attractAdapter.startDemo();
  scene.attractAdapter.update(0.1);
  assert.equal(scene.attractAdapter.demoTrail.length > 0, true);

  scene.update(0.016, { input: makeInput(['p1Left']) });
  assert.equal(scene.attractController.active, false);
}

export function run() {
  testPhysicsWrap();
  testWrapAwareNearestTargeting();
  testPlayerInertiaAndFireCooldown();
  testWaveSplitAndProgression();
  testScoreExtraLife();
  testTwoPlayerSharedSpaceCollision();
  testAttractControllerMenuFlow();
}
