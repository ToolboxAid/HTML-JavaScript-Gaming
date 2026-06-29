/*
Toolbox Aid
David Quesenberry
06/03/2026
engineV2SaveLoadValidation.js
*/

import { createEngineV2SaveState } from "./engineV2SaveStateModel.js";

export const ENGINE_V2_SAVE_LOAD_ERRORS = Object.freeze({
  SAVE_DEFINITION_INVALID: "ENGINE_V2_SAVE_LOAD_SAVE_DEFINITION_INVALID",
  RUNTIME_STATE_INVALID: "ENGINE_V2_SAVE_LOAD_RUNTIME_STATE_INVALID",
  SHUTDOWN_STATE_INVALID: "ENGINE_V2_SAVE_LOAD_SHUTDOWN_STATE_INVALID",
  LOAD_REQUEST_INVALID: "ENGINE_V2_SAVE_LOAD_LOAD_REQUEST_INVALID",
  CONTINUE_REQUEST_INVALID: "ENGINE_V2_SAVE_LOAD_CONTINUE_REQUEST_INVALID",
  SAVE_FAILED: "ENGINE_V2_SAVE_LOAD_SAVE_FAILED",
  SAVE_ID_MISMATCH: "ENGINE_V2_SAVE_LOAD_SAVE_ID_MISMATCH",
  RUNTIME_STATE_NOT_CLEARED: "ENGINE_V2_SAVE_LOAD_RUNTIME_STATE_NOT_CLEARED",
  RESTORE_SURFACE_MISSING: "ENGINE_V2_SAVE_LOAD_RESTORE_SURFACE_MISSING",
});

export const ENGINE_V2_SAVE_LOAD_REQUIRED_STATE_KEYS = Object.freeze([
  "sceneState",
  "objectives",
  "health",
  "position",
  "runtime",
]);

export function validateEngineV2SaveLoadFlow({ saveDefinition, runtimeState, shutdownState, loadRequest, continueRequest }) {
  const errors = [];

  if (!isRecord(saveDefinition)) {
    errors.push(createSaveLoadError(ENGINE_V2_SAVE_LOAD_ERRORS.SAVE_DEFINITION_INVALID, "Save/load validation requires saveDefinition object.", "saveDefinition"));
  }

  if (!isRecord(runtimeState)) {
    errors.push(createSaveLoadError(ENGINE_V2_SAVE_LOAD_ERRORS.RUNTIME_STATE_INVALID, "Save/load validation requires runtimeState object.", "runtimeState"));
  }

  if (!isRecord(shutdownState)) {
    errors.push(createSaveLoadError(ENGINE_V2_SAVE_LOAD_ERRORS.SHUTDOWN_STATE_INVALID, "Save/load validation requires shutdownState object.", "shutdownState"));
  }

  if (!isRecord(loadRequest) || !hasNonEmptyString(loadRequest.saveStateId)) {
    errors.push(createSaveLoadError(ENGINE_V2_SAVE_LOAD_ERRORS.LOAD_REQUEST_INVALID, "Save/load validation requires loadRequest.saveStateId.", "loadRequest"));
  }

  if (!isRecord(continueRequest) || !hasNonEmptyString(continueRequest.saveStateId)) {
    errors.push(createSaveLoadError(ENGINE_V2_SAVE_LOAD_ERRORS.CONTINUE_REQUEST_INVALID, "Save/load validation requires continueRequest.saveStateId.", "continueRequest"));
  }

  if (errors.length > 0) {
    return createSaveLoadResult({ saveState: null, restoredRuntimeState: null, flowEvents: [], errors });
  }

  validateRuntimeStateSurfaces(runtimeState, "runtimeState").forEach((error) => errors.push(error));

  if (Object.keys(shutdownState).length > 0) {
    errors.push(createSaveLoadError(ENGINE_V2_SAVE_LOAD_ERRORS.RUNTIME_STATE_NOT_CLEARED, "Shutdown state must not retain runtime surfaces before load.", "shutdownState"));
  }

  if (errors.length > 0) {
    return createSaveLoadResult({ saveState: null, restoredRuntimeState: null, flowEvents: [], errors });
  }

  const saveResult = createEngineV2SaveState({ saveDefinition, runtimeState });

  if (!saveResult.valid) {
    return createSaveLoadResult({
      saveState: null,
      restoredRuntimeState: null,
      flowEvents: [],
      errors: [
        createSaveLoadError(ENGINE_V2_SAVE_LOAD_ERRORS.SAVE_FAILED, "Save/load validation failed save-state creation.", "saveDefinition"),
        ...saveResult.errors,
      ],
    });
  }

  if (loadRequest.saveStateId !== saveResult.saveState.saveStateId || continueRequest.saveStateId !== saveResult.saveState.saveStateId) {
    return createSaveLoadResult({
      saveState: null,
      restoredRuntimeState: null,
      flowEvents: [],
      errors: [createSaveLoadError(ENGINE_V2_SAVE_LOAD_ERRORS.SAVE_ID_MISMATCH, "Load and continue requests must reference the created save state.", "loadRequest.saveStateId")],
    });
  }

  validateRestoredPayload(saveResult.saveState.payload, "saveState.payload").forEach((error) => errors.push(error));

  if (errors.length > 0) {
    return createSaveLoadResult({ saveState: null, restoredRuntimeState: null, flowEvents: [], errors });
  }

  const restoredRuntimeState = freezeJsonClone(saveResult.saveState.payload);

  return createSaveLoadResult({
    saveState: saveResult.saveState,
    restoredRuntimeState,
    flowEvents: Object.freeze([
      Object.freeze({ flowStep: "save", saveStateId: saveResult.saveState.saveStateId }),
      Object.freeze({ flowStep: "shutdown", saveStateId: saveResult.saveState.saveStateId }),
      Object.freeze({ flowStep: "load", saveStateId: loadRequest.saveStateId }),
      Object.freeze({ flowStep: "continue", saveStateId: continueRequest.saveStateId }),
    ]),
    errors,
  });
}

