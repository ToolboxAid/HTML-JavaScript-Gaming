/*
Toolbox Aid
David Quesenberry
06/02/2026
ToolContractCoverage.test.mjs
*/
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  IDENTITY_PERMISSIONS,
  isIdentityPermission,
} from "../../../../src/shared/contracts/identityPermissionsContract.js";
import {
  PROJECT_ROLES,
  PROJECT_VISIBILITY_STATES,
  isProjectVisibility,
} from "../../../../src/shared/contracts/projectContract.js";
import {
  TOOL_STATE_FIELDS,
  isToolStateVersion,
  validateToolStateContract,
} from "../../../../src/shared/contracts/toolStateContract.js";
import {
  TOOL_CONTRACT_CATALOG_ID,
  TOOL_CONTRACT_CATALOG_VERSION,
  TOOL_CONTRACT_ASSET_TYPES,
  TOOL_CONTRACT_ASSET_TYPE_LIST,
  TOOL_CONTRACT_ERRORS,
  TOOL_CONTRACT_FIELDS,
  TOOL_CONTRACT_FORMAT_LIST,
  TOOL_CONTRACT_FORMATS,
  TOOL_CONTRACT_OWNER_ID,
  TOOL_CONTRACT_PORTABLE_EXPORT_FIELDS,
  TOOL_CONTRACT_PROJECT_ID,
  TOOL_CONTRACT_STATUS,
  TOOL_CONTRACT_STATUS_LIST,
  TOOL_CONTRACT_TYPE_LIST,
  TOOL_CONTRACT_TYPES,
  TOOL_CONTRACT_VISIBILITY_LIST,
  TOOL_CONTRACT_VISIBILITY_STATES,
  canActorAccessToolContract,
  canEditToolContractStatus,
  createPortableToolContractExport,
  isToolContractAssetType,
  isToolContractFormat,
  isToolContractStatus,
  isToolContractType,
  isToolContractVersion,
  isToolContractVisibility,
  isToolContractVisibleToActor,
  toolStateLinksToToolContract,
  validatePortableToolContractExport,
  validateToolContract,
} from "../../../../src/shared/contracts/tools/toolContract.js";
import {
  TOOL_CONTRACT_LIST,
  TOOL_INDEX_ROOT_CARD_COVERAGE,
  getToolContractById,
} from "../../../../src/shared/contracts/tools/toolContractsIndex.js";
import {
  getVisibleActiveToolRegistry,
} from "../../../../www/toolbox/toolRegistry.js";

const scenariosPath = fileURLToPath(
  new URL("../../fixtures/tools/tool-contract-scenarios.json", import.meta.url)
);

