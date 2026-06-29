/*
Toolbox Aid
David Quesenberry
06/02/2026
RuntimeManifestFixtureHardening.test.mjs
*/
import assert from "node:assert/strict";
import { createFirstManifestDrivenPlayableScene } from "../../../www/src/engine/runtime/firstManifestDrivenPlayableScene.js";
import { parseManifestRuntimePayload } from "../../../www/src/engine/runtime/manifestRuntimeParser.js";
import { createRuntimeInputPipeline } from "../../../www/src/engine/runtime/runtimeInputPipeline.js";
import { instantiateEnvironmentForces } from "../../../www/src/engine/runtime/runtimeEnvironmentForceInstantiation.js";
import { instantiateTerrainMaterials } from "../../../www/src/engine/runtime/runtimeTerrainMaterialInstantiation.js";
import {
  createInvalidEngineFixtures,
  createValidEngineFixture,
} from "./RuntimeManifestDrivenFixture.mjs";

export function run() {
  const validFixture = createValidEngineFixture();
  const invalidFixtures = createInvalidEngineFixtures();

  assert.equal(Object.hasOwn(validFixture.manifest, "sample"), false);
  assert.equal(Object.hasOwn(validFixture.manifest, "toolFixture"), false);
  assert.equal(createFirstManifestDrivenPlayableScene(validFixture.manifest, validFixture.inputEvents).valid, true);

  assert.equal(parseManifestRuntimePayload(invalidFixtures.missingSchema).valid, false);
  assert.equal(createFirstManifestDrivenPlayableScene(invalidFixtures.missingObjectInstances, validFixture.inputEvents).valid, false);
  assert.equal(instantiateTerrainMaterials(invalidFixtures.invalidTerrainMaterial.terrainMaterials).valid, false);
  assert.equal(instantiateEnvironmentForces(invalidFixtures.invalidEnvironmentForce.environmentForces).valid, false);
  assert.equal(createFirstManifestDrivenPlayableScene(invalidFixtures.missingRuleAttachment, validFixture.inputEvents).valid, false);
  assert.equal(createRuntimeInputPipeline(invalidFixtures.invalidInputBinding.inputBindings).valid, false);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
