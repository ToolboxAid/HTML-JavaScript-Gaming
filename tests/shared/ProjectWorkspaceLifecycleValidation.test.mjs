/*
Toolbox Aid
David Quesenberry
06/02/2026
ProjectWorkspaceLifecycleValidation.test.mjs
*/
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  PROJECT_WORKSPACE_RUNTIME_FLOW_STATES,
  validateProjectWorkspaceRuntimeContract,
} from "../../src/shared/contracts/projectWorkspaceRuntimeContract.js";

const scenariosPath = fileURLToPath(
  new URL("../fixtures/project-workspaces/projectworkspace-lifecycle-scenarios.json", import.meta.url)
);

const VISIBLE_REJECT_PREFIX = "REJECT ProjectWorkspace lifecycle boundary:";

export const PROJECT_WORKSPACE_LIFECYCLE_ACTIONS = Object.freeze({
  CREATE: "create",
  OPEN: "open",
  SAVE: "save",
  CLOSE: "close",
  CANCEL: "cancel",
  SET_DIRTY: "setDirty",
});

const PROJECT_WORKSPACE_LIFECYCLE_ACTION_LIST = Object.freeze(Object.values(PROJECT_WORKSPACE_LIFECYCLE_ACTIONS));

const LIFECYCLE_ERRORS = Object.freeze({
  TRANSITION_INVALID: "PROJECTWORKSPACE_LIFECYCLE_TRANSITION_INVALID",
  ACTION_INVALID: "PROJECTWORKSPACE_LIFECYCLE_ACTION_INVALID",
  FORBIDDEN_FIELD: "PROJECTWORKSPACE_LIFECYCLE_FORBIDDEN_FIELD",
  CREATE_PROJECT_REQUIRED: "PROJECTWORKSPACE_LIFECYCLE_CREATE_PROJECT_REQUIRED",
  OPEN_REFERENCES_REQUIRED: "PROJECTWORKSPACE_LIFECYCLE_OPEN_REFERENCES_REQUIRED",
  SAVE_TOOLSTATE_REQUIRED: "PROJECTWORKSPACE_LIFECYCLE_SAVE_TOOLSTATE_REQUIRED",
  SAVE_DIRTY_CLEAR_REQUIRED: "PROJECTWORKSPACE_LIFECYCLE_SAVE_DIRTY_CLEAR_REQUIRED",
  CLOSE_RELEASE_REQUIRED: "PROJECTWORKSPACE_LIFECYCLE_CLOSE_RELEASE_REQUIRED",
  CANCEL_DIRTY_CLEAR_REQUIRED: "PROJECTWORKSPACE_LIFECYCLE_CANCEL_DIRTY_CLEAR_REQUIRED",
  DIRTY_BOOLEAN_REQUIRED: "PROJECTWORKSPACE_LIFECYCLE_DIRTY_BOOLEAN_REQUIRED",
});

const FORBIDDEN_TRANSITION_FIELDS = Object.freeze([
  "toolRuntime",
  "runtimeState",
  "toolPayload",
  "payloadJson",
  "sampleJson",
  "fallbackData",
  "localStorage",
  "sessionStorage",
]);

export function run() {
  const scenarios = JSON.parse(readFileSync(scenariosPath, "utf8"));

  for (const scenario of scenarios.validLifecycleTransitions) {
    const result = validateProjectWorkspaceLifecycleBoundary(scenario.transition);
    assert.equal(result.status, "PASS", scenario.name);
    assert.equal(result.valid, true, scenario.name);
    assert.equal(result.visibleMessage, "", scenario.name);
    assert.equal(result.actionable, true, scenario.name);
    assert.equal(result.toolRuntimeValidation, "SKIP / future lane", scenario.name);
    assert.equal(result.samplesDecision, "SKIP / pending rebuild", scenario.name);
  }

  for (const scenario of scenarios.invalidLifecycleTransitions) {
    const result = validateProjectWorkspaceLifecycleBoundary(scenario.transition);
    assert.equal(result.status, "REJECT", scenario.name);
    assert.equal(result.valid, false, scenario.name);
    assert.equal(result.actionable, true, scenario.name);
    assert.ok(result.visibleMessage.startsWith(VISIBLE_REJECT_PREFIX), scenario.name);
    assert.deepEqual(result.errors.map((item) => item.code), scenario.expectedErrorCodes, scenario.name);
    assert.equal(result.toolRuntimeValidation, "SKIP / future lane", scenario.name);
  }
}

