/*
Toolbox Aid
David Quesenberry
03/24/2026
PaddleInterceptWorld.test.mjs
*/
import assert from 'node:assert/strict';
import PaddleInterceptWorld, {
  predictFutureBallCenterY,
  predictInterceptY,
  reflectIntoLane,
} from '../../samples/phase-03/0326/game/PaddleInterceptWorld.js';

function createControls(overrides = {}) {
  return {
    startPressed: false,
    resetPressed: false,
    ...overrides,
  };
}

function testReflectionHelperMirrorsPastWalls() {
  assert.equal(reflectIntoLane(50, 0, 100), 50);
  assert.equal(reflectIntoLane(130, 0, 100), 70);
  assert.equal(reflectIntoLane(-20, 0, 100), 20);
}

function testInterceptPredictionAccountsForWallReflection() {
  const ball = {
    centerX: 120,
    centerY: 100,
    vx: 200,
    vy: 150,
  };
  const direct = predictFutureBallCenterY(ball, 2, 50, 250);
  assert.equal(direct, 100);

  const reflected = predictInterceptY(ball, 720, 50, 250);
  assert.equal(reflected, 150);
}

function testPaddleTracksTowardPredictedIntercept() {
  const world = new PaddleInterceptWorld({ width: 960, height: 720 });
  world.ball.centerX = 180;
  world.ball.centerY = 140;
  world.ball.vx = 300;
  world.ball.vy = 220;
  world.refreshInterceptMarker();
  const startY = world.paddle.centerY;
  const startDelta = Math.abs(world.interceptMarkerY - startY);

  world.update(0, createControls({ startPressed: true }));
  world.update(0.2, createControls());
  assert.equal(Math.abs(world.interceptMarkerY - world.paddle.centerY) < startDelta, true);
}

function testLongRunStabilityKeepsBallAndPaddleInsideBounds() {
  const world = new PaddleInterceptWorld({ width: 960, height: 720 });
  world.update(0, createControls({ startPressed: true }));

  for (let index = 0; index < 1800; index += 1) {
    world.update(1 / 60, createControls());
    const ball = world.getBallBounds();
    const paddle = world.getPaddleBounds();
    assert.equal(ball.left >= world.playfield.left - 0.001, true);
    assert.equal(ball.right <= world.playfield.right + 0.001, true);
    assert.equal(ball.top >= world.playfield.top - 0.001, true);
    assert.equal(ball.bottom <= world.playfield.bottom + 0.001, true);
    assert.equal(paddle.top >= world.playfield.top - 0.001, true);
    assert.equal(paddle.bottom <= world.playfield.bottom + 0.001, true);
  }
}

function testResetRestoresInitialState() {
  const world = new PaddleInterceptWorld({ width: 960, height: 720 });
  const startX = world.ball.centerX;
  const startY = world.ball.centerY;
  world.update(0, createControls({ startPressed: true }));
  world.update(0.5, createControls());

  const event = world.update(0, createControls({ resetPressed: true }));
  assert.equal(event.reset, true);
  assert.equal(world.status, 'menu');
  assert.equal(world.ball.centerX, startX);
  assert.equal(world.ball.centerY, startY);
}

export function run() {
  testReflectionHelperMirrorsPastWalls();
  testInterceptPredictionAccountsForWallReflection();
  testPaddleTracksTowardPredictedIntercept();
  testLongRunStabilityKeepsBallAndPaddleInsideBounds();
  testResetRestoresInitialState();
}
