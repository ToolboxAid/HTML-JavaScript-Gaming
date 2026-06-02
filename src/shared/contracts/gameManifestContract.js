/*
Toolbox Aid
David Quesenberry
06/02/2026
gameManifestContract.js
*/
import {
  IDENTITY_PERMISSION_SCOPES,
  IDENTITY_PERMISSIONS,
  IDENTITY_ROLES,
  canActorPerformPermission,
  isIdentityPermission,
} from "./identityPermissionsContract.js";
import {
  PROJECT_ROLES,
  PROJECT_TYPES,
  PROJECT_VISIBILITY_STATES,
  canActorAccessProject,
  isProjectVisibility,
} from "./projectContract.js";

export const GAME_MANIFEST_CONTRACT_ID = "gamefoundrystudio.game-manifest.contract";
export const GAME_MANIFEST_CONTRACT_VERSION = "1.0.0";

export const GAME_MANIFEST_FIELDS = Object.freeze({
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

export const GAME_MANIFEST_FIELD_LIST = Object.freeze([
  GAME_MANIFEST_FIELDS.MANIFEST_ID,
  GAME_MANIFEST_FIELDS.OWNER,
  GAME_MANIFEST_FIELDS.PROJECT,
  GAME_MANIFEST_FIELDS.PROJECT_TYPE,
  GAME_MANIFEST_FIELDS.SOURCE_TOOL_STATES,
  GAME_MANIFEST_FIELDS.SOURCE_ASSETS,
  GAME_MANIFEST_FIELDS.VISIBILITY,
  GAME_MANIFEST_FIELDS.VERSION,
  GAME_MANIFEST_FIELDS.STATUS,
  GAME_MANIFEST_FIELDS.EXPORT_FORMAT,
]);

export const GAME_MANIFEST_STATUS = Object.freeze({
  DRAFT: "draft",
  ACTIVE: "active",
  ARCHIVED: "archived",
  PUBLISHED: "published",
});

export const GAME_MANIFEST_STATUS_LIST = Object.freeze([
  GAME_MANIFEST_STATUS.DRAFT,
  GAME_MANIFEST_STATUS.ACTIVE,
  GAME_MANIFEST_STATUS.ARCHIVED,
  GAME_MANIFEST_STATUS.PUBLISHED,
]);

export const GAME_MANIFEST_EXPORT_FORMATS = Object.freeze({
  GAME_MANIFEST_JSON: "game-manifest-json",
});

export const GAME_MANIFEST_EXPORT_FORMAT_LIST = Object.freeze([
  GAME_MANIFEST_EXPORT_FORMATS.GAME_MANIFEST_JSON,
]);

export const GAME_MANIFEST_SOURCE_ASSET_TYPES = Object.freeze({
  VECTOR: "vector",
  PALETTE: "palette",
  IMAGE: "image",
  AUDIO: "audio",
  TILEMAP: "tilemap",
  LOCALIZATION: "localization",
});

export const GAME_MANIFEST_SOURCE_ASSET_TYPE_LIST = Object.freeze([
  GAME_MANIFEST_SOURCE_ASSET_TYPES.VECTOR,
  GAME_MANIFEST_SOURCE_ASSET_TYPES.PALETTE,
  GAME_MANIFEST_SOURCE_ASSET_TYPES.IMAGE,
  GAME_MANIFEST_SOURCE_ASSET_TYPES.AUDIO,
  GAME_MANIFEST_SOURCE_ASSET_TYPES.TILEMAP,
  GAME_MANIFEST_SOURCE_ASSET_TYPES.LOCALIZATION,
]);

export const GAME_MANIFEST_RULES = Object.freeze({
  REQUIRES_OWNER: true,
  REQUIRES_PROJECT: true,
  REQUIRES_GAME_PROJECT_TYPE: true,
  MAY_REFERENCE_TOOL_STATES: true,
  MAY_REFERENCE_ASSETS: true,
  PORTABLE_EXPORT_IMPORT_FORMAT: true,
  DATABASE_REMAINS_WORKING_SYSTEM: true,
  MANIFEST_NOT_DATABASE_SOURCE_OF_TRUTH: true,
  CANNOT_BYPASS_OWNERSHIP_VISIBILITY_PERMISSIONS: true,
  ARCHIVED_IMMUTABLE_UNLESS_POLICY_ALLOWS: true,
});

export const GAME_MANIFEST_PORTABLE_EXPORT_FIELDS = Object.freeze([
  GAME_MANIFEST_FIELDS.MANIFEST_ID,
  GAME_MANIFEST_FIELDS.PROJECT_TYPE,
  GAME_MANIFEST_FIELDS.SOURCE_TOOL_STATES,
  GAME_MANIFEST_FIELDS.SOURCE_ASSETS,
  GAME_MANIFEST_FIELDS.VISIBILITY,
  GAME_MANIFEST_FIELDS.VERSION,
  GAME_MANIFEST_FIELDS.STATUS,
  GAME_MANIFEST_FIELDS.EXPORT_FORMAT,
]);

export const GAME_MANIFEST_CONTRACT_ERRORS = Object.freeze({
  MANIFEST_ID_REQUIRED: "GAME_MANIFEST_ID_REQUIRED",
  OWNER_REQUIRED: "GAME_MANIFEST_OWNER_REQUIRED",
  PROJECT_REQUIRED: "GAME_MANIFEST_PROJECT_REQUIRED",
  PROJECT_TYPE_REQUIRED: "GAME_MANIFEST_PROJECT_TYPE_REQUIRED",
  PROJECT_TYPE_INVALID: "GAME_MANIFEST_PROJECT_TYPE_INVALID",
  SOURCE_TOOL_STATE_INVALID: "GAME_MANIFEST_SOURCE_TOOL_STATE_INVALID",
  SOURCE_ASSET_INVALID: "GAME_MANIFEST_SOURCE_ASSET_INVALID",
  VISIBILITY_REQUIRED: "GAME_MANIFEST_VISIBILITY_REQUIRED",
  VISIBILITY_INVALID: "GAME_MANIFEST_VISIBILITY_INVALID",
  VERSION_REQUIRED: "GAME_MANIFEST_VERSION_REQUIRED",
  VERSION_INVALID: "GAME_MANIFEST_VERSION_INVALID",
  STATUS_REQUIRED: "GAME_MANIFEST_STATUS_REQUIRED",
  STATUS_INVALID: "GAME_MANIFEST_STATUS_INVALID",
  EXPORT_FORMAT_REQUIRED: "GAME_MANIFEST_EXPORT_FORMAT_REQUIRED",
  EXPORT_FORMAT_INVALID: "GAME_MANIFEST_EXPORT_FORMAT_INVALID",
  PORTABLE_EXPORT_INVALID: "GAME_MANIFEST_PORTABLE_EXPORT_INVALID",
});

export function isGameManifestStatus(value) {
  return GAME_MANIFEST_STATUS_LIST.includes(value);
}

export function isGameManifestVisibility(value) {
  return isProjectVisibility(value);
}

export function isGameManifestVersion(value) {
  return Number.isInteger(value) && value >= 1;
}

export function isGameManifestExportFormat(value) {
  return GAME_MANIFEST_EXPORT_FORMAT_LIST.includes(value);
}

export function isGameManifestSourceAssetType(value) {
  return GAME_MANIFEST_SOURCE_ASSET_TYPE_LIST.includes(value);
}

export function isGameManifestSourceToolState(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.toolStateId)
    && hasNonEmptyString(value.toolType)
    && (value.version === undefined || isGameManifestVersion(value.version));
}

export function isGameManifestSourceAsset(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.assetId)
    && isGameManifestSourceAssetType(value.assetType)
    && (value.version === undefined || isGameManifestVersion(value.version));
}

