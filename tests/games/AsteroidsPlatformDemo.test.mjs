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
  const mediumObject = nextPayload.objects.find((object) => object.id === 'object.asteroids.medium-asteroid')
    || nextPayload.objects.find((object) => (
      Array.isArray(object.tags)
      && object.tags.includes('asteroid')
      && object.tags.includes('medium')
    ));
  assert.ok(mediumObject);
  const oldMediumObject = {
    ...clone(mediumObject),
    id: 'object.asteroids.medium-asteroid',
    name: 'Old Medium Asteroid',
    tags: ['asteroid', 'medium', 'old']
  };
  const recreatedMediumObject = {
    ...clone(mediumObject),
    id: 'object.asteroids.medium-asteroid-2',
    name: 'Recreated Medium Asteroid',
    tags: ['asteroid', 'medium']
  };
  nextPayload.objects = nextPayload.objects.filter((object) => !(
    Array.isArray(object.tags)
    && object.tags.includes('asteroid')
    && object.tags.includes('medium')
  ));
  nextPayload.objects.push(oldMediumObject, recreatedMediumObject);
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
  assert.equal(payload.objects.some((object) => object.id === 'object.asteroids.small-asteroid'), true);

  const geometryProfiles = createAsteroidsTestGeometryProfiles();
  assert.equal(geometryProfiles[1].objectId, 'object.asteroids.small-asteroid');
  assert.equal(geometryProfiles[2].objectId, 'object.asteroids.medium-asteroid');
  assert.equal(geometryProfiles[3].objectId, 'object.asteroids.large-asteroid');
  assert.equal(geometryProfiles[1].points.length, 6);
  assert.equal(geometryProfiles[2].points.length, 7);
  assert.equal(geometryProfiles[3].points.length, 12);
  assert.deepEqual(payload.objects.find((object) => object.id === 'object.asteroids.medium-asteroid').tags, ['asteroid', 'medium']);

  const recreatedPayload = createPayloadWithRecreatedMediumAsteroid(payload);
  const recreatedProfiles = createAsteroidGeometryProfilesFromObjectVectorPayload(recreatedPayload, {
    runtimeBindings: {
      asteroidMedium: 'object.asteroids.medium-asteroid'
    }
  });
  assert.equal(recreatedProfiles[2].objectId, 'object.asteroids.medium-asteroid-2');

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
  assert.equal(assetSet.objectsById.has('object.asteroids.small-asteroid'), true);
  assert.equal(assetSet.objectsById.has('object.asteroids.ship'), true);

  const recreatedAssetSet = await runtime.loadPayload(recreatedPayload, {
    runtimeBindings: {
      asteroidMedium: 'object.asteroids.medium-asteroid'
    },
    sourceLabel: 'Asteroids recreated medium object-vector payload'
  });
  const resolvedMedium = runtime.resolveObject(recreatedAssetSet, {
    objectId: 'object.asteroids.medium-asteroid',
    runtimeRole: 'asteroidMedium',
    tags: ['asteroid', 'medium']
  });
  assert.equal(resolvedMedium.id, 'object.asteroids.medium-asteroid-2');
  assert.equal(runtime.getDiagnostics().events.some((event) => (
    event.level === 'WARN'
    && event.message.includes('ignored explicit objectId object.asteroids.medium-asteroid')
  )), true);

  const smallPreview = runtime.createSvgString(assetSet, {
    objectId: 'object.asteroids.small-asteroid',
    stateId: 'active'
  });
  assert.equal(smallPreview.ok, true);
  assert.match(smallPreview.svg, /data-runtime-object-vector="true"/);
  assert.match(smallPreview.svg, /<polygon /);
  assert.equal(smallPreview.svg.includes(`vector.${'asteroids'}.`), false);
}