function validateRuntimeStateSurfaces(runtimeState, path) {
  const errors = [];

  ["inventory", "equipment", "state"].forEach((surface) => {
    if (!Object.hasOwn(runtimeState, surface)) {
      errors.push(createSaveLoadError(ENGINE_V2_SAVE_LOAD_ERRORS.RESTORE_SURFACE_MISSING, "Runtime state is missing required save/load surface.", `${path}.${surface}`));
    }
  });

  if (!isRecord(runtimeState.state)) {
    errors.push(createSaveLoadError(ENGINE_V2_SAVE_LOAD_ERRORS.RUNTIME_STATE_INVALID, "Runtime state must include state object.", `${path}.state`));
    return errors;
  }

  ENGINE_V2_SAVE_LOAD_REQUIRED_STATE_KEYS.forEach((stateKey) => {
    if (!Object.hasOwn(runtimeState.state, stateKey)) {
      errors.push(createSaveLoadError(ENGINE_V2_SAVE_LOAD_ERRORS.RESTORE_SURFACE_MISSING, "Runtime state.state is missing required restore key.", `${path}.state.${stateKey}`));
    }
  });

  return errors;
}

function validateRestoredPayload(payload, path) {
  const errors = [];

  ["inventory", "equipment", "state"].forEach((surface) => {
    if (!Object.hasOwn(payload, surface)) {
      errors.push(createSaveLoadError(ENGINE_V2_SAVE_LOAD_ERRORS.RESTORE_SURFACE_MISSING, "Save payload is missing required restore surface.", `${path}.${surface}`));
    }
  });

  ENGINE_V2_SAVE_LOAD_REQUIRED_STATE_KEYS.forEach((stateKey) => {
    if (!Object.hasOwn(payload.state || {}, stateKey)) {
      errors.push(createSaveLoadError(ENGINE_V2_SAVE_LOAD_ERRORS.RESTORE_SURFACE_MISSING, "Save payload state is missing required restore key.", `${path}.state.${stateKey}`));
    }
  });

  return errors;
}

function createSaveLoadResult({ saveState, restoredRuntimeState, flowEvents, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    saveState,
    restoredRuntimeState,
    flowEvents: Object.freeze(flowEvents),
    errors: Object.freeze(errors),
  });
}

function createSaveLoadError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function freezeJsonClone(value) {
  return Object.freeze(JSON.parse(JSON.stringify(value)));
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
