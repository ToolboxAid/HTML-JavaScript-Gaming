/*
Toolbox Aid
David Quesenberry
03/24/2026
PongWorld.test.mjs
*/
import assert from 'node:assert/strict';
import PongWorld from '../../games/Pong/game/PongWorld.js';

function createControls(overrides = {}) {
  return {
    moveX: 0,
    moveY: 0,
    servePressed: false,
    confirmPressed: false,
    backPressed: false,
    ...overrides,
  };
}

function testTennisEnglishChangesReturn() {
  const world = new PongWorld({ width: 960, height: 720 });
  world.setMode('tennis');
  world.status = 'playing';
  world.player.y = 300;
  world.player.vy = -420;
  world.ball.x = world.player.x + (world.player.width * 0.5) + world.ball.radius - 1;
  world.ball.y = world.player.y - 18;
  world.ball.vx = -420;
  world.ball.vy = 0;
  world.ball.spin = 0;

  world.update(1 / 120, createControls());

  assert.equal(world.ball.vx > 0, true);
  assert.equal(world.ball.vy < 0, true);
  assert.equal(world.ball.spin < 0, true);
}

function testVerticalLaneModesKeepPaddlesInLane() {
  ['tennis', 'handball', 'jaiAlai'].forEach((modeKey) => {
    const world = new PongWorld({ width: 960, height: 720 });
    world.setMode(modeKey);
    const playerStartX = world.player.x;
    const opponentStartX = world.opponent?.x ?? null;

    world.update(1 / 60, createControls({ moveX: 1, moveY: 1 }));

    assert.equal(world.player.x, playerStartX, `${modeKey} player should stay in its lane`);
    if (world.opponent) {
      assert.equal(world.opponent.x, opponentStartX, `${modeKey} opponent should stay in its lane`);
    }
  });
}

function testHockeyGoalMouthScoring() {
  const world = new PongWorld({ width: 960, height: 720 });
  world.setMode('hockey');
  world.status = 'playing';
  world.ball.x = world.width - world.ball.radius - 2;
  world.ball.y = world.height * 0.5;
  world.ball.vx = 480;
  world.ball.vy = 0;

  const result = world.update(0.1, createControls());
  assert.equal(result.scored, true);
  assert.equal(world.scores[0], 1);

  world.status = 'playing';
  world.ball.x = world.width - world.ball.radius - 2;
  world.ball.y = 80;
  world.ball.vx = 480;
  world.ball.vy = 0;
  world.scores[0] = 0;
  world.update(0.1, createControls());
  assert.equal(world.scores[0], 0);
  assert.equal(world.ball.vx < 0, true);
}

function testHandballScoringAndLives() {
  const world = new PongWorld({ width: 960, height: 720 });
  world.setMode('handball');
  world.status = 'playing';
  world.ball.x = world.width - world.ball.radius - 1;
  world.ball.y = world.height * 0.5;
  world.ball.vx = 400;
  world.ball.vy = 0;
  world.ball.frontWallReady = true;

  world.update(1 / 60, createControls());
  assert.equal(world.scores[0], 1);
  assert.equal(world.ball.vx < 0, true);

  world.ball.x = -world.ball.radius - 2;
  world.ball.vx = -420;
  world.status = 'playing';
  const beforeLives = world.playerLives;
  world.update(1 / 60, createControls());
  assert.equal(world.playerLives, beforeLives - 1);
  assert.equal(world.status, 'serve');
}

function testJaiAlaiWinTransition() {
  const world = new PongWorld({ width: 960, height: 720 });
  world.setMode('jaiAlai');
  world.scores[0] = world.mode.targetScore - 1;
  world.status = 'playing';
  world.ball.x = world.width - world.ball.radius - 1;
  world.ball.vx = 480;
  world.ball.frontWallReady = true;

  const result = world.update(1 / 60, createControls());
  assert.equal(result.status, 'won');
  assert.equal(world.status, 'won');
}

export function run() {
  testTennisEnglishChangesReturn();
  testVerticalLaneModesKeepPaddlesInLane();
  testHockeyGoalMouthScoring();
  testHandballScoringAndLives();
  testJaiAlaiWinTransition();
}
