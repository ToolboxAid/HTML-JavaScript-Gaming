/*
Toolbox Aid
David Quesenberry
06/02/2026
Wave3ToolContractBaselineValidation.test.mjs
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
  new URL("../fixtures/project-workspaces/wave-3-tool-migration-scenarios.json", import.meta.url)
);

export const WAVE_3_TOOL_IDS = Object.freeze([
  "asset-studio",
  "game-design-studio",
  "publish-studio",
  "animation-studio",
  "particle-studio",
  "sound-studio",
  "ai-assistant",
  "code-studio",
  "input-studio",
  "localization-studio",
]);

export function run() {
  const scenarios = readScenarios();

  assert.equal(scenarios.wave, "wave-3");
  assert.match(scenarios.sourcePlanning, /Future activation backlog/);
  assert.deepEqual(scenarios.tools.map((tool) => tool.toolId), WAVE_3_TOOL_IDS);
  assert.equal(scenarios.wave1Decision, "SKIP / already closed");
  assert.equal(scenarios.wave2Decision, "SKIP / already closed");

  for (const tool of scenarios.tools) {
    const toolContract = getWave3ToolContract(tool.toolId);
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

  for (const tool of scenarios.tools) {
    const projectWorkspaceValidation = validateProjectWorkspaceRuntimeContract(createProjectWorkspaceContext(tool.toolId, "opening"));
    assert.equal(projectWorkspaceValidation.valid, true, tool.toolId);
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

export function getWave3ToolContract(toolId) {
  const toolContract = TOOL_CONTRACT_LIST.find((contract) => contract.toolId === toolId);
  assert.ok(toolContract, `Wave 3 tool contract exists: ${toolId}`);
  return toolContract;
}

export function createProjectWorkspaceContext(toolId, flowState) {
  return Object.freeze({
    activeProjectId: "project.wave3",
    activeToolId: toolId,
    activeToolStateId: `tool-state.wave3.${toolId}`,
    dirty: false,
    recoveryAvailable: false,
    flowState,
  });
}

export function createLaunch(toolId) {
  return Object.freeze({
    selectedToolId: toolId,
    projectWorkspace: createProjectWorkspaceContext(toolId, "opening"),
    manifestInput: Object.freeze({
      manifestId: "manifest.wave3",
      projectId: "project.wave3",
      projectType: "game",
      version: 1,
    }),
    toolStateInput: Object.freeze({
      toolStateId: `tool-state.wave3.${toolId}`,
      projectId: "project.wave3",
      toolType: toolId,
      version: 1,
    }),
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
