/*
Toolbox Aid
David Quesenberry
03/25/2026
PacmanFullAIWorld.test.mjs
*/
import assert from 'node:assert/strict';
import PacmanFullAIWorld from '../../games/PacmanFullAI/game/PacmanFullAIWorld.js';

function controls(overrides = {}) {
  return {
    queuedDirection: null,
    startPressed: false,
    resetPressed: false,
    ...overrides,
  };
}

function testStartAndMovement() {
  const world = new PacmanFullAIWorld({ width: 960, height: 720 });
  world.update(0, controls({ startPressed: true }));
  assert.equal(world.status, 'playing');

  const before = world.player.x;
  world.update(0.2, controls({ queuedDirection: 'left' }));
  assert.equal(world.player.x < before, true);
}

function testPowerPelletTriggersFrightened() {
  const world = new PacmanFullAIWorld({ width: 960, height: 720 });
  world.startGame();
  world.player.x = world.grid.tileToWorld(1, 1).x;
  world.player.y = world.grid.tileToWorld(1, 1).y;

  const event = world.update(0, controls());
  assert.equal(event.powerPelletEaten, true);
  assert.equal(world.modeScheduler.frightenedMs > 0, true);
  world.update(0, controls());
  assert.equal(world.modeState.mode, 'frightened');
}

function testCollisionInFrightenedEatsGhost() {
  const world = new PacmanFullAIWorld({ width: 960, height: 720 });
  world.startGame();
  world.modeScheduler.triggerFrightened();
  world.modeState = world.modeScheduler.update(0);
  const ghost = world.ghosts[0];
  ghost.inHouse = false;
  ghost.eaten = false;
  ghost.x = world.player.x;
  ghost.y = world.player.y;

  const event = world.update(1 / 60, controls());
  assert.equal(event.ghostEaten, true);
  assert.equal(ghost.eaten, true);
}

function testResetReturnsToMenu() {
  const world = new PacmanFullAIWorld({ width: 960, height: 720 });
  world.startGame();
  const event = world.update(0, controls({ resetPressed: true }));
  assert.equal(event.reset, true);
  assert.equal(world.status, 'menu');
}

export function run() {
  testStartAndMovement();
  testPowerPelletTriggersFrightened();
  testCollisionInFrightenedEatsGhost();
  testResetReturnsToMenu();
}
