/*
Toolbox Aid
David Quesenberry
06/02/2026
toolStateContract.js
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
  PROJECT_VISIBILITY_STATES,
  canActorAccessProject,
  isProjectVisibility,
} from "./projectContract.js";

export const TOOL_STATE_CONTRACT_ID = "gamefoundrystudio.tool-state.lifecycle";
export const TOOL_STATE_CONTRACT_VERSION = "1.0.0";

export const TOOL_STATE_FIELDS = Object.freeze({
  TOOL_STATE_ID: "toolStateId",
  TOOL_TYPE: "toolType",
  OWNER: "ownerId",
  PROJECT: "projectId",
  VISIBILITY: "visibility",
  VERSION: "version",
  STATUS: "status",
});

export const TOOL_STATE_STATUS = Object.freeze({
  DRAFT: "draft",
  ACTIVE: "active",
  ARCHIVED: "archived",
});

export const TOOL_STATE_STATUS_LIST = Object.freeze([
  TOOL_STATE_STATUS.DRAFT,
  TOOL_STATE_STATUS.ACTIVE,
  TOOL_STATE_STATUS.ARCHIVED,
]);

export const TOOL_STATE_VISIBILITY_STATES = Object.freeze({
  PRIVATE: PROJECT_VISIBILITY_STATES.PRIVATE,
  PROJECT: PROJECT_VISIBILITY_STATES.PROJECT,
  UNLISTED: PROJECT_VISIBILITY_STATES.UNLISTED,
  PUBLIC: PROJECT_VISIBILITY_STATES.PUBLIC,
});

export const TOOL_STATE_VISIBILITY_LIST = Object.freeze([
  TOOL_STATE_VISIBILITY_STATES.PRIVATE,
  TOOL_STATE_VISIBILITY_STATES.PROJECT,
  TOOL_STATE_VISIBILITY_STATES.UNLISTED,
  TOOL_STATE_VISIBILITY_STATES.PUBLIC,
]);

export const TOOL_STATE_RELATIONSHIPS = Object.freeze({
  BELONGS_TO_PROJECT: "belongs-to-project",
  OWNED_BY_USER: "owned-by-user",
  MAY_REFERENCE_ASSETS: "may-reference-assets",
  MAY_BE_EXPORTED: "may-be-exported",
});

export const TOOL_STATE_RELATIONSHIP_LIST = Object.freeze([
  TOOL_STATE_RELATIONSHIPS.BELONGS_TO_PROJECT,
  TOOL_STATE_RELATIONSHIPS.OWNED_BY_USER,
  TOOL_STATE_RELATIONSHIPS.MAY_REFERENCE_ASSETS,
  TOOL_STATE_RELATIONSHIPS.MAY_BE_EXPORTED,
]);

export const TOOL_STATE_PORTABLE_EXPORT_FIELDS = Object.freeze([
  TOOL_STATE_FIELDS.TOOL_STATE_ID,
  TOOL_STATE_FIELDS.TOOL_TYPE,
  TOOL_STATE_FIELDS.VISIBILITY,
  TOOL_STATE_FIELDS.VERSION,
  TOOL_STATE_FIELDS.STATUS,
  "assetRefs",
  "payload",
]);

export const TOOL_STATE_CONTRACT_ERRORS = Object.freeze({
  TOOL_STATE_ID_REQUIRED: "TOOL_STATE_ID_REQUIRED",
  TOOL_TYPE_REQUIRED: "TOOL_TYPE_REQUIRED",
  OWNER_REQUIRED: "TOOL_STATE_OWNER_REQUIRED",
  PROJECT_REQUIRED: "TOOL_STATE_PROJECT_REQUIRED",
  VISIBILITY_REQUIRED: "TOOL_STATE_VISIBILITY_REQUIRED",
  VISIBILITY_INVALID: "TOOL_STATE_VISIBILITY_INVALID",
  VERSION_REQUIRED: "TOOL_STATE_VERSION_REQUIRED",
  VERSION_INVALID: "TOOL_STATE_VERSION_INVALID",
  STATUS_REQUIRED: "TOOL_STATE_STATUS_REQUIRED",
  STATUS_INVALID: "TOOL_STATE_STATUS_INVALID",
  RELATIONSHIP_INVALID: "TOOL_STATE_RELATIONSHIP_INVALID",
  ASSET_REF_INVALID: "TOOL_STATE_ASSET_REF_INVALID",
  PORTABLE_EXPORT_INVALID: "TOOL_STATE_PORTABLE_EXPORT_INVALID",
});

export function isToolStateStatus(value) {
  return TOOL_STATE_STATUS_LIST.includes(value);
}

export function isToolStateVisibility(value) {
  return TOOL_STATE_VISIBILITY_LIST.includes(value) && isProjectVisibility(value);
}

export function isToolStateRelationship(value) {
  return TOOL_STATE_RELATIONSHIP_LIST.includes(value);
}

export function isToolStateVersion(value) {
  return Number.isInteger(value) && value >= 1;
}

export function validateToolStateContract(toolState) {
  const errors = [];

  if (!hasNonEmptyString(toolState?.toolStateId)) {
    errors.push(createContractError(
      TOOL_STATE_CONTRACT_ERRORS.TOOL_STATE_ID_REQUIRED,
      "Tool state records require toolStateId.",
      "toolStateId"
    ));
  }

  if (!hasNonEmptyString(toolState?.toolType)) {
    errors.push(createContractError(
      TOOL_STATE_CONTRACT_ERRORS.TOOL_TYPE_REQUIRED,
      "Tool state records require toolType.",
      "toolType"
    ));
  }

  if (!hasNonEmptyString(toolState?.ownerId)) {
    errors.push(createContractError(
      TOOL_STATE_CONTRACT_ERRORS.OWNER_REQUIRED,
      "Tool state records require ownerId.",
      "ownerId"
    ));
  }

  if (!hasNonEmptyString(toolState?.projectId)) {
    errors.push(createContractError(
      TOOL_STATE_CONTRACT_ERRORS.PROJECT_REQUIRED,
      "Tool state records require projectId.",
      "projectId"
    ));
  }

  if (!hasNonEmptyString(toolState?.visibility)) {
    errors.push(createContractError(
      TOOL_STATE_CONTRACT_ERRORS.VISIBILITY_REQUIRED,
      "Tool state records require explicit visibility.",
      "visibility"
    ));
  } else if (!isToolStateVisibility(toolState.visibility)) {
    errors.push(createContractError(
      TOOL_STATE_CONTRACT_ERRORS.VISIBILITY_INVALID,
      "Tool state visibility must be an allowed project visibility state.",
      "visibility"
    ));
  }

  if (toolState?.version === undefined || toolState?.version === null) {
    errors.push(createContractError(
      TOOL_STATE_CONTRACT_ERRORS.VERSION_REQUIRED,
      "Tool state records require version.",
      "version"
    ));
  } else if (!isToolStateVersion(toolState.version)) {
    errors.push(createContractError(
      TOOL_STATE_CONTRACT_ERRORS.VERSION_INVALID,
      "Tool state version must be a positive integer.",
      "version"
    ));
  }

  if (!hasNonEmptyString(toolState?.status)) {
    errors.push(createContractError(
      TOOL_STATE_CONTRACT_ERRORS.STATUS_REQUIRED,
      "Tool state records require status.",
      "status"
    ));
  } else if (!isToolStateStatus(toolState.status)) {
    errors.push(createContractError(
      TOOL_STATE_CONTRACT_ERRORS.STATUS_INVALID,
      "Tool state status must be an allowed tool state status.",
      "status"
    ));
  }

  if (Array.isArray(toolState?.relationships)) {
    toolState.relationships.forEach((relationship, index) => {
      if (!isToolStateRelationship(relationship)) {
        errors.push(createContractError(
          TOOL_STATE_CONTRACT_ERRORS.RELATIONSHIP_INVALID,
          "Tool state relationship must be an allowed relationship.",
          `relationships[${index}]`
        ));
      }
    });
  }

  if (Array.isArray(toolState?.assetRefs)) {
    toolState.assetRefs.forEach((assetRef, index) => {
      if (!hasNonEmptyString(assetRef)) {
        errors.push(createContractError(
          TOOL_STATE_CONTRACT_ERRORS.ASSET_REF_INVALID,
          "Tool state asset references must be non-empty strings.",
          `assetRefs[${index}]`
        ));
      }
    });
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

export function canEditToolStateStatus(toolState, policy = {}) {
  if (toolState?.status === TOOL_STATE_STATUS.ARCHIVED) {
    return policy.allowArchivedToolStateEdit === true;
  }

  return isToolStateStatus(toolState?.status);
}

export function isToolStateVisibleToActor({
  actorId,
  toolState,
  project,
  grantedProjectIds = [],
} = {}) {
  if (!hasNonEmptyString(actorId) || !toolState) {
    return false;
  }

  if (actorId === toolState.ownerId) {
    return true;
  }

  if (toolState.visibility === TOOL_STATE_VISIBILITY_STATES.PUBLIC || toolState.visibility === TOOL_STATE_VISIBILITY_STATES.UNLISTED) {
    return true;
  }

  if (!project || toolState.projectId !== project.id) {
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

export function canActorAccessToolState({
  actorId,
  projectRole,
  permission,
  toolState,
  project,
  grantedProjectIds = [],
  grantedScopes = [],
  policy = {},
} = {}) {
  if (!isIdentityPermission(permission) || !isToolStateVisibleToActor({ actorId, toolState, project, grantedProjectIds })) {
    return false;
  }

  if (permission === IDENTITY_PERMISSIONS.EDIT && !canEditToolStateStatus(toolState, policy)) {
    return false;
  }

  if (actorId === toolState?.ownerId) {
    return canActorPerformPermission({
      actorId,
      role: IDENTITY_ROLES.OWNER,
      permission,
      scope: IDENTITY_PERMISSION_SCOPES.OWNED_OBJECT,
      object: {
        ownerId: toolState.ownerId,
        visibility: toolState.visibility,
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

export function createPortableToolStateExport(toolState) {
  const validation = validateToolStateContract(toolState);

  if (!validation.valid) {
    return Object.freeze({
      valid: false,
      errors: validation.errors,
      export: null,
    });
  }

  const portableExport = Object.freeze({
    contractId: TOOL_STATE_CONTRACT_ID,
    contractVersion: TOOL_STATE_CONTRACT_VERSION,
    toolStateId: toolState.toolStateId,
    toolType: toolState.toolType,
    visibility: toolState.visibility,
    version: toolState.version,
    status: toolState.status,
    assetRefs: Object.freeze(normalizeStringArray(toolState.assetRefs)),
    payload: clonePortablePayload(toolState.payload ?? {}),
    portable: true,
  });

  return Object.freeze({
    valid: true,
    errors: Object.freeze([]),
    export: portableExport,
  });
}

export function validatePortableToolStateExport(portableExport) {
  const errors = [];

  if (!portableExport?.portable) {
    errors.push(createContractError(
      TOOL_STATE_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID,
      "Portable tool state export must declare portable=true.",
      "portable"
    ));
  }

  if (hasNonEmptyString(portableExport?.ownerId) || hasNonEmptyString(portableExport?.projectId) || hasNonEmptyString(portableExport?.databaseId)) {
    errors.push(createContractError(
      TOOL_STATE_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID,
      "Portable tool state export must not carry database owner, project, or database ids.",
      "portable"
    ));
  }

  if (!hasNonEmptyString(portableExport?.toolStateId)
    || !hasNonEmptyString(portableExport?.toolType)
    || !isToolStateVisibility(portableExport?.visibility)
    || !isToolStateVersion(portableExport?.version)
    || !isToolStateStatus(portableExport?.status)) {
    errors.push(createContractError(
      TOOL_STATE_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID,
      "Portable tool state export must preserve valid portable identity, type, visibility, version, and status fields.",
      "portable"
    ));
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
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
