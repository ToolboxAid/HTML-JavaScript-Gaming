/*
Toolbox Aid
David Quesenberry
03/24/2026
SolarSystemValidation.test.mjs
*/
import assert from 'node:assert/strict';
import SolarSystemScene from '../../games/SolarSystem/game/SolarSystemScene.js';
import { bootSolarSystem } from '../../games/SolarSystem/main.js';

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
  return {
    setState(codesDown = []) {
      down = new Set(codesDown);
    },
    isDown(code) {
      return down.has(code);
    },
    isPressed() {
      return false;
    },
    getGamepad() {
      return null;
    },
  };
}

export async function run() {
  let constructed = false;
  const noDocument = bootSolarSystem({
    documentRef: null,
    EngineClass: class {
      constructor() {
        constructed = true;
      }
    },
  });
  assert.equal(noDocument, null);
  assert.equal(constructed, false);

  const noCanvas = bootSolarSystem({
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

  const booted = bootSolarSystem({
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
  assert.equal(installedScene instanceof SolarSystemScene, true);
  await canvas.trigger('click');
  assert.equal(fullscreenRequests, 1);
  fullscreenState = { available: false, active: false };
  await canvas.trigger('click');
  assert.equal(fullscreenRequests, 1);

  const input = createMutableInput();
  const scene = new SolarSystemScene();
  const elapsedBefore = scene.world.elapsedDays;

  input.setState(['Digit4']);
  scene.update(1, { input });
  assert.equal(scene.world.getTimeScale().label, 'x200');
  assert.equal(scene.world.elapsedDays > elapsedBefore, true);

  input.setState(['KeyL']);
  scene.update(0, { input });
  assert.equal(scene.world.labelsVisible, false);

  input.setState(['KeyP']);
  scene.update(0.016, { input });
  assert.equal(scene.isPaused, true);
  const pausedDays = scene.world.elapsedDays;
  input.setState([]);
  scene.update(1, { input });
  assert.equal(scene.world.elapsedDays, pausedDays);

  input.setState(['KeyP']);
  scene.update(0.016, { input });
  assert.equal(scene.isPaused, false);

  input.setState(['KeyR']);
  scene.update(0, { input });
  assert.equal(scene.world.elapsedDays, 0);
}
