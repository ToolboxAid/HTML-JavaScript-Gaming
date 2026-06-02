/*
Toolbox Aid
David Quesenberry
06/02/2026
auditEventContract.js
*/
import {
  IDENTITY_PERMISSION_SCOPES,
  IDENTITY_PERMISSIONS,
  IDENTITY_ROLES,
  IDENTITY_VISIBILITY_STATES,
  canActorPerformPermission,
  isIdentityPermission,
} from "./identityPermissionsContract.js";

export const AUDIT_EVENT_CONTRACT_ID = "gamefoundrystudio.audit.event.contract";
export const AUDIT_EVENT_CONTRACT_VERSION = "1.0.0";

export const AUDIT_EVENT_FIELDS = Object.freeze({
  AUDIT_EVENT_ID: "auditEventId",
  OWNER: "ownerId",
  ACTOR: "actorId",
  ACTION: "action",
  TARGET_TYPE: "targetType",
  TARGET_ID: "targetId",
  SEVERITY: "severity",
  OCCURRED_AT: "occurredAt",
  AUDIT_NOTES: "auditNotes",
});

export const AUDIT_EVENT_FIELD_LIST = Object.freeze([
  AUDIT_EVENT_FIELDS.AUDIT_EVENT_ID,
  AUDIT_EVENT_FIELDS.OWNER,
  AUDIT_EVENT_FIELDS.ACTOR,
  AUDIT_EVENT_FIELDS.ACTION,
  AUDIT_EVENT_FIELDS.TARGET_TYPE,
  AUDIT_EVENT_FIELDS.TARGET_ID,
  AUDIT_EVENT_FIELDS.SEVERITY,
  AUDIT_EVENT_FIELDS.OCCURRED_AT,
  AUDIT_EVENT_FIELDS.AUDIT_NOTES,
]);

export const AUDIT_EVENT_ACTIONS = Object.freeze({
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
  SHARE: "share",
  PUBLISH: "publish",
  MODERATE: "moderate",
  ADMINISTER: "administer",
});

export const AUDIT_EVENT_ACTION_LIST = Object.freeze([
  AUDIT_EVENT_ACTIONS.CREATE,
  AUDIT_EVENT_ACTIONS.UPDATE,
  AUDIT_EVENT_ACTIONS.DELETE,
  AUDIT_EVENT_ACTIONS.SHARE,
  AUDIT_EVENT_ACTIONS.PUBLISH,
  AUDIT_EVENT_ACTIONS.MODERATE,
  AUDIT_EVENT_ACTIONS.ADMINISTER,
]);

export const AUDIT_EVENT_TARGET_TYPES = Object.freeze({
  PROJECT: "project",
  RELEASE: "release",
  PUBLISH: "publish",
  MARKETPLACE_LISTING: "marketplaceListing",
  ENTITLEMENT: "entitlement",
  DOWNLOAD_GRANT: "downloadGrant",
  LIBRARY_ITEM: "libraryItem",
  INSTALL_RECEIPT: "installReceipt",
  UPDATE_CHANNEL: "updateChannel",
  VERSION_COMPATIBILITY: "versionCompatibility",
  MIGRATION_PLAN: "migrationPlan",
  BACKUP_SNAPSHOT: "backupSnapshot",
  RESTORE_SNAPSHOT: "restoreSnapshot",
  CREATOR_PROFILE: "creatorProfile",
  ORGANIZATION: "organization",
  COLLABORATION_ROLE: "collaborationRole",
  REVIEW_RATING: "reviewRating",
  MODERATION_QUEUE: "moderationQueue",
});

export const AUDIT_EVENT_TARGET_TYPE_LIST = Object.freeze(Object.values(AUDIT_EVENT_TARGET_TYPES));

export const AUDIT_EVENT_SEVERITY = Object.freeze({
  INFO: "info",
  WARNING: "warning",
  SECURITY: "security",
});

export const AUDIT_EVENT_SEVERITY_LIST = Object.freeze([
  AUDIT_EVENT_SEVERITY.INFO,
  AUDIT_EVENT_SEVERITY.WARNING,
  AUDIT_EVENT_SEVERITY.SECURITY,
]);

