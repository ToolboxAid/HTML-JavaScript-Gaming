import assert from 'node:assert/strict';
import { bootAsteroidsNew as bootAsteroids } from '../../games/Asteroids/index.js';
import { loadAsteroidsManifest } from './asteroidsManifestObjectGeometry.mjs';

function createCanvas() {
  return {
    addEventListener() {},
    getContext() {
      return {};
    },
    style: {},
  };
}

export async function run() {
  const manifestPayload = loadAsteroidsManifest();
  assert.deepEqual(manifestPayload.screen, { width: 960, height: 720 });

  let engineOptions = null;
  let sceneOptions = null;
  const canvas = createCanvas();
  const bootedEngine = await bootAsteroids({
    documentRef: {
      body: { style: {} },
      documentElement: { style: {} },
      getElementById(id) {
        return id === 'game' ? canvas : null;
      },
    },
    EngineClass: class {
      constructor(options) {
        engineOptions = options;
        this.canvas = options.canvas;
        this.fullscreen = {
          getState() {
            return { active: false, available: false };
          },
        };
      }

      setScene(scene) {
        this.scene = scene;
      }

      start() {}
    },
    InputServiceClass: class {},
    ObjectVectorRuntimeClass: class {
      async loadFromManifest() {
        const objects = manifestPayload.tools['object-vector-studio-v2'].objects;
        return {
          objectsById: new Map(objects.map((object) => [object.id, object])),
        };
      }

      getDiagnostics() {
        return {};
      }
    },
    SceneClass: class {
      constructor(options) {
        sceneOptions = options;
      }
    },
    manifestPayload,
  });

  assert.equal(bootedEngine.canvas, canvas);
  assert.equal(engineOptions.width, manifestPayload.screen.width);
  assert.equal(engineOptions.height, manifestPayload.screen.height);
  assert.deepEqual(sceneOptions.screenDimensions, manifestPayload.screen);

  const missingScreenManifest = { ...manifestPayload };
  delete missingScreenManifest.screen;
  let invalidEngineCreated = false;
  await assert.rejects(
    () => bootAsteroids({
      documentRef: {
        body: { style: {} },
        documentElement: { style: {} },
        getElementById(id) {
          return id === 'game' ? createCanvas() : null;
        },
      },
      EngineClass: class {
        constructor() {
          invalidEngineCreated = true;
        }
      },
      InputServiceClass: class {},
      ObjectVectorRuntimeClass: class {},
      SceneClass: class {},
      manifestPayload: missingScreenManifest,
    }),
    /requires screen\.width and screen\.height/
  );
  assert.equal(invalidEngineCreated, false);
}
