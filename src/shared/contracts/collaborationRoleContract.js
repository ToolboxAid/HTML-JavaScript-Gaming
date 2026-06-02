/*
Toolbox Aid
David Quesenberry
06/02/2026
collaborationRoleContract.js
*/
import {
  IDENTITY_PERMISSION_SCOPES,
  IDENTITY_PERMISSIONS,
  IDENTITY_ROLES,
  IDENTITY_VISIBILITY_STATES,
  canActorPerformPermission,
  isIdentityPermission,
} from "./identityPermissionsContract.js";

export const COLLABORATION_ROLE_CONTRACT_ID = "gamefoundrystudio.collaboration.role.contract";
export const COLLABORATION_ROLE_CONTRACT_VERSION = "1.0.0";

export const COLLABORATION_ROLE_FIELDS = Object.freeze({
  COLLABORATION_ROLE_ID: "collaborationRoleId",
  OWNER: "ownerId",
  PROJECT: "projectId",
  SUBJECT_TYPE: "subjectType",
  SUBJECT_ID: "subjectId",
  ROLE: "role",
  PERMISSIONS: "permissions",
  VISIBILITY: "visibility",
  GRANTED_AT: "grantedAt",
  EXPIRES_AT: "expiresAt",
  ROLE_NOTES: "roleNotes",
});

export const COLLABORATION_ROLE_FIELD_LIST = Object.freeze([
  COLLABORATION_ROLE_FIELDS.COLLABORATION_ROLE_ID,
  COLLABORATION_ROLE_FIELDS.OWNER,
  COLLABORATION_ROLE_FIELDS.PROJECT,
  COLLABORATION_ROLE_FIELDS.SUBJECT_TYPE,
  COLLABORATION_ROLE_FIELDS.SUBJECT_ID,
  COLLABORATION_ROLE_FIELDS.ROLE,
  COLLABORATION_ROLE_FIELDS.PERMISSIONS,
  COLLABORATION_ROLE_FIELDS.VISIBILITY,
  COLLABORATION_ROLE_FIELDS.GRANTED_AT,
  COLLABORATION_ROLE_FIELDS.EXPIRES_AT,
  COLLABORATION_ROLE_FIELDS.ROLE_NOTES,
]);

export const COLLABORATION_ROLE_SUBJECT_TYPES = Object.freeze({
  USER: "user",
  CREATOR_PROFILE: "creatorProfile",
  ORGANIZATION: "organization",
});

export const COLLABORATION_ROLE_SUBJECT_TYPE_LIST = Object.freeze([
  COLLABORATION_ROLE_SUBJECT_TYPES.USER,
  COLLABORATION_ROLE_SUBJECT_TYPES.CREATOR_PROFILE,
  COLLABORATION_ROLE_SUBJECT_TYPES.ORGANIZATION,
]);

export const COLLABORATION_ROLES = Object.freeze({
  OWNER: "owner",
  ADMIN: "admin",
  COLLABORATOR: "collaborator",
  VIEWER: "viewer",
});

export const COLLABORATION_ROLE_LIST = Object.freeze([
  COLLABORATION_ROLES.OWNER,
  COLLABORATION_ROLES.ADMIN,
  COLLABORATION_ROLES.COLLABORATOR,
  COLLABORATION_ROLES.VIEWER,
]);

export const COLLABORATION_ROLE_VISIBILITY_LIST = Object.freeze([
  IDENTITY_VISIBILITY_STATES.PRIVATE,
  IDENTITY_VISIBILITY_STATES.SHARED,
  IDENTITY_VISIBILITY_STATES.PROJECT,
  IDENTITY_VISIBILITY_STATES.TEAM,
]);

