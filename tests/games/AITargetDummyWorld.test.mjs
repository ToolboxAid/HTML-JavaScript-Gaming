/*
Toolbox Aid
David Quesenberry
03/25/2026
AITargetDummyWorld.test.mjs
*/
import assert from 'node:assert/strict';
import AITargetDummyWorld from '../../games/AITargetDummy/game/AITargetDummyWorld.js';

function createControls(overrides = {}) {
  return {
    moveX: 0,
    moveY: 0,
    startPressed: false,
    resetPressed: false,
    ...overrides,
  };
}

function testStartAndPlayerMovement() {
  const world = new AITargetDummyWorld({ width: 960, height: 720 });
  world.update(0, createControls({ startPressed: true }));
  assert.equal(world.status, 'playing');
  const startX = world.player.x;
  world.update(0.2, createControls({ moveX: 1 }));
  assert.equal(world.player.x > startX, true);
}

function testDummyChasesWhenPlayerInSenseRadius() {
  const world = new AITargetDummyWorld({ width: 960, height: 720 });
  world.startGame();
  world.player.x = world.dummy.x - 140;
  world.player.y = world.dummy.y;
  for (let i = 0; i < 90; i += 1) {
    world.update(1 / 60, createControls());
  }
  assert.equal(world.dummy.state, 'pursue');
}

function testDummyEvadesAtCloseRange() {
  const world = new AITargetDummyWorld({ width: 960, height: 720 });
  world.startGame();
  world.player.x = world.dummy.x - 8;
  world.player.y = world.dummy.y - 8;

  let sawEvade = false;
  for (let i = 0; i < 90; i += 1) {
    const event = world.update(1 / 60, createControls());
    if (event.dummyState === 'evade') {
      sawEvade = true;
      break;
    }
  }
  assert.equal(sawEvade, true);
}

function testHysteresisPreventsRapidFlipping() {
  const world = new AITargetDummyWorld({ width: 960, height: 720 });
  world.startGame();
  world.player.x = world.dummy.x - 220;
  world.player.y = world.dummy.y;
  for (let i = 0; i < 80; i += 1) {
    world.update(1 / 60, createControls());
  }
  const before = world.dummy.state;
  world.player.x = world.dummy.x - 258;
  for (let i = 0; i < 5; i += 1) {
    world.update(1 / 60, createControls());
  }
  assert.equal(before, 'pursue');
  assert.equal(world.dummy.state, 'pursue');
}

function testResetReturnsToMenu() {
  const world = new AITargetDummyWorld({ width: 960, height: 720 });
  world.startGame();
  world.update(0.2, createControls({ moveX: 1 }));
  const event = world.update(0, createControls({ resetPressed: true }));
  assert.equal(event.reset, true);
  assert.equal(world.status, 'menu');
}

export function run() {
  testStartAndPlayerMovement();
  testDummyChasesWhenPlayerInSenseRadius();
  testDummyEvadesAtCloseRange();
  testHysteresisPreventsRapidFlipping();
  testResetReturnsToMenu();
}
