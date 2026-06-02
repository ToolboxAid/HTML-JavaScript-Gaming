/*
Toolbox Aid
David Quesenberry
06/02/2026
assetContract.js
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

export const ASSET_CONTRACT_ID = "gamefoundrystudio.asset.lifecycle";
export const ASSET_CONTRACT_VERSION = "1.0.0";

export const ASSET_FIELDS = Object.freeze({
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

export const ASSET_TYPES = Object.freeze({
  VECTOR: "vector",
  PALETTE: "palette",
  IMAGE: "image",
  AUDIO: "audio",
  TILEMAP: "tilemap",
  LOCALIZATION: "localization",
});

export const ASSET_TYPE_LIST = Object.freeze([
  ASSET_TYPES.VECTOR,
  ASSET_TYPES.PALETTE,
  ASSET_TYPES.IMAGE,
  ASSET_TYPES.AUDIO,
  ASSET_TYPES.TILEMAP,
  ASSET_TYPES.LOCALIZATION,
]);

export const ASSET_STATUS = Object.freeze({
  DRAFT: "draft",
  ACTIVE: "active",
  ARCHIVED: "archived",
});

export const ASSET_STATUS_LIST = Object.freeze([
  ASSET_STATUS.DRAFT,
  ASSET_STATUS.ACTIVE,
  ASSET_STATUS.ARCHIVED,
]);

export const ASSET_VISIBILITY_STATES = Object.freeze({
  PRIVATE: PROJECT_VISIBILITY_STATES.PRIVATE,
  PROJECT: PROJECT_VISIBILITY_STATES.PROJECT,
  UNLISTED: PROJECT_VISIBILITY_STATES.UNLISTED,
  PUBLIC: PROJECT_VISIBILITY_STATES.PUBLIC,
  MARKETPLACE: IDENTITY_VISIBILITY_STATES.MARKETPLACE,
});

export const ASSET_VISIBILITY_LIST = Object.freeze([
  ASSET_VISIBILITY_STATES.PRIVATE,
  ASSET_VISIBILITY_STATES.PROJECT,
  ASSET_VISIBILITY_STATES.UNLISTED,
  ASSET_VISIBILITY_STATES.PUBLIC,
  ASSET_VISIBILITY_STATES.MARKETPLACE,
]);

export const ASSET_EXPORT_FORMATS = Object.freeze({
  METADATA_JSON: "metadata-json",
  PROJECT_PACKAGE: "project-package",
  VECTOR_JSON: "vector-json",
  SVG: "svg",
  PALETTE_JSON: "palette-json",
  IMAGE_FILE: "image-file",
  AUDIO_FILE: "audio-file",
  TILEMAP_JSON: "tilemap-json",
  LOCALIZATION_JSON: "localization-json",
});

export const ASSET_EXPORT_FORMAT_LIST = Object.freeze([
  ASSET_EXPORT_FORMATS.METADATA_JSON,
  ASSET_EXPORT_FORMATS.PROJECT_PACKAGE,
  ASSET_EXPORT_FORMATS.VECTOR_JSON,
  ASSET_EXPORT_FORMATS.SVG,
  ASSET_EXPORT_FORMATS.PALETTE_JSON,
  ASSET_EXPORT_FORMATS.IMAGE_FILE,
  ASSET_EXPORT_FORMATS.AUDIO_FILE,
  ASSET_EXPORT_FORMATS.TILEMAP_JSON,
  ASSET_EXPORT_FORMATS.LOCALIZATION_JSON,
]);

export const ASSET_TYPE_EXPORT_FORMATS = Object.freeze({
  [ASSET_TYPES.VECTOR]: Object.freeze([
    ASSET_EXPORT_FORMATS.VECTOR_JSON,
    ASSET_EXPORT_FORMATS.SVG,
    ASSET_EXPORT_FORMATS.METADATA_JSON,
    ASSET_EXPORT_FORMATS.PROJECT_PACKAGE,
  ]),
  [ASSET_TYPES.PALETTE]: Object.freeze([
    ASSET_EXPORT_FORMATS.PALETTE_JSON,
    ASSET_EXPORT_FORMATS.METADATA_JSON,
    ASSET_EXPORT_FORMATS.PROJECT_PACKAGE,
  ]),
  [ASSET_TYPES.IMAGE]: Object.freeze([
    ASSET_EXPORT_FORMATS.IMAGE_FILE,
    ASSET_EXPORT_FORMATS.METADATA_JSON,
    ASSET_EXPORT_FORMATS.PROJECT_PACKAGE,
  ]),
  [ASSET_TYPES.AUDIO]: Object.freeze([
    ASSET_EXPORT_FORMATS.AUDIO_FILE,
    ASSET_EXPORT_FORMATS.METADATA_JSON,
    ASSET_EXPORT_FORMATS.PROJECT_PACKAGE,
  ]),
  [ASSET_TYPES.TILEMAP]: Object.freeze([
    ASSET_EXPORT_FORMATS.TILEMAP_JSON,
    ASSET_EXPORT_FORMATS.METADATA_JSON,
    ASSET_EXPORT_FORMATS.PROJECT_PACKAGE,
  ]),
  [ASSET_TYPES.LOCALIZATION]: Object.freeze([
    ASSET_EXPORT_FORMATS.LOCALIZATION_JSON,
    ASSET_EXPORT_FORMATS.METADATA_JSON,
    ASSET_EXPORT_FORMATS.PROJECT_PACKAGE,
  ]),
});

export const ASSET_METADATA_FIELDS = Object.freeze({
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

export const ASSET_PORTABLE_EXPORT_FIELDS = Object.freeze([
  ASSET_FIELDS.ASSET_ID,
  ASSET_FIELDS.ASSET_TYPE,
  ASSET_FIELDS.SOURCE_TOOL_STATE,
  ASSET_FIELDS.VISIBILITY,
  ASSET_FIELDS.VERSION,
  ASSET_FIELDS.STATUS,
  ASSET_FIELDS.METADATA,
  ASSET_FIELDS.EXPORT_FORMATS,
]);

export const ASSET_CONTRACT_ERRORS = Object.freeze({
  ASSET_ID_REQUIRED: "ASSET_ID_REQUIRED",
  ASSET_TYPE_REQUIRED: "ASSET_TYPE_REQUIRED",
  ASSET_TYPE_INVALID: "ASSET_TYPE_INVALID",
  OWNER_REQUIRED: "ASSET_OWNER_REQUIRED",
  PROJECT_REQUIRED: "ASSET_PROJECT_REQUIRED",
  SOURCE_TOOL_STATE_INVALID: "ASSET_SOURCE_TOOL_STATE_INVALID",
  SOURCE_TOOL_STATE_PROJECT_MISMATCH: "ASSET_SOURCE_TOOL_STATE_PROJECT_MISMATCH",
  VISIBILITY_REQUIRED: "ASSET_VISIBILITY_REQUIRED",
  VISIBILITY_INVALID: "ASSET_VISIBILITY_INVALID",
  VERSION_REQUIRED: "ASSET_VERSION_REQUIRED",
  VERSION_INVALID: "ASSET_VERSION_INVALID",
  STATUS_REQUIRED: "ASSET_STATUS_REQUIRED",
  STATUS_INVALID: "ASSET_STATUS_INVALID",
  METADATA_REQUIRED: "ASSET_METADATA_REQUIRED",
  METADATA_INVALID: "ASSET_METADATA_INVALID",
  EXPORT_FORMATS_REQUIRED: "ASSET_EXPORT_FORMATS_REQUIRED",
  EXPORT_FORMAT_INVALID: "ASSET_EXPORT_FORMAT_INVALID",
  PORTABLE_EXPORT_INVALID: "ASSET_PORTABLE_EXPORT_INVALID",
});

const VECTOR_METADATA_FORMATS = Object.freeze([
  ASSET_EXPORT_FORMATS.VECTOR_JSON,
  ASSET_EXPORT_FORMATS.SVG,
]);

export function isAssetType(value) {
  return ASSET_TYPE_LIST.includes(value);
}

export function isAssetStatus(value) {
  return ASSET_STATUS_LIST.includes(value);
}

export function isAssetVisibility(value) {
  return ASSET_VISIBILITY_LIST.includes(value);
}

export function isAssetVersion(value) {
  return Number.isInteger(value) && value >= 1;
}

export function isAssetExportFormat(value) {
  return ASSET_EXPORT_FORMAT_LIST.includes(value);
}

export function isAssetExportFormatForType(assetType, exportFormat) {
  return Array.isArray(ASSET_TYPE_EXPORT_FORMATS[assetType])
    && ASSET_TYPE_EXPORT_FORMATS[assetType].includes(exportFormat);
}

export function isAssetMetadataForType(assetType, metadata) {
  return validateAssetMetadataForType(assetType, metadata).valid;
}

export function validateAssetContract(asset) {
  const errors = [];

  if (!hasNonEmptyString(asset?.assetId)) {
    errors.push(createContractError(
      ASSET_CONTRACT_ERRORS.ASSET_ID_REQUIRED,
      "Asset records require assetId.",
      "assetId"
    ));
  }

  if (!hasNonEmptyString(asset?.assetType)) {
    errors.push(createContractError(
      ASSET_CONTRACT_ERRORS.ASSET_TYPE_REQUIRED,
      "Asset records require assetType.",
      "assetType"
    ));
  } else if (!isAssetType(asset.assetType)) {
    errors.push(createContractError(
      ASSET_CONTRACT_ERRORS.ASSET_TYPE_INVALID,
      "Asset assetType must be an allowed asset type.",
      "assetType"
    ));
  }

  if (!hasNonEmptyString(asset?.ownerId)) {
    errors.push(createContractError(
      ASSET_CONTRACT_ERRORS.OWNER_REQUIRED,
      "Asset records require ownerId.",
      "ownerId"
    ));
  }

  if (!hasNonEmptyString(asset?.projectId)) {
    errors.push(createContractError(
      ASSET_CONTRACT_ERRORS.PROJECT_REQUIRED,
      "Asset records require projectId.",
      "projectId"
    ));
  }

  if (asset?.sourceToolState !== undefined) {
    validateSourceToolState(asset, errors);
  }

  if (!hasNonEmptyString(asset?.visibility)) {
    errors.push(createContractError(
      ASSET_CONTRACT_ERRORS.VISIBILITY_REQUIRED,
      "Asset records require explicit visibility.",
      "visibility"
    ));
  } else if (!isAssetVisibility(asset.visibility)) {
    errors.push(createContractError(
      ASSET_CONTRACT_ERRORS.VISIBILITY_INVALID,
      "Asset visibility must be an allowed asset visibility state.",
      "visibility"
    ));
  }

  if (asset?.version === undefined || asset?.version === null) {
    errors.push(createContractError(
      ASSET_CONTRACT_ERRORS.VERSION_REQUIRED,
      "Asset records require version.",
      "version"
    ));
  } else if (!isAssetVersion(asset.version)) {
    errors.push(createContractError(
      ASSET_CONTRACT_ERRORS.VERSION_INVALID,
      "Asset version must be a positive integer.",
      "version"
    ));
  }

  if (!hasNonEmptyString(asset?.status)) {
    errors.push(createContractError(
      ASSET_CONTRACT_ERRORS.STATUS_REQUIRED,
      "Asset records require status.",
      "status"
    ));
  } else if (!isAssetStatus(asset.status)) {
    errors.push(createContractError(
      ASSET_CONTRACT_ERRORS.STATUS_INVALID,
      "Asset status must be an allowed asset status.",
      "status"
    ));
  }

  collectAssetMetadataErrors(
    asset?.assetType,
    asset?.metadata,
    errors,
    "metadata",
    ASSET_CONTRACT_ERRORS.METADATA_REQUIRED,
    ASSET_CONTRACT_ERRORS.METADATA_INVALID
  );

  if (!Array.isArray(asset?.exportFormats) || asset.exportFormats.length === 0) {
    errors.push(createContractError(
      ASSET_CONTRACT_ERRORS.EXPORT_FORMATS_REQUIRED,
      "Asset records require exportFormats.",
      "exportFormats"
    ));
  } else {
    asset.exportFormats.forEach((format, index) => {
      if (!isAssetExportFormat(format) || (isAssetType(asset?.assetType) && !isAssetExportFormatForType(asset.assetType, format))) {
        errors.push(createContractError(
          ASSET_CONTRACT_ERRORS.EXPORT_FORMAT_INVALID,
          "Asset exportFormats must use allowed export formats for the asset type.",
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

export function validateAssetMetadataForType(assetType, metadata) {
  const errors = [];

  if (!isAssetType(assetType)) {
    errors.push(createContractError(
      ASSET_CONTRACT_ERRORS.ASSET_TYPE_INVALID,
      "Asset metadata validation requires an allowed asset type.",
      "assetType"
    ));

    return Object.freeze({
      valid: false,
      errors: Object.freeze(errors),
    });
  }

  collectAssetMetadataErrors(
    assetType,
    metadata,
    errors,
    "metadata",
    ASSET_CONTRACT_ERRORS.METADATA_REQUIRED,
    ASSET_CONTRACT_ERRORS.METADATA_INVALID
  );

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

export function canEditAssetStatus(asset, policy = {}) {
  if (asset?.status === ASSET_STATUS.ARCHIVED) {
    return policy.allowArchivedAssetEdit === true;
  }

  return isAssetStatus(asset?.status);
}

export function isAssetVisibleToActor({
  actorId,
  asset,
  project,
  grantedProjectIds = [],
} = {}) {
  if (!hasNonEmptyString(actorId) || !asset) {
    return false;
  }

  if (actorId === asset.ownerId) {
    return true;
  }

  if (asset.visibility === ASSET_VISIBILITY_STATES.PUBLIC
    || asset.visibility === ASSET_VISIBILITY_STATES.UNLISTED
    || asset.visibility === ASSET_VISIBILITY_STATES.MARKETPLACE) {
    return true;
  }

  if (!project || asset.projectId !== project.id) {
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

export function canActorAccessAsset({
  actorId,
  projectRole,
  permission,
  asset,
  project,
  grantedProjectIds = [],
  grantedScopes = [],
  policy = {},
} = {}) {
  if (!isIdentityPermission(permission) || !isAssetVisibleToActor({ actorId, asset, project, grantedProjectIds })) {
    return false;
  }

  if (permission === IDENTITY_PERMISSIONS.EDIT && !canEditAssetStatus(asset, policy)) {
    return false;
  }

  if (actorId === asset?.ownerId) {
    return canActorPerformPermission({
      actorId,
      role: IDENTITY_ROLES.OWNER,
      permission,
      scope: IDENTITY_PERMISSION_SCOPES.OWNED_OBJECT,
      object: {
        ownerId: asset.ownerId,
        visibility: asset.visibility,
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

export function createPortableAssetExport(asset) {
  const validation = validateAssetContract(asset);

  if (!validation.valid) {
    return Object.freeze({
      valid: false,
      errors: validation.errors,
      export: null,
    });
  }

  const portableExport = Object.freeze({
    contractId: ASSET_CONTRACT_ID,
    contractVersion: ASSET_CONTRACT_VERSION,
    assetId: asset.assetId,
    assetType: asset.assetType,
    sourceToolState: createPortableSourceToolState(asset.sourceToolState),
    visibility: asset.visibility,
    version: asset.version,
    status: asset.status,
    metadata: Object.freeze(cloneJsonData(asset.metadata)),
    exportFormats: Object.freeze(normalizeStringArray(asset.exportFormats)),
    portable: true,
  });

  return Object.freeze({
    valid: true,
    errors: Object.freeze([]),
    export: portableExport,
  });
}

export function validatePortableAssetExport(portableExport) {
  const errors = [];

  if (!portableExport?.portable) {
    errors.push(createContractError(
      ASSET_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID,
      "Portable asset export must declare portable=true.",
      "portable"
    ));
  }

  if (hasNonEmptyString(portableExport?.ownerId) || hasNonEmptyString(portableExport?.projectId) || hasNonEmptyString(portableExport?.databaseId)) {
    errors.push(createContractError(
      ASSET_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID,
      "Portable asset export must not carry database owner, project, or database ids.",
      "portable"
    ));
  }

  if (!hasNonEmptyString(portableExport?.assetId)
    || !isAssetType(portableExport?.assetType)
    || !isAssetVisibility(portableExport?.visibility)
    || !isAssetVersion(portableExport?.version)
    || !isAssetStatus(portableExport?.status)
    || !Array.isArray(portableExport?.exportFormats)
    || portableExport.exportFormats.length === 0) {
    errors.push(createContractError(
      ASSET_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID,
      "Portable asset export must preserve valid portable identity, type, visibility, version, status, and export format fields.",
      "portable"
    ));
  }

  collectAssetMetadataErrors(
    portableExport?.assetType,
    portableExport?.metadata,
    errors,
    "metadata",
    ASSET_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID,
    ASSET_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID
  );

  if (Array.isArray(portableExport?.exportFormats)) {
    portableExport.exportFormats.forEach((format, index) => {
      if (!isAssetExportFormat(format) || (isAssetType(portableExport?.assetType) && !isAssetExportFormatForType(portableExport.assetType, format))) {
        errors.push(createContractError(
          ASSET_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID,
          "Portable asset export formats must remain approved for the asset type.",
          `exportFormats[${index}]`
        ));
      }
    });
  }

  if (portableExport?.sourceToolState && (hasNonEmptyString(portableExport.sourceToolState.ownerId) || hasNonEmptyString(portableExport.sourceToolState.projectId))) {
    errors.push(createContractError(
      ASSET_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID,
      "Portable source tool state references must not carry owner or project ids.",
      "sourceToolState"
    ));
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

function validateSourceToolState(asset, errors) {
  const sourceToolState = asset.sourceToolState;

  if (!sourceToolState || typeof sourceToolState !== "object") {
    errors.push(createContractError(
      ASSET_CONTRACT_ERRORS.SOURCE_TOOL_STATE_INVALID,
      "Asset sourceToolState must be an object when provided.",
      "sourceToolState"
    ));
    return;
  }

  if (!hasNonEmptyString(sourceToolState[TOOL_STATE_FIELDS.TOOL_STATE_ID]) || !hasNonEmptyString(sourceToolState[TOOL_STATE_FIELDS.TOOL_TYPE])) {
    errors.push(createContractError(
      ASSET_CONTRACT_ERRORS.SOURCE_TOOL_STATE_INVALID,
      "Asset sourceToolState must identify toolStateId and toolType.",
      "sourceToolState"
    ));
  }

  if (sourceToolState.version !== undefined && !isToolStateVersion(sourceToolState.version)) {
    errors.push(createContractError(
      ASSET_CONTRACT_ERRORS.SOURCE_TOOL_STATE_INVALID,
      "Asset sourceToolState version must be a positive integer when provided.",
      "sourceToolState.version"
    ));
  }

  if (hasNonEmptyString(sourceToolState.projectId) && sourceToolState.projectId !== asset.projectId) {
    errors.push(createContractError(
      ASSET_CONTRACT_ERRORS.SOURCE_TOOL_STATE_PROJECT_MISMATCH,
      "Asset sourceToolState projectId must match asset projectId.",
      "sourceToolState.projectId"
    ));
  }
}

function collectAssetMetadataErrors(assetType, metadata, errors, path, requiredCode, invalidCode) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    errors.push(createContractError(
      requiredCode,
      "Asset records require metadata as an object.",
      path
    ));
    return;
  }

  if (!isAssetType(assetType)) {
    return;
  }

  if (metadata.title !== undefined && !hasNonEmptyString(metadata.title)) {
    errors.push(createContractError(invalidCode, "Asset metadata title must be non-empty when provided.", `${path}.title`));
  }

  if (metadata.tags !== undefined && !isStringList(metadata.tags)) {
    errors.push(createContractError(invalidCode, "Asset metadata tags must be non-empty strings when provided.", `${path}.tags`));
  }

  if (assetType === ASSET_TYPES.VECTOR) {
    validateVectorMetadata(metadata, errors, path, invalidCode);
  } else if (assetType === ASSET_TYPES.PALETTE) {
    validatePaletteMetadata(metadata, errors, path, invalidCode);
  } else if (assetType === ASSET_TYPES.IMAGE) {
    validateImageMetadata(metadata, errors, path, invalidCode);
  } else if (assetType === ASSET_TYPES.AUDIO) {
    validateAudioMetadata(metadata, errors, path, invalidCode);
  } else if (assetType === ASSET_TYPES.TILEMAP) {
    validateTilemapMetadata(metadata, errors, path, invalidCode);
  } else if (assetType === ASSET_TYPES.LOCALIZATION) {
    validateLocalizationMetadata(metadata, errors, path, invalidCode);
  }
}

function validateVectorMetadata(metadata, errors, path, errorCode) {
  if (!VECTOR_METADATA_FORMATS.includes(metadata.vectorFormat)) {
    errors.push(createContractError(errorCode, "Vector asset metadata requires vectorFormat of vector-json or svg.", `${path}.vectorFormat`));
  }

  if (metadata.objectCount !== undefined && !isNonNegativeInteger(metadata.objectCount)) {
    errors.push(createContractError(errorCode, "Vector asset metadata objectCount must be a non-negative integer when provided.", `${path}.objectCount`));
  }
}

function validatePaletteMetadata(metadata, errors, path, errorCode) {
  if (!isNonNegativeInteger(metadata.swatchCount)) {
    errors.push(createContractError(errorCode, "Palette asset metadata requires swatchCount as a non-negative integer.", `${path}.swatchCount`));
  }
}

function validateImageMetadata(metadata, errors, path, errorCode) {
  if (!hasNonEmptyString(metadata.filePath)) {
    errors.push(createContractError(errorCode, "Image asset metadata requires filePath.", `${path}.filePath`));
  }

  if (!isPositiveInteger(metadata.width)) {
    errors.push(createContractError(errorCode, "Image asset metadata requires width as a positive integer.", `${path}.width`));
  }

  if (!isPositiveInteger(metadata.height)) {
    errors.push(createContractError(errorCode, "Image asset metadata requires height as a positive integer.", `${path}.height`));
  }
}

function validateAudioMetadata(metadata, errors, path, errorCode) {
  if (!hasNonEmptyString(metadata.filePath)) {
    errors.push(createContractError(errorCode, "Audio asset metadata requires filePath.", `${path}.filePath`));
  }

  if (!isPositiveNumber(metadata.durationMs)) {
    errors.push(createContractError(errorCode, "Audio asset metadata requires durationMs as a positive number.", `${path}.durationMs`));
  }
}

function validateTilemapMetadata(metadata, errors, path, errorCode) {
  if (!hasNonEmptyString(metadata.filePath)) {
    errors.push(createContractError(errorCode, "Tilemap asset metadata requires filePath.", `${path}.filePath`));
  }

  if (!isNonNegativeInteger(metadata.tileCount)) {
    errors.push(createContractError(errorCode, "Tilemap asset metadata requires tileCount as a non-negative integer.", `${path}.tileCount`));
  }
}

function validateLocalizationMetadata(metadata, errors, path, errorCode) {
  if (!hasNonEmptyString(metadata.filePath)) {
    errors.push(createContractError(errorCode, "Localization asset metadata requires filePath.", `${path}.filePath`));
  }

  if (!hasNonEmptyString(metadata.locale)) {
    errors.push(createContractError(errorCode, "Localization asset metadata requires locale.", `${path}.locale`));
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

function isStringList(value) {
  return Array.isArray(value) && value.every((item) => hasNonEmptyString(item));
}

function isPositiveInteger(value) {
  return Number.isInteger(value) && value >= 1;
}

function isNonNegativeInteger(value) {
  return Number.isInteger(value) && value >= 0;
}

function isPositiveNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function normalizeStringArray(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  return Array.from(new Set(values.filter((value) => hasNonEmptyString(value))));
}

function cloneJsonData(value) {
  return JSON.parse(JSON.stringify(value));
}

function createContractError(code, message, path) {
  return Object.freeze({ code, message, path });
}