export function validateGameManifestContract(manifest) {
  const errors = [];

  if (!hasNonEmptyString(manifest?.manifestId)) {
    errors.push(createContractError(
      GAME_MANIFEST_CONTRACT_ERRORS.MANIFEST_ID_REQUIRED,
      "Game Manifest records require manifestId.",
      GAME_MANIFEST_FIELDS.MANIFEST_ID
    ));
  }

  if (!hasNonEmptyString(manifest?.ownerId)) {
    errors.push(createContractError(
      GAME_MANIFEST_CONTRACT_ERRORS.OWNER_REQUIRED,
      "Game Manifest records require ownerId.",
      GAME_MANIFEST_FIELDS.OWNER
    ));
  }

  if (!hasNonEmptyString(manifest?.projectId)) {
    errors.push(createContractError(
      GAME_MANIFEST_CONTRACT_ERRORS.PROJECT_REQUIRED,
      "Game Manifest records require projectId.",
      GAME_MANIFEST_FIELDS.PROJECT
    ));
  }

  if (!hasNonEmptyString(manifest?.projectType)) {
    errors.push(createContractError(
      GAME_MANIFEST_CONTRACT_ERRORS.PROJECT_TYPE_REQUIRED,
      "Game Manifest records require projectType.",
      GAME_MANIFEST_FIELDS.PROJECT_TYPE
    ));
  } else if (manifest.projectType !== PROJECT_TYPES.GAME) {
    errors.push(createContractError(
      GAME_MANIFEST_CONTRACT_ERRORS.PROJECT_TYPE_INVALID,
      "Game Manifest records require projectType=game.",
      GAME_MANIFEST_FIELDS.PROJECT_TYPE
    ));
  }

  validateSourceToolStates(manifest?.sourceToolStates, errors);
  validateSourceAssets(manifest?.sourceAssets, errors);

  if (!hasNonEmptyString(manifest?.visibility)) {
    errors.push(createContractError(
      GAME_MANIFEST_CONTRACT_ERRORS.VISIBILITY_REQUIRED,
      "Game Manifest records require explicit visibility.",
      GAME_MANIFEST_FIELDS.VISIBILITY
    ));
  } else if (!isGameManifestVisibility(manifest.visibility)) {
    errors.push(createContractError(
      GAME_MANIFEST_CONTRACT_ERRORS.VISIBILITY_INVALID,
      "Game Manifest visibility must be an allowed project visibility state.",
      GAME_MANIFEST_FIELDS.VISIBILITY
    ));
  }

  if (manifest?.version === undefined || manifest?.version === null) {
    errors.push(createContractError(
      GAME_MANIFEST_CONTRACT_ERRORS.VERSION_REQUIRED,
      "Game Manifest records require version.",
      GAME_MANIFEST_FIELDS.VERSION
    ));
  } else if (!isGameManifestVersion(manifest.version)) {
    errors.push(createContractError(
      GAME_MANIFEST_CONTRACT_ERRORS.VERSION_INVALID,
      "Game Manifest version must be a positive integer.",
      GAME_MANIFEST_FIELDS.VERSION
    ));
  }

  if (!hasNonEmptyString(manifest?.status)) {
    errors.push(createContractError(
      GAME_MANIFEST_CONTRACT_ERRORS.STATUS_REQUIRED,
      "Game Manifest records require status.",
      GAME_MANIFEST_FIELDS.STATUS
    ));
  } else if (!isGameManifestStatus(manifest.status)) {
    errors.push(createContractError(
      GAME_MANIFEST_CONTRACT_ERRORS.STATUS_INVALID,
      "Game Manifest status must be an allowed manifest status.",
      GAME_MANIFEST_FIELDS.STATUS
    ));
  }

  if (!hasNonEmptyString(manifest?.exportFormat)) {
    errors.push(createContractError(
      GAME_MANIFEST_CONTRACT_ERRORS.EXPORT_FORMAT_REQUIRED,
      "Game Manifest records require exportFormat.",
      GAME_MANIFEST_FIELDS.EXPORT_FORMAT
    ));
  } else if (!isGameManifestExportFormat(manifest.exportFormat)) {
    errors.push(createContractError(
      GAME_MANIFEST_CONTRACT_ERRORS.EXPORT_FORMAT_INVALID,
      "Game Manifest exportFormat must be an allowed portable manifest format.",
      GAME_MANIFEST_FIELDS.EXPORT_FORMAT
    ));
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

export function canEditGameManifestStatus(manifest, policy = {}) {
  if (manifest?.status === GAME_MANIFEST_STATUS.ARCHIVED) {
    return policy.allowArchivedManifestEdit === true;
  }

  return isGameManifestStatus(manifest?.status);
}

export function isGameManifestVisibleToActor({
  actorId,
  manifest,
  project,
  grantedProjectIds = [],
} = {}) {
  if (!hasNonEmptyString(actorId) || !manifest) {
    return false;
  }

  if (actorId === manifest.ownerId) {
    return true;
  }

  if (manifest.visibility === PROJECT_VISIBILITY_STATES.PUBLIC || manifest.visibility === PROJECT_VISIBILITY_STATES.UNLISTED) {
    return true;
  }

  if (!project || manifest.projectId !== project.id) {
    return false;
  }

  return canActorAccessProject({
    actorId,
    projectRole: PROJECT_ROLES.VIEWER,
    permission: IDENTITY_PERMISSIONS.VIEW,
    project,
    grantedProjectIds,
  });
}

export function canActorAccessGameManifest({
  actorId,
  projectRole,
  permission,
  manifest,
  project,
  grantedProjectIds = [],
  grantedScopes = [],
  policy = {},
} = {}) {
  if (!isIdentityPermission(permission) || !isGameManifestVisibleToActor({ actorId, manifest, project, grantedProjectIds })) {
    return false;
  }

  if (permission === IDENTITY_PERMISSIONS.EDIT && !canEditGameManifestStatus(manifest, policy)) {
    return false;
  }

  if (actorId === manifest?.ownerId) {
    return canActorPerformPermission({
      actorId,
      role: IDENTITY_ROLES.OWNER,
      permission,
      scope: IDENTITY_PERMISSION_SCOPES.OWNED_OBJECT,
      object: {
        ownerId: manifest.ownerId,
        visibility: manifest.visibility,
      },
    });
  }

  return canActorAccessProject({
    actorId,
    projectRole,
    permission,
    project,
    grantedProjectIds,
    grantedScopes,
    policy,
  });
}

export function createPortableGameManifestExport(manifest) {
  const validation = validateGameManifestContract(manifest);

  if (!validation.valid) {
    return Object.freeze({
      valid: false,
      errors: validation.errors,
      export: null,
    });
  }

  const portableExport = Object.freeze({
    contractId: GAME_MANIFEST_CONTRACT_ID,
    contractVersion: GAME_MANIFEST_CONTRACT_VERSION,
    manifestId: manifest.manifestId,
    projectType: PROJECT_TYPES.GAME,
    sourceToolStates: Object.freeze(cloneReferenceList(manifest.sourceToolStates)),
    sourceAssets: Object.freeze(cloneReferenceList(manifest.sourceAssets)),
    visibility: manifest.visibility,
    version: manifest.version,
    status: manifest.status,
    exportFormat: manifest.exportFormat,
    portable: true,
  });

  return Object.freeze({
    valid: true,
    errors: Object.freeze([]),
    export: portableExport,
  });
}

export function validatePortableGameManifestExport(portableExport) {
  const errors = [];

  if (!portableExport?.portable) {
    errors.push(createContractError(
      GAME_MANIFEST_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID,
      "Portable Game Manifest export must declare portable=true.",
      "portable"
    ));
  }

  if (hasNonEmptyString(portableExport?.ownerId) || hasNonEmptyString(portableExport?.projectId) || hasNonEmptyString(portableExport?.databaseId)) {
    errors.push(createContractError(
      GAME_MANIFEST_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID,
      "Portable Game Manifest export must not carry database owner, project, or database ids.",
      "portable"
    ));
  }

  const portableManifest = {
    ...portableExport,
    ownerId: "portable.owner",
    projectId: "portable.project",
  };
  const validation = validateGameManifestContract(portableManifest);

  validation.errors.forEach((error) => {
    errors.push(createContractError(
      GAME_MANIFEST_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID,
      error.message,
      error.path
    ));
  });

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

function validateSourceToolStates(sourceToolStates, errors) {
  if (sourceToolStates === undefined || sourceToolStates === null) {
    return;
  }

  if (!Array.isArray(sourceToolStates)) {
    errors.push(createContractError(
      GAME_MANIFEST_CONTRACT_ERRORS.SOURCE_TOOL_STATE_INVALID,
      "Game Manifest sourceToolStates must be an array when provided.",
      GAME_MANIFEST_FIELDS.SOURCE_TOOL_STATES
    ));
    return;
  }

  sourceToolStates.forEach((sourceToolState, index) => {
    if (!isGameManifestSourceToolState(sourceToolState)) {
      errors.push(createContractError(
        GAME_MANIFEST_CONTRACT_ERRORS.SOURCE_TOOL_STATE_INVALID,
        "Game Manifest source tool state references must identify toolStateId, toolType, and optional positive version.",
        `${GAME_MANIFEST_FIELDS.SOURCE_TOOL_STATES}[${index}]`
      ));
    }
  });
}

function validateSourceAssets(sourceAssets, errors) {
  if (sourceAssets === undefined || sourceAssets === null) {
    return;
  }

  if (!Array.isArray(sourceAssets)) {
    errors.push(createContractError(
      GAME_MANIFEST_CONTRACT_ERRORS.SOURCE_ASSET_INVALID,
      "Game Manifest sourceAssets must be an array when provided.",
      GAME_MANIFEST_FIELDS.SOURCE_ASSETS
    ));
    return;
  }

  sourceAssets.forEach((sourceAsset, index) => {
    if (!isGameManifestSourceAsset(sourceAsset)) {
      errors.push(createContractError(
        GAME_MANIFEST_CONTRACT_ERRORS.SOURCE_ASSET_INVALID,
        "Game Manifest source asset references must identify assetId, assetType, and optional positive version.",
        `${GAME_MANIFEST_FIELDS.SOURCE_ASSETS}[${index}]`
      ));
    }
  });
}

function isReferenceObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function cloneReferenceList(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  return values.map((value) => Object.freeze(JSON.parse(JSON.stringify(value))));
}

function createContractError(code, message, path) {
  return Object.freeze({ code, message, path });
}
