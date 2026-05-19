/*
 Toolbox Aid
 David Quesenberry
 03/23/2026
 AsteroidsValidation.test.mjs
*/
import assert from 'node:assert/strict';
import Engine from '../../src/engine/core/Engine.js';
import AsteroidsGameScene from '../../games/Asteroids/game/AsteroidsGameScene.js';
import AsteroidsSession from '../../games/Asteroids/game/AsteroidsSession.js';
import AsteroidsWorld from '../../games/Asteroids/game/AsteroidsWorld.js';
import { bootAsteroidsNew as bootAsteroids } from '../../games/Asteroids/index.js';
import {
  createAsteroidsTestGeometryProfiles,
  createAsteroidsTestSceneOptions,
  loadAsteroidsManifest,
  loadAsteroidsObjectVectorPayload,
  loadAsteroidsVectorMaps
} from './asteroidsManifestObjectVectors.mjs';
import {
  ASTEROIDS_OBJECT_VECTOR_IDS,
  ASTEROIDS_REQUIRED_MANIFEST_GEOMETRY_IDS,
  getAsteroidsObjectVectorPoints,
  loadAsteroidsVectorMapsFromManifest
} from '../../games/Asteroids/game/asteroidsVectorMaps.js';

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

class TestObjectVectorRuntime {
  async loadFromManifest() {
    const payload = loadAsteroidsObjectVectorPayload();
    return {
      assetsById: new Map(),
      objectsById: new Map(payload.objects.map((object) => [object.id, object])),
      payload
    };
  }

