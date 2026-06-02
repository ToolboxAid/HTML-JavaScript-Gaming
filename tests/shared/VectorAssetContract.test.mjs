/*
Toolbox Aid
David Quesenberry
06/02/2026
VectorAssetContract.test.mjs
*/
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  IDENTITY_PERMISSIONS,
  isIdentityPermission,
} from "../../src/shared/contracts/identityPermissionsContract.js";
import {
  PROJECT_ROLES,
  PROJECT_VISIBILITY_STATES,
  isProjectVisibility,
} from "../../src/shared/contracts/projectContract.js";
import {
  TOOL_STATE_FIELDS,
  isToolStateVersion,
} from "../../src/shared/contracts/toolStateContract.js";
import {
  VECTOR_ASSET_CONTRACT_ERRORS,
  VECTOR_ASSET_CONTRACT_ID,
  VECTOR_ASSET_CONTRACT_VERSION,
  VECTOR_ASSET_EXPORT_FORMAT_LIST,
  VECTOR_ASSET_EXPORT_FORMATS,
  VECTOR_ASSET_FIELDS,
  VECTOR_ASSET_PORTABLE_EXPORT_FIELDS,
  VECTOR_ASSET_STATUS,
  VECTOR_ASSET_STATUS_LIST,
  VECTOR_ASSET_TYPE,
  VECTOR_ASSET_VISIBILITY_LIST,
  VECTOR_ASSET_VISIBILITY_STATES,
  canActorAccessVectorAsset,
  canEditVectorAssetStatus,
  createPortableVectorAssetExport,
  isVectorAssetExportFormat,
  isVectorAssetStatus,
  isVectorAssetType,
  isVectorAssetVersion,
  isVectorAssetVisibility,
  isVectorAssetVisibleToActor,
  validatePortableVectorAssetExport,
  validateVectorAssetContract,
} from "../../src/shared/contracts/vectorAssetContract.js";

const scenariosPath = fileURLToPath(
  new URL("../fixtures/vector-assets/vector-asset-scenarios.json", import.meta.url)
);

