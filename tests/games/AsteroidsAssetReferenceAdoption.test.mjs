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
  const mediumObject = nextPayload.objects.find((object) => object.id === "object.asteroids.medium-asteroid")
    || nextPayload.objects.find((object) => (
      Array.isArray(object.tags)
      && object.tags.includes("asteroid")
      && object.tags.includes("medium")
    ));
  assert.ok(mediumObject);
  const oldMediumObject = {
    ...clone(mediumObject),
    id: "object.asteroids.medium-asteroid",
    name: "Old Medium Asteroid",
    tags: ["asteroid", "medium", "old"]
  };
  const recreatedMediumObject = {
    ...clone(mediumObject),
    id: "object.asteroids.medium-asteroid-2",
    name: "Recreated Medium Asteroid",
    tags: ["asteroid", "medium"]
  };
  nextPayload.objects = nextPayload.objects.filter((object) => !(
    Array.isArray(object.tags)
    && object.tags.includes("asteroid")
    && object.tags.includes("medium")
  ));
  nextPayload.objects.push(oldMediumObject, recreatedMediumObject);
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
  assert.equal(payload.objects.some((object) => object.id === "object.asteroids.small-asteroid"), true);
  assert.equal(profiles[1].objectId, "object.asteroids.small-asteroid");
  assert.equal(profiles[2].objectId, "object.asteroids.medium-asteroid");
  assert.equal(profiles[3].objectId, "object.asteroids.large-asteroid");
  assert.deepEqual(payload.objects.find((object) => object.id === "object.asteroids.medium-asteroid").tags, ["asteroid", "medium"]);

  const recreatedPayload = createPayloadWithRecreatedMediumAsteroid(payload);
  const recreatedProfiles = createAsteroidGeometryProfilesFromObjectVectorPayload(recreatedPayload, {
    runtimeBindings: {
      asteroidMedium: "object.asteroids.medium-asteroid"
    }
  });
  assert.equal(recreatedProfiles[2].objectId, "object.asteroids.medium-asteroid-2");

  const shapes = payload.objects.flatMap((object) => object.shapes);
  assert.equal(shapes.some((shape) => shape.tool === "polygon"), true);
  assert.equal(shapes.some((shape) => Object.prototype.hasOwnProperty.call(shape, "id")), false);
  assert.equal(shapes.some((shape) => Object.prototype.hasOwnProperty.call(shape, "shapeKey")), false);
  assert.equal(shapes.some((shape) => Object.prototype.hasOwnProperty.call(shape, "label")), false);
  assert.equal(shapes.some((shape) => Object.prototype.hasOwnProperty.call(shape, "type")), false);
}
