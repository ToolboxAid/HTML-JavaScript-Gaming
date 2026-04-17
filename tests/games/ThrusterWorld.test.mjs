/*
Toolbox Aid
David Quesenberry
03/24/2026
ThrusterWorld.test.mjs
*/
import assert from 'node:assert/strict';
import ThrusterWorld from '../../samples/phase-04/0413/game/ThrusterWorld.js';

function createControls(overrides = {}) {
  return {
    turn: 0,
    thrustDown: false,
    startPressed: false,
    resetPressed: false,
    ...overrides,
  };
}

function testStartAndRotation() {
  const world = new ThrusterWorld({ width: 960, height: 720 });
  world.update(0, createControls({ startPressed: true }));
  assert.equal(world.status, 'playing');

  const startAngle = world.ship.angle;
  world.update(0.2, createControls({ turn: 1 }));
  assert.equal(world.ship.angle > startAngle, true);
}

function testThrustBuildsInertialVelocity() {
  const world = new ThrusterWorld({ width: 960, height: 720 });
  world.startGame();
  const startVy = world.ship.vy;
  world.update(0.25, createControls({ thrustDown: true }));
  assert.equal(world.ship.vy < startVy, true);

  const afterBurnVy = world.ship.vy;
  world.update(0.25, createControls());
  assert.equal(world.ship.vy < 0, true);
  assert.equal(world.ship.vy > afterBurnVy, true);
}

function testWallBounceStaysInBounds() {
  const world = new ThrusterWorld({ width: 960, height: 720 });
  world.startGame();
  const minX = world.playfield.left + world.ship.radius;
  world.ship.x = minX + 1;
  world.ship.vx = -220;

  const event = world.update(1 / 60, createControls());
  assert.equal(event.wallBounced, true);
  assert.equal(world.ship.vx > 0, true);
  assert.equal(world.ship.x >= minX, true);
}

function testLongRunStaysInsideBounds() {
  const world = new ThrusterWorld({ width: 960, height: 720 });
  world.startGame();

  for (let index = 0; index < 900; index += 1) {
    const turn = index % 180 < 90 ? -0.75 : 0.75;
    const thrustDown = index % 40 < 12;
    world.update(1 / 60, createControls({ turn, thrustDown }));
    assert.equal(world.ship.x >= (world.playfield.left + world.ship.radius), true);
    assert.equal(world.ship.x <= (world.playfield.right - world.ship.radius), true);
    assert.equal(world.ship.y >= (world.playfield.top + world.ship.radius), true);
    assert.equal(world.ship.y <= (world.playfield.bottom - world.ship.radius), true);
  }
}

function testResetReturnsToMenuAndCenter() {
  const world = new ThrusterWorld({ width: 960, height: 720 });
  world.startGame();
  world.update(0.2, createControls({ turn: 1, thrustDown: true }));

  const event = world.update(0, createControls({ resetPressed: true }));
  assert.equal(event.reset, true);
  assert.equal(world.status, 'menu');
  assert.equal(world.ship.x, world.width / 2);
  assert.equal(world.ship.y, world.height / 2);
  assert.equal(world.ship.vx, 0);
  assert.equal(world.ship.vy, 0);
}

export function run() {
  testStartAndRotation();
  testThrustBuildsInertialVelocity();
  testWallBounceStaysInBounds();
  testLongRunStaysInsideBounds();
  testResetReturnsToMenuAndCenter();
}
