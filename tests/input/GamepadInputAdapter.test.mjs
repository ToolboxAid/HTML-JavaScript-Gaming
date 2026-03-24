/*
Toolbox Aid
David Quesenberry
03/24/2026
GamepadInputAdapter.test.mjs
*/
import assert from 'node:assert/strict';
import GamepadInputAdapter from '../../engine/input/GamepadInputAdapter.js';

function createInputService({
  axes = [0, 0, 0, 0],
  down = {},
  pressed = {},
  connected = true,
} = {}) {
  return {
    getGamepad(index = 0) {
      if (index !== 0) {
        return null;
      }
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

function testAppliesDeadzoneAndDigitalOverrides() {
  const adapter = new GamepadInputAdapter({
    input: createInputService({ axes: [0.1, -0.19] }),
    deadzone: 0.2,
  });

  const insideDeadzone = adapter.getPad(0);
  assert.equal(insideDeadzone.leftStick.x, 0);
  assert.equal(insideDeadzone.leftStick.y, 0);
  assert.equal(insideDeadzone.horizontal, 0);
  assert.equal(insideDeadzone.vertical, 0);

  adapter.setInput(createInputService({
    axes: [0.6, -1],
    down: { 12: true },
  }));
  const outsideDeadzone = adapter.getPad(0);
  assert.equal(outsideDeadzone.leftStick.x, 0.6);
  assert.equal(outsideDeadzone.leftStick.y, -1);
  assert.equal(outsideDeadzone.horizontal, 0.6);
  assert.equal(outsideDeadzone.vertical, -1);
}

function testMapsSemanticButtons() {
  const adapter = new GamepadInputAdapter({
    input: createInputService({
      axes: [0, 0, 0.3, -0.4],
    down: { 0: true, 9: true },
      pressed: { 1: true, 9: true },
    }),
  });

  const snapshot = adapter.getPad(0);
  assert.equal(snapshot.confirmDown, true);
  assert.equal(snapshot.confirmPressed, false);
  assert.equal(snapshot.cancelPressed, true);
  assert.equal(snapshot.startPressed, true);
  assert.equal(snapshot.rightStick.x, 0.3);
  assert.equal(snapshot.rightStick.y, -0.4);
}

export function run() {
  testAppliesDeadzoneAndDigitalOverrides();
  testMapsSemanticButtons();
}
