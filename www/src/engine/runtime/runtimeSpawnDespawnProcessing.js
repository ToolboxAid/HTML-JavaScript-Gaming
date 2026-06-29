/*
Toolbox Aid
David Quesenberry
06/02/2026
runtimeSpawnDespawnProcessing.js
*/

import { instantiateRuntimeObjects } from "./runtimeObjectInstantiation.js";

export const RUNTIME_SPAWN_DESPAWN_ERRORS = Object.freeze({
  OBJECTS_INVALID: "RUNTIME_SPAWN_DESPAWN_OBJECTS_INVALID",
  RECORDS_INVALID: "RUNTIME_SPAWN_DESPAWN_RECORDS_INVALID",
  SPAWN_DEFINITIONS_INVALID: "RUNTIME_SPAWN_DEFINITIONS_INVALID",
  RULE_OUTCOMES_INVALID: "RUNTIME_RULE_OUTCOMES_INVALID",
  SPAWN_DEFINITION_MISSING: "RUNTIME_SPAWN_DEFINITION_MISSING",
  DESPAWN_TARGET_REQUIRED: "RUNTIME_DESPAWN_TARGET_REQUIRED",
  DESPAWN_TARGET_MISSING: "RUNTIME_DESPAWN_TARGET_MISSING",
});

export function processRuntimeSpawnDespawn({ runtimeObjects, objectRecords, spawnDefinitions, ruleOutcomes }) {
  const errors = [];

  if (!Array.isArray(runtimeObjects)) {
    errors.push(createSpawnDespawnError(RUNTIME_SPAWN_DESPAWN_ERRORS.OBJECTS_INVALID, "Spawn/despawn processing requires runtimeObjects array.", "runtimeObjects"));
  }

  if (!Array.isArray(objectRecords)) {
    errors.push(createSpawnDespawnError(RUNTIME_SPAWN_DESPAWN_ERRORS.RECORDS_INVALID, "Spawn/despawn processing requires objectRecords array.", "objectRecords"));
  }

  if (!Array.isArray(spawnDefinitions)) {
    errors.push(createSpawnDespawnError(RUNTIME_SPAWN_DESPAWN_ERRORS.SPAWN_DEFINITIONS_INVALID, "Spawn/despawn processing requires spawnDefinitions array.", "spawnDefinitions"));
  }

  if (!Array.isArray(ruleOutcomes)) {
    errors.push(createSpawnDespawnError(RUNTIME_SPAWN_DESPAWN_ERRORS.RULE_OUTCOMES_INVALID, "Spawn/despawn processing requires ruleOutcomes array.", "ruleOutcomes"));
  }

  if (errors.length > 0) {
    return createSpawnDespawnResult({ runtimeObjects: [], spawned: [], despawned: [], errors });
  }

  let nextRuntimeObjects = [...runtimeObjects];
  const spawned = [];
  const despawned = [];

  ruleOutcomes.forEach((outcome, index) => {
    const path = `ruleOutcomes[${index}]`;

    if (outcome.outcomeType === "spawn") {
      const spawnDefinition = spawnDefinitions.find((definition) => definition.ruleId === outcome.ruleId);

      if (!spawnDefinition) {
        errors.push(createSpawnDespawnError(
          RUNTIME_SPAWN_DESPAWN_ERRORS.SPAWN_DEFINITION_MISSING,
          "Spawn outcome requires a manifest-defined spawn definition.",
          `${path}.ruleId`
        ));
        return;
      }

      const spawnResult = instantiateRuntimeObjects(objectRecords, [spawnDefinition]);

      if (!spawnResult.valid) {
        spawnResult.errors.forEach((error) => errors.push(error));
        return;
      }

      spawned.push(spawnResult.runtimeObjects[0]);
      nextRuntimeObjects.push(spawnResult.runtimeObjects[0]);
      return;
    }

    if (outcome.outcomeType === "despawn") {
      if (!hasNonEmptyString(outcome.targetInstanceId)) {
        errors.push(createSpawnDespawnError(
          RUNTIME_SPAWN_DESPAWN_ERRORS.DESPAWN_TARGET_REQUIRED,
          "Despawn outcome requires targetInstanceId.",
          `${path}.targetInstanceId`
        ));
        return;
      }

      const targetExists = nextRuntimeObjects.some((runtimeObject) => runtimeObject.instanceId === outcome.targetInstanceId);

      if (!targetExists) {
        errors.push(createSpawnDespawnError(
          RUNTIME_SPAWN_DESPAWN_ERRORS.DESPAWN_TARGET_MISSING,
          "Despawn outcome target does not exist.",
          `${path}.targetInstanceId`
        ));
        return;
      }

      nextRuntimeObjects = nextRuntimeObjects.filter((runtimeObject) => runtimeObject.instanceId !== outcome.targetInstanceId);
      despawned.push(outcome.targetInstanceId);
    }
  });

  return createSpawnDespawnResult({
    runtimeObjects: errors.length === 0 ? nextRuntimeObjects : [],
    spawned: errors.length === 0 ? spawned : [],
    despawned: errors.length === 0 ? despawned : [],
    errors,
  });
}

function createSpawnDespawnResult({ runtimeObjects, spawned, despawned, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    runtimeObjects: Object.freeze(runtimeObjects),
    spawned: Object.freeze(spawned),
    despawned: Object.freeze(despawned),
    errors: Object.freeze(errors),
  });
}

function createSpawnDespawnError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
