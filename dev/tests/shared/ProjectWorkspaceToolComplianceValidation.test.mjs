/*
Toolbox Aid
David Quesenberry
06/02/2026
ProjectWorkspaceToolComplianceValidation.test.mjs
*/
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  validateProjectWorkspaceRuntimeContract,
} from "../../../src/shared/contracts/projectWorkspaceRuntimeContract.js";
import {
  validateToolStateContract,
} from "../../../src/shared/contracts/toolStateContract.js";
import {
  TOOL_CONTRACT_LIST,
} from "../../../src/shared/contracts/tools/toolContractsIndex.js";
import {
  toolStateLinksToToolContract,
  validateToolContract,
} from "../../../src/shared/contracts/tools/toolContract.js";
import {
  validateProjectWorkspaceLaunchBoundary,
} from "./ProjectWorkspaceLaunchBoundaryValidation.test.mjs";
import {
  validateProjectWorkspaceManifestHandoffBoundary,
} from "./ProjectWorkspaceManifestHandoffBoundaryValidation.test.mjs";
import {
  WAVE_1_TOOL_IDS,
} from "./Wave1ToolContractBaselineValidation.test.mjs";
import {
  run as runWave1Closeout,
} from "./Wave1MigrationCloseoutValidation.test.mjs";
import {
  WAVE_2_TOOL_IDS,
} from "./Wave2ToolContractBaselineValidation.test.mjs";
import {
  run as runWave2Closeout,
} from "./Wave2MigrationCloseoutValidation.test.mjs";
import {
  WAVE_3_TOOL_IDS,
} from "./Wave3ToolContractBaselineValidation.test.mjs";
import {
  run as runWave3Closeout,
} from "./Wave3MigrationCloseoutValidation.test.mjs";

const scenariosPath = fileURLToPath(
  new URL("../fixtures/project-workspaces/projectworkspace-migration-governance-scenarios.json", import.meta.url)
);

export function run() {
  const scenarios = readGovernanceScenarios();

  assert.deepEqual(scenarios.wave1ToolIds, WAVE_1_TOOL_IDS);
  assert.deepEqual(scenarios.wave2ToolIds, WAVE_2_TOOL_IDS);
  assert.deepEqual(scenarios.wave3ToolIds, WAVE_3_TOOL_IDS);
  assert.equal(scenarios.samplesDecision, "SKIP / pending rebuild");
  assert.equal(scenarios.runtimeImplementationDecision, "SKIP / future feature lane");
  assert.deepEqual(scenarios.remainingUnmigratedToolIds, []);

  runWave1Closeout();
  runWave2Closeout();
  runWave3Closeout();

  const migratedToolIds = migratedProjectWorkspaceToolIds(scenarios);
  assert.equal(migratedToolIds.length, 33);
  assert.equal(new Set(migratedToolIds).size, migratedToolIds.length);

  for (const toolId of migratedToolIds) {
    const toolContract = getToolContract(toolId);
    assert.equal(validateToolContract(toolContract).valid, true, toolId);
  }

  for (const toolId of scenarios.currentProjectWorkspaceLaunchableToolIds) {
    const projectWorkspace = createProjectWorkspaceContext(toolId);
    const toolState = createToolState(toolId);
    const launch = createLaunch(toolId);
    const handoff = createManifestHandoff(toolId, projectWorkspace);
    const toolContract = getToolContract(toolId);

    assert.equal(validateProjectWorkspaceRuntimeContract(projectWorkspace).valid, true, toolId);
    assert.equal(validateProjectWorkspaceLaunchBoundary(launch).status, "PASS", toolId);
    assert.equal(validateProjectWorkspaceManifestHandoffBoundary(handoff).status, "PASS", toolId);
    assert.equal(validateToolStateContract(toolState).valid, true, toolId);
    assert.equal(toolStateLinksToToolContract(toolState, toolContract), true, toolId);
    assert.equal(Object.hasOwn(projectWorkspace, "payload"), false, toolId);
    assert.equal(Object.hasOwn(projectWorkspace, "toolState"), false, toolId);
    assert.equal(Object.hasOwn(handoff.manifest, "runtimeState"), false, toolId);
    assert.equal(Object.hasOwn(handoff.manifest, "toolPayload"), false, toolId);
  }
}

export function readGovernanceScenarios() {
  return JSON.parse(readFileSync(scenariosPath, "utf8"));
}

export function migratedProjectWorkspaceToolIds(scenarios = readGovernanceScenarios()) {
  return Object.freeze([
    ...scenarios.currentProjectWorkspaceLaunchableToolIds,
    ...scenarios.wave1ToolIds,
    ...scenarios.wave2ToolIds,
    ...scenarios.wave3ToolIds,
  ]);
}

export function getToolContract(toolId) {
  const toolContract = TOOL_CONTRACT_LIST.find((contract) => contract.toolId === toolId);
  assert.ok(toolContract, `tool contract exists: ${toolId}`);
  return toolContract;
}

function createProjectWorkspaceContext(toolId) {
  return Object.freeze({
    activeProjectId: "project.migration-closeout",
    activeToolId: toolId,
    activeToolStateId: `tool-state.migration-closeout.${toolId}`,
    dirty: false,
    recoveryAvailable: false,
    flowState: "opening",
  });
}

function createLaunch(toolId) {
  return Object.freeze({
    selectedToolId: toolId,
    projectWorkspace: createProjectWorkspaceContext(toolId),
    manifestInput: Object.freeze({
      manifestId: "manifest.migration-closeout",
      projectId: "project.migration-closeout",
      projectType: "game",
      version: 1,
    }),
    toolStateInput: Object.freeze({
      toolStateId: `tool-state.migration-closeout.${toolId}`,
      projectId: "project.migration-closeout",
      toolType: toolId,
      version: 1,
    }),
  });
}

function createManifestHandoff(toolId, projectWorkspace) {
  return Object.freeze({
    projectWorkspace,
    manifest: Object.freeze({
      manifestId: "manifest.migration-closeout",
      ownerId: "user.owner",
      projectId: "project.migration-closeout",
      projectType: "game",
      sourceToolStates: Object.freeze([
        Object.freeze({
          toolStateId: `tool-state.migration-closeout.${toolId}`,
          toolType: toolId,
          version: 1,
        }),
      ]),
      sourceAssets: Object.freeze([
        Object.freeze({
          assetId: `asset.migration-closeout.${toolId}`,
          assetType: "image",
          version: 1,
        }),
      ]),
      visibility: "project",
      version: 1,
      status: "active",
      exportFormat: "game-manifest-json",
    }),
    declaredManifestFields: Object.freeze(["manifestId", "projectId", "projectType", "sourceToolStates", "sourceAssets", "visibility", "version", "status", "exportFormat"]),
    downstreamUseFields: Object.freeze(["manifestId", "projectId", "sourceToolStates"]),
  });
}

function createToolState(toolId) {
  return Object.freeze({
    toolStateId: `tool-state.migration-closeout.${toolId}`,
    toolType: toolId,
    ownerId: "user.owner",
    projectId: "project.migration-closeout",
    visibility: "project",
    version: 1,
    status: "active",
    payload: Object.freeze({
      summary: "migration closeout validation payload",
    }),
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
