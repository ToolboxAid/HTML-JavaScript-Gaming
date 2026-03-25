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
  world.update(1 / 60, createControls());
  assert.equal(world.dummy.state === 'chase' || world.dummy.state === 'attack', true);
}

function testDummyAttackCycle() {
  const world = new AITargetDummyWorld({ width: 960, height: 720 });
  world.startGame();
  world.player.x = world.dummy.x - 10;
  world.player.y = world.dummy.y;

  let attackTriggered = false;
  for (let i = 0; i < 120; i += 1) {
    const event = world.update(1 / 60, createControls());
    if (event.attackTriggered) {
      attackTriggered = true;
      break;
    }
  }

  assert.equal(attackTriggered, true);
  assert.equal(world.dummy.attacksLanded > 0, true);
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
  testDummyAttackCycle();
  testResetReturnsToMenu();
}
