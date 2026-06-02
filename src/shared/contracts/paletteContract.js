/*
Toolbox Aid
David Quesenberry
06/02/2026
paletteContract.js
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

export const PALETTE_CONTRACT_ID = "gamefoundrystudio.palette.lifecycle";
export const PALETTE_CONTRACT_VERSION = "1.0.0";

export const PALETTE_FIELDS = Object.freeze({
  PALETTE_ID: "paletteId",
  OWNER: "ownerId",
  PROJECT: "projectId",
  SOURCE_TOOL_STATE: "sourceToolState",
  VISIBILITY: "visibility",
  VERSION: "version",
  STATUS: "status",
  SWATCHES: "swatches",
  EXPORT_FORMATS: "exportFormats",
});

export const PALETTE_SWATCH_FIELDS = Object.freeze({
  SYMBOL: "symbol",
  HEX: "hex",
  NAME: "name",
  SOURCE: "source",
  TAGS: "tags",
});

export const PALETTE_STATUS = Object.freeze({
  DRAFT: "draft",
  ACTIVE: "active",
  ARCHIVED: "archived",
});

export const PALETTE_STATUS_LIST = Object.freeze([
  PALETTE_STATUS.DRAFT,
  PALETTE_STATUS.ACTIVE,
  PALETTE_STATUS.ARCHIVED,
]);

export const PALETTE_VISIBILITY_STATES = Object.freeze({
  PRIVATE: PROJECT_VISIBILITY_STATES.PRIVATE,
  PROJECT: PROJECT_VISIBILITY_STATES.PROJECT,
  UNLISTED: PROJECT_VISIBILITY_STATES.UNLISTED,
  PUBLIC: PROJECT_VISIBILITY_STATES.PUBLIC,
  MARKETPLACE: IDENTITY_VISIBILITY_STATES.MARKETPLACE,
});

export const PALETTE_VISIBILITY_LIST = Object.freeze([
  PALETTE_VISIBILITY_STATES.PRIVATE,
  PALETTE_VISIBILITY_STATES.PROJECT,
  PALETTE_VISIBILITY_STATES.UNLISTED,
  PALETTE_VISIBILITY_STATES.PUBLIC,
  PALETTE_VISIBILITY_STATES.MARKETPLACE,
]);

export const PALETTE_EXPORT_FORMATS = Object.freeze({
  PALETTE_JSON: "palette-json",
  PROJECT_PACKAGE: "project-package",
});

export const PALETTE_EXPORT_FORMAT_LIST = Object.freeze([
  PALETTE_EXPORT_FORMATS.PALETTE_JSON,
  PALETTE_EXPORT_FORMATS.PROJECT_PACKAGE,
]);

export const PALETTE_PORTABLE_EXPORT_FIELDS = Object.freeze([
  PALETTE_FIELDS.PALETTE_ID,
  PALETTE_FIELDS.SOURCE_TOOL_STATE,
  PALETTE_FIELDS.VISIBILITY,
  PALETTE_FIELDS.VERSION,
  PALETTE_FIELDS.STATUS,
  PALETTE_FIELDS.SWATCHES,
  PALETTE_FIELDS.EXPORT_FORMATS,
]);

export const PALETTE_CONTRACT_ERRORS = Object.freeze({
  PALETTE_ID_REQUIRED: "PALETTE_ID_REQUIRED",
  OWNER_REQUIRED: "PALETTE_OWNER_REQUIRED",
  PROJECT_REQUIRED: "PALETTE_PROJECT_REQUIRED",
  SOURCE_TOOL_STATE_INVALID: "PALETTE_SOURCE_TOOL_STATE_INVALID",
  SOURCE_TOOL_STATE_PROJECT_MISMATCH: "PALETTE_SOURCE_TOOL_STATE_PROJECT_MISMATCH",
  VISIBILITY_REQUIRED: "PALETTE_VISIBILITY_REQUIRED",
  VISIBILITY_INVALID: "PALETTE_VISIBILITY_INVALID",
  VERSION_REQUIRED: "PALETTE_VERSION_REQUIRED",
  VERSION_INVALID: "PALETTE_VERSION_INVALID",
  STATUS_REQUIRED: "PALETTE_STATUS_REQUIRED",
  STATUS_INVALID: "PALETTE_STATUS_INVALID",
  SWATCHES_REQUIRED: "PALETTE_SWATCHES_REQUIRED",
  SWATCH_INVALID: "PALETTE_SWATCH_INVALID",
  EXPORT_FORMATS_REQUIRED: "PALETTE_EXPORT_FORMATS_REQUIRED",
  EXPORT_FORMAT_INVALID: "PALETTE_EXPORT_FORMAT_INVALID",
  PORTABLE_EXPORT_INVALID: "PALETTE_PORTABLE_EXPORT_INVALID",
});

const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}([0-9a-f]{2})?$/i;

export function isPaletteStatus(value) {
  return PALETTE_STATUS_LIST.includes(value);
}

export function isPaletteVisibility(value) {
  return PALETTE_VISIBILITY_LIST.includes(value);
}

export function isPaletteVersion(value) {
  return Number.isInteger(value) && value >= 1;
}

export function isPaletteExportFormat(value) {
  return PALETTE_EXPORT_FORMAT_LIST.includes(value);
}

export function isPaletteSwatch(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  if (!isHexColor(value.hex) || !hasNonEmptyString(value.name)) {
    return false;
  }

  if (value.symbol !== undefined && !hasNonEmptyString(value.symbol)) {
    return false;
  }

  if (value.source !== undefined && !hasNonEmptyString(value.source)) {
    return false;
  }

  if (value.tags !== undefined && !isStringList(value.tags)) {
    return false;
  }

  return true;
}

export function validatePaletteContract(palette) {
  const errors = [];

  if (!hasNonEmptyString(palette?.paletteId)) {
    errors.push(createContractError(
      PALETTE_CONTRACT_ERRORS.PALETTE_ID_REQUIRED,
      "Palette records require paletteId.",
      "paletteId"
    ));
  }

  if (!hasNonEmptyString(palette?.ownerId)) {
    errors.push(createContractError(
      PALETTE_CONTRACT_ERRORS.OWNER_REQUIRED,
      "Palette records require ownerId.",
      "ownerId"
    ));
  }

  if (!hasNonEmptyString(palette?.projectId)) {
    errors.push(createContractError(
      PALETTE_CONTRACT_ERRORS.PROJECT_REQUIRED,
      "Palette records require projectId.",
      "projectId"
    ));
  }

  if (palette?.sourceToolState !== undefined) {
    validateSourceToolState(palette, errors);
  }

  if (!hasNonEmptyString(palette?.visibility)) {
    errors.push(createContractError(
      PALETTE_CONTRACT_ERRORS.VISIBILITY_REQUIRED,
      "Palette records require explicit visibility.",
      "visibility"
    ));
  } else if (!isPaletteVisibility(palette.visibility)) {
    errors.push(createContractError(
      PALETTE_CONTRACT_ERRORS.VISIBILITY_INVALID,
      "Palette visibility must be an allowed palette visibility state.",
      "visibility"
    ));
  }

  if (palette?.version === undefined || palette?.version === null) {
    errors.push(createContractError(
      PALETTE_CONTRACT_ERRORS.VERSION_REQUIRED,
      "Palette records require version.",
      "version"
    ));
  } else if (!isPaletteVersion(palette.version)) {
    errors.push(createContractError(
      PALETTE_CONTRACT_ERRORS.VERSION_INVALID,
      "Palette version must be a positive integer.",
      "version"
    ));
  }

  if (!hasNonEmptyString(palette?.status)) {
    errors.push(createContractError(
      PALETTE_CONTRACT_ERRORS.STATUS_REQUIRED,
      "Palette records require status.",
      "status"
    ));
  } else if (!isPaletteStatus(palette.status)) {
    errors.push(createContractError(
      PALETTE_CONTRACT_ERRORS.STATUS_INVALID,
      "Palette status must be an allowed palette status.",
      "status"
    ));
  }

  validateSwatches(palette, errors);

  if (!Array.isArray(palette?.exportFormats) || palette.exportFormats.length === 0) {
    errors.push(createContractError(
      PALETTE_CONTRACT_ERRORS.EXPORT_FORMATS_REQUIRED,
      "Palette records require exportFormats.",
      "exportFormats"
    ));
  } else {
    palette.exportFormats.forEach((format, index) => {
      if (!isPaletteExportFormat(format)) {
        errors.push(createContractError(
          PALETTE_CONTRACT_ERRORS.EXPORT_FORMAT_INVALID,
          "Palette exportFormats must use allowed export formats.",
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

export function canEditPaletteStatus(palette, policy = {}) {
  if (palette?.status === PALETTE_STATUS.ARCHIVED) {
    return policy.allowArchivedPaletteEdit === true;
  }

  return isPaletteStatus(palette?.status);
}

export function isPaletteVisibleToActor({
  actorId,
  palette,
  project,
  grantedProjectIds = [],
} = {}) {
  if (!hasNonEmptyString(actorId) || !palette) {
    return false;
  }

  if (actorId === palette.ownerId) {
    return true;
  }

  if (palette.visibility === PALETTE_VISIBILITY_STATES.PUBLIC
    || palette.visibility === PALETTE_VISIBILITY_STATES.UNLISTED
    || palette.visibility === PALETTE_VISIBILITY_STATES.MARKETPLACE) {
    return true;
  }

  if (!project || palette.projectId !== project.id) {
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

export function canActorAccessPalette({
  actorId,
  projectRole,
  permission,
  palette,
  project,
  grantedProjectIds = [],
  grantedScopes = [],
  policy = {},
} = {}) {
  if (!isIdentityPermission(permission) || !isPaletteVisibleToActor({ actorId, palette, project, grantedProjectIds })) {
    return false;
  }

  if (permission === IDENTITY_PERMISSIONS.EDIT && !canEditPaletteStatus(palette, policy)) {
    return false;
  }

  if (actorId === palette?.ownerId) {
    return canActorPerformPermission({
      actorId,
      role: IDENTITY_ROLES.OWNER,
      permission,
      scope: IDENTITY_PERMISSION_SCOPES.OWNED_OBJECT,
      object: {
        ownerId: palette.ownerId,
        visibility: palette.visibility,
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

export function createPortablePaletteExport(palette) {
  const validation = validatePaletteContract(palette);

  if (!validation.valid) {
    return Object.freeze({
      valid: false,
      errors: validation.errors,
      export: null,
    });
  }

  const portableExport = Object.freeze({
    contractId: PALETTE_CONTRACT_ID,
    contractVersion: PALETTE_CONTRACT_VERSION,
    paletteId: palette.paletteId,
    sourceToolState: createPortableSourceToolState(palette.sourceToolState),
    visibility: palette.visibility,
    version: palette.version,
    status: palette.status,
    swatches: Object.freeze(cloneJsonData(palette.swatches)),
    exportFormats: Object.freeze(normalizeStringArray(palette.exportFormats)),
    portable: true,
  });

  return Object.freeze({
    valid: true,
    errors: Object.freeze([]),
    export: portableExport,
  });
}

export function validatePortablePaletteExport(portableExport) {
  const errors = [];

  if (!portableExport?.portable) {
    errors.push(createContractError(
      PALETTE_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID,
      "Portable palette export must declare portable=true.",
      "portable"
    ));
  }

  if (hasNonEmptyString(portableExport?.ownerId) || hasNonEmptyString(portableExport?.projectId) || hasNonEmptyString(portableExport?.databaseId)) {
    errors.push(createContractError(
      PALETTE_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID,
      "Portable palette export must not carry database owner, project, or database ids.",
      "portable"
    ));
  }

  if (!hasNonEmptyString(portableExport?.paletteId)
    || !isPaletteVisibility(portableExport?.visibility)
    || !isPaletteVersion(portableExport?.version)
    || !isPaletteStatus(portableExport?.status)
    || !Array.isArray(portableExport?.swatches)
    || !Array.isArray(portableExport?.exportFormats)
    || portableExport.exportFormats.length === 0) {
    errors.push(createContractError(
      PALETTE_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID,
      "Portable palette export must preserve valid portable identity, visibility, version, status, swatches, and export format fields.",
      "portable"
    ));
  }

  if (Array.isArray(portableExport?.swatches)) {
    portableExport.swatches.forEach((swatch, index) => {
      if (!isPaletteSwatch(swatch)) {
        errors.push(createContractError(
          PALETTE_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID,
          "Portable palette export swatches must remain valid swatches.",
          `swatches[${index}]`
        ));
      }
    });
  }

  if (Array.isArray(portableExport?.exportFormats)) {
    portableExport.exportFormats.forEach((format, index) => {
      if (!isPaletteExportFormat(format)) {
        errors.push(createContractError(
          PALETTE_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID,
          "Portable palette export formats must remain approved palette export formats.",
          `exportFormats[${index}]`
        ));
      }
    });
  }

  if (portableExport?.sourceToolState && (hasNonEmptyString(portableExport.sourceToolState.ownerId) || hasNonEmptyString(portableExport.sourceToolState.projectId))) {
    errors.push(createContractError(
      PALETTE_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID,
      "Portable source tool state references must not carry owner or project ids.",
      "sourceToolState"
    ));
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

function validateSourceToolState(palette, errors) {
  const sourceToolState = palette.sourceToolState;

  if (!sourceToolState || typeof sourceToolState !== "object") {
    errors.push(createContractError(
      PALETTE_CONTRACT_ERRORS.SOURCE_TOOL_STATE_INVALID,
      "Palette sourceToolState must be an object when provided.",
      "sourceToolState"
    ));
    return;
  }

  if (!hasNonEmptyString(sourceToolState[TOOL_STATE_FIELDS.TOOL_STATE_ID]) || !hasNonEmptyString(sourceToolState[TOOL_STATE_FIELDS.TOOL_TYPE])) {
    errors.push(createContractError(
      PALETTE_CONTRACT_ERRORS.SOURCE_TOOL_STATE_INVALID,
      "Palette sourceToolState must identify toolStateId and toolType.",
      "sourceToolState"
    ));
  }

  if (sourceToolState.version !== undefined && !isToolStateVersion(sourceToolState.version)) {
    errors.push(createContractError(
      PALETTE_CONTRACT_ERRORS.SOURCE_TOOL_STATE_INVALID,
      "Palette sourceToolState version must be a positive integer when provided.",
      "sourceToolState.version"
    ));
  }

  if (hasNonEmptyString(sourceToolState.projectId) && sourceToolState.projectId !== palette.projectId) {
    errors.push(createContractError(
      PALETTE_CONTRACT_ERRORS.SOURCE_TOOL_STATE_PROJECT_MISMATCH,
      "Palette sourceToolState projectId must match palette projectId.",
      "sourceToolState.projectId"
    ));
  }
}

function validateSwatches(palette, errors) {
  if (!Array.isArray(palette?.swatches)) {
    errors.push(createContractError(
      PALETTE_CONTRACT_ERRORS.SWATCHES_REQUIRED,
      "Palette records require swatches as an array.",
      "swatches"
    ));
    return;
  }

  palette.swatches.forEach((swatch, index) => {
    if (!isPaletteSwatch(swatch)) {
      errors.push(createContractError(
        PALETTE_CONTRACT_ERRORS.SWATCH_INVALID,
        "Palette swatches must include valid hex and name fields.",
        `swatches[${index}]`
      ));
    }
  });
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

function isHexColor(value) {
  return hasNonEmptyString(value) && HEX_COLOR_PATTERN.test(value);
}

function isStringList(value) {
  return Array.isArray(value) && value.every((item) => hasNonEmptyString(item));
}

function normalizeStringArray(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  return Array.from(new Set(values.filter((value) => hasNonEmptyString(value))));
}

function cloneJsonData(value) {
  return Object.freeze(JSON.parse(JSON.stringify(value)));
}

function createContractError(code, message, path) {
  return Object.freeze({ code, message, path });
}
