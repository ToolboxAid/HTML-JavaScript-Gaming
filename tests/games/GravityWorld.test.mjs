/*
Toolbox Aid
David Quesenberry
03/24/2026
GravityWorld.test.mjs
*/
import assert from 'node:assert/strict';
import GravityWorld from '../../samples/phase-03/0325/game/GravityWorld.js';

function createControls(overrides = {}) {
  return {
    horizontal: 0,
    startPressed: false,
    resetPressed: false,
    ...overrides,
  };
}

function testStartAndGravityAcceleration() {
  const world = new GravityWorld({ width: 960, height: 720 });
  const startY = world.ball.y;

  world.update(0, createControls({ startPressed: true }));
  assert.equal(world.status, 'playing');

  world.update(0.25, createControls());
  assert.equal(world.ball.y > startY, true);
  assert.equal(world.ball.vy > 0, true);
}

function testHorizontalInfluenceAdjustsVelocity() {
  const world = new GravityWorld({ width: 960, height: 720 });
  world.startGame();
  const startVx = world.ball.vx;
  world.update(0.2, createControls({ horizontal: 1 }));
  assert.equal(world.ball.vx > startVx, true);
}

function testFloorBounceIsDamped() {
  const world = new GravityWorld({ width: 960, height: 720 });
  world.startGame();
  const maxY = world.playfield.bottom - world.ball.size;
  world.ball.y = maxY - 2;
  world.ball.vy = 420;

  const event = world.update(1 / 60, createControls());
  assert.equal(event.floorBounced, true);
  assert.equal(world.ball.y <= maxY, true);
  assert.equal(world.ball.vy < 0, true);
  assert.equal(Math.abs(world.ball.vy) < 420, true);
}

function testLongRunStaysInsideBounds() {
  const world = new GravityWorld({ width: 960, height: 720 });
  world.startGame();

  for (let index = 0; index < 900; index += 1) {
    const horizontal = index % 180 < 90 ? -0.25 : 0.25;
    world.update(1 / 60, createControls({ horizontal }));
    assert.equal(world.ball.x >= world.playfield.left, true);
    assert.equal(world.ball.x <= (world.playfield.right - world.ball.size), true);
    assert.equal(world.ball.y >= world.playfield.top, true);
    assert.equal(world.ball.y <= (world.playfield.bottom - world.ball.size), true);
  }
}

function testResetReturnsToMenuAndStartPosition() {
  const world = new GravityWorld({ width: 960, height: 720 });
  world.startGame();
  world.update(0.2, createControls({ horizontal: 1 }));

  const event = world.update(0, createControls({ resetPressed: true }));
  assert.equal(event.reset, true);
  assert.equal(world.status, 'menu');
  assert.equal(world.ball.x, (world.width / 2) - (world.ball.size / 2));
  assert.equal(world.ball.y, 156);
  assert.equal(world.ball.vy, 0);
}

export function run() {
  testStartAndGravityAcceleration();
  testHorizontalInfluenceAdjustsVelocity();
  testFloorBounceIsDamped();
  testLongRunStaysInsideBounds();
  testResetReturnsToMenuAndStartPosition();
}
