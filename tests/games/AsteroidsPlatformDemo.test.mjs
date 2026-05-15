import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ObjectVectorRuntimeAssetService } from '../../src/engine/rendering/index.js';
import {
  createAsteroidGeometryProfilesFromObjectVectorPayload
} from '../../games/Asteroids/game/asteroidObjectGeometry.js';
import {
  createAsteroidsTestGeometryProfiles,
  loadAsteroidsManifest,
  loadAsteroidsObjectVectorPayload
} from './asteroidsManifestObjectVectors.mjs';

function createJsonResponse(payload) {
  return {
    ok: true,
    status: 200,
    async json() {
      return payload;
    }
  };
}

function createLocalFetch() {
  return async (url) => {
    const targetPath = fileURLToPath(url);
    return createJsonResponse(JSON.parse(fs.readFileSync(targetPath, 'utf8')));
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createPayloadWithRecreatedMediumAsteroid(payload) {
  const nextPayload = clone(payload);
  const mediumIndex = nextPayload.objects.findIndex((object) => (
    Array.isArray(object.tags)
    && object.tags.includes('asteroid')
    && object.tags.includes('medium')
  ));
  assert.notEqual(mediumIndex, -1);
  const mediumObject = nextPayload.objects[mediumIndex];
  const oldMediumObject = {
    ...clone(mediumObject),
    id: 'object.asteroids.asteroid.medium',
    name: 'Old Medium Asteroid',
    tags: ['asteroid', 'medium', 'old']
  };
  const recreatedMediumObject = {
    ...clone(mediumObject),
    id: 'object.asteroids.asteroid.medium-recreated',
    name: 'Recreated Medium Asteroid',
    tags: ['asteroid', 'medium']
  };
  nextPayload.objects.splice(mediumIndex, 1, oldMediumObject, recreatedMediumObject);
  return nextPayload;
}

export async function run() {
  const manifest = loadAsteroidsManifest();
  const payload = loadAsteroidsObjectVectorPayload();
  const manifestText = JSON.stringify(manifest);

  assert.equal(manifest.game.workspace.tools['vector-map-editor'], undefined);
  assert.equal(manifestText.includes(`vector.${'asteroids'}.`), false);
  assert.equal(Array.isArray(payload.objects), true);
  assert.equal(payload.objects.some((object) => object.id === 'object.asteroids.ship'), true);
  assert.equal(payload.objects.some((object) => object.id === 'object.asteroids.asteroid.small'), true);

  const geometryProfiles = createAsteroidsTestGeometryProfiles();
  assert.equal(geometryProfiles[1].objectId, 'object.asteroids.asteroid.small');
  assert.equal(geometryProfiles[2].objectId, 'object.asteroids.asteroid.medium');
  assert.equal(geometryProfiles[3].objectId, 'object.asteroids.asteroid.large');
  assert.equal(geometryProfiles[1].points.length, 6);
  assert.equal(geometryProfiles[2].points.length, 7);
  assert.equal(geometryProfiles[3].points.length, 12);
  assert.deepEqual(payload.objects.find((object) => object.id === 'object.asteroids.asteroid.medium').tags, ['asteroid', 'medium']);

  const recreatedPayload = createPayloadWithRecreatedMediumAsteroid(payload);
  const recreatedProfiles = createAsteroidGeometryProfilesFromObjectVectorPayload(recreatedPayload, {
    runtimeBindings: {
      asteroidMedium: 'object.asteroids.asteroid.medium'
    }
  });
  assert.equal(recreatedProfiles[2].objectId, 'object.asteroids.asteroid.medium-recreated');

  const shapes = payload.objects.flatMap((object) => object.shapes);
  assert.equal(shapes.some((shape) => shape.tool === 'polygon'), true);
  assert.equal(shapes.some((shape) => shape.tool === 'line'), true);
  assert.equal(shapes.some((shape) => Object.prototype.hasOwnProperty.call(shape, 'shapeKey')), false);
  assert.equal(shapes.some((shape) => Object.prototype.hasOwnProperty.call(shape, 'label')), false);
  assert.equal(shapes.some((shape) => Object.prototype.hasOwnProperty.call(shape, 'type')), false);

  const runtime = new ObjectVectorRuntimeAssetService({
    fetchRef: createLocalFetch(),
    logger: { info() {}, warn() {}, error() {} }
  });
  const assetSet = await runtime.loadPayload(payload, {
    sourceLabel: 'Asteroids game.manifest.json:tools.object-vector-studio-v2'
  });
  assert.equal(assetSet.objectsById.has('object.asteroids.asteroid.small'), true);
  assert.equal(assetSet.objectsById.has('object.asteroids.ship'), true);

  const recreatedAssetSet = await runtime.loadPayload(recreatedPayload, {
    runtimeBindings: {
      asteroidMedium: 'object.asteroids.asteroid.medium'
    },
    sourceLabel: 'Asteroids recreated medium object-vector payload'
  });
  const resolvedMedium = runtime.resolveObject(recreatedAssetSet, {
    objectId: 'object.asteroids.asteroid.medium',
    runtimeRole: 'asteroidMedium',
    tags: ['asteroid', 'medium']
  });
  assert.equal(resolvedMedium.id, 'object.asteroids.asteroid.medium-recreated');
  assert.equal(runtime.getDiagnostics().events.some((event) => (
    event.level === 'WARN'
    && event.message.includes('ignored explicit objectId object.asteroids.asteroid.medium')
  )), true);

  const smallPreview = runtime.createSvgString(assetSet, {
    objectId: 'object.asteroids.asteroid.small',
    stateId: 'active'
  });
  assert.equal(smallPreview.ok, true);
  assert.match(smallPreview.svg, /data-runtime-object-vector="true"/);
  assert.match(smallPreview.svg, /<polygon /);
  assert.equal(smallPreview.svg.includes(`vector.${'asteroids'}.`), false);
}
