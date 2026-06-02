/*
Toolbox Aid
David Quesenberry
06/02/2026
ProjectWorkspaceManifestHandoffBoundaryValidation.test.mjs
*/
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  validateGameManifestContract,
} from "../../src/shared/contracts/gameManifestContract.js";
import {
  validateProjectWorkspaceRuntimeContract,
} from "../../src/shared/contracts/projectWorkspaceRuntimeContract.js";

const scenariosPath = fileURLToPath(
  new URL("../fixtures/project-workspaces/projectworkspace-manifest-handoff-boundary-scenarios.json", import.meta.url)
);

const VISIBLE_REJECT_PREFIX = "REJECT ProjectWorkspace manifest handoff boundary:";

const MANIFEST_HANDOFF_ERRORS = Object.freeze({
  PROJECT_WORKSPACE_REQUIRED: "PROJECTWORKSPACE_MANIFEST_HANDOFF_PROJECTWORKSPACE_REQUIRED",
  MANIFEST_REQUIRED: "PROJECTWORKSPACE_MANIFEST_HANDOFF_MANIFEST_REQUIRED",
  DECLARED_FIELDS_REQUIRED: "PROJECTWORKSPACE_MANIFEST_HANDOFF_DECLARED_FIELDS_REQUIRED",
  DOWNSTREAM_FIELDS_REQUIRED: "PROJECTWORKSPACE_MANIFEST_HANDOFF_DOWNSTREAM_FIELDS_REQUIRED",
  UNDECLARED_FIELD: "PROJECTWORKSPACE_MANIFEST_HANDOFF_UNDECLARED_FIELD",
  FORBIDDEN_FIELD: "PROJECTWORKSPACE_MANIFEST_HANDOFF_FORBIDDEN_FIELD",
});

const FORBIDDEN_HANDOFF_FIELDS = Object.freeze([
  "runtimeState",
  "toolRuntime",
  "toolState",
  "toolStates",
  "toolPayload",
  "payloadJson",
  "fallbackData",
  "sampleJson",
  "localStorage",
  "sessionStorage",
  "renderState",
  "renderedCanvas",
]);

export function run() {
  const scenarios = JSON.parse(readFileSync(scenariosPath, "utf8"));

  for (const scenario of scenarios.validHandoffs) {
    const result = validateProjectWorkspaceManifestHandoffBoundary(scenario.handoff);
    assert.equal(result.status, "PASS", scenario.name);
    assert.equal(result.valid, true, scenario.name);
    assert.equal(result.visibleMessage, "", scenario.name);
    assert.equal(result.toolRenderingValidated, false, scenario.name);
    assert.equal(result.samplesDecision, "SKIP / pending rebuild", scenario.name);
  }

  for (const scenario of scenarios.invalidHandoffs) {
    const result = validateProjectWorkspaceManifestHandoffBoundary(scenario.handoff);
    assert.equal(result.status, "REJECT", scenario.name);
    assert.equal(result.valid, false, scenario.name);
    assert.equal(result.rejectedBeforeDownstreamUse, true, scenario.name);
    assert.ok(result.visibleMessage.startsWith(VISIBLE_REJECT_PREFIX), scenario.name);
    assert.deepEqual(result.errors.map((item) => item.code), scenario.expectedErrorCodes, scenario.name);
    assert.equal(result.toolRenderingValidated, false, scenario.name);
  }
}

export function validateProjectWorkspaceManifestHandoffBoundary(handoff) {
  const errors = [];

  if (!isPlainObject(handoff)) {
    errors.push(error(MANIFEST_HANDOFF_ERRORS.MANIFEST_REQUIRED, "handoff"));
    return reject(errors);
  }

  if (!isPlainObject(handoff.projectWorkspace)) {
    errors.push(error(MANIFEST_HANDOFF_ERRORS.PROJECT_WORKSPACE_REQUIRED, "projectWorkspace"));
  } else {
    const projectWorkspaceValidation = validateProjectWorkspaceRuntimeContract(handoff.projectWorkspace);
    for (const projectWorkspaceError of projectWorkspaceValidation.errors) {
      errors.push(projectWorkspaceError);
    }
  }

  if (!isPlainObject(handoff.manifest)) {
    errors.push(error(MANIFEST_HANDOFF_ERRORS.MANIFEST_REQUIRED, "manifest"));
  } else {
    collectForbiddenFieldErrors(handoff.manifest, "manifest", errors);
    const manifestValidation = validateGameManifestContract(handoff.manifest);
    for (const manifestError of manifestValidation.errors) {
      errors.push(manifestError);
    }
  }

  if (!isNonEmptyStringArray(handoff.declaredManifestFields)) {
    errors.push(error(MANIFEST_HANDOFF_ERRORS.DECLARED_FIELDS_REQUIRED, "declaredManifestFields"));
  }

  if (!isNonEmptyStringArray(handoff.downstreamUseFields)) {
    errors.push(error(MANIFEST_HANDOFF_ERRORS.DOWNSTREAM_FIELDS_REQUIRED, "downstreamUseFields"));
  }

  if (isNonEmptyStringArray(handoff.declaredManifestFields) && isNonEmptyStringArray(handoff.downstreamUseFields)) {
    const declaredFields = new Set(handoff.declaredManifestFields);
    for (const fieldName of handoff.downstreamUseFields) {
      if (!declaredFields.has(fieldName)) {
        errors.push(error(MANIFEST_HANDOFF_ERRORS.UNDECLARED_FIELD, `downstreamUseFields.${fieldName}`));
      }
    }
  }

  if (errors.length > 0) {
    return reject(errors);
  }

  return Object.freeze({
    valid: true,
    status: "PASS",
    reason: "ProjectWorkspace manifest handoff consumes declared fields only.",
    rejectedBeforeDownstreamUse: false,
    toolRenderingValidated: false,
    samplesDecision: "SKIP / pending rebuild",
    visibleMessage: "",
    errors: Object.freeze([]),
  });
}

function collectForbiddenFieldErrors(record, pathPrefix, errors) {
  for (const fieldName of FORBIDDEN_HANDOFF_FIELDS) {
    if (Object.hasOwn(record, fieldName)) {
      errors.push(error(MANIFEST_HANDOFF_ERRORS.FORBIDDEN_FIELD, `${pathPrefix}.${fieldName}`));
    }
  }
}

function reject(errors) {
  return Object.freeze({
    valid: false,
    status: "REJECT",
    reason: "invalid ProjectWorkspace manifest handoff",
    rejectedBeforeDownstreamUse: true,
    toolRenderingValidated: false,
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

function isNonEmptyStringArray(value) {
  return Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === "string" && item.trim().length > 0);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
