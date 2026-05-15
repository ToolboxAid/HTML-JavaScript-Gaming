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
import {
  validateAsteroidsRuntimeObjectBindings
} from '../../games/Asteroids/game/asteroidsObjectVectorRoles.js';

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
  const runtimeBindings = manifest.game.gameData.objectVectorRuntime.objectIds;
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
  const bindingValidation = validateAsteroidsRuntimeObjectBindings(payload.objects, runtimeBindings);
  assert.equal(bindingValidation.ok, true);
  assert.equal(bindingValidation.objectsByRole.asteroidMedium.id, 'object.asteroids.medium-asteroid');
  assert.deepEqual(bindingValidation.warnings, []);
  const missingMediumBindings = { ...runtimeBindings };
  delete missingMediumBindings.asteroidMedium;
  const missingBindingValidation = validateAsteroidsRuntimeObjectBindings(payload.objects, missingMediumBindings);
  assert.equal(missingBindingValidation.ok, false);
  assert.equal(missingBindingValidation.errors.some((entry) => (
    entry.message.includes('objectIds.asteroidMedium')
    && entry.details.candidates.some((candidate) => candidate.includes('object.asteroids.medium-asteroid'))
  )), true);
  const invalidBindingValidation = validateAsteroidsRuntimeObjectBindings(payload.objects, {
    ...runtimeBindings,
    asteroidMedium: 'object.asteroids.large-asteroid'
  });
  assert.equal(invalidBindingValidation.ok, true);
  assert.equal(invalidBindingValidation.objectsByRole.asteroidMedium.id, 'object.asteroids.large-asteroid');

  const recreatedPayload = createPayloadWithRecreatedMediumAsteroid(payload);
  const recreatedBindings = {
    ...runtimeBindings,
    asteroidMedium: 'object.asteroids.medium-asteroid-2'
  };
  const recreatedProfiles = createAsteroidGeometryProfilesFromObjectVectorPayload(recreatedPayload, {
    runtimeBindings: recreatedBindings
  });
  assert.equal(recreatedProfiles[2].objectId, 'object.asteroids.medium-asteroid-2');
  const oldBindingValidation = validateAsteroidsRuntimeObjectBindings(recreatedPayload.objects, {
    ...runtimeBindings,
    asteroidMedium: 'object.asteroids.medium-asteroid'
  });
  assert.equal(oldBindingValidation.ok, false);
  assert.equal(oldBindingValidation.errors.some((entry) => entry.message.includes('points to an old/legacy object')), true);

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
    runtimeBindings,
    sourceLabel: 'Asteroids game.manifest.json:tools.object-vector-studio-v2'
  });
  assert.equal(assetSet.objectsById.has('object.asteroids.small-asteroid'), true);
  assert.equal(assetSet.objectsById.has('object.asteroids.ship'), true);

  const recreatedAssetSet = await runtime.loadPayload(recreatedPayload, {
    runtimeBindings: recreatedBindings,
    sourceLabel: 'Asteroids recreated medium object-vector payload'
  });
  const resolvedMedium = runtime.resolveObject(recreatedAssetSet, {
    objectId: 'object.asteroids.medium-asteroid-2',
    requireManifestBinding: true,
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
