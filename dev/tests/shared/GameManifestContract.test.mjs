/*
Toolbox Aid
David Quesenberry
06/02/2026
GameManifestContract.test.mjs
*/
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  IDENTITY_PERMISSIONS,
  isIdentityPermission,
} from "../../../src/shared/contracts/identityPermissionsContract.js";
import {
  GAME_MANIFEST_CONTRACT_ERRORS,
  GAME_MANIFEST_CONTRACT_ID,
  GAME_MANIFEST_CONTRACT_VERSION,
  GAME_MANIFEST_EXPORT_FORMATS,
  GAME_MANIFEST_EXPORT_FORMAT_LIST,
  GAME_MANIFEST_FIELD_LIST,
  GAME_MANIFEST_FIELDS,
  GAME_MANIFEST_PORTABLE_EXPORT_FIELDS,
  GAME_MANIFEST_RULES,
  GAME_MANIFEST_SOURCE_ASSET_TYPE_LIST,
  GAME_MANIFEST_SOURCE_ASSET_TYPES,
  GAME_MANIFEST_STATUS,
  GAME_MANIFEST_STATUS_LIST,
  canActorAccessGameManifest,
  canEditGameManifestStatus,
  createPortableGameManifestExport,
  isGameManifestExportFormat,
  isGameManifestSourceAsset,
  isGameManifestSourceAssetType,
  isGameManifestSourceToolState,
  isGameManifestStatus,
  isGameManifestVersion,
  isGameManifestVisibility,
  isGameManifestVisibleToActor,
  validateGameManifestContract,
  validatePortableGameManifestExport,
} from "../../../src/shared/contracts/gameManifestContract.js";
import {
  PROJECT_ROLES,
  PROJECT_TYPES,
  PROJECT_VISIBILITY_STATES,
  validateProjectContract,
} from "../../../src/shared/contracts/projectContract.js";
import {
  TOOL_STATE_STATUS,
  validateToolStateContract,
} from "../../../src/shared/contracts/toolStateContract.js";

const scenariosPath = fileURLToPath(
  new URL("../fixtures/manifests/manifest-scenarios.json", import.meta.url)
);

