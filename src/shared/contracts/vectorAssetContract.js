/*
Toolbox Aid
David Quesenberry
06/02/2026
vectorAssetContract.js
*/
import {
  IDENTITY_PERMISSION_SCOPES,
  IDENTITY_PERMISSIONS,
  IDENTITY_ROLES,
  IDENTITY_VISIBILITY_STATES,
  canActorPerformPermission,
  isIdentityPermission,
} from "./identityPermissionsContract.js";
import {
  PROJECT_ROLES,
  PROJECT_VISIBILITY_STATES,
  canActorAccessProject,
} from "./projectContract.js";
import {
  TOOL_STATE_FIELDS,
  isToolStateVersion,
} from "./toolStateContract.js";

export const VECTOR_ASSET_CONTRACT_ID = "gamefoundrystudio.vector-asset.lifecycle";
export const VECTOR_ASSET_CONTRACT_VERSION = "1.0.0";
export const VECTOR_ASSET_TYPE = "vector";

export const VECTOR_ASSET_FIELDS = Object.freeze({
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

export const VECTOR_ASSET_STATUS = Object.freeze({
  DRAFT: "draft",
  ACTIVE: "active",
  ARCHIVED: "archived",
});

export const VECTOR_ASSET_STATUS_LIST = Object.freeze([
  VECTOR_ASSET_STATUS.DRAFT,
  VECTOR_ASSET_STATUS.ACTIVE,
  VECTOR_ASSET_STATUS.ARCHIVED,
]);

export const VECTOR_ASSET_VISIBILITY_STATES = Object.freeze({
  PRIVATE: PROJECT_VISIBILITY_STATES.PRIVATE,
  PROJECT: PROJECT_VISIBILITY_STATES.PROJECT,
  UNLISTED: PROJECT_VISIBILITY_STATES.UNLISTED,
  PUBLIC: PROJECT_VISIBILITY_STATES.PUBLIC,
  MARKETPLACE: IDENTITY_VISIBILITY_STATES.MARKETPLACE,
});

export const VECTOR_ASSET_VISIBILITY_LIST = Object.freeze([
  VECTOR_ASSET_VISIBILITY_STATES.PRIVATE,
  VECTOR_ASSET_VISIBILITY_STATES.PROJECT,
  VECTOR_ASSET_VISIBILITY_STATES.UNLISTED,
  VECTOR_ASSET_VISIBILITY_STATES.PUBLIC,
  VECTOR_ASSET_VISIBILITY_STATES.MARKETPLACE,
]);

export const VECTOR_ASSET_EXPORT_FORMATS = Object.freeze({
  VECTOR_JSON: "vector-json",
  SVG: "svg",
  PROJECT_PACKAGE: "project-package",
});

export const VECTOR_ASSET_EXPORT_FORMAT_LIST = Object.freeze([
  VECTOR_ASSET_EXPORT_FORMATS.VECTOR_JSON,
  VECTOR_ASSET_EXPORT_FORMATS.SVG,
  VECTOR_ASSET_EXPORT_FORMATS.PROJECT_PACKAGE,
]);

export const VECTOR_ASSET_PORTABLE_EXPORT_FIELDS = Object.freeze([
  VECTOR_ASSET_FIELDS.ASSET_ID,
  VECTOR_ASSET_FIELDS.ASSET_TYPE,
  VECTOR_ASSET_FIELDS.SOURCE_TOOL_STATE,
  VECTOR_ASSET_FIELDS.VISIBILITY,
  VECTOR_ASSET_FIELDS.VERSION,
  VECTOR_ASSET_FIELDS.STATUS,
  VECTOR_ASSET_FIELDS.EXPORT_FORMATS,
  "payload",
]);

export const VECTOR_ASSET_CONTRACT_ERRORS = Object.freeze({
  ASSET_ID_REQUIRED: "VECTOR_ASSET_ID_REQUIRED",
  ASSET_TYPE_REQUIRED: "VECTOR_ASSET_TYPE_REQUIRED",
  ASSET_TYPE_INVALID: "VECTOR_ASSET_TYPE_INVALID",
  OWNER_REQUIRED: "VECTOR_ASSET_OWNER_REQUIRED",
  PROJECT_REQUIRED: "VECTOR_ASSET_PROJECT_REQUIRED",
  SOURCE_TOOL_STATE_INVALID: "VECTOR_ASSET_SOURCE_TOOL_STATE_INVALID",
  SOURCE_TOOL_STATE_PROJECT_MISMATCH: "VECTOR_ASSET_SOURCE_TOOL_STATE_PROJECT_MISMATCH",
  VISIBILITY_REQUIRED: "VECTOR_ASSET_VISIBILITY_REQUIRED",
  VISIBILITY_INVALID: "VECTOR_ASSET_VISIBILITY_INVALID",
  VERSION_REQUIRED: "VECTOR_ASSET_VERSION_REQUIRED",
  VERSION_INVALID: "VECTOR_ASSET_VERSION_INVALID",
  STATUS_REQUIRED: "VECTOR_ASSET_STATUS_REQUIRED",
  STATUS_INVALID: "VECTOR_ASSET_STATUS_INVALID",
  EXPORT_FORMATS_REQUIRED: "VECTOR_ASSET_EXPORT_FORMATS_REQUIRED",
  EXPORT_FORMAT_INVALID: "VECTOR_ASSET_EXPORT_FORMAT_INVALID",
  PORTABLE_EXPORT_INVALID: "VECTOR_ASSET_PORTABLE_EXPORT_INVALID",
});

export function isVectorAssetType(value) {
  return value === VECTOR_ASSET_TYPE;
}

export function isVectorAssetStatus(value) {
  return VECTOR_ASSET_STATUS_LIST.includes(value);
}

export function isVectorAssetVisibility(value) {
  return VECTOR_ASSET_VISIBILITY_LIST.includes(value);
}

export function isVectorAssetVersion(value) {
  return Number.isInteger(value) && value >= 1;
}

export function isVectorAssetExportFormat(value) {
  return VECTOR_ASSET_EXPORT_FORMAT_LIST.includes(value);
}

export function validateVectorAssetContract(vectorAsset) {
  const errors = [];

  if (!hasNonEmptyString(vectorAsset?.assetId)) {
    errors.push(createContractError(
      VECTOR_ASSET_CONTRACT_ERRORS.ASSET_ID_REQUIRED,
      "Vector asset records require assetId.",
      "assetId"
    ));
  }

  if (!hasNonEmptyString(vectorAsset?.assetType)) {
    errors.push(createContractError(
      VECTOR_ASSET_CONTRACT_ERRORS.ASSET_TYPE_REQUIRED,
      "Vector asset records require assetType.",
      "assetType"
    ));
  } else if (!isVectorAssetType(vectorAsset.assetType)) {
    errors.push(createContractError(
      VECTOR_ASSET_CONTRACT_ERRORS.ASSET_TYPE_INVALID,
      "Vector asset assetType must be vector.",
      "assetType"
    ));
  }

  if (!hasNonEmptyString(vectorAsset?.ownerId)) {
    errors.push(createContractError(
      VECTOR_ASSET_CONTRACT_ERRORS.OWNER_REQUIRED,
      "Vector asset records require ownerId.",
      "ownerId"
    ));
  }

  if (!hasNonEmptyString(vectorAsset?.projectId)) {
    errors.push(createContractError(
      VECTOR_ASSET_CONTRACT_ERRORS.PROJECT_REQUIRED,
      "Vector asset records require projectId.",
      "projectId"
    ));
  }

  if (vectorAsset?.sourceToolState !== undefined) {
    validateSourceToolState(vectorAsset, errors);
  }

  if (!hasNonEmptyString(vectorAsset?.visibility)) {
    errors.push(createContractError(
      VECTOR_ASSET_CONTRACT_ERRORS.VISIBILITY_REQUIRED,
      "Vector asset records require explicit visibility.",
      "visibility"
    ));
  } else if (!isVectorAssetVisibility(vectorAsset.visibility)) {
    errors.push(createContractError(
      VECTOR_ASSET_CONTRACT_ERRORS.VISIBILITY_INVALID,
      "Vector asset visibility must be an allowed vector asset visibility state.",
      "visibility"
    ));
  }

  if (vectorAsset?.version === undefined || vectorAsset?.version === null) {
    errors.push(createContractError(
      VECTOR_ASSET_CONTRACT_ERRORS.VERSION_REQUIRED,
      "Vector asset records require version.",
      "version"
    ));
  } else if (!isVectorAssetVersion(vectorAsset.version)) {
    errors.push(createContractError(
      VECTOR_ASSET_CONTRACT_ERRORS.VERSION_INVALID,
      "Vector asset version must be a positive integer.",
      "version"
    ));
  }

  if (!hasNonEmptyString(vectorAsset?.status)) {
    errors.push(createContractError(
      VECTOR_ASSET_CONTRACT_ERRORS.STATUS_REQUIRED,
      "Vector asset records require status.",
      "status"
    ));
  } else if (!isVectorAssetStatus(vectorAsset.status)) {
    errors.push(createContractError(
      VECTOR_ASSET_CONTRACT_ERRORS.STATUS_INVALID,
      "Vector asset status must be an allowed vector asset status.",
      "status"
    ));
  }

  if (!Array.isArray(vectorAsset?.exportFormats) || vectorAsset.exportFormats.length === 0) {
    errors.push(createContractError(
      VECTOR_ASSET_CONTRACT_ERRORS.EXPORT_FORMATS_REQUIRED,
      "Vector asset records require exportFormats.",
      "exportFormats"
    ));
  } else {
    vectorAsset.exportFormats.forEach((format, index) => {
      if (!isVectorAssetExportFormat(format)) {
        errors.push(createContractError(
          VECTOR_ASSET_CONTRACT_ERRORS.EXPORT_FORMAT_INVALID,
          "Vector asset exportFormats must use allowed export formats.",
          `exportFormats[${index}]`
        ));
      }
    });
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

export function canEditVectorAssetStatus(vectorAsset, policy = {}) {
  if (vectorAsset?.status === VECTOR_ASSET_STATUS.ARCHIVED) {
    return policy.allowArchivedVectorAssetEdit === true;
  }

  return isVectorAssetStatus(vectorAsset?.status);
}

export function isVectorAssetVisibleToActor({
  actorId,
  vectorAsset,
  project,
  grantedProjectIds = [],
} = {}) {
  if (!hasNonEmptyString(actorId) || !vectorAsset) {
    return false;
  }

  if (actorId === vectorAsset.ownerId) {
    return true;
  }

  if (vectorAsset.visibility === VECTOR_ASSET_VISIBILITY_STATES.PUBLIC
    || vectorAsset.visibility === VECTOR_ASSET_VISIBILITY_STATES.UNLISTED
    || vectorAsset.visibility === VECTOR_ASSET_VISIBILITY_STATES.MARKETPLACE) {
    return true;
  }

  if (!project || vectorAsset.projectId !== project.id) {
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

export function canActorAccessVectorAsset({
  actorId,
  projectRole,
  permission,
  vectorAsset,
  project,
  grantedProjectIds = [],
  grantedScopes = [],
  policy = {},
} = {}) {
  if (!isIdentityPermission(permission) || !isVectorAssetVisibleToActor({ actorId, vectorAsset, project, grantedProjectIds })) {
    return false;
  }

  if (permission === IDENTITY_PERMISSIONS.EDIT && !canEditVectorAssetStatus(vectorAsset, policy)) {
    return false;
  }

  if (actorId === vectorAsset?.ownerId) {
    return canActorPerformPermission({
      actorId,
      role: IDENTITY_ROLES.OWNER,
      permission,
      scope: IDENTITY_PERMISSION_SCOPES.OWNED_OBJECT,
      object: {
        ownerId: vectorAsset.ownerId,
        visibility: vectorAsset.visibility,
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

export function createPortableVectorAssetExport(vectorAsset) {
  const validation = validateVectorAssetContract(vectorAsset);

  if (!validation.valid) {
    return Object.freeze({
      valid: false,
      errors: validation.errors,
      export: null,
    });
  }

  const portableExport = Object.freeze({
    contractId: VECTOR_ASSET_CONTRACT_ID,
    contractVersion: VECTOR_ASSET_CONTRACT_VERSION,
    assetId: vectorAsset.assetId,
    assetType: VECTOR_ASSET_TYPE,
    sourceToolState: createPortableSourceToolState(vectorAsset.sourceToolState),
    visibility: vectorAsset.visibility,
    version: vectorAsset.version,
    status: vectorAsset.status,
    exportFormats: Object.freeze(normalizeStringArray(vectorAsset.exportFormats)),
    payload: clonePortablePayload(vectorAsset.payload ?? {}),
    portable: true,
  });

  return Object.freeze({
    valid: true,
    errors: Object.freeze([]),
    export: portableExport,
  });
}

export function validatePortableVectorAssetExport(portableExport) {
  const errors = [];

  if (!portableExport?.portable) {
    errors.push(createContractError(
      VECTOR_ASSET_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID,
      "Portable vector asset export must declare portable=true.",
      "portable"
    ));
  }

  if (hasNonEmptyString(portableExport?.ownerId) || hasNonEmptyString(portableExport?.projectId) || hasNonEmptyString(portableExport?.databaseId)) {
    errors.push(createContractError(
      VECTOR_ASSET_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID,
      "Portable vector asset export must not carry database owner, project, or database ids.",
      "portable"
    ));
  }

  if (!hasNonEmptyString(portableExport?.assetId)
    || !isVectorAssetType(portableExport?.assetType)
    || !isVectorAssetVisibility(portableExport?.visibility)
    || !isVectorAssetVersion(portableExport?.version)
    || !isVectorAssetStatus(portableExport?.status)
    || !Array.isArray(portableExport?.exportFormats)
    || portableExport.exportFormats.length === 0) {
    errors.push(createContractError(
      VECTOR_ASSET_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID,
      "Portable vector asset export must preserve valid portable identity, type, visibility, version, status, and export format fields.",
      "portable"
    ));
  }

  if (Array.isArray(portableExport?.exportFormats)) {
    portableExport.exportFormats.forEach((format, index) => {
      if (!isVectorAssetExportFormat(format)) {
        errors.push(createContractError(
          VECTOR_ASSET_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID,
          "Portable vector asset export formats must remain approved vector asset export formats.",
          `exportFormats[${index}]`
        ));
      }
    });
  }

  if (portableExport?.sourceToolState && (hasNonEmptyString(portableExport.sourceToolState.ownerId) || hasNonEmptyString(portableExport.sourceToolState.projectId))) {
    errors.push(createContractError(
      VECTOR_ASSET_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID,
      "Portable source tool state references must not carry owner or project ids.",
      "sourceToolState"
    ));
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

function validateSourceToolState(vectorAsset, errors) {
  const sourceToolState = vectorAsset.sourceToolState;

  if (!sourceToolState || typeof sourceToolState !== "object") {
    errors.push(createContractError(
      VECTOR_ASSET_CONTRACT_ERRORS.SOURCE_TOOL_STATE_INVALID,
      "Vector asset sourceToolState must be an object when provided.",
      "sourceToolState"
    ));
    return;
  }

  if (!hasNonEmptyString(sourceToolState[TOOL_STATE_FIELDS.TOOL_STATE_ID]) || !hasNonEmptyString(sourceToolState[TOOL_STATE_FIELDS.TOOL_TYPE])) {
    errors.push(createContractError(
      VECTOR_ASSET_CONTRACT_ERRORS.SOURCE_TOOL_STATE_INVALID,
      "Vector asset sourceToolState must identify toolStateId and toolType.",
      "sourceToolState"
    ));
  }

  if (sourceToolState.version !== undefined && !isToolStateVersion(sourceToolState.version)) {
    errors.push(createContractError(
      VECTOR_ASSET_CONTRACT_ERRORS.SOURCE_TOOL_STATE_INVALID,
      "Vector asset sourceToolState version must be a positive integer when provided.",
      "sourceToolState.version"
    ));
  }

  if (hasNonEmptyString(sourceToolState.projectId) && sourceToolState.projectId !== vectorAsset.projectId) {
    errors.push(createContractError(
      VECTOR_ASSET_CONTRACT_ERRORS.SOURCE_TOOL_STATE_PROJECT_MISMATCH,
      "Vector asset sourceToolState projectId must match vector asset projectId.",
      "sourceToolState.projectId"
    ));
  }
}

function createPortableSourceToolState(sourceToolState) {
  if (!sourceToolState) {
    return null;
  }

  return Object.freeze({
    toolStateId: sourceToolState.toolStateId,
    toolType: sourceToolState.toolType,
    version: sourceToolState.version,
  });
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeStringArray(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  return Array.from(new Set(values.filter((value) => hasNonEmptyString(value))));
}

function clonePortablePayload(payload) {
  return Object.freeze(JSON.parse(JSON.stringify(payload)));
}

function createContractError(code, message, path) {
  return Object.freeze({ code, message, path });
}
