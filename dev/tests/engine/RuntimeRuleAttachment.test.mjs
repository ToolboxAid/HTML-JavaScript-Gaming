/*
Toolbox Aid
David Quesenberry
06/02/2026
RuntimeRuleAttachment.test.mjs
*/
import assert from "node:assert/strict";
import {
  RUNTIME_RULE_ATTACHMENT_ERRORS,
  attachRuntimeRules,
} from "../../../www/src/engine/runtime/runtimeRuleAttachment.js";
import { readManifestObjectDefinitions } from "../../../www/src/engine/runtime/objectDefinitionReader.js";
import { readManifestRuleDefinitions } from "../../../www/src/engine/runtime/ruleDefinitionReader.js";
import { createRuntimeObjectRecords } from "../../../www/src/engine/runtime/runtimeObjectRecordFactory.js";
import { instantiateRuntimeObjects } from "../../../www/src/engine/runtime/runtimeObjectInstantiation.js";
import { createManifestDrivenRuntimeFixture } from "./RuntimeManifestDrivenFixture.mjs";

export function run() {
  const manifest = createManifestDrivenRuntimeFixture();
  const objectDefinitions = readManifestObjectDefinitions(manifest);
  const objectRecords = createRuntimeObjectRecords(objectDefinitions.objectDefinitions);
  const runtimeObjects = instantiateRuntimeObjects(objectRecords.records, manifest.objectInstances);
  const ruleDefinitions = readManifestRuleDefinitions(manifest);
  const result = attachRuntimeRules(runtimeObjects.runtimeObjects, ruleDefinitions.ruleDefinitions);

  assert.equal(result.valid, true);
  assert.equal(result.runtimeObjects[0].attachedRules.length, 1);
  assert.equal(result.runtimeObjects[0].attachedRules[0].ruleType, "movement");
  assert.equal(Object.hasOwn(result.runtimeObjects[0].attachedRules[0], "executed"), false);

  const invalidResult = attachRuntimeRules([
    { ...runtimeObjects.runtimeObjects[0], rules: ["missing.rule"] },
  ], ruleDefinitions.ruleDefinitions);

  assert.equal(invalidResult.valid, false);
  assert.deepEqual(
    invalidResult.errors.map((error) => error.code),
    [RUNTIME_RULE_ATTACHMENT_ERRORS.RULE_MISSING]
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
