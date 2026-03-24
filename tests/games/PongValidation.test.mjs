/*
Toolbox Aid
David Quesenberry
03/24/2026
PongValidation.test.mjs
*/
import assert from 'node:assert/strict';
import PongScene from '../../games/pong/game/PongScene.js';
import { bootPong } from '../../games/pong/main.js';

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

function createInput(codesDown = [], codesPressed = []) {
  const down = new Set(codesDown);
  const pressed = new Set(codesPressed);
  return {
    isDown(code) {
      return down.has(code);
    },
    isPressed(code) {
      return pressed.has(code);
    },
    getGamepad() {
      return null;
    },
  };
}

export async function run() {
  let constructed = false;
  const noDocument = bootPong({
    documentRef: null,
    EngineClass: class {
      constructor() {
        constructed = true;
      }
    },
    InputServiceClass: class {
      constructor() {
        constructed = true;
      }
    },
  });
  assert.equal(noDocument, null);
  assert.equal(constructed, false);

  const noCanvas = bootPong({
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
      this.options = options;
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

  const booted = bootPong({
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
  assert.equal(installedScene instanceof PongScene, true);
  await canvas.trigger('click');
  assert.equal(fullscreenRequests, 1);
  fullscreenState = { available: false, active: false };
  await canvas.trigger('click');
  assert.equal(fullscreenRequests, 1);

  const scene = new PongScene();
  const engine = { input: createInput(['ArrowDown'], []), canvas: { style: {} } };
  scene.update(0.016, engine);
  scene.update(0.016, { input: createInput([], []), canvas: { style: {} } });
  assert.equal(scene.selectedModeIndex, 1);

  scene.update(0.016, { input: createInput([], ['Enter']), canvas: { style: {} } });
  assert.equal(scene.phase, 'playing');
  assert.equal(scene.world.modeKey, 'hockey');

  scene.world.status = 'won';
  scene.update(0.016, { input: createInput([], ['Enter']), canvas: { style: {} } });
  assert.equal(scene.world.status, 'serve');

  scene.update(0.016, { input: createInput([], ['Escape']), canvas: { style: {} } });
  assert.equal(scene.phase, 'menu');
}
