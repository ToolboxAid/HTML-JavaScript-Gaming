/*
Toolbox Aid
David Quesenberry
06/02/2026
organizationContract.js
*/
import {
  IDENTITY_PERMISSION_SCOPES,
  IDENTITY_PERMISSIONS,
  IDENTITY_ROLES,
  IDENTITY_VISIBILITY_STATES,
  canActorPerformPermission,
  isIdentityPermission,
} from "./identityPermissionsContract.js";

export const ORGANIZATION_CONTRACT_ID = "gamefoundrystudio.organization.contract";
export const ORGANIZATION_CONTRACT_VERSION = "1.0.0";

export const ORGANIZATION_FIELDS = Object.freeze({
  ORGANIZATION_ID: "organizationId",
  OWNER: "ownerId",
  DISPLAY_NAME: "displayName",
  HANDLE: "handle",
  VISIBILITY: "visibility",
  ORGANIZATION_STATUS: "organizationStatus",
  CREATED_AT: "createdAt",
  ORGANIZATION_NOTES: "organizationNotes",
});

export const ORGANIZATION_FIELD_LIST = Object.freeze([
  ORGANIZATION_FIELDS.ORGANIZATION_ID,
  ORGANIZATION_FIELDS.OWNER,
  ORGANIZATION_FIELDS.DISPLAY_NAME,
  ORGANIZATION_FIELDS.HANDLE,
  ORGANIZATION_FIELDS.VISIBILITY,
  ORGANIZATION_FIELDS.ORGANIZATION_STATUS,
  ORGANIZATION_FIELDS.CREATED_AT,
  ORGANIZATION_FIELDS.ORGANIZATION_NOTES,
]);

export const ORGANIZATION_STATUS = Object.freeze({
  ACTIVE: "active",
  SUSPENDED: "suspended",
  ARCHIVED: "archived",
});

export const ORGANIZATION_STATUS_LIST = Object.freeze([
  ORGANIZATION_STATUS.ACTIVE,
  ORGANIZATION_STATUS.SUSPENDED,
  ORGANIZATION_STATUS.ARCHIVED,
]);

export const ORGANIZATION_VISIBILITY_LIST = Object.freeze([
  IDENTITY_VISIBILITY_STATES.PRIVATE,
  IDENTITY_VISIBILITY_STATES.SHARED,
  IDENTITY_VISIBILITY_STATES.PUBLIC,
  IDENTITY_VISIBILITY_STATES.MARKETPLACE,
]);

