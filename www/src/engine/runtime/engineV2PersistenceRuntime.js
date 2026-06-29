/*
Toolbox Aid
David Quesenberry
06/03/2026
engineV2PersistenceRuntime.js
*/

import { createEngineV2SaveState } from "./engineV2SaveStateModel.js";

export const ENGINE_V2_PERSISTENCE_ACTIONS = Object.freeze({
  SAVE: "save",
  LOAD: "load",
});

export const ENGINE_V2_PERSISTENCE_ERRORS = Object.freeze({
  DEFINITION_INVALID: "ENGINE_V2_PERSISTENCE_DEFINITION_INVALID",
  ACTIONS_INVALID: "ENGINE_V2_PERSISTENCE_ACTIONS_INVALID",
  SAVE_STATES_INVALID: "ENGINE_V2_PERSISTENCE_SAVE_STATES_INVALID",
  ACTION_INVALID: "ENGINE_V2_PERSISTENCE_ACTION_INVALID",
  SAVE_STATE_MISSING: "ENGINE_V2_PERSISTENCE_SAVE_STATE_MISSING",
  SAVE_STATE_FAILED: "ENGINE_V2_PERSISTENCE_SAVE_STATE_FAILED",
});

export function processEngineV2Persistence({ persistenceDefinition, persistenceActions, saveStates }) {
  const errors = [];

  validatePersistenceDefinition(persistenceDefinition, "persistenceDefinition").forEach((error) => errors.push(error));

  if (!Array.isArray(persistenceActions)) {
    errors.push(createPersistenceError(ENGINE_V2_PERSISTENCE_ERRORS.ACTIONS_INVALID, "Persistence runtime requires persistenceActions array.", "persistenceActions"));
  }

  if (!Array.isArray(saveStates)) {
    errors.push(createPersistenceError(ENGINE_V2_PERSISTENCE_ERRORS.SAVE_STATES_INVALID, "Persistence runtime requires saveStates array.", "saveStates"));
  }

  if (errors.length > 0) {
    return createPersistenceResult({ saveSnapshots: [], loadResults: [], persistenceEvents: [], errors });
  }

  persistenceActions.forEach((action, index) => validatePersistenceAction(action, `persistenceActions[${index}]`).forEach((error) => errors.push(error)));

  if (errors.length > 0) {
    return createPersistenceResult({ saveSnapshots: [], loadResults: [], persistenceEvents: [], errors });
  }

  const saveSnapshots = [];
  const loadResults = [];
  const persistenceEvents = [];

  persistenceActions.forEach((action, index) => {
    const path = `persistenceActions[${index}]`;

    if (action.actionType === ENGINE_V2_PERSISTENCE_ACTIONS.SAVE) {
      const saveResult = createEngineV2SaveState({
        saveDefinition: {
          saveStateId: action.saveStateId,
          ownerInstanceId: action.ownerInstanceId,
          projectId: persistenceDefinition.projectId,
          version: action.version,
          persistedSurfaces: persistenceDefinition.persistedSurfaces,
        },
        runtimeState: action.runtimeState,
      });

      if (!saveResult.valid) {
        errors.push(createPersistenceError(ENGINE_V2_PERSISTENCE_ERRORS.SAVE_STATE_FAILED, "Persistence save action failed save-state validation.", path));
        saveResult.errors.forEach((error) => errors.push(error));
        return;
      }

      saveSnapshots.push(saveResult.saveState);
      persistenceEvents.push(Object.freeze({ actionId: action.actionId, actionType: action.actionType, saveStateId: action.saveStateId }));
      return;
    }

    const saveState = saveStates.find((entry) => entry.saveStateId === action.saveStateId);

    if (!saveState) {
      errors.push(createPersistenceError(ENGINE_V2_PERSISTENCE_ERRORS.SAVE_STATE_MISSING, "Persistence load action references missing save state.", `${path}.saveStateId`));
      return;
    }

    loadResults.push(Object.freeze({ actionId: action.actionId, saveStateId: action.saveStateId, payload: saveState.payload }));
    persistenceEvents.push(Object.freeze({ actionId: action.actionId, actionType: action.actionType, saveStateId: action.saveStateId }));
  });

  if (errors.length > 0) {
    return createPersistenceResult({ saveSnapshots: [], loadResults: [], persistenceEvents: [], errors });
  }

  return createPersistenceResult({ saveSnapshots, loadResults, persistenceEvents, errors });
}

function validatePersistenceDefinition(definition, path) {
  if (!isRecord(definition) || !hasNonEmptyString(definition.projectId) || !Array.isArray(definition.persistedSurfaces) || definition.persistedSurfaces.length === 0) {
    return [createPersistenceError(ENGINE_V2_PERSISTENCE_ERRORS.DEFINITION_INVALID, "Persistence definition requires projectId and persistedSurfaces.", path)];
  }

  return [];
}

function validatePersistenceAction(action, path) {
  if (!isRecord(action) || !hasNonEmptyString(action.actionId) || !hasNonEmptyString(action.saveStateId) || !Object.values(ENGINE_V2_PERSISTENCE_ACTIONS).includes(action.actionType)) {
    return [createPersistenceError(ENGINE_V2_PERSISTENCE_ERRORS.ACTION_INVALID, "Persistence action requires actionId, saveStateId, and actionType.", path)];
  }

  if (action.actionType === ENGINE_V2_PERSISTENCE_ACTIONS.SAVE && (!hasNonEmptyString(action.ownerInstanceId) || !hasNonEmptyString(action.version) || !isRecord(action.runtimeState))) {
    return [createPersistenceError(ENGINE_V2_PERSISTENCE_ERRORS.ACTION_INVALID, "Persistence save action requires ownerInstanceId, version, and runtimeState.", path)];
  }

  return [];
}

function createPersistenceResult({ saveSnapshots, loadResults, persistenceEvents, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    saveSnapshots: Object.freeze(saveSnapshots),
    loadResults: Object.freeze(loadResults),
    persistenceEvents: Object.freeze(persistenceEvents),
    errors: Object.freeze(errors),
  });
}

function createPersistenceError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
