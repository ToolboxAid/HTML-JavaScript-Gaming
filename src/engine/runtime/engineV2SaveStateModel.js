/*
Toolbox Aid
David Quesenberry
06/03/2026
engineV2SaveStateModel.js
*/

export const ENGINE_V2_SAVE_STATE_SURFACES = Object.freeze({
  INVENTORY: "inventory",
  EQUIPMENT: "equipment",
  CURRENCY: "currency",
  STATE: "state",
  CHECKPOINTS: "checkpoints",
  PROFILE: "profile",
});

export const ENGINE_V2_SAVE_STATE_ERRORS = Object.freeze({
  DEFINITION_INVALID: "ENGINE_V2_SAVE_STATE_DEFINITION_INVALID",
  RUNTIME_STATE_INVALID: "ENGINE_V2_SAVE_STATE_RUNTIME_STATE_INVALID",
  SURFACE_INVALID: "ENGINE_V2_SAVE_STATE_SURFACE_INVALID",
  SURFACE_MISSING: "ENGINE_V2_SAVE_STATE_SURFACE_MISSING",
});

const SURFACE_LIST = Object.freeze(Object.values(ENGINE_V2_SAVE_STATE_SURFACES));

export function createEngineV2SaveState({ saveDefinition, runtimeState }) {
  const errors = [];

  validateSaveDefinition(saveDefinition, "saveDefinition").forEach((error) => errors.push(error));

  if (!isRecord(runtimeState)) {
    errors.push(createSaveStateError(ENGINE_V2_SAVE_STATE_ERRORS.RUNTIME_STATE_INVALID, "Save-state model requires runtimeState object.", "runtimeState"));
  }

  if (errors.length > 0) {
    return createSaveStateResult({ saveState: null, errors });
  }

  const payload = {};

  saveDefinition.persistedSurfaces.forEach((surface) => {
    if (!SURFACE_LIST.includes(surface)) {
      errors.push(createSaveStateError(ENGINE_V2_SAVE_STATE_ERRORS.SURFACE_INVALID, "Save-state persisted surface is not approved.", "saveDefinition.persistedSurfaces"));
      return;
    }

    if (!Object.hasOwn(runtimeState, surface)) {
      errors.push(createSaveStateError(ENGINE_V2_SAVE_STATE_ERRORS.SURFACE_MISSING, "Runtime state is missing requested persisted surface.", `runtimeState.${surface}`));
      return;
    }

    payload[surface] = cloneJson(runtimeState[surface]);
  });

  if (errors.length > 0) {
    return createSaveStateResult({ saveState: null, errors });
  }

  return createSaveStateResult({
    saveState: Object.freeze({
      saveStateId: saveDefinition.saveStateId,
      ownerInstanceId: saveDefinition.ownerInstanceId,
      projectId: saveDefinition.projectId,
      version: saveDefinition.version,
      persistedSurfaces: Object.freeze([...saveDefinition.persistedSurfaces]),
      payload: Object.freeze(payload),
    }),
    errors,
  });
}

function validateSaveDefinition(definition, path) {
  if (!isRecord(definition) || !hasNonEmptyString(definition.saveStateId) || !hasNonEmptyString(definition.ownerInstanceId) || !hasNonEmptyString(definition.projectId) || !hasNonEmptyString(definition.version) || !Array.isArray(definition.persistedSurfaces) || definition.persistedSurfaces.length === 0) {
    return [createSaveStateError(ENGINE_V2_SAVE_STATE_ERRORS.DEFINITION_INVALID, "Save definition requires saveStateId, ownerInstanceId, projectId, version, and persistedSurfaces.", path)];
  }

  return [];
}

function createSaveStateResult({ saveState, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    saveState,
    errors: Object.freeze(errors),
  });
}

function createSaveStateError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
