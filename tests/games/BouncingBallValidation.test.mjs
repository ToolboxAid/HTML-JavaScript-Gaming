/*
Toolbox Aid
David Quesenberry
03/24/2026
BouncingBallValidation.test.mjs
*/
import assert from 'node:assert/strict';
import BouncingBallScene from '../../games/bouncing-ball/game/BouncingBallScene.js';
import { bootBouncingBall } from '../../games/bouncing-ball/main.js';

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
  let pressed = new Set();
  let gamepads = [];
  return {
    setState(codesPressed = [], nextGamepads = null) {
      pressed = new Set(codesPressed);
      if (nextGamepads) {
        gamepads = nextGamepads;
      }
    },
    isDown() {
      return false;
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
  pressed = {},
  connected = true,
} = {}) {
  return {
    index,
    connected,
    id: `Pad-${index}`,
    mapping: 'standard',
    axes: [0, 0, 0, 0],
    isDown() {
      return false;
    },
    isPressed(buttonIndex) {
      return Boolean(pressed[buttonIndex]);
    },
  };
}

export async function run() {
  let constructed = false;
  const noDocument = bootBouncingBall({
    documentRef: null,
    EngineClass: class {
      constructor() {
        constructed = true;
      }
    },
  });
  assert.equal(noDocument, null);
  assert.equal(constructed, false);

  const noCanvas = bootBouncingBall({
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

  const booted = bootBouncingBall({
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
  assert.equal(installedScene instanceof BouncingBallScene, true);
  await canvas.trigger('click');
  assert.equal(fullscreenRequests, 1);
  fullscreenState = { available: false, active: false };
  await canvas.trigger('click');
  assert.equal(fullscreenRequests, 1);

  const input = createMutableInput();
  const scene = new BouncingBallScene();
  scene.enter({ input, canvas: { style: {} } });

  input.setState(['Enter']);
  scene.update(0.016);
  assert.equal(scene.world.status, 'playing');

  input.setState(['KeyP']);
  scene.update(0.016);
  assert.equal(scene.isPaused, true);
  const pausedX = scene.world.ball.x;
  input.setState([]);
  scene.update(0.2);
  assert.equal(scene.world.ball.x, pausedX);

  input.setState(['KeyP']);
  scene.update(0.016);
  assert.equal(scene.isPaused, false);

  input.setState(['KeyR']);
  scene.update(0.016);
  assert.equal(scene.world.status, 'menu');

  input.setState([], [createPad(2, { pressed: { 0: true } })]);
  scene.update(0.016);
  assert.equal(scene.world.status, 'playing');
}
