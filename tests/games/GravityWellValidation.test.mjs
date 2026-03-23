/*
 Toolbox Aid
 David Quesenberry
 03/23/2026
 GravityWellValidation.test.mjs
*/
import assert from 'node:assert/strict';
import GravityWellScene from '../../games/GravityWell/game/GravityWellScene.js';
import { bootGravityWell } from '../../games/GravityWell/main.js';

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

function createEngineWithInput(activeKeys = []) {
  const keys = new Set(activeKeys);
  return {
    canvas: {
      style: {},
    },
    input: {
      isDown(code) {
        return keys.has(code);
      },
    },
  };
}

export async function run() {
  let unexpectedConstruction = false;
  const noDocumentEngine = bootGravityWell({
    documentRef: null,
    EngineClass: class {
      constructor() {
        unexpectedConstruction = true;
      }
    },
    InputServiceClass: class {
      constructor() {
        unexpectedConstruction = true;
      }
    },
  });
  assert.equal(noDocumentEngine, null);
  assert.equal(unexpectedConstruction, false);

  unexpectedConstruction = false;
  const noCanvasEngine = bootGravityWell({
    documentRef: {
      getElementById() {
        return null;
      },
    },
    EngineClass: class {
      constructor() {
        unexpectedConstruction = true;
      }
    },
    InputServiceClass: class {
      constructor() {
        unexpectedConstruction = true;
      }
    },
  });
  assert.equal(noCanvasEngine, null);
  assert.equal(unexpectedConstruction, false);

  const bootCanvas = createCanvas();
  let createdInput = null;
  let installedScene = null;
  let started = 0;
  let requestCount = 0;
  let fullscreenState = { available: true, active: false };
  class TestInputService {
    constructor() {
      this.kind = 'gravity-input';
      createdInput = this;
    }

    isDown() {
      return false;
    }
  }
  class TestScene {
    constructor() {
      this.kind = 'gravity-scene';
    }
  }
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
          requestCount += 1;
          return true;
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

  const bootedEngine = bootGravityWell({
    documentRef: {
      getElementById(id) {
        return id === 'game' ? bootCanvas : null;
      },
    },
    EngineClass: TestEngine,
    InputServiceClass: TestInputService,
    SceneClass: TestScene,
  });

  assert.equal(bootedEngine instanceof TestEngine, true);
  assert.equal(bootedEngine.options.canvas, bootCanvas);
  assert.equal(bootedEngine.options.width, 960);
  assert.equal(bootedEngine.options.height, 720);
  assert.equal(bootedEngine.options.fixedStepMs, 1000 / 60);
  assert.equal(bootedEngine.options.input, createdInput);
  assert.equal(started, 1);
  assert.equal(installedScene.kind, 'gravity-scene');

  await bootCanvas.trigger('click');
  assert.equal(requestCount, 1);

  fullscreenState = { available: false, active: false };
  await bootCanvas.trigger('click');
  assert.equal(requestCount, 1);

  fullscreenState = { available: true, active: true };
  await bootCanvas.trigger('click');
  assert.equal(requestCount, 1);

  const noFullscreenCanvas = createCanvas();
  const noFullscreenEngine = bootGravityWell({
    documentRef: {
      getElementById(id) {
        return id === 'game' ? noFullscreenCanvas : null;
      },
    },
    EngineClass: class {
      constructor(options) {
        this.canvas = options.canvas;
      }

      setScene() {}

      start() {}
    },
    InputServiceClass: class {
      isDown() {
        return false;
      }
    },
    SceneClass: class {},
  });
  assert.equal(Boolean(noFullscreenEngine), true);
  await noFullscreenCanvas.trigger('click');

  const menuScene = new GravityWellScene();
  const menuEngine = createEngineWithInput(['Enter']);
  menuScene.update(0.016, menuEngine);
  assert.equal(menuScene.phase, 'playing');
  assert.equal(menuScene.world.elapsedSeconds, 0);
  assert.equal(menuScene.world.collectedCount, 0);

  const wonScene = new GravityWellScene();
  const wonEngine = createEngineWithInput();
  wonScene.phase = 'playing';
  let wonUpdateCalls = 0;
  wonScene.world.update = () => {
    wonUpdateCalls += 1;
    return { status: 'won', collectedBeacon: false };
  };
  wonScene.update(0.016, wonEngine);
  assert.equal(wonUpdateCalls, 1);
  assert.equal(wonScene.phase, 'won');

  wonScene.world.elapsedSeconds = 9;
  wonScene.world.collectedCount = 2;
  wonScene.lastEnterPressed = false;
  wonScene.update(0.016, createEngineWithInput(['Enter']));
  assert.equal(wonScene.phase, 'playing');
  assert.equal(wonScene.world.elapsedSeconds, 0);
  assert.equal(wonScene.world.collectedCount, 0);

  const lostScene = new GravityWellScene();
  const lostEngine = createEngineWithInput();
  lostScene.phase = 'playing';
  let lostUpdateCalls = 0;
  lostScene.world.update = () => {
    lostUpdateCalls += 1;
    return { status: 'lost', collectedBeacon: false };
  };
  lostScene.update(0.016, lostEngine);
  assert.equal(lostUpdateCalls, 1);
  assert.equal(lostScene.phase, 'lost');

  lostScene.world.elapsedSeconds = 4;
  lostScene.world.collectedCount = 1;
  lostScene.lastEnterPressed = false;
  lostScene.update(0.016, createEngineWithInput(['Enter']));
  assert.equal(lostScene.phase, 'playing');
  assert.equal(lostScene.world.elapsedSeconds, 0);
  assert.equal(lostScene.world.collectedCount, 0);
}
