import assert from "node:assert/strict";
import {
  createAsteroidGeometryProfilesFromObjectVectorPayload
} from "../../games/Asteroids/game/asteroidObjectGeometry.js";
import {
  createAsteroidsTestGeometryProfiles,
  loadAsteroidsManifest,
  loadAsteroidsObjectVectorPayload
} from "./asteroidsManifestObjectVectors.mjs";
import {
  validateAsteroidsRuntimeObjectBindings
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
  const runtimeBindings = manifest.game.gameData.objectVectorRuntime.objectIds;
  const manifestText = JSON.stringify(manifest);

  assert.equal(manifest.game.workspace.tools["vector-map-editor"], undefined);
  assert.equal(manifestText.includes(`vector.${"asteroids"}.`), false);
  assert.equal(payload.objects.some((object) => object.id === "object.asteroids.ship"), true);
  assert.equal(payload.objects.some((object) => object.id === "object.asteroids.small-asteroid"), true);
  assert.equal(profiles[1].objectId, "object.asteroids.small-asteroid");
  assert.equal(profiles[2].objectId, "object.asteroids.medium-asteroid");
  assert.equal(profiles[3].objectId, "object.asteroids.large-asteroid");
  assert.deepEqual(payload.objects.find((object) => object.id === "object.asteroids.medium-asteroid").tags, ["asteroid", "medium"]);
  const bindingValidation = validateAsteroidsRuntimeObjectBindings(payload.objects, runtimeBindings);
  assert.equal(bindingValidation.ok, true);
  assert.equal(bindingValidation.objectsByRole.asteroidMedium.id, "object.asteroids.medium-asteroid");
  assert.equal(bindingValidation.warnings.some((entry) => (
    entry.message.includes("matched multiple objects by tags [asteroid, medium]")
    && entry.details.candidates.some((candidate) => candidate.includes("object.asteroids.medium-asteroid-2"))
  )), true);
  const missingMediumBindings = { ...runtimeBindings };
  delete missingMediumBindings.asteroidMedium;
  const missingBindingValidation = validateAsteroidsRuntimeObjectBindings(payload.objects, missingMediumBindings);
  assert.equal(missingBindingValidation.ok, false);
  assert.equal(missingBindingValidation.errors.some((entry) => (
    entry.message.includes("objectIds.asteroidMedium")
    && entry.details.candidates.some((candidate) => candidate.includes("object.asteroids.medium-asteroid"))
    && entry.details.candidates.some((candidate) => candidate.includes("object.asteroids.medium-asteroid-2"))
  )), true);

  const recreatedPayload = createPayloadWithRecreatedMediumAsteroid(payload);
  const recreatedBindings = {
    ...runtimeBindings,
    asteroidMedium: "object.asteroids.medium-asteroid-2"
  };
  const recreatedProfiles = createAsteroidGeometryProfilesFromObjectVectorPayload(recreatedPayload, {
    runtimeBindings: recreatedBindings
  });
  assert.equal(recreatedProfiles[2].objectId, "object.asteroids.medium-asteroid-2");
  const oldBindingValidation = validateAsteroidsRuntimeObjectBindings(recreatedPayload.objects, {
    ...runtimeBindings,
    asteroidMedium: "object.asteroids.medium-asteroid"
  });
  assert.equal(oldBindingValidation.ok, false);
  assert.equal(oldBindingValidation.errors.some((entry) => entry.message.includes("points to an old/legacy object")), true);

  const shapes = payload.objects.flatMap((object) => object.shapes);
  assert.equal(shapes.some((shape) => shape.tool === "polygon"), true);
  assert.equal(shapes.some((shape) => Object.prototype.hasOwnProperty.call(shape, "id")), false);
  assert.equal(shapes.some((shape) => Object.prototype.hasOwnProperty.call(shape, "shapeKey")), false);
  assert.equal(shapes.some((shape) => Object.prototype.hasOwnProperty.call(shape, "label")), false);
  assert.equal(shapes.some((shape) => Object.prototype.hasOwnProperty.call(shape, "type")), false);
}