export function validateProjectWorkspaceLifecycleBoundary(transition) {
  const errors = [];

  if (!isPlainObject(transition)) {
    errors.push(error(LIFECYCLE_ERRORS.TRANSITION_INVALID, "transition"));
    return reject(errors);
  }

  collectForbiddenFieldErrors(transition, "transition", errors);
  validateContext(transition.before, "before", errors);
  validateContext(transition.after, "after", errors);

  if (!PROJECT_WORKSPACE_LIFECYCLE_ACTION_LIST.includes(transition.action)) {
    errors.push(error(LIFECYCLE_ERRORS.ACTION_INVALID, "action"));
  } else {
    validateActionBoundary(transition, errors);
  }

  if (errors.length > 0) {
    return reject(errors);
  }

  return Object.freeze({
    valid: true,
    status: "PASS",
    actionable: true,
    reason: "ProjectWorkspace lifecycle transition is contract-boundary valid.",
    toolRuntimeValidation: "SKIP / future lane",
    samplesDecision: "SKIP / pending rebuild",
    visibleMessage: "",
    errors: Object.freeze([]),
  });
}

function validateActionBoundary(transition, errors) {
  const before = transition.before || {};
  const after = transition.after || {};

  if (transition.action === PROJECT_WORKSPACE_LIFECYCLE_ACTIONS.CREATE) {
    if (!hasNonEmptyString(after.activeProjectId)) {
      errors.push(error(LIFECYCLE_ERRORS.CREATE_PROJECT_REQUIRED, "after.activeProjectId"));
    }
    return;
  }

  if (transition.action === PROJECT_WORKSPACE_LIFECYCLE_ACTIONS.OPEN) {
    if (!hasNonEmptyString(after.activeProjectId)
      || !hasNonEmptyString(after.activeToolId)
      || !hasNonEmptyString(after.activeToolStateId)
      || after.flowState !== PROJECT_WORKSPACE_RUNTIME_FLOW_STATES.OPEN) {
      errors.push(error(LIFECYCLE_ERRORS.OPEN_REFERENCES_REQUIRED, "after"));
    }
    return;
  }

  if (transition.action === PROJECT_WORKSPACE_LIFECYCLE_ACTIONS.SAVE) {
    if (!hasNonEmptyString(transition.saveTargetToolStateId) || transition.saveTargetToolStateId !== after.activeToolStateId) {
      errors.push(error(LIFECYCLE_ERRORS.SAVE_TOOLSTATE_REQUIRED, "saveTargetToolStateId"));
    }
    if (before.dirty !== true || after.dirty !== false) {
      errors.push(error(LIFECYCLE_ERRORS.SAVE_DIRTY_CLEAR_REQUIRED, "after.dirty"));
    }
    return;
  }

  if (transition.action === PROJECT_WORKSPACE_LIFECYCLE_ACTIONS.CLOSE) {
    if (hasNonEmptyString(after.activeToolId) || hasNonEmptyString(after.activeToolStateId)) {
      errors.push(error(LIFECYCLE_ERRORS.CLOSE_RELEASE_REQUIRED, "after"));
    }
    return;
  }

  if (transition.action === PROJECT_WORKSPACE_LIFECYCLE_ACTIONS.CANCEL) {
    if (after.dirty !== false) {
      errors.push(error(LIFECYCLE_ERRORS.CANCEL_DIRTY_CLEAR_REQUIRED, "after.dirty"));
    }
    return;
  }

  if (transition.action === PROJECT_WORKSPACE_LIFECYCLE_ACTIONS.SET_DIRTY && typeof after.dirty !== "boolean") {
    errors.push(error(LIFECYCLE_ERRORS.DIRTY_BOOLEAN_REQUIRED, "after.dirty"));
  }
}

function validateContext(projectWorkspaceContext, pathPrefix, errors) {
  const validation = validateProjectWorkspaceRuntimeContract(projectWorkspaceContext || {});
  for (const validationError of validation.errors) {
    errors.push(Object.freeze({
      code: validationError.code,
      path: `${pathPrefix}.${validationError.path}`,
    }));
  }
}

function collectForbiddenFieldErrors(record, pathPrefix, errors) {
  for (const fieldName of FORBIDDEN_TRANSITION_FIELDS) {
    if (Object.hasOwn(record, fieldName)) {
      errors.push(error(LIFECYCLE_ERRORS.FORBIDDEN_FIELD, `${pathPrefix}.${fieldName}`));
    }
  }
}

function reject(errors) {
  return Object.freeze({
    valid: false,
    status: "REJECT",
    actionable: true,
    reason: "invalid ProjectWorkspace lifecycle transition",
    toolRuntimeValidation: "SKIP / future lane",
    samplesDecision: "SKIP / pending rebuild",
    visibleMessage: `${VISIBLE_REJECT_PREFIX} ${errors.map((item) => item.code).join(", ")}`,
    errors: Object.freeze(errors),
  });
}

function error(code, path) {
  return Object.freeze({ code, path });
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
