/*
Toolbox Aid
David Quesenberry
03/24/2026
ThrusterValidation.test.mjs
*/
import assert from 'node:assert/strict';
import ThrusterScene from '../../samples/phase-04/0413/game/ThrusterScene.js';
import { bootThruster } from '../../samples/phase-04/0413/main.js';

function createCanvas() {
  const listeners = new Map();
  return {
    style: {},
    addEventListener(type, handler) {
      listeners.set(type, handler);
    },
    async trigger(type) {
      return listeners.get(type)?.();
    },
  };
}

function createMutableInput() {
  let down = new Set();
  let pressed = new Set();
  let gamepads = [];
  return {
    setState(codesDown = [], codesPressed = [], nextGamepads = null) {
      down = new Set(codesDown);
      pressed = new Set(codesPressed);
      if (nextGamepads) {
        gamepads = nextGamepads;
      }
    },
    isDown(code) {
      return down.has(code);
    },
    isPressed(code) {
      return pressed.has(code);
    },
    getGamepad(index = 0) {
      return gamepads.find((pad) => pad.index === index) ?? null;
    },
    getGamepads() {
      return gamepads;
    },
  };
}

function createPad(index, {
  axes = [0, 0, 0, 0],
  pressed = {},
  connected = true,
} = {}) {
  return {
    index,
    connected,
    id: `Pad-${index}`,
    mapping: 'standard',
    axes,
    isDown(buttonIndex) {
      return Boolean(pressed[buttonIndex]);
    },
    isPressed(buttonIndex) {
      return Boolean(pressed[buttonIndex]);
    },
  };
}

export async function run() {
  let constructed = false;
  const noDocument = bootThruster({
    documentRef: null,
    EngineClass: class {
      constructor() {
        constructed = true;
      }
    },
  });
  assert.equal(noDocument, null);
  assert.equal(constructed, false);

  const noCanvas = bootThruster({
    documentRef: {
      getElementById() {
        return null;
      },
    },
  });
  assert.equal(noCanvas, null);

  const canvas = createCanvas();
  let installedScene = null;
  let started = 0;
  class TestEngine {
    constructor(options) {
      this.canvas = options.canvas;
      this.input = options.input;
    }

    setScene(scene) {
      installedScene = scene;
    }

    start() {
      started += 1;
    }
  }

  const booted = bootThruster({
    documentRef: {
      getElementById(id) {
        return id === 'game' ? canvas : null;
      },
    },
    EngineClass: TestEngine,
    InputServiceClass: class {
      isDown() {
        return false;
      }
      isPressed() {
        return false;
      }
      getGamepad() {
        return null;
      }
    },
  });

  assert.equal(Boolean(booted), true);
  assert.equal(started, 1);
  assert.equal(installedScene instanceof ThrusterScene, true);
  await canvas.trigger('click');

  const input = createMutableInput();
  const scene = new ThrusterScene();
  scene.enter({ input, canvas: { style: {} } });

  input.setState([], ['Enter']);
  scene.update(0.016);
  assert.equal(scene.world.status, 'playing');

  input.setState(['ArrowRight'], []);
  const startAngle = scene.world.ship.angle;
  scene.update(0.1);
  assert.equal(scene.world.ship.angle > startAngle, true);

  input.setState(['ArrowUp'], []);
  const beforeVy = scene.world.ship.vy;
  scene.update(0.1);
  assert.equal(scene.world.ship.vy < beforeVy, true);

  input.setState([], ['KeyP']);
  scene.update(0.016);
  assert.equal(scene.isPaused, true);
  const pausedX = scene.world.ship.x;
  input.setState(['ArrowUp'], []);
  scene.update(0.2);
  assert.equal(scene.world.ship.x, pausedX);

  input.setState([], ['KeyP']);
  scene.update(0.016);
  assert.equal(scene.isPaused, false);

  input.setState([], ['KeyR']);
  scene.update(0.016);
  assert.equal(scene.world.status, 'menu');

  input.setState([], [], [createPad(2, { axes: [0.75, 0], pressed: { 0: true } })]);
  scene.update(0.016);
  assert.equal(scene.world.status, 'playing');
  const padAngle = scene.world.ship.angle;
  scene.update(0.1);
  assert.equal(scene.world.ship.angle > padAngle, true);
}
