/*
Toolbox Aid
David Quesenberry
06/02/2026
moderationQueueContract.js
*/
import {
  IDENTITY_PERMISSION_SCOPES,
  IDENTITY_PERMISSIONS,
  IDENTITY_ROLES,
  IDENTITY_VISIBILITY_STATES,
  canActorPerformPermission,
  isIdentityPermission,
} from "./identityPermissionsContract.js";

export const MODERATION_QUEUE_CONTRACT_ID = "gamefoundrystudio.moderation.queue.contract";
export const MODERATION_QUEUE_CONTRACT_VERSION = "1.0.0";

export const MODERATION_QUEUE_FIELDS = Object.freeze({
  MODERATION_QUEUE_ID: "moderationQueueId",
  OWNER: "ownerId",
  PROJECT: "projectId",
  SUBJECT_TYPE: "subjectType",
  SUBJECT_ID: "subjectId",
  REPORT_REASON: "reportReason",
  QUEUE_STATUS: "queueStatus",
  VISIBILITY: "visibility",
  CREATED_AT: "createdAt",
  MODERATION_NOTES: "moderationNotes",
});

export const MODERATION_QUEUE_FIELD_LIST = Object.freeze([
  MODERATION_QUEUE_FIELDS.MODERATION_QUEUE_ID,
  MODERATION_QUEUE_FIELDS.OWNER,
  MODERATION_QUEUE_FIELDS.PROJECT,
  MODERATION_QUEUE_FIELDS.SUBJECT_TYPE,
  MODERATION_QUEUE_FIELDS.SUBJECT_ID,
  MODERATION_QUEUE_FIELDS.REPORT_REASON,
  MODERATION_QUEUE_FIELDS.QUEUE_STATUS,
  MODERATION_QUEUE_FIELDS.VISIBILITY,
  MODERATION_QUEUE_FIELDS.CREATED_AT,
  MODERATION_QUEUE_FIELDS.MODERATION_NOTES,
]);

export const MODERATION_QUEUE_SUBJECT_TYPES = Object.freeze({
  MARKETPLACE_LISTING: "marketplaceListing",
  REVIEW_RATING: "reviewRating",
  CREATOR_PROFILE: "creatorProfile",
  ORGANIZATION: "organization",
  COMMENT: "comment",
});

export const MODERATION_QUEUE_SUBJECT_TYPE_LIST = Object.freeze([
  MODERATION_QUEUE_SUBJECT_TYPES.MARKETPLACE_LISTING,
  MODERATION_QUEUE_SUBJECT_TYPES.REVIEW_RATING,
  MODERATION_QUEUE_SUBJECT_TYPES.CREATOR_PROFILE,
  MODERATION_QUEUE_SUBJECT_TYPES.ORGANIZATION,
  MODERATION_QUEUE_SUBJECT_TYPES.COMMENT,
]);

export const MODERATION_QUEUE_STATUS = Object.freeze({
  OPEN: "open",
  IN_REVIEW: "inReview",
  RESOLVED: "resolved",
  DISMISSED: "dismissed",
});

export const MODERATION_QUEUE_STATUS_LIST = Object.freeze([
  MODERATION_QUEUE_STATUS.OPEN,
  MODERATION_QUEUE_STATUS.IN_REVIEW,
  MODERATION_QUEUE_STATUS.RESOLVED,
  MODERATION_QUEUE_STATUS.DISMISSED,
]);

export const MODERATION_QUEUE_RULES = Object.freeze({
  REQUIRES_OWNER: true,
  REQUIRES_PROJECT: true,
  REQUIRES_SUBJECT: true,
  REQUIRES_REPORT_REASON: true,
  REQUIRES_VALID_QUEUE_STATUS: true,
  REQUIRES_ADMIN_ONLY_VISIBILITY: true,
  REQUIRES_CREATED_AT: true,
  NO_PAYMENT_STATE: true,
  NO_AUTH_SESSION_STATE: true,
  NO_RUNTIME_STATE: true,
  NO_TOOL_STATE: true,
  NO_FINAL_MODERATION_DECISION_STATE: true,
});

