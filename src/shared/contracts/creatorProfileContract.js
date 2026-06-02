/*
Toolbox Aid
David Quesenberry
06/02/2026
creatorProfileContract.js
*/
import {
  IDENTITY_PERMISSION_SCOPES,
  IDENTITY_PERMISSIONS,
  IDENTITY_ROLES,
  IDENTITY_VISIBILITY_STATES,
  canActorPerformPermission,
  isIdentityPermission,
} from "./identityPermissionsContract.js";

export const CREATOR_PROFILE_CONTRACT_ID = "gamefoundrystudio.creator.profile.contract";
export const CREATOR_PROFILE_CONTRACT_VERSION = "1.0.0";

export const CREATOR_PROFILE_FIELDS = Object.freeze({
  CREATOR_PROFILE_ID: "creatorProfileId",
  OWNER: "ownerId",
  DISPLAY_NAME: "displayName",
  HANDLE: "handle",
  VISIBILITY: "visibility",
  PROFILE_STATUS: "profileStatus",
  CREATED_AT: "createdAt",
  PROFILE_NOTES: "profileNotes",
});

export const CREATOR_PROFILE_FIELD_LIST = Object.freeze([
  CREATOR_PROFILE_FIELDS.CREATOR_PROFILE_ID,
  CREATOR_PROFILE_FIELDS.OWNER,
  CREATOR_PROFILE_FIELDS.DISPLAY_NAME,
  CREATOR_PROFILE_FIELDS.HANDLE,
  CREATOR_PROFILE_FIELDS.VISIBILITY,
  CREATOR_PROFILE_FIELDS.PROFILE_STATUS,
  CREATOR_PROFILE_FIELDS.CREATED_AT,
  CREATOR_PROFILE_FIELDS.PROFILE_NOTES,
]);

export const CREATOR_PROFILE_STATUS = Object.freeze({
  ACTIVE: "active",
  SUSPENDED: "suspended",
  ARCHIVED: "archived",
});

export const CREATOR_PROFILE_STATUS_LIST = Object.freeze([
  CREATOR_PROFILE_STATUS.ACTIVE,
  CREATOR_PROFILE_STATUS.SUSPENDED,
  CREATOR_PROFILE_STATUS.ARCHIVED,
]);

export const CREATOR_PROFILE_VISIBILITY_LIST = Object.freeze([
  IDENTITY_VISIBILITY_STATES.PRIVATE,
  IDENTITY_VISIBILITY_STATES.SHARED,
  IDENTITY_VISIBILITY_STATES.PUBLIC,
  IDENTITY_VISIBILITY_STATES.MARKETPLACE,
]);

export const CREATOR_PROFILE_RULES = Object.freeze({
  REQUIRES_OWNER: true,
  REQUIRES_DISPLAY_NAME: true,
  REQUIRES_HANDLE: true,
  REQUIRES_VISIBILITY: true,
  REQUIRES_VALID_STATUS: true,
  REQUIRES_CREATED_AT: true,
  NO_AUTH_SESSION_STATE: true,
  NO_RUNTIME_STATE: true,
  NO_TOOL_STATE: true,
  NO_PAYMENT_STATE: true,
  NO_MODERATION_DECISION_STATE: true,
});