export const COLLABORATION_ROLE_RULES = Object.freeze({
  REQUIRES_OWNER: true,
  REQUIRES_PROJECT: true,
  REQUIRES_SUBJECT: true,
  REQUIRES_VALID_ROLE: true,
  REQUIRES_VALID_PERMISSIONS: true,
  REQUIRES_VISIBILITY: true,
  REQUIRES_GRANTED_AT: true,
  NO_AUTH_SESSION_STATE: true,
  NO_RUNTIME_STATE: true,
  NO_TOOL_STATE: true,
  NO_PAYMENT_STATE: true,
});

export const COLLABORATION_ROLE_FORBIDDEN_FIELDS = Object.freeze([
  "activeProjectId",
  "activeToolId",
  "activeToolStateId",
  "authProvider",
  "authSession",
  "authSessionState",
  "authState",
  "checkoutSession",
  "credentials",
  "dirty",
  "paymentIntent",
  "paymentProvider",
  "paymentState",
  "payload",
  "payloadJson",
  "session",
  "sessionStorage",
  "sourceToolStates",
  "toolState",
  "toolStateId",
  "toolStates",
  "workspace",
  "workspaceState",
]);

export const COLLABORATION_ROLE_CONTRACT_ERRORS = Object.freeze({
  COLLABORATION_ROLE_ID_REQUIRED: "COLLABORATION_ROLE_ID_REQUIRED",
  OWNER_REQUIRED: "COLLABORATION_ROLE_OWNER_REQUIRED",
  PROJECT_REQUIRED: "COLLABORATION_ROLE_PROJECT_REQUIRED",
  SUBJECT_TYPE_REQUIRED: "COLLABORATION_ROLE_SUBJECT_TYPE_REQUIRED",
  SUBJECT_TYPE_INVALID: "COLLABORATION_ROLE_SUBJECT_TYPE_INVALID",
  SUBJECT_ID_REQUIRED: "COLLABORATION_ROLE_SUBJECT_ID_REQUIRED",
  ROLE_REQUIRED: "COLLABORATION_ROLE_REQUIRED",
  ROLE_INVALID: "COLLABORATION_ROLE_INVALID",
  PERMISSIONS_REQUIRED: "COLLABORATION_ROLE_PERMISSIONS_REQUIRED",
  PERMISSIONS_INVALID: "COLLABORATION_ROLE_PERMISSIONS_INVALID",
  VISIBILITY_REQUIRED: "COLLABORATION_ROLE_VISIBILITY_REQUIRED",
  VISIBILITY_INVALID: "COLLABORATION_ROLE_VISIBILITY_INVALID",
  GRANTED_AT_REQUIRED: "COLLABORATION_ROLE_GRANTED_AT_REQUIRED",
  GRANTED_AT_INVALID: "COLLABORATION_ROLE_GRANTED_AT_INVALID",
  EXPIRES_AT_INVALID: "COLLABORATION_ROLE_EXPIRES_AT_INVALID",
  ROLE_NOTES_INVALID: "COLLABORATION_ROLE_NOTES_INVALID",
  FIELD_NOT_ALLOWED: "COLLABORATION_ROLE_FIELD_NOT_ALLOWED",
});

export function isCollaborationRoleSubjectType(value) {
  return COLLABORATION_ROLE_SUBJECT_TYPE_LIST.includes(value);
}

export function isCollaborationRole(value) {
  return COLLABORATION_ROLE_LIST.includes(value);
}

export function isCollaborationRoleVisibility(value) {
  return COLLABORATION_ROLE_VISIBILITY_LIST.includes(value);
}

