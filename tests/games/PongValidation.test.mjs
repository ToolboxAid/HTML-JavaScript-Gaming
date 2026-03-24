/*
Toolbox Aid
David Quesenberry
03/24/2026
PongValidation.test.mjs
*/
import assert from 'node:assert/strict';
import PongScene from '../../games/Pong/game/PongScene.js';
import { bootPong } from '../../games/Pong/main.js';

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
  down = {},
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
      return Boolean(down[buttonIndex]);
    },
    isPressed(buttonIndex) {
      return Boolean(pressed[buttonIndex]);
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
  const input = createMutableInput();
  const engine = { input, canvas: { style: {} } };
  scene.enter(engine);
  input.setState([], ['KeyM']);
  scene.update(0.016, engine);
  assert.equal(scene.mode.key, 'hockey');
  assert.equal(scene.roundOver, true);
  input.setState(['KeyD'], []);
  scene.update(0.25, engine);
  assert.equal(scene.leftPaddle.x > 54, true);
  assert.equal(scene.leftPaddle.x <= (480 - 44), true);

  input.setState([], ['Enter']);
  scene.update(0.016, engine);
  assert.equal(scene.roundOver, false);
  assert.equal(scene.getBallSpeed() > 0, true);
  assert.equal(Math.abs(scene.ball.x - 480) < 10, true);
  assert.equal(scene.leftPaddle.x > 54, true);
  assert.equal(scene.rightPaddle.x, 892);

  input.setState([], ['KeyP']);
  scene.update(0.016, engine);
  assert.equal(scene.isPaused, true);
  input.setState([], ['KeyP']);
  scene.update(0.016, engine);
  assert.equal(scene.isPaused, false);

  input.setState([], ['KeyX']);
  scene.update(0.016, engine);
  assert.equal(scene.roundOver, true);
  assert.equal(scene.isPaused, false);
  assert.equal(scene.ball.vx, 0);
  assert.equal(scene.ball.vy, 0);

  scene.roundOver = true;
  scene.messageText = 'ready';
  input.setState([], ['KeyN']);
  scene.update(0.016, engine);
  assert.equal(scene.mode.key, 'tennis');

  input.setState([], ['KeyM']);
  scene.update(0.016, engine);
  assert.equal(scene.mode.key, 'hockey');
  input.setState([], ['KeyM']);
  scene.update(0.016, engine);
  assert.equal(scene.mode.key, 'handball');
  assert.equal(scene.leftPaddle.x, 54);
  input.setState([], ['KeyM']);
  scene.update(0.016, engine);
  assert.equal(scene.mode.key, 'jai-alai');
  assert.equal(scene.leftPaddle.x, 54);

  scene.applyMode();
  input.setState([], [], [createPad(0, { axes: [0, 0.75] })]);
  scene.update(0.2, engine);
  assert.equal(scene.leftPaddle.y > (380 - scene.leftPaddle.height / 2), true);

  scene.setMode(1);
  scene.applyMode();
  input.setState([], [], [createPad(2, { axes: [0.65, 0] })]);
  scene.update(0.2, engine);
  assert.equal(scene.leftPaddle.x > 54, true);

  scene.setMode(0);
  scene.applyMode();
  input.setState([], [], [createPad(0, { down: { 5: true } })]);
  scene.update(0.016, engine);
  assert.equal(scene.mode.key, 'tennis');
  input.setState([], [], [createPad(0, { pressed: { 5: true } })]);
  scene.update(0.016, engine);
  assert.equal(scene.mode.key, 'hockey');

  const serveScene = new PongScene();
  const serveInput = createMutableInput();
  const serveEngine = { input: serveInput, canvas: { style: {} } };
  serveScene.enter(serveEngine);
  serveScene.setMode(0);
  serveInput.setState([], [], [createPad(3, { pressed: { 0: true } })]);
  serveScene.update(0.016, serveEngine);
  assert.equal(serveScene.roundOver, false);
}
