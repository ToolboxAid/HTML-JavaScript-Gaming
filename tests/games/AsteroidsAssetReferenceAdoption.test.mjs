import assert from "node:assert/strict";
import {
  createAsteroidsTestGeometryProfiles,
  loadAsteroidsManifest,
  loadAsteroidsObjectVectorPayload
} from "./asteroidsManifestObjectVectors.mjs";

export async function run() {
  const manifest = loadAsteroidsManifest();
  const payload = loadAsteroidsObjectVectorPayload();
  const profiles = createAsteroidsTestGeometryProfiles();
  const manifestText = JSON.stringify(manifest);

  assert.equal(manifest.game.workspace.tools["vector-map-editor"], undefined);
  assert.equal(manifestText.includes(`vector.${"asteroids"}.`), false);
  assert.equal(payload.objects.some((object) => object.id === "object.asteroids.ship"), true);
  assert.equal(payload.objects.some((object) => object.id === "object.asteroids.asteroid.small"), true);
  assert.equal(profiles[1].objectId, "object.asteroids.asteroid.small");
  assert.equal(profiles[2].objectId, "object.asteroids.asteroid.medium");
  assert.equal(profiles[3].objectId, "object.asteroids.asteroid.large");

  const shapeIds = payload.objects.flatMap((object) => object.shapes.map((shape) => shape.id));
  assert.equal(shapeIds.includes("small-asteroid-ridge"), true);
  assert.equal(shapeIds.some((shapeId) => shapeId.startsWith("object.")), false);
}
