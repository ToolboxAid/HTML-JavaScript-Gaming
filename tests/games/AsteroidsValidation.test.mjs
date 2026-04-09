/*
 Toolbox Aid
 David Quesenberry
 03/23/2026
 AsteroidsValidation.test.mjs
*/
import assert from 'node:assert/strict';
import Engine from '/src/engine/core/Engine.js';
import AsteroidsGameScene from '../../games/Asteroids/game/AsteroidsGameScene.js';
import AsteroidsSession from '../../games/Asteroids/game/AsteroidsSession.js';
import AsteroidsWorld from '../../games/Asteroids/game/AsteroidsWorld.js';
import { bootAsteroids } from '../../games/Asteroids/main.js';

function createCanvas() {
  const listeners = new Map();
  const canvas = {
    width: 0,
    height: 0,
    style: {},
    addEventListener(type, handler) {
      listeners.set(type, handler);
    },
    trigger(type) {
      return listeners.get(type)?.();
    },
    getContext() {
      return context;
    },
  };

  const context = {
    canvas,
    clearRect() {},
    fillRect() {},
    strokeRect() {},
    beginPath() {},
    arc() {},
    fill() {},
    moveTo() {},
    lineTo() {},
    stroke() {},
    closePath() {},
    fillText() {},
    drawImage() {},
  };

  return canvas;
}

function createEngine({ canvas = createCanvas(), input = null } = {}) {
  return new Engine({
    canvas,
    input: input ?? {
      attach() {},
      detach() {},
      update() {},
      isDown() {
        return false;
      },
    },
    audio: {
      update() {},
    },
    metrics: {
      recordFrame() {},
    },
    fullscreen: {
      attach() {},
      detach() {},
      getState() {
        return { available: false, active: false };
      },
      async request() {
        return false;
      },
    },
    logger: {
      debug() {},
      info() {},
      warn() {},
      error() {},
    },
  });
}

function createWorldEvents() {
  return {
    explosions: [],
    scoreEvents: [],
    shipDestroyed: false,
    shipDestroyedState: null,
    shipRespawned: false,
    waveCleared: false,
    sfx: [],
  };
}

function withBlockedLocalStorage(run) {
  const originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');

  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    get() {
      throw new Error('blocked');
    },
  });

  try {
    run();
  } finally {
    if (originalDescriptor) {
      Object.defineProperty(globalThis, 'localStorage', originalDescriptor);
    } else {
      delete globalThis.localStorage;
    }
  }
}