  getDiagnostics() {
    return {
      cachedObjects: 0,
      cachedInheritedObjects: 0,
      cachedPayloads: 1,
      events: [],
      schemaLoaded: true
    };
  }
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
  const asteroidGeometryProfiles = createAsteroidsTestGeometryProfiles();
  const vectorMaps = loadAsteroidsVectorMaps();
  const worldOptions = { asteroidGeometryProfiles, vectorMaps };
  const manifestPayload = loadAsteroidsManifest();
  assert.equal(manifestPayload.tools['vector-map-editor'], undefined);
  assert.equal(Object.hasOwn(manifestPayload.tools, 'text2speech-V2'), false);
  const objectVectorPayload = manifestPayload.tools['object-vector-studio-v2'];
  assert.equal(Object.hasOwn(objectVectorPayload.vectorMaps, 'vectors'), false);
  assert.equal(Array.isArray(objectVectorPayload.vectorMaps.shapes), true);
  assert.equal(objectVectorPayload.vectorMaps.shapes.length, 0);
  assert.equal(JSON.stringify(objectVectorPayload.vectorMaps).includes('"paths"'), false);
  assert.equal(JSON.stringify(objectVectorPayload.vectorMaps).includes('"points"'), false);
  assert.equal(ASTEROIDS_OBJECT_VECTOR_IDS.bullet, 'object.asteroids.bullet');
  assert.equal(ASTEROIDS_OBJECT_VECTOR_IDS.attractAsteroid, 'object.asteroids.large-asteroid');
  assert.equal(ASTEROIDS_OBJECT_VECTOR_IDS.attractShip, 'object.asteroids.ship');
  assert.equal(ASTEROIDS_OBJECT_VECTOR_IDS.attractUfo, 'object.asteroids.large-ufo');
  assert.equal(vectorMaps.objectVectorMapsById.get(ASTEROIDS_OBJECT_VECTOR_IDS.bullet).id, 'object.asteroids.bullet');
  assert.equal(vectorMaps.objectVectorMapsById.get(ASTEROIDS_OBJECT_VECTOR_IDS.attractAsteroid).id, 'object.asteroids.large-asteroid');
  assert.equal(vectorMaps.objectVectorMapsById.get(ASTEROIDS_OBJECT_VECTOR_IDS.attractShip).id, 'object.asteroids.ship');
  assert.equal(vectorMaps.objectVectorMapsById.get(ASTEROIDS_OBJECT_VECTOR_IDS.attractUfo).id, 'object.asteroids.large-ufo');
  ASTEROIDS_REQUIRED_MANIFEST_GEOMETRY_IDS.forEach((id) => {
    assert.equal(vectorMaps.objectVectorMapsById.has(id), true, `required Asteroids manifest geometry id ${id} should resolve`);
  });
  assert.deepEqual(
    getAsteroidsObjectVectorPoints(vectorMaps, 'bullet'),
    [
      { x: -2, y: -2 },
      { x: 2, y: -2 },
      { x: 2, y: 2 },
      { x: -2, y: 2 },
    ],
  );
  assert.deepEqual(
    getAsteroidsObjectVectorPoints(vectorMaps, 'ship'),
    [
      { x: 14, y: 0 },
      { x: -10, y: -8 },
      { x: -6, y: -3 },
      { x: -6, y: 3 },
      { x: -10, y: 8 },
      { x: 14, y: 0 },
    ],
  );
  assert.deepEqual(
    getAsteroidsObjectVectorPoints(vectorMaps, 'asteroidMedium'),
    [
      { x: -16, y: -10 },
      { x: -2, y: -18 },
      { x: 16, y: -14 },
      { x: 20, y: 2 },
      { x: 8, y: 18 },
      { x: -10, y: 16 },
      { x: -20, y: 4 },
    ],
  );
  assert.deepEqual(
    getAsteroidsObjectVectorPoints(vectorMaps, 'asteroidSmall'),
    [
      { x: -10, y: -6 },
      { x: 0, y: -12 },
      { x: 10, y: -6 },
      { x: 8, y: 8 },
      { x: -6, y: 10 },
      { x: -12, y: 0 },
    ],
  );
  assert.deepEqual(
    getAsteroidsObjectVectorPoints(vectorMaps, 'ufoSmall').slice(0, 5),
    [
      { x: -14, y: 3 },
      { x: 14, y: 3 },
      { x: 9, y: 9 },
      { x: -9, y: 9 },
      { x: -14, y: 3 },
    ],
  );
  const shipObject = loadAsteroidsObjectVectorPayload().objects.find((object) => object.id === 'object.asteroids.ship');
  const shipHull = shipObject.shapes.find((shape) => shape.tool === 'polygon');
  assert.deepEqual(shipHull.geometry.points, [
    { x: 14, y: 0 },
    { x: -10, y: -8 },
    { x: -6, y: -3 },
    { x: -6, y: 3 },
    { x: -10, y: 8 },
    { x: 14, y: 0 },
  ]);
  const largeUfoObject = loadAsteroidsObjectVectorPayload().objects.find((object) => object.id === 'object.asteroids.large-ufo');
  assert.equal(largeUfoObject.shapes[0].tool, 'polyline');
  assert.equal(largeUfoObject.shapes[0].geometry.points.length, 15);
  const mediumAsteroidVariant = loadAsteroidsObjectVectorPayload().objects.find((object) => object.id === 'object.asteroids.medium-asteroid');
  assert.deepEqual(mediumAsteroidVariant.shapes[0].geometry.points, [
    { x: -16, y: -10 },
    { x: -2, y: -18 },
    { x: 16, y: -14 },
    { x: 20, y: 2 },
    { x: 8, y: 18 },
    { x: -10, y: 16 },
    { x: -20, y: 4 },
  ]);
  const missingBulletManifest = structuredClone(manifestPayload);
  missingBulletManifest.tools['object-vector-studio-v2'].objects = missingBulletManifest.tools['object-vector-studio-v2'].objects
    .filter((object) => object.id !== ASTEROIDS_OBJECT_VECTOR_IDS.bullet);
  const missingBulletValidation = loadAsteroidsVectorMapsFromManifest(missingBulletManifest);
  assert.equal(missingBulletValidation.ok, false);
  assert.equal(missingBulletValidation.errors.some((message) => message.includes(ASTEROIDS_OBJECT_VECTOR_IDS.bullet)), true);
  const missingShipObjectManifest = structuredClone(manifestPayload);
  missingShipObjectManifest.tools['object-vector-studio-v2'].objects = missingShipObjectManifest.tools['object-vector-studio-v2'].objects
    .filter((object) => object.id !== ASTEROIDS_OBJECT_VECTOR_IDS.attractShip);
  const missingShipObjectValidation = loadAsteroidsVectorMapsFromManifest(missingShipObjectManifest);
  assert.equal(missingShipObjectValidation.ok, false);
  assert.equal(missingShipObjectValidation.errors.some((message) => message.includes(ASTEROIDS_OBJECT_VECTOR_IDS.attractShip)), true);
  const missingSmallUfoObjectManifest = structuredClone(manifestPayload);
  missingSmallUfoObjectManifest.tools['object-vector-studio-v2'].objects = missingSmallUfoObjectManifest.tools['object-vector-studio-v2'].objects
    .filter((object) => object.id !== 'object.asteroids.small-ufo');
  const missingSmallUfoObjectValidation = loadAsteroidsVectorMapsFromManifest(missingSmallUfoObjectManifest);
  assert.equal(missingSmallUfoObjectValidation.ok, false);
  assert.equal(
    missingSmallUfoObjectValidation.errors.some((message) => (
      message.includes('ufoSmall')
      && message.includes('object.asteroids.small-ufo')
      && message.includes('object-vector-studio-v2.objects')
    )),
    true,
  );
  const createdDocumentShim = typeof globalThis.document === 'undefined';
  const createdWindowShim = typeof globalThis.window === 'undefined';
  const shimCanvas = createCanvas();

