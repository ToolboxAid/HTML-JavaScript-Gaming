/*
Toolbox Aid
David Quesenberry
06/02/2026
ProjectWorkspaceToolRegistrationValidation.test.mjs
*/
import assert from "node:assert/strict";
import {
  TOOL_INDEX_ROOT_CARD_COVERAGE,
} from "../../../src/shared/contracts/tools/toolContractsIndex.js";
import {
  getActiveToolRegistry,
} from "../../../www/toolbox/toolRegistry.js";
import {
  WorkspaceManagerV2ContextService,
} from "../../../www/toolbox/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js";
import {
  validateProjectWorkspaceLaunchBoundary,
} from "./ProjectWorkspaceLaunchBoundaryValidation.test.mjs";
import {
  getToolContract,
  readGovernanceScenarios,
} from "./ProjectWorkspaceToolComplianceValidation.test.mjs";
import {
  readScenarios as readWave1Scenarios,
} from "./Wave1ToolContractBaselineValidation.test.mjs";
import {
  readScenarios as readWave2Scenarios,
} from "./Wave2ToolContractBaselineValidation.test.mjs";
import {
  createLaunch as createWave3Launch,
  readScenarios as readWave3Scenarios,
} from "./Wave3ToolContractBaselineValidation.test.mjs";

export function run() {
  const scenarios = readGovernanceScenarios();
  const activeRegistry = getActiveToolRegistry();
  const activeRegistryIds = activeRegistry.map((tool) => tool.id);
  const workspaceLaunchableIds = workspaceLaunchableToolIds();
  const supportLaunchIds = new Set(scenarios.supportLaunchIds);

  assert.deepEqual(activeRegistryIds, scenarios.expectedActiveRegistryToolIds);
  assert.deepEqual(workspaceLaunchableIds, scenarios.expectedWorkspaceLaunchableIds);
  assert.equal(new Set(activeRegistryIds).size, activeRegistryIds.length);
  assert.equal(new Set(workspaceLaunchableIds).size, workspaceLaunchableIds.length);

  for (const toolId of activeRegistryIds) {
    assert.ok(getToolContract(toolId), `active registry tool has a contract: ${toolId}`);
  }

  for (const toolId of workspaceLaunchableIds) {
    if (supportLaunchIds.has(toolId)) {
      assert.equal(activeRegistryIds.includes(toolId), false, `${toolId} remains a support launch entry`);
      continue;
    }

    assert.equal(activeRegistryIds.includes(toolId), true, `${toolId} is active registry-backed`);
    assert.ok(getToolContract(toolId), `${toolId} has a first-class contract`);
  }

  for (const hostToolId of scenarios.hostToolIds) {
    assert.equal(activeRegistryIds.includes(hostToolId), true, `${hostToolId} is active registry-backed`);
    assert.equal(workspaceLaunchableIds.includes(hostToolId), false, `${hostToolId} remains the host, not a child launch`);
    assert.ok(getToolContract(hostToolId), `${hostToolId} has a first-class contract`);
  }

  validateWaveRegistrationPatterns(scenarios, activeRegistryIds, workspaceLaunchableIds);
  validateRootCardCoverage(scenarios);
}

export function workspaceLaunchableToolIds() {
  const sessionStorageRef = {
    length: 0,
    getItem() {
      return null;
    },
    key() {
      return null;
    },
    removeItem() {},
    setItem() {},
  };
  const service = new WorkspaceManagerV2ContextService({
    fetchRef: async () => ({ ok: false }),
    locationRef: {
      href: "http://localhost/toolbox/workspace-manager-v2/index.html",
      search: "",
    },
    sessionStorageRef,
    windowRef: {
      indexedDB: null,
    },
  });

  return service.workspaceLaunchableTools().map((tool) => tool.id);
}

function validateWaveRegistrationPatterns(scenarios, activeRegistryIds, workspaceLaunchableIds) {
  const wave1Scenarios = readWave1Scenarios();
  const wave2Scenarios = readWave2Scenarios();
  const wave3Scenarios = readWave3Scenarios();

  for (const scenario of wave1Scenarios.validLaunches) {
    assert.equal(validateProjectWorkspaceLaunchBoundary(scenario.launch).status, "PASS", scenario.name);
    assert.equal(activeRegistryIds.includes(scenario.toolId), true, `${scenario.toolId} is active registry-backed`);
  }

  for (const scenario of wave2Scenarios.validLaunches) {
    assert.equal(validateProjectWorkspaceLaunchBoundary(scenario.launch).status, "PASS", scenario.name);
    assert.equal(activeRegistryIds.includes(scenario.toolId), true, `${scenario.toolId} is active registry-backed`);
  }

  for (const tool of wave3Scenarios.tools) {
    assert.equal(validateProjectWorkspaceLaunchBoundary(createWave3Launch(tool.toolId)).status, "PASS", tool.toolId);
    assert.equal(scenarios.contractOnlyWaveToolIds.includes(tool.toolId), true, `${tool.toolId} is marked contract-only`);
    assert.equal(activeRegistryIds.includes(tool.toolId), false, `${tool.toolId} remains outside current active runtime registry`);
    assert.equal(workspaceLaunchableIds.includes(tool.toolId), false, `${tool.toolId} remains outside current runtime launch list`);
  }
}

function validateRootCardCoverage(scenarios) {
  const knownSkippedTitles = new Set(scenarios.expectedRootCardSkippedTitles);

  for (const card of TOOL_INDEX_ROOT_CARD_COVERAGE) {
    assert.ok(["mapped", "contracted", "skipped"].includes(card.status), `${card.title} has an approved root card status`);

    if (card.status === "skipped") {
      assert.equal(card.contractId, "", `${card.title} skipped root card has no contract id`);
      assert.equal(knownSkippedTitles.has(card.title), true, `${card.title} skipped root card is documented`);
      continue;
    }

    assert.ok(getToolContract(card.contractId), `${card.title} root card resolves to a known tool contract`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