export function run() {
  const scenarios = JSON.parse(readFileSync(scenariosPath, "utf8"));

  assert.equal(VECTOR_ASSET_CONTRACT_ID, "gamefoundrystudio.vector-asset.lifecycle");
  assert.equal(VECTOR_ASSET_CONTRACT_VERSION, "1.0.0");
  assert.equal(VECTOR_ASSET_TYPE, "vector");
  assert.deepEqual(VECTOR_ASSET_FIELDS, {
    ASSET_ID: "assetId",
    ASSET_TYPE: "assetType",
    OWNER: "ownerId",
    PROJECT: "projectId",
    SOURCE_TOOL_STATE: "sourceToolState",
    VISIBILITY: "visibility",
    VERSION: "version",
    STATUS: "status",
    EXPORT_FORMATS: "exportFormats",
  });
  assert.deepEqual(VECTOR_ASSET_STATUS_LIST, ["draft", "active", "archived"]);
  assert.deepEqual(VECTOR_ASSET_VISIBILITY_LIST, [
    "private",
    "project",
    "unlisted",
    "public",
    "marketplace",
  ]);
  assert.deepEqual(VECTOR_ASSET_EXPORT_FORMAT_LIST, [
    "vector-json",
    "svg",
    "project-package",
  ]);
  assert.deepEqual(VECTOR_ASSET_PORTABLE_EXPORT_FIELDS, [
    "assetId",
    "assetType",
    "sourceToolState",
    "visibility",
    "version",
    "status",
    "exportFormats",
    "payload",
  ]);
  assertUnique(VECTOR_ASSET_STATUS_LIST);
  assertUnique(VECTOR_ASSET_VISIBILITY_LIST);
  assertUnique(VECTOR_ASSET_EXPORT_FORMAT_LIST);

  assert.equal(isVectorAssetType(VECTOR_ASSET_TYPE), true);
  assert.equal(isVectorAssetType("sprite"), false);
  assert.equal(isVectorAssetStatus(VECTOR_ASSET_STATUS.ACTIVE), true);
  assert.equal(isVectorAssetStatus("deleted"), false);
  assert.equal(isVectorAssetVisibility(VECTOR_ASSET_VISIBILITY_STATES.PROJECT), true);
  assert.equal(isVectorAssetVisibility("team"), false);
  assert.equal(isVectorAssetVersion(1), true);
  assert.equal(isVectorAssetVersion(0), false);
  assert.equal(isVectorAssetExportFormat(VECTOR_ASSET_EXPORT_FORMATS.SVG), true);
  assert.equal(isVectorAssetExportFormat("gif"), false);

  assert.equal(isIdentityPermission(IDENTITY_PERMISSIONS.VIEW), true);
  assert.equal(isIdentityPermission(IDENTITY_PERMISSIONS.EDIT), true);
  assert.equal(isProjectVisibility(PROJECT_VISIBILITY_STATES.PROJECT), true);
  assert.equal(PROJECT_ROLES.COLLABORATOR, "collaborator");
  assert.equal(TOOL_STATE_FIELDS.TOOL_STATE_ID, "toolStateId");
  assert.equal(isToolStateVersion(1), true);

  for (const scenario of scenarios.validVectorAssets) {
    const validation = validateVectorAssetContract(scenario.vectorAsset);
    assert.equal(validation.valid, true, scenario.name);
    assert.deepEqual(validation.errors, scenario.expectedErrors, scenario.name);
  }

  for (const scenario of scenarios.invalidVectorAssets) {
    const validation = validateVectorAssetContract(scenario.vectorAsset);
    assert.equal(validation.valid, false, scenario.name);
    assertErrorCodes(validation, scenario.expectedErrors, scenario.name);
  }

  const linkedVectorAsset = scenarios.validVectorAssets[0].vectorAsset;
  assert.equal(linkedVectorAsset.sourceToolState.toolStateId, "tool-state.vector.ship");
  assert.equal(linkedVectorAsset.sourceToolState.toolType, "object-vector-studio-v2");
  assert.equal(linkedVectorAsset.sourceToolState.projectId, linkedVectorAsset.projectId);
  assert.equal(isToolStateVersion(linkedVectorAsset.sourceToolState.version), true);

  const privateVectorAsset = scenarios.accessChecks[1].vectorAsset;
  const privateProject = scenarios.accessChecks[1].project;
  assert.equal(isVectorAssetVisibleToActor({
    actorId: "user.other",
    vectorAsset: privateVectorAsset,
    project: privateProject,
  }), false);
  assert.equal(isVectorAssetVisibleToActor({
    actorId: "user.viewer",
    vectorAsset: privateVectorAsset,
    project: privateProject,
    grantedProjectIds: ["project.private"],
  }), true);

  for (const scenario of scenarios.accessChecks) {
    assert.equal(canActorAccessVectorAsset({
      actorId: scenario.actorId,
      projectRole: scenario.projectRole,
      permission: scenario.permission,
      vectorAsset: scenario.vectorAsset,
      project: scenario.project,
      grantedProjectIds: scenario.grantedProjectIds,
      grantedScopes: scenario.grantedScopes,
      policy: scenario.policy,
    }), scenario.expected, scenario.name);
  }

  const archivedVectorAsset = scenarios.validVectorAssets[2].vectorAsset;
  assert.equal(canEditVectorAssetStatus(archivedVectorAsset), false);
  assert.equal(canEditVectorAssetStatus(archivedVectorAsset, {
    allowArchivedVectorAssetEdit: true,
  }), true);
  assert.equal(canActorAccessVectorAsset({
    actorId: archivedVectorAsset.ownerId,
    projectRole: PROJECT_ROLES.OWNER,
    permission: IDENTITY_PERMISSIONS.EDIT,
    vectorAsset: archivedVectorAsset,
    project: {
      id: archivedVectorAsset.projectId,
      ownerId: archivedVectorAsset.ownerId,
      state: "active",
      visibility: PROJECT_VISIBILITY_STATES.PUBLIC,
    },
  }), false);
  assert.equal(canActorAccessVectorAsset({
    actorId: archivedVectorAsset.ownerId,
    projectRole: PROJECT_ROLES.OWNER,
    permission: IDENTITY_PERMISSIONS.EDIT,
    vectorAsset: archivedVectorAsset,
    project: {
      id: archivedVectorAsset.projectId,
      ownerId: archivedVectorAsset.ownerId,
      state: "active",
      visibility: PROJECT_VISIBILITY_STATES.PUBLIC,
    },
    policy: {
      allowArchivedVectorAssetEdit: true,
    },
  }), true);

  const portableResult = createPortableVectorAssetExport(linkedVectorAsset);
  assert.equal(portableResult.valid, true);
  assert.deepEqual(portableResult.errors, []);
  const portableExport = portableResult.export;
  assert.equal(portableExport.contractId, VECTOR_ASSET_CONTRACT_ID);
  assert.equal(portableExport.contractVersion, VECTOR_ASSET_CONTRACT_VERSION);
  assert.equal(portableExport.portable, true);
  assert.equal(portableExport.assetId, linkedVectorAsset.assetId);
  assert.equal(portableExport.assetType, VECTOR_ASSET_TYPE);
  assert.equal(portableExport.ownerId, undefined);
  assert.equal(portableExport.projectId, undefined);
  assert.equal(portableExport.databaseId, undefined);
  assert.equal(portableExport.sourceToolState.toolStateId, linkedVectorAsset.sourceToolState.toolStateId);
  assert.equal(portableExport.sourceToolState.toolType, linkedVectorAsset.sourceToolState.toolType);
  assert.equal(portableExport.sourceToolState.projectId, undefined);
  assert.equal(portableExport.sourceToolState.ownerId, undefined);
  for (const fieldName of VECTOR_ASSET_PORTABLE_EXPORT_FIELDS) {
    assert.equal(Object.hasOwn(portableExport, fieldName), true, fieldName);
  }

  const portableValidation = validatePortableVectorAssetExport(portableExport);
  assert.equal(portableValidation.valid, true);
  assert.deepEqual(portableValidation.errors, []);

  assertErrorCodes(validatePortableVectorAssetExport({
    ...portableExport,
    ownerId: "user.owner",
  }), [VECTOR_ASSET_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID], "portable export strips owner");
  assertErrorCodes(validatePortableVectorAssetExport({
    ...portableExport,
    exportFormats: ["gif"],
  }), [VECTOR_ASSET_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID], "portable export format is approved");
  assertErrorCodes(validatePortableVectorAssetExport({
    ...portableExport,
    sourceToolState: {
      ...portableExport.sourceToolState,
      projectId: linkedVectorAsset.projectId,
    },
  }), [VECTOR_ASSET_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID], "portable source tool state strips project");
}

function assertErrorCodes(validation, expectedCodes, name) {
  assert.deepEqual(validation.errors.map((error) => error.code), expectedCodes, name);
}

function assertUnique(values) {
  assert.equal(new Set(values).size, values.length);
}
