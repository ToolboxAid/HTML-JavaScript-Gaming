import assert from "node:assert/strict";
import {
  createAsteroidsTestGeometryProfiles,
  loadAsteroidsManifest,
  loadAsteroidsObjectVectorPayload,
  loadAsteroidsVectorMaps
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
  const vectorMaps = loadAsteroidsVectorMaps();
  const profiles = createAsteroidsTestGeometryProfiles();
  const manifestText = JSON.stringify(manifest);

  assert.equal(manifest.tools["vector-map-editor"], undefined);
  assert.equal(Array.isArray(manifest.tools["object-vector-studio-v2"].vectorMaps.vectors), true);
  assert.equal(vectorMaps.vectorsById.has("vector.asteroids.ship"), true);
  assert.equal(vectorMaps.vectorsById.has("vector.asteroids.ship.collision"), false);
  assert.equal(vectorMaps.vectorsById.has("vector.asteroids.ui.title"), true);
  assert.equal(manifest.game["workspace"], undefined);
  assert.equal(manifest.game.gameData, undefined);
  assert.equal(manifest.objectVectorRuntime, undefined);
  assert.equal(manifestText.includes(`vector.${"asteroids"}.`), true);
  assert.equal(payload.objects.some((object) => object.id === "object.asteroids.ship"), true);
  assert.equal(payload.objects.some((object) => object.id === "object.asteroids.small-asteroid"), true);
  assert.equal(profiles[1].objectId, "object.asteroids.small-asteroid");
  assert.equal(profiles[2].objectId, "object.asteroids.medium-asteroid");
  assert.equal(profiles[3].objectId, "object.asteroids.large-asteroid");
  assert.deepEqual(payload.objects.find((object) => object.id === "object.asteroids.medium-asteroid").tags, ["asteroid", "medium"]);
  const roleValidation = validateAsteroidsRuntimeObjectRoles(payload.objects, {
    roleBindings: vectorMaps.objectVectorRoles
  });
  assert.equal(roleValidation.ok, true);
  assert.equal(roleValidation.objectsByRole.asteroidMedium.id, "object.asteroids.medium-asteroid");
  assert.deepEqual(roleValidation.warnings, []);
  const missingMediumPayload = {
    ...payload,
    objects: payload.objects.filter((object) => object.id !== "object.asteroids.medium-asteroid")
  };
  const missingMediumValidation = validateAsteroidsRuntimeObjectRoles(missingMediumPayload.objects, {
    roleBindings: vectorMaps.objectVectorRoles
  });
  assert.equal(missingMediumValidation.ok, false);
  assert.equal(missingMediumValidation.errors.some((entry) => (
    entry.message.includes("manifest binding requires object object.asteroids.medium-asteroid")
  )), true);

  const recreatedPayload = createPayloadWithRecreatedMediumAsteroid(payload);
  const oldRoleValidation = validateAsteroidsRuntimeObjectRoles(recreatedPayload.objects, {
    roleBindings: vectorMaps.objectVectorRoles
  });
  assert.equal(oldRoleValidation.ok, false);
  assert.equal(oldRoleValidation.errors.some((entry) => entry.message.includes("is marked old/legacy")), true);

  const shapes = payload.objects.flatMap((object) => object.shapes);
  assert.equal(shapes.some((shape) => shape.tool === "polygon"), true);
  assert.equal(shapes.some((shape) => Object.prototype.hasOwnProperty.call(shape, "id")), false);
  assert.equal(shapes.some((shape) => Object.prototype.hasOwnProperty.call(shape, "shapeKey")), false);
  assert.equal(shapes.some((shape) => Object.prototype.hasOwnProperty.call(shape, "label")), false);
  assert.equal(shapes.some((shape) => Object.prototype.hasOwnProperty.call(shape, "type")), false);
}
