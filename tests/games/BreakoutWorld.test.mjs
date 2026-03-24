/*
Toolbox Aid
David Quesenberry
03/24/2026
BreakoutWorld.test.mjs
*/
import assert from 'node:assert/strict';
import BreakoutWorld from '../../games/Breakout/game/BreakoutWorld.js';

function createControls(overrides = {}) {
  return {
    moveAxis: 0,
    servePressed: false,
    exitPressed: false,
    ...overrides,
  };
}

function testServeAndPaddleMovement() {
  const world = new BreakoutWorld({ width: 960, height: 720 });
  world.startGame();
  const startX = world.paddle.x;
  world.update(0.1, createControls({ moveAxis: 1 }));
  assert.equal(world.paddle.x > startX, true);

  world.update(0, createControls({ servePressed: true }));
  assert.equal(world.status, 'playing');
  assert.equal(world.ball.vy < 0, true);
}

function testPaddleEnglishChangesReturnAngle() {
  const world = new BreakoutWorld({ width: 960, height: 720 });
  world.startGame();
  world.launchBall();
  world.ball.x = world.paddle.x + world.paddle.width - world.ball.size - 8;
  world.ball.y = world.paddle.y - world.ball.size + 1;
  world.ball.vx = 0;
  world.ball.vy = 320;

  const event = world.update(1 / 120, createControls({ moveAxis: 1 }));
  assert.equal(event.paddleHit, true);
  assert.equal(world.ball.vy < 0, true);
  assert.equal(world.ball.vx > 0, true);
}

function testBrickHitScoresAndRemovesBrick() {
  const world = new BreakoutWorld({ width: 960, height: 720 });
  world.startGame();
  world.launchBall();
  const brick = world.bricks.find((item) => item.alive);
  world.ball.x = brick.x + (brick.width / 2) - (world.ball.size / 2);
  world.ball.y = brick.y + brick.height - 2;
  world.ball.vx = 0;
  world.ball.vy = -300;

  const event = world.update(1 / 120, createControls());
  assert.equal(event.brickHit, true);
  assert.equal(brick.alive, false);
  assert.equal(world.score, brick.points);
  assert.equal(world.remainingBricks, world.bricks.filter((item) => item.alive).length);
}

function testLifeLossTransitionsToServe() {
  const world = new BreakoutWorld({ width: 960, height: 720 });
  world.startGame();
  world.launchBall();
  const beforeLives = world.lives;
  world.ball.y = world.height + 4;

  const event = world.update(0, createControls());
  assert.equal(event.lifeLost, true);
  assert.equal(world.lives, beforeLives - 1);
  assert.equal(world.status, 'serve');
  assert.equal(world.ball.vx, 0);
}

function testFinalBrickWinsAndFinalLifeLoses() {
  const winWorld = new BreakoutWorld({ width: 960, height: 720 });
  winWorld.startGame();
  winWorld.launchBall();
  winWorld.bricks.forEach((brick, index) => {
    brick.alive = index === 0;
  });
  winWorld.remainingBricks = 1;
  const finalBrick = winWorld.bricks[0];
  winWorld.ball.x = finalBrick.x + 10;
  winWorld.ball.y = finalBrick.y + 10;
  winWorld.ball.vx = 0;
  winWorld.ball.vy = -240;
  const winEvent = winWorld.update(1 / 120, createControls());
  assert.equal(winEvent.won, true);
  assert.equal(winWorld.status, 'won');

  const lossWorld = new BreakoutWorld({ width: 960, height: 720 });
  lossWorld.startGame();
  lossWorld.launchBall();
  lossWorld.lives = 1;
  lossWorld.ball.y = lossWorld.height + 10;
  const lossEvent = lossWorld.update(0, createControls());
  assert.equal(lossEvent.lost, true);
  assert.equal(lossWorld.status, 'lost');
}

export function run() {
  testServeAndPaddleMovement();
  testPaddleEnglishChangesReturnAngle();
  testBrickHitScoresAndRemovesBrick();
  testLifeLossTransitionsToServe();
  testFinalBrickWinsAndFinalLifeLoses();
}
