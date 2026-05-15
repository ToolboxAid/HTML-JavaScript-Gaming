import assert from "node:assert/strict";
import {
  createAsteroidGeometryProfilesFromObjectVectorPayload
} from "../../games/Asteroids/game/asteroidObjectGeometry.js";
import {
  createAsteroidsTestGeometryProfiles,
  loadAsteroidsManifest,
  loadAsteroidsObjectVectorPayload
} from "./asteroidsManifestObjectVectors.mjs";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createPayloadWithRecreatedMediumAsteroid(payload) {
  const nextPayload = clone(payload);
  const mediumIndex = nextPayload.objects.findIndex((object) => (
    Array.isArray(object.tags)
    && object.tags.includes("asteroid")
    && object.tags.includes("medium")
  ));
  assert.notEqual(mediumIndex, -1);
  const mediumObject = nextPayload.objects[mediumIndex];
  const oldMediumObject = {
    ...clone(mediumObject),
    id: "object.asteroids.asteroid.medium",
    name: "Old Medium Asteroid",
    tags: ["asteroid", "medium", "old"]
  };
  const recreatedMediumObject = {
    ...clone(mediumObject),
    id: "object.asteroids.asteroid.medium-recreated",
    name: "Recreated Medium Asteroid",
    tags: ["asteroid", "medium"]
  };
  nextPayload.objects.splice(mediumIndex, 1, oldMediumObject, recreatedMediumObject);
  return nextPayload;
}

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
  assert.deepEqual(payload.objects.find((object) => object.id === "object.asteroids.asteroid.medium").tags, ["asteroid", "medium"]);

  const recreatedPayload = createPayloadWithRecreatedMediumAsteroid(payload);
  const recreatedProfiles = createAsteroidGeometryProfilesFromObjectVectorPayload(recreatedPayload, {
    runtimeBindings: {
      asteroidMedium: "object.asteroids.asteroid.medium"
    }
  });
  assert.equal(recreatedProfiles[2].objectId, "object.asteroids.asteroid.medium-recreated");

  const shapes = payload.objects.flatMap((object) => object.shapes);
  assert.equal(shapes.some((shape) => shape.tool === "polygon"), true);
  assert.equal(shapes.some((shape) => Object.prototype.hasOwnProperty.call(shape, "id")), false);
  assert.equal(shapes.some((shape) => Object.prototype.hasOwnProperty.call(shape, "shapeKey")), false);
  assert.equal(shapes.some((shape) => Object.prototype.hasOwnProperty.call(shape, "label")), false);
  assert.equal(shapes.some((shape) => Object.prototype.hasOwnProperty.call(shape, "type")), false);
}