export const CREATOR_PROFILE_FORBIDDEN_FIELDS = Object.freeze([
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
  "moderationDecision",
  "moderationState",
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

export const CREATOR_PROFILE_CONTRACT_ERRORS = Object.freeze({
  CREATOR_PROFILE_ID_REQUIRED: "CREATOR_PROFILE_ID_REQUIRED",
  OWNER_REQUIRED: "CREATOR_PROFILE_OWNER_REQUIRED",
  DISPLAY_NAME_REQUIRED: "CREATOR_PROFILE_DISPLAY_NAME_REQUIRED",
  HANDLE_REQUIRED: "CREATOR_PROFILE_HANDLE_REQUIRED",
  HANDLE_INVALID: "CREATOR_PROFILE_HANDLE_INVALID",
  VISIBILITY_REQUIRED: "CREATOR_PROFILE_VISIBILITY_REQUIRED",
  VISIBILITY_INVALID: "CREATOR_PROFILE_VISIBILITY_INVALID",
  PROFILE_STATUS_REQUIRED: "CREATOR_PROFILE_STATUS_REQUIRED",
  PROFILE_STATUS_INVALID: "CREATOR_PROFILE_STATUS_INVALID",
  CREATED_AT_REQUIRED: "CREATOR_PROFILE_CREATED_AT_REQUIRED",
  CREATED_AT_INVALID: "CREATOR_PROFILE_CREATED_AT_INVALID",
  PROFILE_NOTES_INVALID: "CREATOR_PROFILE_NOTES_INVALID",
  FIELD_NOT_ALLOWED: "CREATOR_PROFILE_FIELD_NOT_ALLOWED",
});

export function isCreatorProfileStatus(value) {
  return CREATOR_PROFILE_STATUS_LIST.includes(value);
}

export function isCreatorProfileVisibility(value) {
  return CREATOR_PROFILE_VISIBILITY_LIST.includes(value);
}

export function isCreatorProfileHandle(value) {
  return typeof value === "string" && /^[a-z0-9][a-z0-9-]{2,63}$/.test(value);
}

export function validateCreatorProfileContract(profile) {
  const errors = [];

  collectForbiddenFieldErrors(profile, errors);

  if (!hasNonEmptyString(profile?.creatorProfileId)) {
    errors.push(createContractError(CREATOR_PROFILE_CONTRACT_ERRORS.CREATOR_PROFILE_ID_REQUIRED, "Creator Profile records require creatorProfileId.", CREATOR_PROFILE_FIELDS.CREATOR_PROFILE_ID));
  }

  if (!hasNonEmptyString(profile?.ownerId)) {
    errors.push(createContractError(CREATOR_PROFILE_CONTRACT_ERRORS.OWNER_REQUIRED, "Creator Profile records require ownerId.", CREATOR_PROFILE_FIELDS.OWNER));
  }

  if (!hasNonEmptyString(profile?.displayName)) {
    errors.push(createContractError(CREATOR_PROFILE_CONTRACT_ERRORS.DISPLAY_NAME_REQUIRED, "Creator Profile records require displayName.", CREATOR_PROFILE_FIELDS.DISPLAY_NAME));
  }

  if (!hasNonEmptyString(profile?.handle)) {
    errors.push(createContractError(CREATOR_PROFILE_CONTRACT_ERRORS.HANDLE_REQUIRED, "Creator Profile records require handle.", CREATOR_PROFILE_FIELDS.HANDLE));
  } else if (!isCreatorProfileHandle(profile.handle)) {
    errors.push(createContractError(CREATOR_PROFILE_CONTRACT_ERRORS.HANDLE_INVALID, "Creator Profile handle must be lowercase URL-safe text.", CREATOR_PROFILE_FIELDS.HANDLE));
  }

  if (!hasNonEmptyString(profile?.visibility)) {
    errors.push(createContractError(CREATOR_PROFILE_CONTRACT_ERRORS.VISIBILITY_REQUIRED, "Creator Profile records require visibility.", CREATOR_PROFILE_FIELDS.VISIBILITY));
  } else if (!isCreatorProfileVisibility(profile.visibility)) {
    errors.push(createContractError(CREATOR_PROFILE_CONTRACT_ERRORS.VISIBILITY_INVALID, "Creator Profile visibility must be private, shared, public, or marketplace.", CREATOR_PROFILE_FIELDS.VISIBILITY));
  }

  if (!hasNonEmptyString(profile?.profileStatus)) {
    errors.push(createContractError(CREATOR_PROFILE_CONTRACT_ERRORS.PROFILE_STATUS_REQUIRED, "Creator Profile records require profileStatus.", CREATOR_PROFILE_FIELDS.PROFILE_STATUS));
  } else if (!isCreatorProfileStatus(profile.profileStatus)) {
    errors.push(createContractError(CREATOR_PROFILE_CONTRACT_ERRORS.PROFILE_STATUS_INVALID, "Creator Profile status must be active, suspended, or archived.", CREATOR_PROFILE_FIELDS.PROFILE_STATUS));
  }

  if (!hasNonEmptyString(profile?.createdAt)) {
    errors.push(createContractError(CREATOR_PROFILE_CONTRACT_ERRORS.CREATED_AT_REQUIRED, "Creator Profile records require createdAt.", CREATOR_PROFILE_FIELDS.CREATED_AT));
  } else if (!isTimestamp(profile.createdAt)) {
    errors.push(createContractError(CREATOR_PROFILE_CONTRACT_ERRORS.CREATED_AT_INVALID, "Creator Profile createdAt must be a valid timestamp.", CREATOR_PROFILE_FIELDS.CREATED_AT));
  }

  if (profile?.profileNotes !== undefined && profile.profileNotes !== null && typeof profile.profileNotes !== "string") {
    errors.push(createContractError(CREATOR_PROFILE_CONTRACT_ERRORS.PROFILE_NOTES_INVALID, "Creator Profile profileNotes must be a string when provided.", CREATOR_PROFILE_FIELDS.PROFILE_NOTES));
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

export function isCreatorProfileVisibleToActor({
  actorId,
  profile,
} = {}) {
  if (!hasNonEmptyString(actorId) || !profile) {
    return false;
  }

  return actorId === profile.ownerId
    || profile.visibility === IDENTITY_VISIBILITY_STATES.PUBLIC
    || profile.visibility === IDENTITY_VISIBILITY_STATES.MARKETPLACE;
}

export function canActorAccessCreatorProfile({
  actorId,
  role,
  permission,
  profile,
  grantedScopes = [],
} = {}) {
  if (!isIdentityPermission(permission) || !isCreatorProfileVisibleToActor({ actorId, profile })) {
    return false;
  }

  if (actorId === profile?.ownerId) {
    return canActorPerformPermission({
      actorId,
      role: IDENTITY_ROLES.OWNER,
      permission,
      scope: IDENTITY_PERMISSION_SCOPES.OWNED_OBJECT,
      object: {
        ownerId: profile.ownerId,
        visibility: profile.visibility,
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
        ownerId: profile?.ownerId,
        visibility: IDENTITY_VISIBILITY_STATES.ADMIN_ONLY,
      },
    });
  }

  return permission === IDENTITY_PERMISSIONS.VIEW;
}

function collectForbiddenFieldErrors(record, errors, pathPrefix = "") {
  if (!isReferenceObject(record)) {
    return;
  }

  for (const fieldName of CREATOR_PROFILE_FORBIDDEN_FIELDS) {
    if (Object.hasOwn(record, fieldName)) {
      errors.push(createContractError(CREATOR_PROFILE_CONTRACT_ERRORS.FIELD_NOT_ALLOWED, "Creator Profile records must not carry auth session, runtime, toolState, payment, or moderation decision state.", pathPrefix ? `${pathPrefix}.${fieldName}` : fieldName));
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
