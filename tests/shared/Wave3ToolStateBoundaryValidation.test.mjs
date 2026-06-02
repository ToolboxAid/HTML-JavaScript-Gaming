/*
Toolbox Aid
David Quesenberry
06/02/2026
Wave3ToolStateBoundaryValidation.test.mjs
*/
import assert from "node:assert/strict";
import {
  createPortableToolStateExport,
  validatePortableToolStateExport,
  validateToolStateContract,
} from "../../src/shared/contracts/toolStateContract.js";
import {
  toolStateLinksToToolContract,
} from "../../src/shared/contracts/tools/toolContract.js";
import {
  WAVE_3_TOOL_IDS,
  getWave3ToolContract,
  readScenarios,
} from "./Wave3ToolContractBaselineValidation.test.mjs";

const WAVE_3_TOOLSTATE_ERRORS = Object.freeze({
  ACTIVE_OWNERSHIP_INVALID: "WAVE3_TOOLSTATE_ACTIVE_OWNERSHIP_INVALID",
  PAYLOAD_INVALID: "WAVE3_TOOLSTATE_PAYLOAD_INVALID",
  PAYLOAD_FIELD_FORBIDDEN: "WAVE3_TOOLSTATE_PAYLOAD_FIELD_FORBIDDEN",
});

const FORBIDDEN_PAYLOAD_FIELDS = Object.freeze([
  "fallbackData",
  "sampleJson",
  "localStorage",
  "sessionStorage",
  "workspaceState",
  "projectWorkspace",
  "toolRuntime",
  "runtimeState",
  "payloadJson",
]);

export function run() {
  const scenarios = readScenarios();

  assert.deepEqual(scenarios.tools.map((tool) => tool.toolId), WAVE_3_TOOL_IDS);

  for (const tool of scenarios.tools) {
    const toolState = createValidToolState(tool);
    const before = JSON.stringify(toolState);
    const validation = validateWave3ToolStateBoundary(toolState, {
      toolId: tool.toolId,
      requiredPayloadField: tool.payloadRequiredField,
    });
    const after = JSON.stringify(toolState);

    assert.equal(validation.status, "PASS", tool.toolId);
    assert.equal(validation.valid, true, tool.toolId);
    assert.deepEqual(validation.errors, [], tool.toolId);
    assert.equal(before, after, `${tool.toolId} payload is not mutated`);

    const portableExport = createPortableToolStateExport(toolState);
    assert.equal(portableExport.valid, true, tool.toolId);
    assert.equal(validatePortableToolStateExport(portableExport.export).valid, true, tool.toolId);
  }

  for (const scenario of scenarios.invalidToolStates) {
    const tool = scenarios.tools.find((item) => item.toolId === scenario.toolId);
    const before = JSON.stringify(scenario.toolState);
    const validation = validateWave3ToolStateBoundary(scenario.toolState, {
      toolId: scenario.toolId,
      requiredPayloadField: tool.payloadRequiredField,
    });
    const after = JSON.stringify(scenario.toolState);

    assert.equal(validation.status, "REJECT", scenario.name);
    assert.equal(validation.valid, false, scenario.name);
    assert.deepEqual(validation.errors.map((error) => error.code), scenario.expectedErrorCodes, scenario.name);
    assert.equal(before, after, `${scenario.name} payload is not mutated`);
  }
}

export function validateWave3ToolStateBoundary(toolState, {
  toolId,
  requiredPayloadField,
} = {}) {
  const errors = [];
  const toolContract = getWave3ToolContract(toolId);
  const baseValidation = validateToolStateContract(toolState);

  for (const baseError of baseValidation.errors) {
    errors.push(baseError);
  }

  if (!toolStateLinksToToolContract(toolState, toolContract)) {
    errors.push(error(WAVE_3_TOOLSTATE_ERRORS.ACTIVE_OWNERSHIP_INVALID, "toolType"));
  }

  if (!toolState?.payload || typeof toolState.payload !== "object" || Array.isArray(toolState.payload) || !Object.hasOwn(toolState.payload, requiredPayloadField)) {
    errors.push(error(WAVE_3_TOOLSTATE_ERRORS.PAYLOAD_INVALID, "payload"));
  } else {
    for (const fieldName of FORBIDDEN_PAYLOAD_FIELDS) {
      if (Object.hasOwn(toolState.payload, fieldName)) {
        errors.push(error(WAVE_3_TOOLSTATE_ERRORS.PAYLOAD_FIELD_FORBIDDEN, `payload.${fieldName}`));
      }
    }
  }

  return Object.freeze({
    valid: errors.length === 0,
    status: errors.length === 0 ? "PASS" : "REJECT",
    errors: Object.freeze(errors),
  });
}

export function createValidToolState(tool) {
  return Object.freeze({
    toolStateId: `tool-state.wave3.${tool.toolId}`,
    toolType: tool.toolId,
    ownerId: "user.owner",
    projectId: "project.wave3",
    visibility: "project",
    version: 1,
    status: "active",
    assetRefs: Object.freeze(createAssetRefs(tool)),
    payload: Object.freeze({
      [tool.payloadRequiredField]: Object.freeze(tool.payloadExample),
    }),
  });
}

function createAssetRefs(tool) {
  if (!Array.isArray(tool.producedOutputs) || tool.producedOutputs.length === 0) {
    return [];
  }

  if (tool.producedOutputs.some((output) => output.includes("audio"))) {
    return [`asset.wave3.${tool.toolId}.audio`];
  }

  if (tool.producedOutputs.some((output) => output.includes("localization"))) {
    return [`asset.wave3.${tool.toolId}.localization`];
  }

  if (tool.producedOutputs.some((output) => output.includes("image") || output.includes("vector") || output.includes("palette"))) {
    return [`asset.wave3.${tool.toolId}`];
  }

  return [];
}

function error(code, path) {
  return Object.freeze({ code, path });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
