/*
Toolbox Aid
David Quesenberry
06/02/2026
Wave2ToolContractBaselineValidation.test.mjs
*/
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  validateGameManifestContract,
} from "../../../src/shared/contracts/gameManifestContract.js";
import {
  validateProjectWorkspaceRuntimeContract,
} from "../../../src/shared/contracts/projectWorkspaceRuntimeContract.js";
import {
  TOOL_CONTRACT_LIST,
} from "../../../src/shared/contracts/tools/toolContractsIndex.js";
import {
  TOOL_CONTRACT_OWNER_ID,
  TOOL_CONTRACT_PROJECT_ID,
  createPortableToolContractExport,
  validatePortableToolContractExport,
  validateToolContract,
} from "../../../src/shared/contracts/tools/toolContract.js";
import {
  validateProjectWorkspaceManifestHandoffBoundary,
} from "./ProjectWorkspaceManifestHandoffBoundaryValidation.test.mjs";

const scenariosPath = fileURLToPath(
  new URL("../fixtures/project-workspaces/wave-2-tool-migration-scenarios.json", import.meta.url)
);

export const WAVE_2_TOOL_IDS = Object.freeze([
  "tile-map-editor",
  "parallax-editor",
  "sprite-editor",
  "asset-pipeline",
  "3d-camera-path-editor",
]);

export function run() {
  const scenarios = readScenarios();

  assert.deepEqual(scenarios.tools.map((tool) => tool.toolId), WAVE_2_TOOL_IDS);

  for (const tool of scenarios.tools) {
    const toolContract = getWave2ToolContract(tool.toolId);
    assert.equal(toolContract.toolType, tool.toolType, tool.toolId);
    assert.equal(toolContract.ownerId, TOOL_CONTRACT_OWNER_ID, tool.toolId);
    assert.equal(toolContract.projectId, TOOL_CONTRACT_PROJECT_ID, tool.toolId);
    assert.deepEqual(toolContract.requiredInputs, tool.requiredInputs, tool.toolId);
    assert.deepEqual(toolContract.producedOutputs, tool.producedOutputs, tool.toolId);
    assert.equal(validateToolContract(toolContract).valid, true, tool.toolId);

    const portableExport = createPortableToolContractExport(toolContract);
    assert.equal(portableExport.valid, true, tool.toolId);
    assert.equal(validatePortableToolContractExport(portableExport.export).valid, true, tool.toolId);
    assert.equal(Object.hasOwn(portableExport.export, "ownerId"), false, tool.toolId);
    assert.equal(Object.hasOwn(portableExport.export, "projectId"), false, tool.toolId);
  }

  for (const scenario of scenarios.validLaunches) {
    const projectWorkspaceValidation = validateProjectWorkspaceRuntimeContract(scenario.launch.projectWorkspace);
    assert.equal(projectWorkspaceValidation.valid, true, scenario.name);
    assert.equal(Object.hasOwn(scenario.launch.projectWorkspace, "payload"), false, scenario.name);
    assert.equal(Object.hasOwn(scenario.launch.projectWorkspace, "fallbackData"), false, scenario.name);
  }

  for (const scenario of scenarios.manifestHandoffs) {
    const manifestValidation = validateGameManifestContract(scenario.handoff.manifest);
    assert.equal(manifestValidation.valid, true, scenario.name);
    assert.equal(validateProjectWorkspaceManifestHandoffBoundary(scenario.handoff).status, "PASS", scenario.name);
    assert.equal(Object.hasOwn(scenario.handoff.manifest, "toolPayload"), false, scenario.name);
    assert.equal(Object.hasOwn(scenario.handoff.manifest, "runtimeState"), false, scenario.name);
  }
}

export function readScenarios() {
  return JSON.parse(readFileSync(scenariosPath, "utf8"));
}

export function getWave2ToolContract(toolId) {
  const toolContract = TOOL_CONTRACT_LIST.find((contract) => contract.toolId === toolId);
  assert.ok(toolContract, `Wave 2 tool contract exists: ${toolId}`);
  return toolContract;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