export const AUDIT_EVENT_RULES = Object.freeze({
  REQUIRES_OWNER: true,
  REQUIRES_ACTOR: true,
  REQUIRES_ACTION: true,
  REQUIRES_TARGET: true,
  REQUIRES_SEVERITY: true,
  REQUIRES_OCCURRED_AT: true,
  NO_AUTH_SESSION_STATE: true,
  NO_RUNTIME_STATE: true,
  NO_TOOL_STATE: true,
  NO_FILE_BYTES: true,
  NO_PAYMENT_STATE: true,
});

export const AUDIT_EVENT_FORBIDDEN_FIELDS = Object.freeze([
  "activeProjectId",
  "activeToolId",
  "activeToolStateId",
  "authProvider",
  "authSession",
  "authSessionState",
  "authState",
  "bytes",
  "checkoutSession",
  "credentials",
  "dirty",
  "fileBytes",
  "fileData",
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

export const AUDIT_EVENT_CONTRACT_ERRORS = Object.freeze({
  AUDIT_EVENT_ID_REQUIRED: "AUDIT_EVENT_ID_REQUIRED",
  OWNER_REQUIRED: "AUDIT_EVENT_OWNER_REQUIRED",
  ACTOR_REQUIRED: "AUDIT_EVENT_ACTOR_REQUIRED",
  ACTION_REQUIRED: "AUDIT_EVENT_ACTION_REQUIRED",
  ACTION_INVALID: "AUDIT_EVENT_ACTION_INVALID",
  TARGET_TYPE_REQUIRED: "AUDIT_EVENT_TARGET_TYPE_REQUIRED",
  TARGET_TYPE_INVALID: "AUDIT_EVENT_TARGET_TYPE_INVALID",
  TARGET_ID_REQUIRED: "AUDIT_EVENT_TARGET_ID_REQUIRED",
  SEVERITY_REQUIRED: "AUDIT_EVENT_SEVERITY_REQUIRED",
  SEVERITY_INVALID: "AUDIT_EVENT_SEVERITY_INVALID",
  OCCURRED_AT_REQUIRED: "AUDIT_EVENT_OCCURRED_AT_REQUIRED",
  OCCURRED_AT_INVALID: "AUDIT_EVENT_OCCURRED_AT_INVALID",
  AUDIT_NOTES_INVALID: "AUDIT_EVENT_NOTES_INVALID",
  FIELD_NOT_ALLOWED: "AUDIT_EVENT_FIELD_NOT_ALLOWED",
});

export function isAuditEventAction(value) {
  return AUDIT_EVENT_ACTION_LIST.includes(value);
}

export function isAuditEventTargetType(value) {
  return AUDIT_EVENT_TARGET_TYPE_LIST.includes(value);
}

export function isAuditEventSeverity(value) {
  return AUDIT_EVENT_SEVERITY_LIST.includes(value);
}

export function validateAuditEventContract(auditEvent) {
  const errors = [];

  collectForbiddenFieldErrors(auditEvent, errors);

  if (!hasNonEmptyString(auditEvent?.auditEventId)) {
    errors.push(createContractError(AUDIT_EVENT_CONTRACT_ERRORS.AUDIT_EVENT_ID_REQUIRED, "Audit Event records require auditEventId.", AUDIT_EVENT_FIELDS.AUDIT_EVENT_ID));
  }

  if (!hasNonEmptyString(auditEvent?.ownerId)) {
    errors.push(createContractError(AUDIT_EVENT_CONTRACT_ERRORS.OWNER_REQUIRED, "Audit Event records require ownerId.", AUDIT_EVENT_FIELDS.OWNER));
  }

  if (!hasNonEmptyString(auditEvent?.actorId)) {
    errors.push(createContractError(AUDIT_EVENT_CONTRACT_ERRORS.ACTOR_REQUIRED, "Audit Event records require actorId.", AUDIT_EVENT_FIELDS.ACTOR));
  }

  if (!hasNonEmptyString(auditEvent?.action)) {
    errors.push(createContractError(AUDIT_EVENT_CONTRACT_ERRORS.ACTION_REQUIRED, "Audit Event records require action.", AUDIT_EVENT_FIELDS.ACTION));
  } else if (!isAuditEventAction(auditEvent.action)) {
    errors.push(createContractError(AUDIT_EVENT_CONTRACT_ERRORS.ACTION_INVALID, "Audit Event action must be an allowed action.", AUDIT_EVENT_FIELDS.ACTION));
  }

  if (!hasNonEmptyString(auditEvent?.targetType)) {
    errors.push(createContractError(AUDIT_EVENT_CONTRACT_ERRORS.TARGET_TYPE_REQUIRED, "Audit Event records require targetType.", AUDIT_EVENT_FIELDS.TARGET_TYPE));
  } else if (!isAuditEventTargetType(auditEvent.targetType)) {
    errors.push(createContractError(AUDIT_EVENT_CONTRACT_ERRORS.TARGET_TYPE_INVALID, "Audit Event targetType must be an allowed contract record type.", AUDIT_EVENT_FIELDS.TARGET_TYPE));
  }

  if (!hasNonEmptyString(auditEvent?.targetId)) {
    errors.push(createContractError(AUDIT_EVENT_CONTRACT_ERRORS.TARGET_ID_REQUIRED, "Audit Event records require targetId.", AUDIT_EVENT_FIELDS.TARGET_ID));
  }

  if (!hasNonEmptyString(auditEvent?.severity)) {
    errors.push(createContractError(AUDIT_EVENT_CONTRACT_ERRORS.SEVERITY_REQUIRED, "Audit Event records require severity.", AUDIT_EVENT_FIELDS.SEVERITY));
  } else if (!isAuditEventSeverity(auditEvent.severity)) {
    errors.push(createContractError(AUDIT_EVENT_CONTRACT_ERRORS.SEVERITY_INVALID, "Audit Event severity must be info, warning, or security.", AUDIT_EVENT_FIELDS.SEVERITY));
  }

  if (!hasNonEmptyString(auditEvent?.occurredAt)) {
    errors.push(createContractError(AUDIT_EVENT_CONTRACT_ERRORS.OCCURRED_AT_REQUIRED, "Audit Event records require occurredAt.", AUDIT_EVENT_FIELDS.OCCURRED_AT));
  } else if (!isTimestamp(auditEvent.occurredAt)) {
    errors.push(createContractError(AUDIT_EVENT_CONTRACT_ERRORS.OCCURRED_AT_INVALID, "Audit Event occurredAt must be a valid timestamp.", AUDIT_EVENT_FIELDS.OCCURRED_AT));
  }

  if (auditEvent?.auditNotes !== undefined && auditEvent.auditNotes !== null && typeof auditEvent.auditNotes !== "string") {
    errors.push(createContractError(AUDIT_EVENT_CONTRACT_ERRORS.AUDIT_NOTES_INVALID, "Audit Event auditNotes must be a string when provided.", AUDIT_EVENT_FIELDS.AUDIT_NOTES));
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

export function canActorAccessAuditEvent({
  actorId,
  role,
  permission,
  auditEvent,
  grantedScopes = [],
} = {}) {
  if (!hasNonEmptyString(actorId) || !isIdentityPermission(permission)) {
    return false;
  }

  return canActorPerformPermission({
    actorId,
    role,
    permission,
    scope: IDENTITY_PERMISSION_SCOPES.PLATFORM,
    grantedScopes,
    object: {
      ownerId: auditEvent?.ownerId,
      visibility: IDENTITY_VISIBILITY_STATES.ADMIN_ONLY,
    },
  });
}

function collectForbiddenFieldErrors(record, errors, pathPrefix = "") {
  if (!isReferenceObject(record)) {
    return;
  }

  for (const fieldName of AUDIT_EVENT_FORBIDDEN_FIELDS) {
    if (Object.hasOwn(record, fieldName)) {
      errors.push(createContractError(AUDIT_EVENT_CONTRACT_ERRORS.FIELD_NOT_ALLOWED, "Audit Event records must not carry auth session, runtime, toolState, file bytes, or payment state.", pathPrefix ? `${pathPrefix}.${fieldName}` : fieldName));
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