export function validateCollaborationRoleContract(collaborationRole) {
  const errors = [];

  collectForbiddenFieldErrors(collaborationRole, errors);

  if (!hasNonEmptyString(collaborationRole?.collaborationRoleId)) {
    errors.push(createContractError(COLLABORATION_ROLE_CONTRACT_ERRORS.COLLABORATION_ROLE_ID_REQUIRED, "Collaboration Role records require collaborationRoleId.", COLLABORATION_ROLE_FIELDS.COLLABORATION_ROLE_ID));
  }

  if (!hasNonEmptyString(collaborationRole?.ownerId)) {
    errors.push(createContractError(COLLABORATION_ROLE_CONTRACT_ERRORS.OWNER_REQUIRED, "Collaboration Role records require ownerId.", COLLABORATION_ROLE_FIELDS.OWNER));
  }

  if (!hasNonEmptyString(collaborationRole?.projectId)) {
    errors.push(createContractError(COLLABORATION_ROLE_CONTRACT_ERRORS.PROJECT_REQUIRED, "Collaboration Role records require projectId.", COLLABORATION_ROLE_FIELDS.PROJECT));
  }

  if (!hasNonEmptyString(collaborationRole?.subjectType)) {
    errors.push(createContractError(COLLABORATION_ROLE_CONTRACT_ERRORS.SUBJECT_TYPE_REQUIRED, "Collaboration Role records require subjectType.", COLLABORATION_ROLE_FIELDS.SUBJECT_TYPE));
  } else if (!isCollaborationRoleSubjectType(collaborationRole.subjectType)) {
    errors.push(createContractError(COLLABORATION_ROLE_CONTRACT_ERRORS.SUBJECT_TYPE_INVALID, "Collaboration Role subjectType must be user, creatorProfile, or organization.", COLLABORATION_ROLE_FIELDS.SUBJECT_TYPE));
  }

  if (!hasNonEmptyString(collaborationRole?.subjectId)) {
    errors.push(createContractError(COLLABORATION_ROLE_CONTRACT_ERRORS.SUBJECT_ID_REQUIRED, "Collaboration Role records require subjectId.", COLLABORATION_ROLE_FIELDS.SUBJECT_ID));
  }

  if (!hasNonEmptyString(collaborationRole?.role)) {
    errors.push(createContractError(COLLABORATION_ROLE_CONTRACT_ERRORS.ROLE_REQUIRED, "Collaboration Role records require role.", COLLABORATION_ROLE_FIELDS.ROLE));
  } else if (!isCollaborationRole(collaborationRole.role)) {
    errors.push(createContractError(COLLABORATION_ROLE_CONTRACT_ERRORS.ROLE_INVALID, "Collaboration Role role must be owner, admin, collaborator, or viewer.", COLLABORATION_ROLE_FIELDS.ROLE));
  }

  if (!Array.isArray(collaborationRole?.permissions) || collaborationRole.permissions.length === 0) {
    errors.push(createContractError(COLLABORATION_ROLE_CONTRACT_ERRORS.PERMISSIONS_REQUIRED, "Collaboration Role records require at least one permission.", COLLABORATION_ROLE_FIELDS.PERMISSIONS));
  } else if (!collaborationRole.permissions.every(isIdentityPermission)) {
    errors.push(createContractError(COLLABORATION_ROLE_CONTRACT_ERRORS.PERMISSIONS_INVALID, "Collaboration Role permissions must use allowed identity permissions.", COLLABORATION_ROLE_FIELDS.PERMISSIONS));
  }

  if (!hasNonEmptyString(collaborationRole?.visibility)) {
    errors.push(createContractError(COLLABORATION_ROLE_CONTRACT_ERRORS.VISIBILITY_REQUIRED, "Collaboration Role records require visibility.", COLLABORATION_ROLE_FIELDS.VISIBILITY));
  } else if (!isCollaborationRoleVisibility(collaborationRole.visibility)) {
    errors.push(createContractError(COLLABORATION_ROLE_CONTRACT_ERRORS.VISIBILITY_INVALID, "Collaboration Role visibility must be private, shared, project, or team.", COLLABORATION_ROLE_FIELDS.VISIBILITY));
  }

  if (!hasNonEmptyString(collaborationRole?.grantedAt)) {
    errors.push(createContractError(COLLABORATION_ROLE_CONTRACT_ERRORS.GRANTED_AT_REQUIRED, "Collaboration Role records require grantedAt.", COLLABORATION_ROLE_FIELDS.GRANTED_AT));
  } else if (!isTimestamp(collaborationRole.grantedAt)) {
    errors.push(createContractError(COLLABORATION_ROLE_CONTRACT_ERRORS.GRANTED_AT_INVALID, "Collaboration Role grantedAt must be a valid timestamp.", COLLABORATION_ROLE_FIELDS.GRANTED_AT));
  }

  if (collaborationRole?.expiresAt !== undefined && collaborationRole.expiresAt !== null && !isTimestamp(collaborationRole.expiresAt)) {
    errors.push(createContractError(COLLABORATION_ROLE_CONTRACT_ERRORS.EXPIRES_AT_INVALID, "Collaboration Role expiresAt must be a valid timestamp when provided.", COLLABORATION_ROLE_FIELDS.EXPIRES_AT));
  }

  if (collaborationRole?.roleNotes !== undefined && collaborationRole.roleNotes !== null && typeof collaborationRole.roleNotes !== "string") {
    errors.push(createContractError(COLLABORATION_ROLE_CONTRACT_ERRORS.ROLE_NOTES_INVALID, "Collaboration Role roleNotes must be a string when provided.", COLLABORATION_ROLE_FIELDS.ROLE_NOTES));
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

export function isCollaborationRoleVisibleToActor({
  actorId,
  collaborationRole,
} = {}) {
  return hasNonEmptyString(actorId)
    && (actorId === collaborationRole?.ownerId || actorId === collaborationRole?.subjectId);
}

export function canActorUseCollaborationRolePermission({
  actorId,
  permission,
  collaborationRole,
} = {}) {
  return isIdentityPermission(permission)
    && isCollaborationRoleVisibleToActor({ actorId, collaborationRole })
    && Array.isArray(collaborationRole?.permissions)
    && collaborationRole.permissions.includes(permission);
}

export function canActorAccessCollaborationRole({
  actorId,
  role,
  permission,
  collaborationRole,
  grantedScopes = [],
} = {}) {
  if (!isIdentityPermission(permission)) {
    return false;
  }

  if (canActorUseCollaborationRolePermission({ actorId, permission, collaborationRole })) {
    return true;
  }

  if (actorId === collaborationRole?.ownerId) {
    return canActorPerformPermission({
      actorId,
      role: IDENTITY_ROLES.OWNER,
      permission,
      scope: IDENTITY_PERMISSION_SCOPES.OWNED_OBJECT,
      object: {
        ownerId: collaborationRole.ownerId,
        visibility: collaborationRole.visibility,
      },
    });
  }

  if (permission === IDENTITY_PERMISSIONS.ADMINISTER) {
    return canActorPerformPermission({
      actorId,
      role,
      permission,
      scope: IDENTITY_PERMISSION_SCOPES.PLATFORM,
      grantedScopes,
      object: {
        ownerId: collaborationRole?.ownerId,
        visibility: IDENTITY_VISIBILITY_STATES.ADMIN_ONLY,
      },
    });
  }

  return false;
}

function collectForbiddenFieldErrors(record, errors, pathPrefix = "") {
  if (!isReferenceObject(record)) {
    return;
  }

  for (const fieldName of COLLABORATION_ROLE_FORBIDDEN_FIELDS) {
    if (Object.hasOwn(record, fieldName)) {
      errors.push(createContractError(COLLABORATION_ROLE_CONTRACT_ERRORS.FIELD_NOT_ALLOWED, "Collaboration Role records must not carry auth session, runtime, toolState, or payment state.", pathPrefix ? `${pathPrefix}.${fieldName}` : fieldName));
    }
  }
}

function isReferenceObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isTimestamp(value) {
  return hasNonEmptyString(value) && Number.isFinite(Date.parse(value));
}

function createContractError(code, message, path) {
  return Object.freeze({ code, message, path });
}
