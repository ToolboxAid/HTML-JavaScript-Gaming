/*
Toolbox Aid
David Quesenberry
03/22/2026
AIBehaviors.test.mjs
*/
import assert from 'node:assert/strict';
import {
  AIStateController,
  advancePatrolRoute,
  computeGroupSteering,
  findGridPath,
  stepChaseBehavior,
  stepEvadeBehavior,
} from '/src/engine/ai/index.js';

export function run() {
  const grid = [
    [0, 0, 0, 0],
    [1, 1, 0, 1],
    [0, 0, 0, 0],
    [0, 1, 1, 0],
  ];
  const path = findGridPath(grid, { x: 0, y: 0 }, { x: 3, y: 3 });
  assert.equal(path.length > 0, true);
  assert.deepEqual(path[0], { x: 0, y: 0 });
  assert.deepEqual(path.at(-1), { x: 3, y: 3 });

  const actor = { x: 0, y: 0, speed: 100, width: 10, height: 10 };
  const route = [{ x: 50, y: 0 }, { x: 50, y: 50 }];
  advancePatrolRoute(actor, route, 0.5);
  assert.equal(actor.x > 0, true);

  const chaser = { x: 0, y: 0 };
  const target = { x: 100, y: 0 };
  stepChaseBehavior(chaser, target, 1, { speed: 50 });
  assert.equal(chaser.x > 0, true);

  const evader = { x: 60, y: 0 };
  stepEvadeBehavior(evader, chaser, 1, { speed: 40, desiredDistance: 120 });
  assert.equal(evader.x > 60, true);

  const controller = new AIStateController({
    initial: 'idle',
    states: {
      idle: {
        transition: ({ detected }) => (detected ? 'chase' : null),
      },
      chase: {
        transition: ({ detected }) => (!detected ? 'idle' : null),
      },
    },
  });
  controller.update({ detected: true });
  assert.equal(controller.getState(), 'chase');

  const flock = [
    { x: 0, y: 0, velocityX: 10, velocityY: 0 },
    { x: 10, y: 0, velocityX: 10, velocityY: 0 },
    { x: 0, y: 10, velocityX: 10, velocityY: 0 },
  ];
  const steering = computeGroupSteering(flock[0], flock, { maxSpeed: 50 });
  assert.equal(steering.neighbors >= 1, true);
}