export function run() {
  const scenarios = JSON.parse(readFileSync(scenariosPath, "utf8"));

  assert.equal(GAME_MANIFEST_CONTRACT_ID, "gamefoundrystudio.game-manifest.contract");
  assert.equal(GAME_MANIFEST_CONTRACT_VERSION, "1.0.0");
  assert.deepEqual(GAME_MANIFEST_FIELD_LIST, [
    "manifestId",
    "ownerId",
    "projectId",
    "projectType",
    "sourceToolStates",
    "sourceAssets",
    "visibility",
    "version",
    "status",
    "exportFormat",
  ]);
  assert.deepEqual(GAME_MANIFEST_FIELDS, {
    MANIFEST_ID: "manifestId",
    OWNER: "ownerId",
    PROJECT: "projectId",
    PROJECT_TYPE: "projectType",
    SOURCE_TOOL_STATES: "sourceToolStates",
    SOURCE_ASSETS: "sourceAssets",
    VISIBILITY: "visibility",
    VERSION: "version",
    STATUS: "status",
    EXPORT_FORMAT: "exportFormat",
  });
  assert.deepEqual(GAME_MANIFEST_STATUS_LIST, ["draft", "active", "archived", "published"]);
  assert.deepEqual(GAME_MANIFEST_EXPORT_FORMAT_LIST, ["game-manifest-json"]);
  assert.deepEqual(GAME_MANIFEST_SOURCE_ASSET_TYPE_LIST, [
    "vector",
    "palette",
    "image",
    "audio",
    "tilemap",
    "localization",
  ]);
  assert.deepEqual(GAME_MANIFEST_PORTABLE_EXPORT_FIELDS, [
    "manifestId",
    "projectType",
    "sourceToolStates",
    "sourceAssets",
    "visibility",
    "version",
    "status",
    "exportFormat",
  ]);
  assert.equal(GAME_MANIFEST_RULES.REQUIRES_OWNER, true);
  assert.equal(GAME_MANIFEST_RULES.REQUIRES_PROJECT, true);
  assert.equal(GAME_MANIFEST_RULES.REQUIRES_GAME_PROJECT_TYPE, true);
  assert.equal(GAME_MANIFEST_RULES.MAY_REFERENCE_TOOL_STATES, true);
  assert.equal(GAME_MANIFEST_RULES.MAY_REFERENCE_ASSETS, true);
  assert.equal(GAME_MANIFEST_RULES.PORTABLE_EXPORT_IMPORT_FORMAT, true);
  assert.equal(GAME_MANIFEST_RULES.DATABASE_REMAINS_WORKING_SYSTEM, true);
  assert.equal(GAME_MANIFEST_RULES.MANIFEST_NOT_DATABASE_SOURCE_OF_TRUTH, true);
  assert.equal(GAME_MANIFEST_RULES.CANNOT_BYPASS_OWNERSHIP_VISIBILITY_PERMISSIONS, true);
  assert.equal(GAME_MANIFEST_RULES.ARCHIVED_IMMUTABLE_UNLESS_POLICY_ALLOWS, true);
  assertUnique(GAME_MANIFEST_STATUS_LIST);
  assertUnique(GAME_MANIFEST_EXPORT_FORMAT_LIST);
  assertUnique(GAME_MANIFEST_SOURCE_ASSET_TYPE_LIST);

  assert.equal(isGameManifestStatus(GAME_MANIFEST_STATUS.ACTIVE), true);
  assert.equal(isGameManifestStatus("retired"), false);
  assert.equal(isGameManifestVisibility(PROJECT_VISIBILITY_STATES.PROJECT), true);
  assert.equal(isGameManifestVisibility("marketplace"), false);
  assert.equal(isGameManifestVersion(1), true);
  assert.equal(isGameManifestVersion(0), false);
  assert.equal(isGameManifestExportFormat(GAME_MANIFEST_EXPORT_FORMATS.GAME_MANIFEST_JSON), true);
  assert.equal(isGameManifestExportFormat("database-row"), false);
  assert.equal(isGameManifestSourceAssetType(GAME_MANIFEST_SOURCE_ASSET_TYPES.VECTOR), true);
  assert.equal(isGameManifestSourceAssetType("shader"), false);
  assert.equal(isIdentityPermission(IDENTITY_PERMISSIONS.EDIT), true);

  for (const scenario of scenarios.validManifests) {
    const validation = validateGameManifestContract(scenario.manifest);
    assert.equal(validation.valid, true, scenario.name);
    assert.deepEqual(validation.errors, scenario.expectedErrors, scenario.name);
  }

  for (const scenario of scenarios.invalidManifests) {
    const validation = validateGameManifestContract(scenario.manifest);
    assert.equal(validation.valid, false, scenario.name);
    assert.deepEqual(validation.errors.map((error) => error.code), scenario.expectedErrors, scenario.name);
  }

  assertErrorForScenario(scenarios, "missing owner", GAME_MANIFEST_CONTRACT_ERRORS.OWNER_REQUIRED);
  assertErrorForScenario(scenarios, "missing project", GAME_MANIFEST_CONTRACT_ERRORS.PROJECT_REQUIRED);
  assertErrorForScenario(scenarios, "missing project type", GAME_MANIFEST_CONTRACT_ERRORS.PROJECT_TYPE_REQUIRED);
  assertErrorForScenario(scenarios, "non-game project", GAME_MANIFEST_CONTRACT_ERRORS.PROJECT_TYPE_INVALID);
  assertErrorForScenario(scenarios, "invalid source tool state", GAME_MANIFEST_CONTRACT_ERRORS.SOURCE_TOOL_STATE_INVALID);
  assertErrorForScenario(scenarios, "invalid source asset", GAME_MANIFEST_CONTRACT_ERRORS.SOURCE_ASSET_INVALID);

  const sourceToolStateRecord = {
    toolStateId: "tool-state.palette.alpha",
    toolType: "palette-manager-v2",
    ownerId: "user.owner",
    projectId: "project.game.alpha",
    visibility: PROJECT_VISIBILITY_STATES.PROJECT,
    version: 1,
    status: TOOL_STATE_STATUS.ACTIVE,
  };
  const sourceToolStateReference = {
    toolStateId: sourceToolStateRecord.toolStateId,
    toolType: sourceToolStateRecord.toolType,
    version: sourceToolStateRecord.version,
  };
  assert.equal(validateToolStateContract(sourceToolStateRecord).valid, true);
  assert.equal(isGameManifestSourceToolState(sourceToolStateReference), true);
  assert.equal(isGameManifestSourceToolState({
    toolStateId: sourceToolStateRecord.toolStateId,
    version: 1,
  }), false);

  const sourceAssetReference = {
    assetId: "asset.vector.hero",
    assetType: GAME_MANIFEST_SOURCE_ASSET_TYPES.VECTOR,
    version: 1,
  };
  assert.equal(isGameManifestSourceAsset(sourceAssetReference), true);
  assert.equal(isGameManifestSourceAsset({
    assetId: "asset.shader.hero",
    assetType: "shader",
    version: 1,
  }), false);

  const gameProject = {
    id: "project.game.alpha",
    ownerId: "user.owner",
    projectType: PROJECT_TYPES.GAME,
    state: "active",
    visibility: PROJECT_VISIBILITY_STATES.PROJECT,
  };
  const assetPackProject = {
    ...gameProject,
    id: "project.asset.pack",
    projectType: PROJECT_TYPES.ASSET_PACK,
  };
  assert.equal(validateProjectContract(gameProject).valid, true);
  assert.equal(validateProjectContract(assetPackProject).valid, true);

  const manifest = scenarios.validManifests[0].manifest;
  const portableResult = createPortableGameManifestExport(manifest);
  assert.equal(portableResult.valid, true);
  assert.deepEqual(portableResult.errors, []);
  const portableExport = portableResult.export;
  assert.equal(portableExport.contractId, GAME_MANIFEST_CONTRACT_ID);
  assert.equal(portableExport.contractVersion, GAME_MANIFEST_CONTRACT_VERSION);
  assert.equal(portableExport.portable, true);
  assert.equal(portableExport.projectType, PROJECT_TYPES.GAME);
  assert.equal(portableExport.ownerId, undefined);
  assert.equal(portableExport.projectId, undefined);
  assert.equal(portableExport.databaseId, undefined);
  assert.deepEqual(portableExport.sourceToolStates, manifest.sourceToolStates);
  assert.deepEqual(portableExport.sourceAssets, manifest.sourceAssets);

  for (const fieldName of GAME_MANIFEST_PORTABLE_EXPORT_FIELDS) {
    assert.equal(Object.hasOwn(portableExport, fieldName), true, fieldName);
  }
  assert.equal(validatePortableGameManifestExport(portableExport).valid, true);
  assertErrorCodes(validatePortableGameManifestExport({
    ...portableExport,
    ownerId: "user.owner",
  }), [GAME_MANIFEST_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID], "portable export strips owner");

  assert.equal(isGameManifestVisibleToActor({
    actorId: "user.other",
    manifest: {
      ...manifest,
      visibility: PROJECT_VISIBILITY_STATES.PRIVATE,
    },
    project: gameProject,
  }), false);
  assert.equal(isGameManifestVisibleToActor({
    actorId: "user.viewer",
    manifest: {
      ...manifest,
      visibility: PROJECT_VISIBILITY_STATES.PRIVATE,
    },
    project: gameProject,
    grantedProjectIds: ["project.game.alpha"],
  }), true);
  assert.equal(isGameManifestVisibleToActor({
    actorId: "public.viewer",
    manifest: {
      ...manifest,
      visibility: PROJECT_VISIBILITY_STATES.PUBLIC,
    },
    project: gameProject,
  }), true);

  assert.equal(canActorAccessGameManifest({
    actorId: "user.collaborator",
    projectRole: PROJECT_ROLES.COLLABORATOR,
    permission: IDENTITY_PERMISSIONS.EDIT,
    manifest,
    project: gameProject,
    grantedProjectIds: ["project.game.alpha"],
    grantedScopes: [],
  }), false, "manifest does not bypass missing project edit scope");
  assert.equal(canActorAccessGameManifest({
    actorId: "user.collaborator",
    projectRole: PROJECT_ROLES.COLLABORATOR,
    permission: IDENTITY_PERMISSIONS.EDIT,
    manifest,
    project: gameProject,
    grantedProjectIds: ["project.game.alpha"],
    grantedScopes: ["project"],
  }), true, "manifest honors project edit scope");
  assert.equal(canActorAccessGameManifest({
    actorId: "user.viewer",
    projectRole: PROJECT_ROLES.VIEWER,
    permission: IDENTITY_PERMISSIONS.EDIT,
    manifest: {
      ...manifest,
      visibility: PROJECT_VISIBILITY_STATES.PUBLIC,
    },
    project: gameProject,
  }), false, "public manifest does not grant edit permission");
  assert.equal(canActorAccessGameManifest({
    actorId: "user.owner",
    projectRole: PROJECT_ROLES.OWNER,
    permission: IDENTITY_PERMISSIONS.DELETE,
    manifest,
    project: gameProject,
  }), true, "owner keeps object control");

  const archivedManifest = {
    ...manifest,
    status: GAME_MANIFEST_STATUS.ARCHIVED,
  };
  assert.equal(canEditGameManifestStatus(archivedManifest), false);
  assert.equal(canEditGameManifestStatus(archivedManifest, { allowArchivedManifestEdit: true }), true);
  assert.equal(canActorAccessGameManifest({
    actorId: "user.owner",
    projectRole: PROJECT_ROLES.OWNER,
    permission: IDENTITY_PERMISSIONS.EDIT,
    manifest: archivedManifest,
    project: gameProject,
  }), false, "archived manifest immutable by default");
  assert.equal(canActorAccessGameManifest({
    actorId: "user.owner",
    projectRole: PROJECT_ROLES.OWNER,
    permission: IDENTITY_PERMISSIONS.EDIT,
    manifest: archivedManifest,
    project: gameProject,
    policy: {
      allowArchivedManifestEdit: true,
    },
  }), true, "archived manifest editable when policy allows");
}

function assertErrorForScenario(scenarios, name, expectedErrorCode) {
  const scenario = scenarios.invalidManifests.find((item) => item.name === name);
  const validation = validateGameManifestContract(scenario.manifest);
  assert.equal(validation.errors.some((error) => error.code === expectedErrorCode), true, name);
}

function assertErrorCodes(validation, expectedCodes, name) {
  assert.deepEqual(validation.errors.map((error) => error.code), expectedCodes, name);
}

function assertUnique(values) {
  assert.equal(new Set(values).size, values.length);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
