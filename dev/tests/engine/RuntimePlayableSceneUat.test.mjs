/*
Toolbox Aid
David Quesenberry
06/02/2026
RuntimePlayableSceneUat.test.mjs
*/
import assert from "node:assert/strict";
import { createFirstManifestDrivenPlayableScene } from "../../../www/src/engine/runtime/firstManifestDrivenPlayableScene.js";
import {
  createInvalidEngineFixtures,
  createValidEngineFixture,
} from "./RuntimeManifestDrivenFixture.mjs";

export function run() {
  const validFixture = createValidEngineFixture();
  const invalidFixtures = createInvalidEngineFixtures();
  const result = createFirstManifestDrivenPlayableScene(invalidFixtures.blockedCollisionScene, validFixture.inputEvents);

  assert.equal(result.valid, true);
  assert.equal(result.scene.terrainMaterials.some((material) => material.materialId === "ice"), true);
  assert.equal(result.scene.environmentForces.some((force) => force.forceId === "wind"), true);
  assert.equal(result.scene.runtimeObjects.find((runtimeObject) => runtimeObject.instanceId === "player.1").attachedRules.length, 1);
  assert.equal(result.frame.actions[0].actionId, "move.right");
  assert.equal(result.frame.collisions.some((collision) => collision.collisionType === "blockedTerrain"), true);
  assert.equal(result.scene.runtimeObjects.find((runtimeObject) => runtimeObject.instanceId === "player.1").position.x, 1);
  assert.equal(result.frame.renderCommands.length, 3);
  assert.equal(result.frame.renderCommands[0].x, 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
