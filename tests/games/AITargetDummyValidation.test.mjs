/*
Toolbox Aid
David Quesenberry
03/25/2026
AITargetDummyValidation.test.mjs
*/
import assert from 'node:assert/strict';
import AITargetDummyScene from '../../games/AITargetDummy/game/AITargetDummyScene.js';
import { bootAITargetDummy } from '../../games/AITargetDummy/main.js';

function createCanvas() {
  return {
    style: {},
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

export async function run() {
  let constructed = false;
  const noDocument = bootAITargetDummy({
    documentRef: null,
    EngineClass: class {
      constructor() {
        constructed = true;
      }
    },
  });
  assert.equal(noDocument, null);
  assert.equal(constructed, false);

  const noCanvas = bootAITargetDummy({
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

  const booted = bootAITargetDummy({
    documentRef: {
      getElementById(id) {
        return id === 'game' ? canvas : null;
      },
    },
    EngineClass: TestEngine,
    InputServiceClass: class {
      isDown() { return false; }
      isPressed() { return false; }
      getGamepad() { return null; }
      getGamepads() { return []; }
    },
  });
  assert.equal(Boolean(booted), true);
  assert.equal(started, 1);
  assert.equal(installedScene instanceof AITargetDummyScene, true);

  const input = createMutableInput();
  const scene = new AITargetDummyScene();
  scene.enter({ input, canvas });
  assert.equal(scene.world.status, 'menu');

  input.setState([], ['Enter']);
  scene.update(1 / 60);
  assert.equal(scene.world.status, 'playing');

  const before = scene.world.player.x;
  input.setState(['ArrowRight'], []);
  scene.update(0.1);
  assert.equal(scene.world.player.x > before, true);

  input.setState([], ['KeyP']);
  scene.update(1 / 60);
  assert.equal(scene.isPaused, true);
}
