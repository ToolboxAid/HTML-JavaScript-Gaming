import assert from "node:assert/strict";
import {
  createAsteroidsTestGeometryProfiles,
  loadAsteroidsManifest,
  loadAsteroidsObjectVectorPayload
} from "./asteroidsManifestObjectVectors.mjs";
import {
  validateAsteroidsRuntimeObjectRoles
} from "../../games/Asteroids/game/asteroidsObjectVectorRoles.js";

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
  nextPayload.objects = nextPayload.objects.filter((object) => (
    object.id !== "object.asteroids.medium-asteroid-2"
    && !(
      Array.isArray(object.tags)
      && object.tags.includes("asteroid")
      && object.tags.includes("medium")
    )
  ));
  nextPayload.objects.push(oldMediumObject, recreatedMediumObject);
  return nextPayload;
}

export async function run() {
  const manifest = loadAsteroidsManifest();
  const payload = loadAsteroidsObjectVectorPayload();
  const profiles = createAsteroidsTestGeometryProfiles();
  const manifestText = JSON.stringify(manifest);

  assert.equal(manifest.tools["vector-map-editor"], undefined);
  assert.equal(Array.isArray(manifest.tools["object-vector-studio-v2"].vectorMaps.shapes), true);
  assert.equal(Object.hasOwn(manifest.tools["object-vector-studio-v2"].vectorMaps, "vectors"), false);
  assert.equal(Object.hasOwn(manifest.tools["object-vector-studio-v2"].vectorMaps, "objectVectorRoles"), false);
  assert.equal(manifest.tools["object-vector-studio-v2"].vectorMaps.shapes.length, 0);
  assert.equal(manifest.game["workspace"], undefined);
  assert.equal(manifest.game.gameData, undefined);
  assert.equal(manifest.objectVectorRuntime, undefined);
  assert.equal(manifestText.includes(`vector.${"asteroids"}.`), false);
  assert.equal(payload.objects.some((object) => object.id === "object.asteroids.bullet"), true);
  assert.equal(payload.objects.some((object) => object.id === "object.asteroids.ship"), true);
  assert.equal(payload.objects.some((object) => object.id === "object.asteroids.small-asteroid"), true);
  assert.deepEqual(
    payload.objects.find((object) => object.id === "object.asteroids.ship").shapes.find((shape) => shape.tool === "polygon").geometry.points,
    [
      { x: 14, y: 0 },
      { x: -10, y: -8 },
      { x: -6, y: -3 },
      { x: -6, y: 3 },
      { x: -10, y: 8 },
      { x: 14, y: 0 },
    ],
  );
  assert.equal(payload.objects.find((object) => object.id === "object.asteroids.large-ufo").shapes[0].tool, "polyline");
  assert.equal(payload.objects.find((object) => object.id === "object.asteroids.small-ufo").shapes[0].tool, "polyline");
  assert.equal(profiles[1].objectId, "object.asteroids.small-asteroid");
  assert.equal(profiles[2].objectId, "object.asteroids.medium-asteroid");
  assert.equal(profiles[3].objectId, "object.asteroids.large-asteroid");
  assert.deepEqual(payload.objects.find((object) => object.id === "object.asteroids.medium-asteroid").tags, ["asteroid", "medium"]);
  const roleValidation = validateAsteroidsRuntimeObjectRoles(payload.objects);
  assert.equal(roleValidation.ok, true);
  assert.equal(roleValidation.objectsByRole.asteroidMedium.id, "object.asteroids.medium-asteroid");
  assert.deepEqual(roleValidation.warnings, []);
  const missingMediumPayload = {
    ...payload,
    objects: payload.objects.filter((object) => object.id !== "object.asteroids.medium-asteroid")
  };
  const missingMediumValidation = validateAsteroidsRuntimeObjectRoles(missingMediumPayload.objects);
  assert.equal(missingMediumValidation.ok, false);
  assert.equal(missingMediumValidation.errors.some((entry) => (
    entry.message.includes("asteroidMedium")
    && entry.message.includes("objects[].tags [asteroid, medium]")
  )), true);

  const recreatedPayload = createPayloadWithRecreatedMediumAsteroid(payload);
  const oldRoleValidation = validateAsteroidsRuntimeObjectRoles(recreatedPayload.objects);
  assert.equal(oldRoleValidation.ok, false);
  assert.equal(oldRoleValidation.errors.some((entry) => entry.message.includes("old/legacy object tag candidates")), true);

  const shapes = payload.objects.flatMap((object) => object.shapes);
  assert.equal(shapes.some((shape) => shape.tool === "polygon"), true);
  assert.equal(shapes.some((shape) => Object.prototype.hasOwnProperty.call(shape, "id")), false);
  assert.equal(shapes.some((shape) => Object.prototype.hasOwnProperty.call(shape, "shapeKey")), false);
  assert.equal(shapes.some((shape) => Object.prototype.hasOwnProperty.call(shape, "label")), false);
  assert.equal(shapes.some((shape) => Object.prototype.hasOwnProperty.call(shape, "type")), false);
}
