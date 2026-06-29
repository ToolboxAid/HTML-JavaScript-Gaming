/*
Toolbox Aid
David Quesenberry
06/02/2026
RuntimeBehaviorComposition.test.mjs
*/
import assert from "node:assert/strict";
import {
  RUNTIME_BEHAVIOR_COMPOSITION_ERRORS,
  composeRuntimeBehavior,
} from "../../../www/src/engine/runtime/runtimeBehaviorComposition.js";
import { readManifestObjectDefinitions } from "../../../www/src/engine/runtime/objectDefinitionReader.js";
import { createRuntimeObjectRecords } from "../../../www/src/engine/runtime/runtimeObjectRecordFactory.js";
import { instantiateEnvironmentForces } from "../../../www/src/engine/runtime/runtimeEnvironmentForceInstantiation.js";
import { instantiateRuntimeObjects } from "../../../www/src/engine/runtime/runtimeObjectInstantiation.js";
import { instantiateTerrainMaterials } from "../../../www/src/engine/runtime/runtimeTerrainMaterialInstantiation.js";
import { createManifestDrivenRuntimeFixture } from "./RuntimeManifestDrivenFixture.mjs";

export function run() {
  const manifest = createManifestDrivenRuntimeFixture();
  const objectDefinitions = readManifestObjectDefinitions(manifest);
  const objectRecords = createRuntimeObjectRecords(objectDefinitions.objectDefinitions);
  const runtimeObjects = instantiateRuntimeObjects(objectRecords.records, manifest.objectInstances);
  const terrainMaterials = instantiateTerrainMaterials(manifest.terrainMaterials);
  const environmentForces = instantiateEnvironmentForces(manifest.environmentForces);
  const result = composeRuntimeBehavior({
    runtimeObjects: runtimeObjects.runtimeObjects,
    terrainMaterials: terrainMaterials.terrainMaterials,
    environmentForces: environmentForces.environmentForces,
    terrainAssignments: manifest.terrainAssignments,
  });

  assert.equal(result.valid, true);
  const playerComposition = result.compositions.find((composition) => composition.instanceId === "player.1");
  const bumblebeeComposition = result.compositions.find((composition) => composition.instanceId === "bumblebee.1");
  assert.equal(playerComposition.terrainEffects.friction, true);
  assert.equal(playerComposition.environmentForces.includes("wind"), true);
  assert.equal(bumblebeeComposition.objectCapabilities.includes("killable"), true);
  assert.equal(bumblebeeComposition.terrainEffects.slide, true);

  const invalidResult = composeRuntimeBehavior({
    runtimeObjects: runtimeObjects.runtimeObjects,
    terrainMaterials: terrainMaterials.terrainMaterials,
    environmentForces: environmentForces.environmentForces,
    terrainAssignments: { "player.1": "missing" },
  });

  assert.equal(invalidResult.valid, false);
  assert.deepEqual(
    invalidResult.errors.map((error) => error.code),
    [RUNTIME_BEHAVIOR_COMPOSITION_ERRORS.MATERIAL_MISSING]
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
