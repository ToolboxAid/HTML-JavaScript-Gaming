/*
Toolbox Aid
David Quesenberry
03/24/2026
MultiBallChaosWorld.test.mjs
*/
import assert from 'node:assert/strict';
import MultiBallChaosWorld from '../../games/MultiBallChaos/game/MultiBallChaosWorld.js';

function createControls(overrides = {}) {
  return {
    startPressed: false,
    resetPressed: false,
    presetPressed: null,
    ...overrides,
  };
}

function snapshot(world) {
  return world.balls.map((ball) => ({
    x: ball.x,
    y: ball.y,
    vx: ball.vx,
    vy: ball.vy,
  }));
}

function testPresetSelectionChangesBallCount() {
  const world = new MultiBallChaosWorld({ width: 960, height: 720 });
  assert.equal(world.balls.length, 3);

  const event = world.update(0, createControls({ presetPressed: 'ten' }));
  assert.equal(event.presetChanged, true);
  assert.equal(world.selectedPresetId, 'ten');
  assert.equal(world.balls.length, 10);
  assert.equal(world.status, 'menu');
}

function testStartAndElapsedTimeAdvance() {
  const world = new MultiBallChaosWorld({ width: 960, height: 720 });
  world.update(0, createControls({ startPressed: true }));
  assert.equal(world.status, 'playing');

  world.update(0.5, createControls());
  assert.equal(world.elapsedSeconds > 0.49, true);
}

function testFastChaosStartsFasterThanThreeBalls() {
  const world = new MultiBallChaosWorld({ width: 960, height: 720 });
  const averageBaseSpeed = world.balls
    .map((ball) => Math.hypot(ball.vx, ball.vy))
    .reduce((total, speed) => total + speed, 0) / world.balls.length;

  world.update(0, createControls({ presetPressed: 'fast' }));
  const averageFastSpeed = world.balls
    .map((ball) => Math.hypot(ball.vx, ball.vy))
    .reduce((total, speed) => total + speed, 0) / world.balls.length;

  assert.equal(averageFastSpeed > averageBaseSpeed, true);
}

function testLongRunTenBallStabilityStaysInBounds() {
  const world = new MultiBallChaosWorld({ width: 960, height: 720 });
  world.update(0, createControls({ presetPressed: 'ten' }));
  world.update(0, createControls({ startPressed: true }));

  for (let index = 0; index < 1800; index += 1) {
    world.update(1 / 60, createControls());
    world.balls.forEach((ball) => {
      assert.equal(ball.x >= world.playfield.left, true);
      assert.equal(ball.x <= (world.playfield.right - ball.size), true);
      assert.equal(ball.y >= world.playfield.top, true);
      assert.equal(ball.y <= (world.playfield.bottom - ball.size), true);
    });
  }
}

function testResetPreservesSelectedPresetAndRestoresInitialLayout() {
  const world = new MultiBallChaosWorld({ width: 960, height: 720 });
  world.update(0, createControls({ presetPressed: 'six' }));
  const baseline = snapshot(world);
  world.update(0, createControls({ startPressed: true }));
  world.update(0.75, createControls());
  assert.notDeepEqual(snapshot(world), baseline);

  const event = world.update(0, createControls({ resetPressed: true }));
  assert.equal(event.reset, true);
  assert.equal(world.status, 'menu');
  assert.equal(world.selectedPresetId, 'six');
  assert.equal(world.elapsedSeconds, 0);
  assert.deepEqual(snapshot(world), baseline);
}

export function run() {
  testPresetSelectionChangesBallCount();
  testStartAndElapsedTimeAdvance();
  testFastChaosStartsFasterThanThreeBalls();
  testLongRunTenBallStabilityStaysInBounds();
  testResetPreservesSelectedPresetAndRestoresInitialLayout();
}
