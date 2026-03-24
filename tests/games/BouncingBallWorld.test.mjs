/*
Toolbox Aid
David Quesenberry
03/24/2026
BouncingBallWorld.test.mjs
*/
import assert from 'node:assert/strict';
import BouncingBallWorld from '../../games/bouncing-ball/game/BouncingBallWorld.js';

function createControls(overrides = {}) {
  return {
    startPressed: false,
    resetPressed: false,
    ...overrides,
  };
}

function testStartAndBasicMotion() {
  const world = new BouncingBallWorld({ width: 960, height: 720 });
  const beforeX = world.ball.x;
  const beforeY = world.ball.y;

  world.update(0, createControls({ startPressed: true }));
  assert.equal(world.status, 'playing');

  world.update(0.25, createControls());
  assert.equal(world.ball.x !== beforeX, true);
  assert.equal(world.ball.y !== beforeY, true);
}

function testWallBounceFlipsHorizontalVelocity() {
  const world = new BouncingBallWorld({ width: 960, height: 720 });
  world.startGame();
  world.ball.x = world.playfield.left + 1;
  world.ball.vx = -320;
  world.ball.vy = 0;

  const event = world.update(1 / 60, createControls());
  assert.equal(event.bounced, true);
  assert.equal(world.ball.vx > 0, true);
  assert.equal(world.ball.x >= world.playfield.left, true);
}

function testWallBounceFlipsVerticalVelocity() {
  const world = new BouncingBallWorld({ width: 960, height: 720 });
  world.startGame();
  world.ball.y = world.playfield.bottom - world.ball.size - 1;
  world.ball.vx = 0;
  world.ball.vy = 320;

  const event = world.update(1 / 60, createControls());
  assert.equal(event.bounced, true);
  assert.equal(world.ball.vy < 0, true);
  assert.equal(world.ball.y <= (world.playfield.bottom - world.ball.size), true);
}

function testLongRunStaysInsideBounds() {
  const world = new BouncingBallWorld({ width: 960, height: 720 });
  world.startGame();

  for (let index = 0; index < 600; index += 1) {
    world.update(1 / 60, createControls());
    assert.equal(world.ball.x >= world.playfield.left, true);
    assert.equal(world.ball.x <= (world.playfield.right - world.ball.size), true);
    assert.equal(world.ball.y >= world.playfield.top, true);
    assert.equal(world.ball.y <= (world.playfield.bottom - world.ball.size), true);
  }
}

function testResetReturnsToMenuAndCenter() {
  const world = new BouncingBallWorld({ width: 960, height: 720 });
  world.startGame();
  world.update(0.2, createControls());

  const event = world.update(0, createControls({ resetPressed: true }));
  assert.equal(event.reset, true);
  assert.equal(world.status, 'menu');
  assert.equal(world.ball.x, (world.width / 2) - (world.ball.size / 2));
  assert.equal(world.ball.y, (world.height / 2) - (world.ball.size / 2));
}

export function run() {
  testStartAndBasicMotion();
  testWallBounceFlipsHorizontalVelocity();
  testWallBounceFlipsVerticalVelocity();
  testLongRunStaysInsideBounds();
  testResetReturnsToMenuAndCenter();
}