export const MODERATION_QUEUE_FORBIDDEN_FIELDS = Object.freeze([
  "activeProjectId",
  "activeToolId",
  "activeToolStateId",
  "authProvider",
  "authSession",
  "authSessionState",
  "authState",
  "checkoutSession",
  "credentials",
  "decision",
  "decisionAt",
  "dirty",
  "moderationDecision",
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

export const MODERATION_QUEUE_CONTRACT_ERRORS = Object.freeze({
  MODERATION_QUEUE_ID_REQUIRED: "MODERATION_QUEUE_ID_REQUIRED",
  OWNER_REQUIRED: "MODERATION_QUEUE_OWNER_REQUIRED",
  PROJECT_REQUIRED: "MODERATION_QUEUE_PROJECT_REQUIRED",
  SUBJECT_TYPE_REQUIRED: "MODERATION_QUEUE_SUBJECT_TYPE_REQUIRED",
  SUBJECT_TYPE_INVALID: "MODERATION_QUEUE_SUBJECT_TYPE_INVALID",
  SUBJECT_ID_REQUIRED: "MODERATION_QUEUE_SUBJECT_ID_REQUIRED",
  REPORT_REASON_REQUIRED: "MODERATION_QUEUE_REPORT_REASON_REQUIRED",
  QUEUE_STATUS_REQUIRED: "MODERATION_QUEUE_STATUS_REQUIRED",
  QUEUE_STATUS_INVALID: "MODERATION_QUEUE_STATUS_INVALID",
  VISIBILITY_REQUIRED: "MODERATION_QUEUE_VISIBILITY_REQUIRED",
  VISIBILITY_INVALID: "MODERATION_QUEUE_VISIBILITY_INVALID",
  CREATED_AT_REQUIRED: "MODERATION_QUEUE_CREATED_AT_REQUIRED",
  CREATED_AT_INVALID: "MODERATION_QUEUE_CREATED_AT_INVALID",
  MODERATION_NOTES_INVALID: "MODERATION_QUEUE_NOTES_INVALID",
  FIELD_NOT_ALLOWED: "MODERATION_QUEUE_FIELD_NOT_ALLOWED",
});

export function isModerationQueueSubjectType(value) {
  return MODERATION_QUEUE_SUBJECT_TYPE_LIST.includes(value);
}

export function isModerationQueueStatus(value) {
  return MODERATION_QUEUE_STATUS_LIST.includes(value);
}

export function validateModerationQueueContract(queueItem) {
  const errors = [];

  collectForbiddenFieldErrors(queueItem, errors);

  if (!hasNonEmptyString(queueItem?.moderationQueueId)) {
    errors.push(createContractError(MODERATION_QUEUE_CONTRACT_ERRORS.MODERATION_QUEUE_ID_REQUIRED, "Moderation Queue records require moderationQueueId.", MODERATION_QUEUE_FIELDS.MODERATION_QUEUE_ID));
  }

  if (!hasNonEmptyString(queueItem?.ownerId)) {
    errors.push(createContractError(MODERATION_QUEUE_CONTRACT_ERRORS.OWNER_REQUIRED, "Moderation Queue records require ownerId.", MODERATION_QUEUE_FIELDS.OWNER));
  }

  if (!hasNonEmptyString(queueItem?.projectId)) {
    errors.push(createContractError(MODERATION_QUEUE_CONTRACT_ERRORS.PROJECT_REQUIRED, "Moderation Queue records require projectId.", MODERATION_QUEUE_FIELDS.PROJECT));
  }

  if (!hasNonEmptyString(queueItem?.subjectType)) {
    errors.push(createContractError(MODERATION_QUEUE_CONTRACT_ERRORS.SUBJECT_TYPE_REQUIRED, "Moderation Queue records require subjectType.", MODERATION_QUEUE_FIELDS.SUBJECT_TYPE));
  } else if (!isModerationQueueSubjectType(queueItem.subjectType)) {
    errors.push(createContractError(MODERATION_QUEUE_CONTRACT_ERRORS.SUBJECT_TYPE_INVALID, "Moderation Queue subjectType must identify a supported moderated record.", MODERATION_QUEUE_FIELDS.SUBJECT_TYPE));
  }

  if (!hasNonEmptyString(queueItem?.subjectId)) {
    errors.push(createContractError(MODERATION_QUEUE_CONTRACT_ERRORS.SUBJECT_ID_REQUIRED, "Moderation Queue records require subjectId.", MODERATION_QUEUE_FIELDS.SUBJECT_ID));
  }

  if (!hasNonEmptyString(queueItem?.reportReason)) {
    errors.push(createContractError(MODERATION_QUEUE_CONTRACT_ERRORS.REPORT_REASON_REQUIRED, "Moderation Queue records require reportReason.", MODERATION_QUEUE_FIELDS.REPORT_REASON));
  }

  if (!hasNonEmptyString(queueItem?.queueStatus)) {
    errors.push(createContractError(MODERATION_QUEUE_CONTRACT_ERRORS.QUEUE_STATUS_REQUIRED, "Moderation Queue records require queueStatus.", MODERATION_QUEUE_FIELDS.QUEUE_STATUS));
  } else if (!isModerationQueueStatus(queueItem.queueStatus)) {
    errors.push(createContractError(MODERATION_QUEUE_CONTRACT_ERRORS.QUEUE_STATUS_INVALID, "Moderation Queue status must be open, inReview, resolved, or dismissed.", MODERATION_QUEUE_FIELDS.QUEUE_STATUS));
  }

  if (!hasNonEmptyString(queueItem?.visibility)) {
    errors.push(createContractError(MODERATION_QUEUE_CONTRACT_ERRORS.VISIBILITY_REQUIRED, "Moderation Queue records require visibility.", MODERATION_QUEUE_FIELDS.VISIBILITY));
  } else if (queueItem.visibility !== IDENTITY_VISIBILITY_STATES.ADMIN_ONLY) {
    errors.push(createContractError(MODERATION_QUEUE_CONTRACT_ERRORS.VISIBILITY_INVALID, "Moderation Queue visibility must be adminOnly.", MODERATION_QUEUE_FIELDS.VISIBILITY));
  }

  if (!hasNonEmptyString(queueItem?.createdAt)) {
    errors.push(createContractError(MODERATION_QUEUE_CONTRACT_ERRORS.CREATED_AT_REQUIRED, "Moderation Queue records require createdAt.", MODERATION_QUEUE_FIELDS.CREATED_AT));
  } else if (!isTimestamp(queueItem.createdAt)) {
    errors.push(createContractError(MODERATION_QUEUE_CONTRACT_ERRORS.CREATED_AT_INVALID, "Moderation Queue createdAt must be a valid timestamp.", MODERATION_QUEUE_FIELDS.CREATED_AT));
  }

  if (queueItem?.moderationNotes !== undefined && queueItem.moderationNotes !== null && typeof queueItem.moderationNotes !== "string") {
    errors.push(createContractError(MODERATION_QUEUE_CONTRACT_ERRORS.MODERATION_NOTES_INVALID, "Moderation Queue moderationNotes must be a string when provided.", MODERATION_QUEUE_FIELDS.MODERATION_NOTES));
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

export function canActorAccessModerationQueue({
  actorId,
  role,
  permission,
  queueItem,
  grantedScopes = [],
} = {}) {
  if (!hasNonEmptyString(actorId) || !isIdentityPermission(permission)) {
    return false;
  }

  return canActorPerformPermission({
    actorId,
    role,
    permission,
    scope: permission === IDENTITY_PERMISSIONS.MODERATE
      ? IDENTITY_PERMISSION_SCOPES.MARKETPLACE
      : IDENTITY_PERMISSION_SCOPES.PLATFORM,
    grantedScopes,
    object: {
      ownerId: queueItem?.ownerId,
      visibility: IDENTITY_VISIBILITY_STATES.ADMIN_ONLY,
    },
  });
}

export function canModerateQueueItem({
  actorId,
  role,
  queueItem,
  grantedScopes = [],
} = {}) {
  return canActorAccessModerationQueue({
    actorId,
    role,
    permission: IDENTITY_PERMISSIONS.MODERATE,
    queueItem,
    grantedScopes,
  }) || canActorAccessModerationQueue({
    actorId,
    role: role ?? IDENTITY_ROLES.ADMIN,
    permission: IDENTITY_PERMISSIONS.ADMINISTER,
    queueItem,
    grantedScopes,
  });
}

function collectForbiddenFieldErrors(record, errors, pathPrefix = "") {
  if (!isReferenceObject(record)) {
    return;
  }

  for (const fieldName of MODERATION_QUEUE_FORBIDDEN_FIELDS) {
    if (Object.hasOwn(record, fieldName)) {
      errors.push(createContractError(MODERATION_QUEUE_CONTRACT_ERRORS.FIELD_NOT_ALLOWED, "Moderation Queue records must not carry payment, auth session, runtime, toolState, or final moderation decision state.", pathPrefix ? `${pathPrefix}.${fieldName}` : fieldName));
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
