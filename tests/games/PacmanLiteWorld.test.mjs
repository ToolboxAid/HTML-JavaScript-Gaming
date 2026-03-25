/*
Toolbox Aid
David Quesenberry
03/25/2026
PacmanLiteWorld.test.mjs
*/
import assert from 'node:assert/strict';
import PacmanLiteWorld from '../../games/PacmanLite/game/PacmanLiteWorld.js';

function createControls(overrides = {}) {
  return {
    queuedDirection: null,
    startPressed: false,
    resetPressed: false,
    ...overrides,
  };
}

function testStartAndBufferedDirection() {
  const world = new PacmanLiteWorld({ width: 960, height: 720 });
  world.update(0, createControls({ startPressed: true }));
  assert.equal(world.status, 'playing');

  const before = world.player.x;
  world.update(0.3, createControls({ queuedDirection: 'right' }));
  assert.equal(world.player.x > before, true);
}

function testPelletCollectionScores() {
  const world = new PacmanLiteWorld({ width: 960, height: 720 });
  world.startGame();
  const tile = world.grid.worldToTile(world.player.x, world.player.y);
  const hadPellet = world.grid.hasPellet(tile.x, tile.y);
  world.update(0, createControls());
  assert.equal(hadPellet, true);
  assert.equal(world.score >= 10, true);
}

function testGhostCollisionCostsLife() {
  const world = new PacmanLiteWorld({ width: 960, height: 720 });
  world.startGame();
  world.ghost.x = world.player.x;
  world.ghost.y = world.player.y;
  const beforeLives = world.lives;
  const event = world.update(1 / 60, createControls());
  assert.equal(event.playerHit, true);
  assert.equal(world.lives, beforeLives - 1);
}

function testResetReturnsToMenu() {
  const world = new PacmanLiteWorld({ width: 960, height: 720 });
  world.startGame();
  const event = world.update(0, createControls({ resetPressed: true }));
  assert.equal(event.reset, true);
  assert.equal(world.status, 'menu');
}

export function run() {
  testStartAndBufferedDirection();
  testPelletCollectionScores();
  testGhostCollisionCostsLife();
  testResetReturnsToMenu();
}
