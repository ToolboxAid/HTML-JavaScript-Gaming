import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ObjectVectorRuntimeAssetService } from '../../src/engine/rendering/index.js';
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

  const shapeKeys = payload.objects.flatMap((object) => object.shapes.map((shape) => shape.shapeKey));
  assert.equal(shapeKeys.includes('ship-hull'), true);
  assert.equal(shapeKeys.some((shapeKey) => shapeKey.startsWith('object.')), false);

  const runtime = new ObjectVectorRuntimeAssetService({
    fetchRef: createLocalFetch(),
    logger: { info() {}, warn() {}, error() {} }
  });
  const assetSet = await runtime.loadPayload(payload, {
    sourceLabel: 'Asteroids game.manifest.json:tools.object-vector-studio-v2'
  });
  assert.equal(assetSet.objectsById.has('object.asteroids.asteroid.small'), true);
  assert.equal(assetSet.objectsById.has('object.asteroids.ship'), true);

  const smallPreview = runtime.createSvgString(assetSet, {
    objectId: 'object.asteroids.asteroid.small',
    stateId: 'active'
  });
  assert.equal(smallPreview.ok, true);
  assert.match(smallPreview.svg, /data-runtime-object-vector="true"/);
  assert.match(smallPreview.svg, /<polygon /);
  assert.equal(smallPreview.svg.includes(`vector.${'asteroids'}.`), false);
}
