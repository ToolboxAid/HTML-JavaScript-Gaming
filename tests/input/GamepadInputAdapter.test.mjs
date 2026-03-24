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
  pads = null,
} = {}) {
  return {
    getGamepad(index = 0) {
      if (Array.isArray(pads)) {
        return pads.find((pad) => pad?.index === index) ?? null;
      }
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
    getGamepads() {
      if (Array.isArray(pads)) {
        return pads;
      }
      return connected ? [this.getGamepad(0)] : [];
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
  assert.equal(outsideDeadzone.leftStick.x > 0.49 && outsideDeadzone.leftStick.x < 0.51, true);
  assert.equal(outsideDeadzone.leftStick.y, -1);
  assert.equal(outsideDeadzone.horizontal > 0.49 && outsideDeadzone.horizontal < 0.51, true);
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
  assert.equal(snapshot.leftShoulderPressed, false);
  assert.equal(snapshot.rightShoulderPressed, false);
  assert.equal(snapshot.rightStick.x > 0.12 && snapshot.rightStick.x < 0.13, true);
  assert.equal(snapshot.rightStick.y < -0.24 && snapshot.rightStick.y > -0.26, true);
}

function testMapsShoulderPressesAsEdgeTriggeredActions() {
  const adapter = new GamepadInputAdapter({
    input: createInputService({
      pressed: { 4: true, 5: true },
    }),
  });

  const snapshot = adapter.getPad(0);
  assert.equal(snapshot.leftShoulderDown, false);
  assert.equal(snapshot.rightShoulderDown, false);
  assert.equal(snapshot.leftShoulderPressed, true);
  assert.equal(snapshot.rightShoulderPressed, true);
}

function testListsConnectedPadsInStableOrder() {
  const adapter = new GamepadInputAdapter({
    input: createInputService({
      pads: [
        { index: 2, connected: true, axes: [0, 0], isDown: () => false, isPressed: () => false },
        { index: 0, connected: true, axes: [0, 0], isDown: () => false, isPressed: () => false },
        { index: 1, connected: false, axes: [0, 0], isDown: () => false, isPressed: () => false },
      ],
    }),
  });

  assert.deepEqual(adapter.listConnectedIndices(), [0, 2]);
}

function testFallsBackCleanlyWhenGamepadsReconnect() {
  let pads = [
    { index: 0, connected: true, id: 'Primary', mapping: 'standard', axes: [0, 0.75], isDown: () => false, isPressed: () => false },
  ];
  const input = {
    getGamepad(index = 0) {
      return pads.find((pad) => pad.index === index) ?? null;
    },
    getGamepads() {
      return pads;
    },
  };

  const adapter = new GamepadInputAdapter({ input });
  assert.deepEqual(adapter.listConnectedIndices(), [0]);
  assert.equal(adapter.getPad(0).vertical > 0.68, true);

  pads = [
    { index: 2, connected: true, id: 'Reconnected', mapping: 'standard', axes: [0, -0.6], isDown: () => false, isPressed: () => false },
  ];

  assert.deepEqual(adapter.listConnectedIndices(), [2]);
  assert.equal(adapter.getPad(2).vertical < -0.49, true);
}

export function run() {
  testAppliesDeadzoneAndDigitalOverrides();
  testMapsSemanticButtons();
  testMapsShoulderPressesAsEdgeTriggeredActions();
  testListsConnectedPadsInStableOrder();
  testFallsBackCleanlyWhenGamepadsReconnect();
}
