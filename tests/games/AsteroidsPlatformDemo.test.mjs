import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ObjectVectorRuntimeAssetService } from '../../src/engine/rendering/index.js';
import {
  createAsteroidsTestGeometryProfiles,
  loadAsteroidsManifest,
  loadAsteroidsObjectVectorPayload
} from './asteroidsManifestObjectGeometry.mjs';
import {
  validateAsteroidsRuntimeObjectTags
} from '../../games/Asteroids/game/asteroidsObjectTags.js';

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
  nextPayload.objects = nextPayload.objects.filter((object) => (
    object.id !== 'object.asteroids.medium-asteroid-2'
    && !(
      Array.isArray(object.tags)
      && object.tags.includes('asteroid')
      && object.tags.includes('medium')
    )
  ));
  nextPayload.objects.push(oldMediumObject, recreatedMediumObject);
  return nextPayload;
}

export async function run() {
  const manifest = loadAsteroidsManifest();
  const payload = loadAsteroidsObjectVectorPayload();
  const manifestText = JSON.stringify(manifest);

  assert.equal(manifest.tools['vector-map-editor'], undefined);
  assert.equal(Object.hasOwn(manifest.tools['object-vector-studio-v2'], 'vectorMaps'), false);
  assert.equal(manifest.game["workspace"], undefined);
  assert.equal(manifest.game.gameData, undefined);
  assert.equal(manifest.objectVectorRuntime, undefined);
  assert.equal(manifestText.includes(`vector.${'asteroids'}.`), false);
  assert.equal(Array.isArray(payload.objects), true);
  assert.equal(payload.objects.some((object) => object.id === 'object.asteroids.bullet'), true);
  assert.equal(payload.objects.some((object) => object.id === 'object.asteroids.ship'), true);
  assert.equal(payload.objects.some((object) => object.id === 'object.asteroids.small-asteroid'), true);

  const geometryProfiles = createAsteroidsTestGeometryProfiles();
  assert.equal(geometryProfiles[1].objectId, 'object.asteroids.small-asteroid');
  assert.equal(geometryProfiles[2].objectId, 'object.asteroids.medium-asteroid');
  assert.equal(geometryProfiles[3].objectId, 'object.asteroids.large-asteroid');
  assert.equal(geometryProfiles[1].points.length, 12);
  assert.equal(geometryProfiles[2].points.length, 12);
  assert.equal(geometryProfiles[3].points.length, 12);
  assert.equal(geometryProfiles[3].radius > geometryProfiles[2].radius, true);
  assert.equal(geometryProfiles[2].radius > geometryProfiles[1].radius, true);
  assert.deepEqual(payload.objects.find((object) => object.id === 'object.asteroids.medium-asteroid').tags, ['asteroid', 'medium']);
  const tagValidation = validateAsteroidsRuntimeObjectTags(payload.objects);
  assert.equal(tagValidation.ok, true);
  assert.equal(tagValidation.objectsByKey.asteroidMedium.id, 'object.asteroids.medium-asteroid');
  assert.deepEqual(tagValidation.warnings, []);
  const missingMediumPayload = {
    ...payload,
    objects: payload.objects.filter((object) => object.id !== 'object.asteroids.medium-asteroid')
  };
  const missingMediumValidation = validateAsteroidsRuntimeObjectTags(missingMediumPayload.objects);
  assert.equal(missingMediumValidation.ok, false);
  assert.equal(missingMediumValidation.errors.some((entry) => (
    entry.message.includes('asteroidMedium')
    && entry.message.includes('objects[].tags [asteroid, medium]')
  )), true);

  const recreatedPayload = createPayloadWithRecreatedMediumAsteroid(payload);
  const oldTagValidation = validateAsteroidsRuntimeObjectTags(recreatedPayload.objects);
  assert.equal(oldTagValidation.ok, false);
  assert.equal(oldTagValidation.errors.some((entry) => entry.message.includes('old/legacy tagged candidates')), true);

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
  assert.equal(Object.prototype.hasOwnProperty.call(assetSet, 'runtimeBindings'), false);

  const recreatedAssetSet = await runtime.loadPayload(recreatedPayload, {
    sourceLabel: 'Asteroids recreated medium object-vector payload'
  });
  const resolvedMedium = runtime.resolveObject(recreatedAssetSet, {
    objectId: 'object.asteroids.medium-asteroid-2',
    runtimeRole: 'asteroidMedium'
  });
  assert.equal(resolvedMedium.id, 'object.asteroids.medium-asteroid-2');
  assert.equal(runtime.getDiagnostics().events.some((event) => event.message.includes('matched multiple objects by tags')), false);

  const smallPreview = runtime.createSvgString(assetSet, {
    objectId: 'object.asteroids.small-asteroid',
    stateId: 'active'
  });
  assert.equal(smallPreview.ok, true);
  assert.match(smallPreview.svg, /data-runtime-object-vector="true"/);
  assert.match(smallPreview.svg, /<polygon /);
  assert.equal(smallPreview.svg.includes(`vector.${'asteroids'}.`), false);
}