export async function run() {
  const missingCanvasDocument = {
    documentElement: { style: {} },
    body: { style: {} },
    getElementById() {
      return null;
    },
  };
  const missingCanvasEngine = await bootAsteroids({
    documentRef: missingCanvasDocument,
    EngineClass: class {
      constructor() {
        throw new Error('Engine should not boot without a canvas.');
      }
    },
    InputServiceClass: class {
      constructor() {
        throw new Error('Input should not initialize without a canvas.');
      }
    },
  });
  assert.equal(missingCanvasEngine, null);

  const fullscreenStates = [
    { available: false, active: false },
    { available: true, active: false },
    { available: true, active: true },
  ];
  let fullscreenReads = 0;
  let fullscreenRequests = 0;
  let startCount = 0;
  let sceneInstance = null;
  const bootCanvas = createCanvas();
  const bootDocument = {
    documentElement: { style: {} },
    body: { style: {} },
    fonts: {
      async load() {
        throw new Error('font load failed');
      },
    },
    getElementById(id) {
      return id === 'game' ? bootCanvas : null;
    },
  };
  const previousDocument = globalThis.document;
  globalThis.document = bootDocument;
  try {
    const bootedEngine = await bootAsteroids({
      documentRef: bootDocument,
      EngineClass: class {
        constructor({ canvas, input }) {
          this.canvas = canvas;
          this.input = input;
          this.fullscreen = {
            getState() {
              const state = fullscreenStates[Math.min(fullscreenReads, fullscreenStates.length - 1)];
              fullscreenReads += 1;
              return state;
            },
            async request() {
              fullscreenRequests += 1;
              return true;
            },
          };
        }

        setScene(scene) {
          sceneInstance = scene;
        }

        start() {
          startCount += 1;
        }
      },
      InputServiceClass: class {
        constructor() {
          this.kind = 'input';
        }
      },
      SceneClass: class {
        constructor() {
          this.kind = 'scene';
        }
      },
    });

    assert.equal(bootedEngine.canvas, bootCanvas);
    assert.equal(startCount, 1);
    assert.equal(sceneInstance.kind, 'scene');
    await bootCanvas.trigger('click');
    await bootCanvas.trigger('click');
    await bootCanvas.trigger('click');
    assert.equal(fullscreenRequests, 1);
  } finally {
    if (previousDocument === undefined) {
      delete globalThis.document;
    } else {
      globalThis.document = previousDocument;
    }
  }

  let capturedShowcaseOptions = null;
  const showcaseCanvas = createCanvas();
  const showcaseDocument = {
    documentElement: { style: {} },
    body: { style: {} },
    location: { search: '?debug=1&debugMode=qa' },
    getElementById(id) {
      return id === 'game' ? showcaseCanvas : null;
    },
  };
  await bootAsteroids({
    documentRef: showcaseDocument,
    InputServiceClass: class {},
    EngineClass: class {
      constructor({ canvas }) {
        this.canvas = canvas;
        this.fullscreen = {
          getState() {
            return { available: false, active: false };
          },
          async request() {
            return false;
          },
        };
      }

      setScene(scene) {
        capturedShowcaseOptions = scene.options;
      }

      start() {}
    },
    SceneClass: class {
      constructor(options) {
        this.options = options;
      }
    },
  });
  assert.equal(capturedShowcaseOptions.debugConfig.debugMode, 'qa');
  assert.equal(capturedShowcaseOptions.debugConfig.debugEnabled, true);
  assert.equal(Boolean(capturedShowcaseOptions.devConsoleIntegration), true);
  assert.equal(capturedShowcaseOptions.devConsoleIntegration.getState().overlayVisible, false);

  let capturedProductionOptions = null;
  const productionCanvas = createCanvas();
  const productionDocument = {
    documentElement: { style: {} },
    body: { style: {} },
    location: { search: '' },
    getElementById(id) {
      return id === 'game' ? productionCanvas : null;
    },
  };
  await bootAsteroids({
    documentRef: productionDocument,
    InputServiceClass: class {},
    EngineClass: class {
      constructor({ canvas }) {
        this.canvas = canvas;
        this.fullscreen = {
          getState() {
            return { available: false, active: false };
          },
          async request() {
            return false;
          },
        };
      }

      setScene(scene) {
        capturedProductionOptions = scene.options;
      }

      start() {}
    },
    SceneClass: class {
      constructor(options) {
        this.options = options;
      }
    },
  });
  assert.equal(capturedProductionOptions.debugConfig.debugMode, 'prod');
  assert.equal(capturedProductionOptions.debugConfig.debugEnabled, false);
  assert.equal(capturedProductionOptions.devConsoleIntegration, null);

  let capturedLocalOptions = null;
  const localCanvas = createCanvas();
  const localDocument = {
    documentElement: { style: {} },
    body: { style: {} },
    location: { search: '', protocol: 'file:' },
    getElementById(id) {
      return id === 'game' ? localCanvas : null;
    },
  };
  await bootAsteroids({
    documentRef: localDocument,
    InputServiceClass: class {},
    EngineClass: class {
      constructor({ canvas }) {
        this.canvas = canvas;
        this.fullscreen = {
          getState() {
            return { available: false, active: false };
          },
          async request() {
            return false;
          },
        };
      }

      setScene(scene) {
        capturedLocalOptions = scene.options;
      }

      start() {}
    },
    SceneClass: class {
      constructor(options) {
        this.options = options;
      }
    },
  });
  assert.equal(capturedLocalOptions.debugConfig.debugMode, 'dev');
  assert.equal(capturedLocalOptions.debugConfig.debugEnabled, true);
  assert.equal(Boolean(capturedLocalOptions.devConsoleIntegration), true);
  assert.equal(capturedLocalOptions.devConsoleIntegration.getState().overlayVisible, false);

  withBlockedLocalStorage(() => {
    const scene = new AsteroidsGameScene();
    assert.equal(scene.session.highScore >= 0, true);
  });

  const lifecycleCanvas = createCanvas();
  const lifecycleEngine = createEngine({
    canvas: lifecycleCanvas,
    input: {
      attach() {},
      detach() {},
      update() {},
      isDown() {
        return false;
      },
    },
  });
  const scene = new AsteroidsGameScene();
  let stopAllCount = 0;
  scene.audio = {
    stopAll() {
      stopAllCount += 1;
    },
    play() {},
    updateThrust() {},
    updateUfo() {},
  };
  scene.session.start(1);
  lifecycleEngine.setScene(scene);
  scene.update(0.016, lifecycleEngine);
  assert.equal(lifecycleCanvas.style.cursor, 'none');
  lifecycleEngine.setScene({
    enter() {},
  });
  assert.equal(stopAllCount, 1);
  assert.equal(lifecycleCanvas.style.cursor, 'default');

  const world = new AsteroidsWorld({ width: 960, height: 720 }, { rng: () => 0.25 });
  const session = new AsteroidsSession(world, {
    load: () => 0,
    save: (score) => score,
  });
  session.start(2);
  session.pendingSwapIndex = 1;
  session.pendingSwapTimer = 0;
  session.pendingSwapElapsed = 0;
  session.players[1].worldState = {
    ...world.getState(),
    wave: 4,
    ship: {
      ...world.getState().ship,
      x: 123,
      y: 234,
    },
  };
  world.ufo = null;
  world.update = () => createWorldEvents();
  session.update(0.016, {
    isDown() {
      return false;
    },
  });
  assert.equal(session.activePlayerIndex, 1);
  assert.equal(world.wave, 4);
  assert.equal(world.ship.x, 123);
  assert.equal(world.ship.y, 234);
  assert.equal(session.isTurnIntroActive(), true);
}