export function run() {
  const scenarios = JSON.parse(readFileSync(scenariosPath, "utf8"));

  assert.equal(TOOL_CONTRACT_CATALOG_ID, "gamefoundrystudio.tool.contract-catalog");
  assert.equal(TOOL_CONTRACT_CATALOG_VERSION, "1.0.0");
  assert.equal(TOOL_CONTRACT_OWNER_ID, "platform.gamefoundrystudio");
  assert.equal(TOOL_CONTRACT_PROJECT_ID, "project.gamefoundrystudio.tools");
  assert.deepEqual(TOOL_CONTRACT_FIELDS, {
    TOOL_ID: "toolId",
    TOOL_TYPE: "toolType",
    GROUPING: "grouping",
    OWNER: "ownerId",
    PROJECT: "projectId",
    VISIBILITY: "visibility",
    REQUIRED_INPUTS: "requiredInputs",
    PRODUCED_OUTPUTS: "producedOutputs",
    SOURCE_TOOL_STATE: "sourceToolState",
    SUPPORTED_ASSET_TYPES: "supportedAssetTypes",
    IMPORT_FORMATS: "importFormats",
    EXPORT_FORMATS: "exportFormats",
    STATUS: "status",
    VERSION: "version",
  });
  assert.deepEqual(TOOL_CONTRACT_TYPE_LIST, [
    "editor",
    "generator",
    "inspector",
    "manager",
    "pipeline",
    "studio",
    "utility",
    "viewer",
    "workspace",
  ]);
  assert.deepEqual(TOOL_CONTRACT_STATUS_LIST, ["draft", "active", "archived"]);
  assert.deepEqual(TOOL_CONTRACT_VISIBILITY_LIST, [
    "private",
    "project",
    "unlisted",
    "public",
    "marketplace",
  ]);
  assert.deepEqual(TOOL_CONTRACT_ASSET_TYPE_LIST, [
    "vector",
    "palette",
    "image",
    "audio",
    "tilemap",
    "localization",
  ]);
  assert.deepEqual(TOOL_CONTRACT_PORTABLE_EXPORT_FIELDS, [
    "toolId",
    "toolType",
    "grouping",
    "visibility",
    "requiredInputs",
    "producedOutputs",
    "sourceToolState",
    "supportedAssetTypes",
    "importFormats",
    "exportFormats",
    "status",
    "version",
  ]);
  assertUnique(TOOL_CONTRACT_TYPE_LIST);
  assertUnique(TOOL_CONTRACT_STATUS_LIST);
  assertUnique(TOOL_CONTRACT_VISIBILITY_LIST);
  assertUnique(TOOL_CONTRACT_FORMAT_LIST);
  assertUnique(TOOL_CONTRACT_ASSET_TYPE_LIST);
  assertUnique(TOOL_CONTRACT_LIST.map((toolContract) => toolContract.toolId));

  assert.equal(isToolContractType(TOOL_CONTRACT_TYPES.STUDIO), true);
  assert.equal(isToolContractType("daemon"), false);
  assert.equal(isToolContractStatus(TOOL_CONTRACT_STATUS.ACTIVE), true);
  assert.equal(isToolContractStatus("deleted"), false);
  assert.equal(isToolContractVisibility(TOOL_CONTRACT_VISIBILITY_STATES.PROJECT), true);
  assert.equal(isToolContractVisibility("team"), false);
  assert.equal(isToolContractVersion(1), true);
  assert.equal(isToolContractVersion(0), false);
  assert.equal(isToolContractFormat(TOOL_CONTRACT_FORMATS.GAME_MANIFEST), true);
  assert.equal(isToolContractFormat("spreadsheet"), false);
  assert.equal(isToolContractAssetType(TOOL_CONTRACT_ASSET_TYPES.VECTOR), true);
  assert.equal(isToolContractAssetType("shader"), false);

  assert.equal(isIdentityPermission(IDENTITY_PERMISSIONS.VIEW), true);
  assert.equal(isIdentityPermission(IDENTITY_PERMISSIONS.EDIT), true);
  assert.equal(isProjectVisibility(PROJECT_VISIBILITY_STATES.PROJECT), true);
  assert.equal(PROJECT_ROLES.COLLABORATOR, "collaborator");
  assert.equal(TOOL_STATE_FIELDS.TOOL_STATE_ID, "toolStateId");
  assert.equal(isToolStateVersion(1), true);

  for (const toolContract of TOOL_CONTRACT_LIST) {
    const validation = validateToolContract(toolContract);
    assert.equal(validation.valid, true, toolContract.toolId);
    assert.deepEqual(validation.errors, [], toolContract.toolId);
    assert.equal(toolContract.ownerId, TOOL_CONTRACT_OWNER_ID, toolContract.toolId);
    assert.equal(toolContract.projectId, TOOL_CONTRACT_PROJECT_ID, toolContract.toolId);
    assert.ok(toolContract.producedOutputs.length > 0, `${toolContract.toolId} produced outputs`);
    assert.ok(toolContract.exportFormats.length > 0, `${toolContract.toolId} export formats`);
    assert.equal(getToolContractById(toolContract.toolId), toolContract, toolContract.toolId);
  }

  const requiredNamedContracts = [
    "asset-manager-v2",
    "collision-inspector-v2",
    "game-design-studio",
    "input-mapping-v2",
    "localization-studio",
    "midi-studio-v2",
    "object-vector-studio-v2",
    "palette-manager-v2",
    "preview-generator-v2",
    "publish-studio",
    "storage-inspector-v2",
    "workspace-manager-v2",
    "world-vector-studio-v2",
  ];

  for (const toolId of requiredNamedContracts) {
    assert.ok(getToolContractById(toolId), `missing named tool contract: ${toolId}`);
  }

  const visibleRegistryToolIds = getVisibleActiveToolRegistry().map((tool) => tool.id).sort();
  const toolContractIds = new Set(TOOL_CONTRACT_LIST.map((toolContract) => toolContract.toolId));
  const missingRegisteredToolIds = visibleRegistryToolIds.filter((toolId) => !toolContractIds.has(toolId));
  assert.deepEqual(missingRegisteredToolIds, [], "registered first-class tools without contracts");

  for (const coverage of TOOL_INDEX_ROOT_CARD_COVERAGE) {
    assert.ok(["contracted", "mapped", "skipped"].includes(coverage.status), coverage.title);
    if (coverage.status === "skipped") {
      assert.ok(coverage.reason, `${coverage.title} skip reason`);
    } else {
      assert.ok(getToolContractById(coverage.contractId), `${coverage.title} mapped contract`);
    }
  }
  assert.deepEqual(
    TOOL_INDEX_ROOT_CARD_COVERAGE.filter((coverage) => coverage.status === "skipped").map((coverage) => coverage.title),
    ["Marketplace", "Arcade"]
  );

  for (const scenario of scenarios.invalidToolContracts) {
    const validation = validateToolContract(scenario.toolContract);
    assert.equal(validation.valid, false, scenario.name);
    assertErrorCodes(validation, scenario.expectedErrors, scenario.name);
  }

  const objectVectorContract = getToolContractById("object-vector-studio-v2");
  const savedToolState = {
    toolStateId: "tool-state.object-vector.active",
    toolType: objectVectorContract.toolId,
    ownerId: objectVectorContract.ownerId,
    projectId: objectVectorContract.projectId,
    visibility: "project",
    version: 1,
    status: "active",
  };
  assert.equal(validateToolStateContract(savedToolState).valid, true);
  assert.equal(toolStateLinksToToolContract(savedToolState, objectVectorContract), true);
  assert.equal(toolStateLinksToToolContract({
    ...savedToolState,
    toolType: "palette-manager-v2",
  }, objectVectorContract), false);

  const privateToolContract = scenarios.accessChecks[1].toolContract;
  const privateProject = scenarios.accessChecks[1].project;
  assert.equal(isToolContractVisibleToActor({
    actorId: "user.other",
    toolContract: privateToolContract,
    project: privateProject,
  }), false);
  assert.equal(isToolContractVisibleToActor({
    actorId: "user.viewer",
    toolContract: privateToolContract,
    project: privateProject,
    grantedProjectIds: ["project.private"],
  }), true);

  for (const scenario of scenarios.accessChecks) {
    assert.equal(canActorAccessToolContract({
      actorId: scenario.actorId,
      projectRole: scenario.projectRole,
      permission: scenario.permission,
      toolContract: scenario.toolContract,
      project: scenario.project,
      grantedProjectIds: scenario.grantedProjectIds,
      grantedScopes: scenario.grantedScopes,
      policy: scenario.policy,
    }), scenario.expected, scenario.name);
  }

  const archivedToolContract = scenarios.accessChecks[5].toolContract;
  assert.equal(canEditToolContractStatus(archivedToolContract), false);
  assert.equal(canEditToolContractStatus(archivedToolContract, {
    allowArchivedToolOutputEdit: true,
  }), true);

  const sourceLinkedContract = {
    ...objectVectorContract,
    sourceToolState: {
      toolStateId: "tool-state.object-vector.active",
      toolType: objectVectorContract.toolId,
      projectId: objectVectorContract.projectId,
      version: 1,
    },
  };
  assert.equal(validateToolContract(sourceLinkedContract).valid, true);

  const portableResult = createPortableToolContractExport(sourceLinkedContract);
  assert.equal(portableResult.valid, true);
  assert.deepEqual(portableResult.errors, []);
  const portableExport = portableResult.export;
  assert.equal(portableExport.contractId, TOOL_CONTRACT_CATALOG_ID);
  assert.equal(portableExport.contractVersion, TOOL_CONTRACT_CATALOG_VERSION);
  assert.equal(portableExport.portable, true);
  assert.equal(portableExport.toolId, sourceLinkedContract.toolId);
  assert.equal(portableExport.toolType, sourceLinkedContract.toolType);
  assert.equal(portableExport.grouping, sourceLinkedContract.grouping);
  assert.equal(portableExport.ownerId, undefined);
  assert.equal(portableExport.projectId, undefined);
  assert.equal(portableExport.databaseId, undefined);
  assert.equal(portableExport.sourceToolState.toolStateId, sourceLinkedContract.sourceToolState.toolStateId);
  assert.equal(portableExport.sourceToolState.toolType, sourceLinkedContract.sourceToolState.toolType);
  assert.equal(portableExport.sourceToolState.projectId, undefined);
  assert.equal(portableExport.sourceToolState.ownerId, undefined);
  for (const fieldName of TOOL_CONTRACT_PORTABLE_EXPORT_FIELDS) {
    assert.equal(Object.hasOwn(portableExport, fieldName), true, fieldName);
  }

  const portableValidation = validatePortableToolContractExport(portableExport);
  assert.equal(portableValidation.valid, true);
  assert.deepEqual(portableValidation.errors, []);

  assertErrorCodes(validatePortableToolContractExport({
    ...portableExport,
    ownerId: "user.owner",
  }), [TOOL_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID], "portable export strips owner");
  assertErrorCodes(validatePortableToolContractExport({
    ...portableExport,
    exportFormats: ["spreadsheet"],
  }), [TOOL_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID], "portable export format is approved");
  assertErrorCodes(validatePortableToolContractExport({
    ...portableExport,
    sourceToolState: {
      ...portableExport.sourceToolState,
      projectId: sourceLinkedContract.projectId,
    },
  }), [TOOL_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID], "portable source tool state strips project");
}

function assertErrorCodes(validation, expectedCodes, name) {
  assert.deepEqual(validation.errors.map((error) => error.code), expectedCodes, name);
}

function assertUnique(values) {
  assert.equal(new Set(values).size, values.length);
}
