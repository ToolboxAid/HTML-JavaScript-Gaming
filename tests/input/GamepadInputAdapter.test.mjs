/*
Toolbox Aid
David Quesenberry
03/24/2026
GamepadInputAdapter.test.mjs
*/
import assert from 'node:assert/strict';
import GamepadInputAdapter from '../../engine/input/GamepadInputAdapter.js';

function createInputService({
  axes = [0, 0],
  down = {},
  pressed = {},
  connected = true,
} = {}) {
  return {
    getGamepad() {
      return {
        connected,
        id: 'Pad',
        index: 0,
        axes,
        isDown(buttonIndex) {
          return Boolean(down[buttonIndex]);
        },
        isPressed(buttonIndex) {
          return Boolean(pressed[buttonIndex]);
        },
      };
    },
  };
}

function testAppliesDeadzoneAndNormalization() {
  const adapter = new GamepadInputAdapter({
    deadzone: 0.2,
    axes: { moveX: 0, moveY: 1 },
  });

  const insideDeadzone = adapter.read(createInputService({ axes: [0.1, -0.19] }));
  assert.equal(insideDeadzone.getAxis('moveX'), 0);
  assert.equal(insideDeadzone.getAxis('moveY'), 0);

  const outsideDeadzone = adapter.read(createInputService({ axes: [0.6, -1] }));
  assert.equal(outsideDeadzone.getAxis('moveX') > 0.49, true);
  assert.equal(outsideDeadzone.getAxis('moveX') < 0.51, true);
  assert.equal(outsideDeadzone.getAxis('moveY'), -1);
}

function testMapsNamedButtons() {
  const adapter = new GamepadInputAdapter({
    buttons: { confirm: 0, cancel: 1, start: 9 },
  });

  const snapshot = adapter.read(createInputService({
    down: { 0: true, 9: true },
    pressed: { 1: true },
  }));

  assert.equal(snapshot.isDown('confirm'), true);
  assert.equal(snapshot.isDown('start'), true);
  assert.equal(snapshot.isPressed('cancel'), true);
  assert.equal(snapshot.isPressed('confirm'), false);
}

export function run() {
  testAppliesDeadzoneAndNormalization();
  testMapsNamedButtons();
}