export const ORGANIZATION_RULES = Object.freeze({
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

export const ORGANIZATION_FORBIDDEN_FIELDS = Object.freeze([
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

export const ORGANIZATION_CONTRACT_ERRORS = Object.freeze({
  ORGANIZATION_ID_REQUIRED: "ORGANIZATION_ID_REQUIRED",
  OWNER_REQUIRED: "ORGANIZATION_OWNER_REQUIRED",
  DISPLAY_NAME_REQUIRED: "ORGANIZATION_DISPLAY_NAME_REQUIRED",
  HANDLE_REQUIRED: "ORGANIZATION_HANDLE_REQUIRED",
  HANDLE_INVALID: "ORGANIZATION_HANDLE_INVALID",
  VISIBILITY_REQUIRED: "ORGANIZATION_VISIBILITY_REQUIRED",
  VISIBILITY_INVALID: "ORGANIZATION_VISIBILITY_INVALID",
  ORGANIZATION_STATUS_REQUIRED: "ORGANIZATION_STATUS_REQUIRED",
  ORGANIZATION_STATUS_INVALID: "ORGANIZATION_STATUS_INVALID",
  CREATED_AT_REQUIRED: "ORGANIZATION_CREATED_AT_REQUIRED",
  CREATED_AT_INVALID: "ORGANIZATION_CREATED_AT_INVALID",
  ORGANIZATION_NOTES_INVALID: "ORGANIZATION_NOTES_INVALID",
  FIELD_NOT_ALLOWED: "ORGANIZATION_FIELD_NOT_ALLOWED",
});

export function isOrganizationStatus(value) {
  return ORGANIZATION_STATUS_LIST.includes(value);
}

export function isOrganizationVisibility(value) {
  return ORGANIZATION_VISIBILITY_LIST.includes(value);
}

export function isOrganizationHandle(value) {
  return typeof value === "string" && /^[a-z0-9][a-z0-9-]{2,63}$/.test(value);
}

export function validateOrganizationContract(organization) {
  const errors = [];

  collectForbiddenFieldErrors(organization, errors);

  if (!hasNonEmptyString(organization?.organizationId)) {
    errors.push(createContractError(ORGANIZATION_CONTRACT_ERRORS.ORGANIZATION_ID_REQUIRED, "Organization records require organizationId.", ORGANIZATION_FIELDS.ORGANIZATION_ID));
  }

  if (!hasNonEmptyString(organization?.ownerId)) {
    errors.push(createContractError(ORGANIZATION_CONTRACT_ERRORS.OWNER_REQUIRED, "Organization records require ownerId.", ORGANIZATION_FIELDS.OWNER));
  }

  if (!hasNonEmptyString(organization?.displayName)) {
    errors.push(createContractError(ORGANIZATION_CONTRACT_ERRORS.DISPLAY_NAME_REQUIRED, "Organization records require displayName.", ORGANIZATION_FIELDS.DISPLAY_NAME));
  }

  if (!hasNonEmptyString(organization?.handle)) {
    errors.push(createContractError(ORGANIZATION_CONTRACT_ERRORS.HANDLE_REQUIRED, "Organization records require handle.", ORGANIZATION_FIELDS.HANDLE));
  } else if (!isOrganizationHandle(organization.handle)) {
    errors.push(createContractError(ORGANIZATION_CONTRACT_ERRORS.HANDLE_INVALID, "Organization handle must be lowercase URL-safe text.", ORGANIZATION_FIELDS.HANDLE));
  }

  if (!hasNonEmptyString(organization?.visibility)) {
    errors.push(createContractError(ORGANIZATION_CONTRACT_ERRORS.VISIBILITY_REQUIRED, "Organization records require visibility.", ORGANIZATION_FIELDS.VISIBILITY));
  } else if (!isOrganizationVisibility(organization.visibility)) {
    errors.push(createContractError(ORGANIZATION_CONTRACT_ERRORS.VISIBILITY_INVALID, "Organization visibility must be private, shared, public, or marketplace.", ORGANIZATION_FIELDS.VISIBILITY));
  }

  if (!hasNonEmptyString(organization?.organizationStatus)) {
    errors.push(createContractError(ORGANIZATION_CONTRACT_ERRORS.ORGANIZATION_STATUS_REQUIRED, "Organization records require organizationStatus.", ORGANIZATION_FIELDS.ORGANIZATION_STATUS));
  } else if (!isOrganizationStatus(organization.organizationStatus)) {
    errors.push(createContractError(ORGANIZATION_CONTRACT_ERRORS.ORGANIZATION_STATUS_INVALID, "Organization status must be active, suspended, or archived.", ORGANIZATION_FIELDS.ORGANIZATION_STATUS));
  }

  if (!hasNonEmptyString(organization?.createdAt)) {
    errors.push(createContractError(ORGANIZATION_CONTRACT_ERRORS.CREATED_AT_REQUIRED, "Organization records require createdAt.", ORGANIZATION_FIELDS.CREATED_AT));
  } else if (!isTimestamp(organization.createdAt)) {
    errors.push(createContractError(ORGANIZATION_CONTRACT_ERRORS.CREATED_AT_INVALID, "Organization createdAt must be a valid timestamp.", ORGANIZATION_FIELDS.CREATED_AT));
  }

  if (organization?.organizationNotes !== undefined && organization.organizationNotes !== null && typeof organization.organizationNotes !== "string") {
    errors.push(createContractError(ORGANIZATION_CONTRACT_ERRORS.ORGANIZATION_NOTES_INVALID, "Organization organizationNotes must be a string when provided.", ORGANIZATION_FIELDS.ORGANIZATION_NOTES));
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

export function isOrganizationVisibleToActor({
  actorId,
  organization,
} = {}) {
  if (!hasNonEmptyString(actorId) || !organization) {
    return false;
  }

  return actorId === organization.ownerId
    || organization.visibility === IDENTITY_VISIBILITY_STATES.PUBLIC
    || organization.visibility === IDENTITY_VISIBILITY_STATES.MARKETPLACE;
}

export function canActorAccessOrganization({
  actorId,
  role,
  permission,
  organization,
  grantedScopes = [],
} = {}) {
  if (!isIdentityPermission(permission) || !isOrganizationVisibleToActor({ actorId, organization })) {
    return false;
  }

  if (actorId === organization?.ownerId) {
    return canActorPerformPermission({
      actorId,
      role: IDENTITY_ROLES.OWNER,
      permission,
      scope: IDENTITY_PERMISSION_SCOPES.OWNED_OBJECT,
      object: {
        ownerId: organization.ownerId,
        visibility: organization.visibility,
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
        ownerId: organization?.ownerId,
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

  for (const fieldName of ORGANIZATION_FORBIDDEN_FIELDS) {
    if (Object.hasOwn(record, fieldName)) {
      errors.push(createContractError(ORGANIZATION_CONTRACT_ERRORS.FIELD_NOT_ALLOWED, "Organization records must not carry auth session, runtime, toolState, payment, or moderation decision state.", pathPrefix ? `${pathPrefix}.${fieldName}` : fieldName));
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
