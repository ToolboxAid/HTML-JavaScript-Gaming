/*
Toolbox Aid
David Quesenberry
03/25/2026
PacmanLiteValidation.test.mjs
*/
import assert from 'node:assert/strict';
import PacmanLiteScene from '../../games/PacmanLite/game/PacmanLiteScene.js';
import { bootPacmanLite } from '../../games/PacmanLite/main.js';

function createMutableInput() {
  let down = new Set();
  let pressed = new Set();
  let gamepads = [];
  return {
    setState(codesDown = [], codesPressed = [], nextGamepads = null) {
      down = new Set(codesDown);
      pressed = new Set(codesPressed);
      if (nextGamepads) gamepads = nextGamepads;
    },
    isDown(code) { return down.has(code); },
    isPressed(code) { return pressed.has(code); },
    getGamepad(index = 0) { return gamepads.find((pad) => pad.index === index) ?? null; },
    getGamepads() { return gamepads; },
  };
}

export async function run() {
  const none = bootPacmanLite({ documentRef: null });
  assert.equal(none, null);

  const noCanvas = bootPacmanLite({
    documentRef: { getElementById: () => null },
  });
  assert.equal(noCanvas, null);

  let setSceneCalled = false;
  class FakeEngine {
    constructor(options) {
      this.canvas = options.canvas;
      this.input = options.input;
      this.fullscreen = { getState: () => ({ available: false, active: false }), request: async () => {} };
    }
    setScene(scene) { setSceneCalled = scene instanceof PacmanLiteScene; }
    start() {}
  }
  const booted = bootPacmanLite({
    documentRef: { getElementById: (id) => (id === 'game' ? { addEventListener() {}, style: {} } : null) },
    EngineClass: FakeEngine,
    InputServiceClass: class { isDown() { return false; } isPressed() { return false; } getGamepad() { return null; } getGamepads() { return []; } },
  });
  assert.equal(Boolean(booted), true);
  assert.equal(setSceneCalled, true);

  const input = createMutableInput();
  const scene = new PacmanLiteScene();
  scene.enter({ input, canvas: { style: {} } });
  input.setState([], ['Enter']);
  scene.update(1 / 60);
  assert.equal(scene.world.status, 'playing');
}