  if (createdDocumentShim) {
    globalThis.document = {
      readyState: 'complete',
      documentElement: { style: {} },
      body: { style: {} },
      addEventListener() {},
      getElementById(id) {
        return id === 'game' ? shimCanvas : null;
      },
    };
  }

  if (createdWindowShim) {
    globalThis.window = {
      location: {
        search: '',
      },
    };
  }

  try {
    const missingCanvasDocument = {
      documentElement: { style: {} },
      body: { style: {} },
      getElementById() {
        return null;
      },
    };
  const originalConsoleError = console.error;
  console.error = (...args) => {
    const head = String(args?.[0] ?? '');
    if (head.includes('Asteroids FAIL missing-canvas')) {
      return;
    }
    originalConsoleError(...args);
  };

  let missingCanvasEngine = null;
  try {
    missingCanvasEngine = await bootAsteroids({
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
      manifestPayload,
    });
  } finally {
    console.error = originalConsoleError;
  }

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
      ObjectVectorRuntimeClass: TestObjectVectorRuntime,
      SceneClass: class {
        constructor() {
          this.kind = 'scene';
        }
      },
      manifestPayload,
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
    ObjectVectorRuntimeClass: TestObjectVectorRuntime,
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
    manifestPayload,
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
    ObjectVectorRuntimeClass: TestObjectVectorRuntime,
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
    manifestPayload,
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
    ObjectVectorRuntimeClass: TestObjectVectorRuntime,
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
    manifestPayload,
  });
  assert.equal(capturedLocalOptions.debugConfig.debugMode, 'dev');
  assert.equal(capturedLocalOptions.debugConfig.debugEnabled, true);
  assert.equal(Boolean(capturedLocalOptions.devConsoleIntegration), true);
  assert.equal(capturedLocalOptions.devConsoleIntegration.getState().overlayVisible, false);

  withBlockedLocalStorage(() => {
    const scene = new AsteroidsGameScene(createAsteroidsTestSceneOptions());
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
  const scene = new AsteroidsGameScene(createAsteroidsTestSceneOptions());
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

  const world = new AsteroidsWorld({ width: 960, height: 720 }, { rng: () => 0.25, ...worldOptions });
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
  } finally {
    if (createdDocumentShim) {
      delete globalThis.document;
    }
    if (createdWindowShim) {
      delete globalThis.window;
    }
  }
}
