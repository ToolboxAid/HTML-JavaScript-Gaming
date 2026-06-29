/*
Toolbox Aid
David Quesenberry
06/02/2026
RuntimeLoaderValidation.test.mjs
*/
import assert from "node:assert/strict";
import {
  MANIFEST_RUNTIME_PARSER_ERRORS,
  parseManifestRuntimePayload,
} from "../../../www/src/engine/runtime/manifestRuntimeParser.js";
import {
  OBJECT_DEFINITION_READER_ERRORS,
  readManifestObjectDefinitions,
} from "../../../www/src/engine/runtime/objectDefinitionReader.js";
import {
  RULE_DEFINITION_READER_ERRORS,
  readManifestRuleDefinitions,
} from "../../../www/src/engine/runtime/ruleDefinitionReader.js";
import { createValidManifestRuntimePayload } from "./ManifestRuntimeParser.test.mjs";

export function run() {
  const validManifest = createValidManifestRuntimePayload();
  const validation = validateRuntimeLoaderSlice(validManifest);

  assert.equal(validation.valid, true);
  assert.equal(validation.errors.length, 0);
  assert.equal(validation.objectDefinitions.length, 1);
  assert.equal(validation.ruleDefinitions.length, 1);
  assert.equal(validation.objectDefinitions[0].objectId, "object.config.player");
  assert.equal(validation.ruleDefinitions[0].ruleId, "movement.player");
  assert.equal(Object.hasOwn(validation.objectDefinitions[0], "entityId"), false);
  assert.equal(Object.hasOwn(validation.ruleDefinitions[0], "executed"), false);

  assertLoaderErrorCodes(
    validateRuntimeLoaderSlice({ ...validManifest, schema: "wrong" }),
    [MANIFEST_RUNTIME_PARSER_ERRORS.SCHEMA_INVALID],
    "invalid manifest is rejected before readers"
  );

  assertLoaderErrorCodes(
    validateRuntimeLoaderSlice({
      ...validManifest,
      objects: {
        "object.bad": {
          objectType: "boss",
        },
      },
    }),
    [OBJECT_DEFINITION_READER_ERRORS.OBJECT_TYPE_INVALID],
    "invalid object type is rejected by combined loader validation"
  );

  assertLoaderErrorCodes(
    validateRuntimeLoaderSlice({
      ...validManifest,
      rules: {
        "rule.bad": {
          ruleType: "script",
        },
      },
    }),
    [RULE_DEFINITION_READER_ERRORS.RULE_TYPE_INVALID],
    "invalid rule type is rejected by combined loader validation"
  );
}

export function validateRuntimeLoaderSlice(payload) {
  const manifestValidation = parseManifestRuntimePayload(payload, {
    sourcePath: "games/ConfigPilot/game.manifest.json",
  });

  if (!manifestValidation.valid) {
    return createRuntimeLoaderResult({
      objectDefinitions: [],
      ruleDefinitions: [],
      errors: manifestValidation.errors,
    });
  }

  const objectValidation = readManifestObjectDefinitions(manifestValidation.manifest);
  const ruleValidation = readManifestRuleDefinitions(manifestValidation.manifest);
  const errors = [...objectValidation.errors, ...ruleValidation.errors];

  return createRuntimeLoaderResult({
    objectDefinitions: objectValidation.valid ? objectValidation.objectDefinitions : [],
    ruleDefinitions: ruleValidation.valid ? ruleValidation.ruleDefinitions : [],
    errors,
  });
}

function createRuntimeLoaderResult({ objectDefinitions, ruleDefinitions, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    objectDefinitions: Object.freeze(objectDefinitions),
    ruleDefinitions: Object.freeze(ruleDefinitions),
    errors: Object.freeze(errors),
  });
}

function assertLoaderErrorCodes(validation, expectedCodes, name) {
  assert.equal(validation.valid, false, name);
  assert.deepEqual(validation.errors.map((error) => error.code), expectedCodes, name);
  assert.deepEqual(validation.objectDefinitions, [], name);
  assert.deepEqual(validation.ruleDefinitions, [], name);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
