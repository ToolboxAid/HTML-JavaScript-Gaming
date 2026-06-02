/*
Toolbox Aid
David Quesenberry
06/02/2026
Wave1ToolStateBoundaryValidation.test.mjs
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
  WAVE_1_TOOL_IDS,
  getWave1ToolContract,
  readScenarios,
} from "./Wave1ToolContractBaselineValidation.test.mjs";

const WAVE_1_TOOLSTATE_ERRORS = Object.freeze({
  ACTIVE_OWNERSHIP_INVALID: "WAVE1_TOOLSTATE_ACTIVE_OWNERSHIP_INVALID",
  PAYLOAD_INVALID: "WAVE1_TOOLSTATE_PAYLOAD_INVALID",
  PAYLOAD_FIELD_FORBIDDEN: "WAVE1_TOOLSTATE_PAYLOAD_FIELD_FORBIDDEN",
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
  const requiredPayloadFields = new Map(scenarios.tools.map((tool) => [tool.toolId, tool.payloadRequiredField]));

  assert.deepEqual(scenarios.tools.map((tool) => tool.toolId), WAVE_1_TOOL_IDS);

  for (const scenario of scenarios.validToolStates) {
    const before = JSON.stringify(scenario.toolState);
    const validation = validateWave1ToolStateBoundary(scenario.toolState, {
      toolId: scenario.toolId,
      requiredPayloadField: requiredPayloadFields.get(scenario.toolId),
    });
    const after = JSON.stringify(scenario.toolState);

    assert.equal(validation.status, "PASS", scenario.toolId);
    assert.equal(validation.valid, true, scenario.toolId);
    assert.deepEqual(validation.errors, [], scenario.toolId);
    assert.equal(before, after, `${scenario.toolId} payload is not mutated`);

    const portableExport = createPortableToolStateExport(scenario.toolState);
    assert.equal(portableExport.valid, true, scenario.toolId);
    assert.equal(validatePortableToolStateExport(portableExport.export).valid, true, scenario.toolId);
  }

  for (const scenario of scenarios.invalidToolStates) {
    const before = JSON.stringify(scenario.toolState);
    const validation = validateWave1ToolStateBoundary(scenario.toolState, {
      toolId: scenario.toolId,
      requiredPayloadField: requiredPayloadFields.get(scenario.toolId),
    });
    const after = JSON.stringify(scenario.toolState);

    assert.equal(validation.status, "REJECT", scenario.name);
    assert.equal(validation.valid, false, scenario.name);
    assert.deepEqual(validation.errors.map((error) => error.code), scenario.expectedErrorCodes, scenario.name);
    assert.equal(before, after, `${scenario.name} payload is not mutated`);
  }
}

export function validateWave1ToolStateBoundary(toolState, {
  toolId,
  requiredPayloadField,
} = {}) {
  const errors = [];
  const toolContract = getWave1ToolContract(toolId);
  const baseValidation = validateToolStateContract(toolState);

  for (const baseError of baseValidation.errors) {
    errors.push(baseError);
  }

  if (!toolStateLinksToToolContract(toolState, toolContract)) {
    errors.push(error(WAVE_1_TOOLSTATE_ERRORS.ACTIVE_OWNERSHIP_INVALID, "toolType"));
  }

  if (!toolState?.payload || typeof toolState.payload !== "object" || Array.isArray(toolState.payload) || !Object.hasOwn(toolState.payload, requiredPayloadField)) {
    errors.push(error(WAVE_1_TOOLSTATE_ERRORS.PAYLOAD_INVALID, "payload"));
  } else {
    for (const fieldName of FORBIDDEN_PAYLOAD_FIELDS) {
      if (Object.hasOwn(toolState.payload, fieldName)) {
        errors.push(error(WAVE_1_TOOLSTATE_ERRORS.PAYLOAD_FIELD_FORBIDDEN, `payload.${fieldName}`));
      }
    }
  }

  return Object.freeze({
    valid: errors.length === 0,
    status: errors.length === 0 ? "PASS" : "REJECT",
    errors: Object.freeze(errors),
  });
}

function error(code, path) {
  return Object.freeze({ code, path });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
