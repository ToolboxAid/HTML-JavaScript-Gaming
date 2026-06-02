/*
Toolbox Aid
David Quesenberry
06/02/2026
AssetContract.test.mjs
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
  ASSET_CONTRACT_ERRORS,
  ASSET_CONTRACT_ID,
  ASSET_CONTRACT_VERSION,
  ASSET_EXPORT_FORMAT_LIST,
  ASSET_EXPORT_FORMATS,
  ASSET_FIELDS,
  ASSET_METADATA_FIELDS,
  ASSET_PORTABLE_EXPORT_FIELDS,
  ASSET_STATUS,
  ASSET_STATUS_LIST,
  ASSET_TYPE_EXPORT_FORMATS,
  ASSET_TYPE_LIST,
  ASSET_TYPES,
  ASSET_VISIBILITY_LIST,
  ASSET_VISIBILITY_STATES,
  canActorAccessAsset,
  canEditAssetStatus,
  createPortableAssetExport,
  isAssetExportFormat,
  isAssetExportFormatForType,
  isAssetMetadataForType,
  isAssetStatus,
  isAssetType,
  isAssetVersion,
  isAssetVisibility,
  isAssetVisibleToActor,
  validateAssetContract,
  validateAssetMetadataForType,
  validatePortableAssetExport,
} from "../../src/shared/contracts/assetContract.js";

const scenariosPath = fileURLToPath(
  new URL("../fixtures/assets/asset-scenarios.json", import.meta.url)
);

export function run() {
  const scenarios = JSON.parse(readFileSync(scenariosPath, "utf8"));

  assert.equal(ASSET_CONTRACT_ID, "gamefoundrystudio.asset.lifecycle");
  assert.equal(ASSET_CONTRACT_VERSION, "1.0.0");
  assert.deepEqual(ASSET_FIELDS, {
    ASSET_ID: "assetId",
    ASSET_TYPE: "assetType",
    OWNER: "ownerId",
    PROJECT: "projectId",
    SOURCE_TOOL_STATE: "sourceToolState",
    VISIBILITY: "visibility",
    VERSION: "version",
    STATUS: "status",
    METADATA: "metadata",
    EXPORT_FORMATS: "exportFormats",
  });
  assert.deepEqual(ASSET_TYPE_LIST, [
    "vector",
    "palette",
    "image",
    "audio",
    "tilemap",
    "localization",
  ]);
  assert.deepEqual(ASSET_STATUS_LIST, ["draft", "active", "archived"]);
  assert.deepEqual(ASSET_VISIBILITY_LIST, [
    "private",
    "project",
    "unlisted",
    "public",
    "marketplace",
  ]);
  assert.deepEqual(ASSET_EXPORT_FORMAT_LIST, [
    "metadata-json",
    "project-package",
    "vector-json",
    "svg",
    "palette-json",
    "image-file",
    "audio-file",
    "tilemap-json",
    "localization-json",
  ]);
  assert.deepEqual(ASSET_METADATA_FIELDS, {
    TITLE: "title",
    TAGS: "tags",
    FILE_PATH: "filePath",
    VECTOR_FORMAT: "vectorFormat",
    OBJECT_COUNT: "objectCount",
    SWATCH_COUNT: "swatchCount",
    WIDTH: "width",
    HEIGHT: "height",
    DURATION_MS: "durationMs",
    TILE_COUNT: "tileCount",
    LOCALE: "locale",
  });
  assert.deepEqual(ASSET_PORTABLE_EXPORT_FIELDS, [
    "assetId",
    "assetType",
    "sourceToolState",
    "visibility",
    "version",
    "status",
    "metadata",
    "exportFormats",
  ]);
  assertUnique(ASSET_TYPE_LIST);
  assertUnique(ASSET_STATUS_LIST);
  assertUnique(ASSET_VISIBILITY_LIST);
  assertUnique(ASSET_EXPORT_FORMAT_LIST);

  assert.equal(isAssetType(ASSET_TYPES.VECTOR), true);
  assert.equal(isAssetType("shader"), false);
  assert.equal(isAssetStatus(ASSET_STATUS.ACTIVE), true);
  assert.equal(isAssetStatus("deleted"), false);
  assert.equal(isAssetVisibility(ASSET_VISIBILITY_STATES.PROJECT), true);
  assert.equal(isAssetVisibility("team"), false);
  assert.equal(isAssetVersion(1), true);
  assert.equal(isAssetVersion(0), false);
  assert.equal(isAssetExportFormat(ASSET_EXPORT_FORMATS.PROJECT_PACKAGE), true);
  assert.equal(isAssetExportFormat("css"), false);
  assert.equal(isAssetExportFormatForType(ASSET_TYPES.VECTOR, ASSET_EXPORT_FORMATS.SVG), true);
  assert.equal(isAssetExportFormatForType(ASSET_TYPES.VECTOR, ASSET_EXPORT_FORMATS.PALETTE_JSON), false);
  assert.deepEqual(ASSET_TYPE_EXPORT_FORMATS[ASSET_TYPES.IMAGE], [
    "image-file",
    "metadata-json",
    "project-package",
  ]);

  assert.equal(isIdentityPermission(IDENTITY_PERMISSIONS.VIEW), true);
  assert.equal(isIdentityPermission(IDENTITY_PERMISSIONS.EDIT), true);
  assert.equal(isProjectVisibility(PROJECT_VISIBILITY_STATES.PROJECT), true);
  assert.equal(PROJECT_ROLES.COLLABORATOR, "collaborator");
  assert.equal(TOOL_STATE_FIELDS.TOOL_STATE_ID, "toolStateId");
  assert.equal(isToolStateVersion(1), true);

  const validAssetTypes = new Set();

  for (const scenario of scenarios.validAssets) {
    const validation = validateAssetContract(scenario.asset);
    assert.equal(validation.valid, true, scenario.name);
    assert.deepEqual(validation.errors, scenario.expectedErrors, scenario.name);
    assert.equal(isAssetMetadataForType(scenario.asset.assetType, scenario.asset.metadata), true, scenario.name);
    validAssetTypes.add(scenario.asset.assetType);
  }

  assert.deepEqual(Array.from(validAssetTypes).sort(), [...ASSET_TYPE_LIST].sort());

  for (const scenario of scenarios.invalidAssets) {
    const validation = validateAssetContract(scenario.asset);
    assert.equal(validation.valid, false, scenario.name);
    assertErrorCodes(validation, scenario.expectedErrors, scenario.name);
  }

  assert.equal(validateAssetMetadataForType(ASSET_TYPES.VECTOR, {
    vectorFormat: "vector-json",
    objectCount: 0,
  }).valid, true);
  assert.equal(validateAssetMetadataForType(ASSET_TYPES.PALETTE, {
    swatchCount: 0,
  }).valid, true);
  assert.equal(validateAssetMetadataForType(ASSET_TYPES.IMAGE, {
    filePath: "assets/images/hero.png",
    width: 128,
    height: 128,
  }).valid, true);
  assert.equal(validateAssetMetadataForType(ASSET_TYPES.AUDIO, {
    filePath: "assets/audio/blip.wav",
    durationMs: 500,
  }).valid, true);
  assert.equal(validateAssetMetadataForType(ASSET_TYPES.TILEMAP, {
    filePath: "assets/tilemaps/level-01.json",
    tileCount: 0,
  }).valid, true);
  assert.equal(validateAssetMetadataForType(ASSET_TYPES.LOCALIZATION, {
    filePath: "assets/locales/en-US.json",
    locale: "en-US",
  }).valid, true);
  assertErrorCodes(validateAssetMetadataForType("shader", {
    title: "Unknown",
  }), [ASSET_CONTRACT_ERRORS.ASSET_TYPE_INVALID], "metadata validation rejects unknown asset type");
  assertErrorCodes(validateAssetMetadataForType(ASSET_TYPES.AUDIO, {
    filePath: "assets/audio/blip.wav",
    durationMs: 0,
  }), [ASSET_CONTRACT_ERRORS.METADATA_INVALID], "metadata validation rejects invalid audio duration");

  const linkedAsset = scenarios.validAssets[0].asset;
  assert.equal(linkedAsset.sourceToolState.toolStateId, "tool-state.vector.ship");
  assert.equal(linkedAsset.sourceToolState.toolType, "object-vector-studio-v2");
  assert.equal(linkedAsset.sourceToolState.projectId, linkedAsset.projectId);
  assert.equal(isToolStateVersion(linkedAsset.sourceToolState.version), true);

  const privateAsset = scenarios.accessChecks[1].asset;
  const privateProject = scenarios.accessChecks[1].project;
  assert.equal(isAssetVisibleToActor({
    actorId: "user.other",
    asset: privateAsset,
    project: privateProject,
  }), false);
  assert.equal(isAssetVisibleToActor({
    actorId: "user.viewer",
    asset: privateAsset,
    project: privateProject,
    grantedProjectIds: ["project.private"],
  }), true);

  for (const scenario of scenarios.accessChecks) {
    assert.equal(canActorAccessAsset({
      actorId: scenario.actorId,
      projectRole: scenario.projectRole,
      permission: scenario.permission,
      asset: scenario.asset,
      project: scenario.project,
      grantedProjectIds: scenario.grantedProjectIds,
      grantedScopes: scenario.grantedScopes,
      policy: scenario.policy,
    }), scenario.expected, scenario.name);
  }

  const archivedAsset = scenarios.accessChecks[5].asset;
  assert.equal(canEditAssetStatus(archivedAsset), false);
  assert.equal(canEditAssetStatus(archivedAsset, {
    allowArchivedAssetEdit: true,
  }), true);
  assert.equal(canActorAccessAsset({
    actorId: archivedAsset.ownerId,
    projectRole: PROJECT_ROLES.OWNER,
    permission: IDENTITY_PERMISSIONS.EDIT,
    asset: archivedAsset,
    project: {
      id: archivedAsset.projectId,
      ownerId: archivedAsset.ownerId,
      state: "active",
      visibility: PROJECT_VISIBILITY_STATES.PUBLIC,
    },
  }), false);
  assert.equal(canActorAccessAsset({
    actorId: archivedAsset.ownerId,
    projectRole: PROJECT_ROLES.OWNER,
    permission: IDENTITY_PERMISSIONS.EDIT,
    asset: archivedAsset,
    project: {
      id: archivedAsset.projectId,
      ownerId: archivedAsset.ownerId,
      state: "active",
      visibility: PROJECT_VISIBILITY_STATES.PUBLIC,
    },
    policy: {
      allowArchivedAssetEdit: true,
    },
  }), true);

  const portableResult = createPortableAssetExport(linkedAsset);
  assert.equal(portableResult.valid, true);
  assert.deepEqual(portableResult.errors, []);
  const portableExport = portableResult.export;
  assert.equal(portableExport.contractId, ASSET_CONTRACT_ID);
  assert.equal(portableExport.contractVersion, ASSET_CONTRACT_VERSION);
  assert.equal(portableExport.portable, true);
  assert.equal(portableExport.assetId, linkedAsset.assetId);
  assert.equal(portableExport.assetType, linkedAsset.assetType);
  assert.equal(portableExport.ownerId, undefined);
  assert.equal(portableExport.projectId, undefined);
  assert.equal(portableExport.databaseId, undefined);
  assert.equal(portableExport.sourceToolState.toolStateId, linkedAsset.sourceToolState.toolStateId);
  assert.equal(portableExport.sourceToolState.toolType, linkedAsset.sourceToolState.toolType);
  assert.equal(portableExport.sourceToolState.projectId, undefined);
  assert.equal(portableExport.sourceToolState.ownerId, undefined);
  assert.deepEqual(portableExport.metadata, linkedAsset.metadata);
  for (const fieldName of ASSET_PORTABLE_EXPORT_FIELDS) {
    assert.equal(Object.hasOwn(portableExport, fieldName), true, fieldName);
  }

  const portableValidation = validatePortableAssetExport(portableExport);
  assert.equal(portableValidation.valid, true);
  assert.deepEqual(portableValidation.errors, []);

  assertErrorCodes(validatePortableAssetExport({
    ...portableExport,
    ownerId: "user.owner",
  }), [ASSET_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID], "portable export strips owner");
  assertErrorCodes(validatePortableAssetExport({
    ...portableExport,
    exportFormats: ["audio-file"],
  }), [ASSET_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID], "portable export format is approved for type");
  assertErrorCodes(validatePortableAssetExport({
    ...portableExport,
    metadata: {
      vectorFormat: "bitmap",
    },
  }), [ASSET_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID], "portable export metadata remains valid for type");
  assertErrorCodes(validatePortableAssetExport({
    ...portableExport,
    sourceToolState: {
      ...portableExport.sourceToolState,
      projectId: linkedAsset.projectId,
    },
  }), [ASSET_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID], "portable source tool state strips project");
}

function assertErrorCodes(validation, expectedCodes, name) {
  assert.deepEqual(validation.errors.map((error) => error.code), expectedCodes, name);
}

function assertUnique(values) {
  assert.equal(new Set(values).size, values.length);
}
