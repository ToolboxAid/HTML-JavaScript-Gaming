/*
Toolbox Aid
David Quesenberry
03/24/2026
GravityValidation.test.mjs
*/
import assert from 'node:assert/strict';
import GravityScene from '../../samples/phase-03/0325/game/GravityScene.js';
import { bootGravity } from '../../samples/phase-03/0325/main.js';

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
  const noDocument = bootGravity({
    documentRef: null,
    EngineClass: class {
      constructor() {
        constructed = true;
      }
    },
  });
  assert.equal(noDocument, null);
  assert.equal(constructed, false);

  const noCanvas = bootGravity({
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
  let fullscreenRequests = 0;
  let fullscreenState = { available: true, active: false };
  class TestEngine {
    constructor(options) {
      this.canvas = options.canvas;
      this.input = options.input;
      this.fullscreen = {
        getState() {
          return fullscreenState;
        },
        async request() {
          fullscreenRequests += 1;
        },
      };
    }

    setScene(scene) {
      installedScene = scene;
    }

    start() {
      started += 1;
    }
  }

  const booted = bootGravity({
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
  assert.equal(installedScene instanceof GravityScene, true);
  await canvas.trigger('click');
  assert.equal(fullscreenRequests, 1);
  fullscreenState = { available: false, active: false };
  await canvas.trigger('click');
  assert.equal(fullscreenRequests, 1);

  const input = createMutableInput();
  const scene = new GravityScene();
  scene.enter({ input, canvas: { style: {} } });

  input.setState([], ['Enter']);
  scene.update(0.016);
  assert.equal(scene.world.status, 'playing');

  input.setState(['ArrowRight'], []);
  const beforeVx = scene.world.ball.vx;
  scene.update(0.1);
  assert.equal(scene.world.ball.vx > beforeVx, true);

  input.setState([], ['KeyP']);
  scene.update(0.016);
  assert.equal(scene.isPaused, true);
  const pausedY = scene.world.ball.y;
  input.setState(['ArrowRight'], []);
  scene.update(0.2);
  assert.equal(scene.world.ball.y, pausedY);

  input.setState([], ['KeyP']);
  scene.update(0.016);
  assert.equal(scene.isPaused, false);

  input.setState([], ['KeyR']);
  scene.update(0.016);
  assert.equal(scene.world.status, 'menu');

  input.setState([], [], [createPad(2, { axes: [0.75, 0], pressed: { 0: true } })]);
  scene.update(0.016);
  assert.equal(scene.world.status, 'playing');
  const padStartX = scene.world.ball.x;
  scene.update(0.2);
  assert.equal(scene.world.ball.x > padStartX, true);
}
