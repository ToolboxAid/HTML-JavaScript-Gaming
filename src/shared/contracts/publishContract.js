/*
Toolbox Aid
David Quesenberry
06/02/2026
publishContract.js
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
import {
  RELEASE_STATUS,
  isReleaseVersion,
} from "./releaseContract.js";

export const PUBLISH_CONTRACT_ID = "gamefoundrystudio.publish.contract";
export const PUBLISH_CONTRACT_VERSION = "1.0.0";

export const PUBLISH_FIELDS = Object.freeze({
  PUBLISH_ID: "publishId",
  OWNER: "ownerId",
  PROJECT: "projectId",
  SOURCE_RELEASE: "sourceRelease",
  VISIBILITY: "visibility",
  STATUS: "status",
  PUBLISHED_AT: "publishedAt",
  PUBLISH_NOTES: "publishNotes",
});

export const PUBLISH_FIELD_LIST = Object.freeze([
  PUBLISH_FIELDS.PUBLISH_ID,
  PUBLISH_FIELDS.OWNER,
  PUBLISH_FIELDS.PROJECT,
  PUBLISH_FIELDS.SOURCE_RELEASE,
  PUBLISH_FIELDS.VISIBILITY,
  PUBLISH_FIELDS.STATUS,
  PUBLISH_FIELDS.PUBLISHED_AT,
  PUBLISH_FIELDS.PUBLISH_NOTES,
]);

export const PUBLISH_STATUS = Object.freeze({
  DRAFT: "draft",
  READY: "ready",
  PUBLISHED: "published",
  RETIRED: "retired",
  CANCELLED: "cancelled",
});

export const PUBLISH_STATUS_LIST = Object.freeze([
  PUBLISH_STATUS.DRAFT,
  PUBLISH_STATUS.READY,
  PUBLISH_STATUS.PUBLISHED,
  PUBLISH_STATUS.RETIRED,
  PUBLISH_STATUS.CANCELLED,
]);

export const PUBLISH_RULES = Object.freeze({
  REQUIRES_OWNER: true,
  REQUIRES_PROJECT: true,
  REQUIRES_SOURCE_RELEASE: true,
  CANNOT_BYPASS_OWNERSHIP_VISIBILITY_PERMISSIONS: true,
  REQUIRES_VALID_VISIBILITY: true,
  REQUIRES_VALID_LIFECYCLE_STATUS: true,
  PUBLISHED_IMMUTABLE_UNLESS_POLICY_ALLOWS_EDIT: true,
  RETIRED_PUBLISH_REMAINS_HISTORICALLY_REFERENCEABLE: true,
  NO_RUNTIME_STATE: true,
  NO_AUTH_STATE: true,
  NO_MARKETPLACE_MODERATION_STATE: true,
  NO_TOOL_STATE_LEAKAGE: true,
});

export const PUBLISH_FORBIDDEN_FIELDS = Object.freeze([
  "activeProjectId",
  "activeToolId",
  "activeToolStateId",
  "authProvider",
  "authState",
  "databaseId",
  "dirty",
  "marketplaceModerationState",
  "marketplaceReviewState",
  "moderationState",
  "payload",
  "payloadJson",
  "recoveryAvailable",
  "session",
  "sessionStorage",
  "sourceToolStates",
  "toolState",
  "toolStateId",
  "toolStates",
  "workspace",
  "workspaceState",
]);

export const PUBLISH_CONTRACT_ERRORS = Object.freeze({
  PUBLISH_ID_REQUIRED: "PUBLISH_ID_REQUIRED",
  OWNER_REQUIRED: "PUBLISH_OWNER_REQUIRED",
  PROJECT_REQUIRED: "PUBLISH_PROJECT_REQUIRED",
  SOURCE_RELEASE_REQUIRED: "PUBLISH_SOURCE_RELEASE_REQUIRED",
  SOURCE_RELEASE_INVALID: "PUBLISH_SOURCE_RELEASE_INVALID",
  VISIBILITY_REQUIRED: "PUBLISH_VISIBILITY_REQUIRED",
  VISIBILITY_INVALID: "PUBLISH_VISIBILITY_INVALID",
  STATUS_REQUIRED: "PUBLISH_STATUS_REQUIRED",
  STATUS_INVALID: "PUBLISH_STATUS_INVALID",
  PUBLISHED_AT_REQUIRED: "PUBLISH_PUBLISHED_AT_REQUIRED",
  PUBLISHED_AT_INVALID: "PUBLISH_PUBLISHED_AT_INVALID",
  PUBLISH_NOTES_INVALID: "PUBLISH_NOTES_INVALID",
  FIELD_NOT_ALLOWED: "PUBLISH_FIELD_NOT_ALLOWED",
});

export function isPublishStatus(value) {
  return PUBLISH_STATUS_LIST.includes(value);
}

export function isPublishVisibility(value) {
  return isProjectVisibility(value);
}

export function isPublishSourceRelease(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.releaseId)
    && isReleaseVersion(value.version)
    && (value.status === undefined || value.status === RELEASE_STATUS.PUBLISHED || value.status === RELEASE_STATUS.RETIRED);
}

export function validatePublishContract(publish) {
  const errors = [];

  collectForbiddenFieldErrors(publish, errors);

  if (!hasNonEmptyString(publish?.publishId)) {
    errors.push(createContractError(
      PUBLISH_CONTRACT_ERRORS.PUBLISH_ID_REQUIRED,
      "Publish records require publishId.",
      PUBLISH_FIELDS.PUBLISH_ID
    ));
  }

  if (!hasNonEmptyString(publish?.ownerId)) {
    errors.push(createContractError(
      PUBLISH_CONTRACT_ERRORS.OWNER_REQUIRED,
      "Publish records require ownerId.",
      PUBLISH_FIELDS.OWNER
    ));
  }

  if (!hasNonEmptyString(publish?.projectId)) {
    errors.push(createContractError(
      PUBLISH_CONTRACT_ERRORS.PROJECT_REQUIRED,
      "Publish records require projectId.",
      PUBLISH_FIELDS.PROJECT
    ));
  }

  if (publish?.sourceRelease === undefined || publish?.sourceRelease === null) {
    errors.push(createContractError(
      PUBLISH_CONTRACT_ERRORS.SOURCE_RELEASE_REQUIRED,
      "Publish records require sourceRelease.",
      PUBLISH_FIELDS.SOURCE_RELEASE
    ));
  } else {
    collectForbiddenFieldErrors(publish.sourceRelease, errors, PUBLISH_FIELDS.SOURCE_RELEASE);

    if (!isPublishSourceRelease(publish.sourceRelease) || publishedSourceReleaseMismatch(publish)) {
      errors.push(createContractError(
        PUBLISH_CONTRACT_ERRORS.SOURCE_RELEASE_INVALID,
        "Publish sourceRelease must reference a valid published or retired Release.",
        PUBLISH_FIELDS.SOURCE_RELEASE
      ));
    }
  }

  if (!hasNonEmptyString(publish?.visibility)) {
    errors.push(createContractError(
      PUBLISH_CONTRACT_ERRORS.VISIBILITY_REQUIRED,
      "Publish records require explicit visibility.",
      PUBLISH_FIELDS.VISIBILITY
    ));
  } else if (!isPublishVisibility(publish.visibility)) {
    errors.push(createContractError(
      PUBLISH_CONTRACT_ERRORS.VISIBILITY_INVALID,
      "Publish visibility must be an allowed project visibility state.",
      PUBLISH_FIELDS.VISIBILITY
    ));
  }

  if (!hasNonEmptyString(publish?.status)) {
    errors.push(createContractError(
      PUBLISH_CONTRACT_ERRORS.STATUS_REQUIRED,
      "Publish records require status.",
      PUBLISH_FIELDS.STATUS
    ));
  } else if (!isPublishStatus(publish.status)) {
    errors.push(createContractError(
      PUBLISH_CONTRACT_ERRORS.STATUS_INVALID,
      "Publish status must be an allowed lifecycle status.",
      PUBLISH_FIELDS.STATUS
    ));
  }

  if (publish?.status === PUBLISH_STATUS.PUBLISHED || publish?.status === PUBLISH_STATUS.RETIRED) {
    if (!hasNonEmptyString(publish?.publishedAt)) {
      errors.push(createContractError(
        PUBLISH_CONTRACT_ERRORS.PUBLISHED_AT_REQUIRED,
        "Published and retired Publish records require publishedAt.",
        PUBLISH_FIELDS.PUBLISHED_AT
      ));
    } else if (!isTimestamp(publish.publishedAt)) {
      errors.push(createContractError(
        PUBLISH_CONTRACT_ERRORS.PUBLISHED_AT_INVALID,
        "Publish publishedAt must be a valid timestamp.",
        PUBLISH_FIELDS.PUBLISHED_AT
      ));
    }
  } else if (publish?.publishedAt !== undefined && publish.publishedAt !== null && !isTimestamp(publish.publishedAt)) {
    errors.push(createContractError(
      PUBLISH_CONTRACT_ERRORS.PUBLISHED_AT_INVALID,
      "Publish publishedAt must be a valid timestamp when provided.",
      PUBLISH_FIELDS.PUBLISHED_AT
    ));
  }

  if (publish?.publishNotes !== undefined && publish.publishNotes !== null && typeof publish.publishNotes !== "string") {
    errors.push(createContractError(
      PUBLISH_CONTRACT_ERRORS.PUBLISH_NOTES_INVALID,
      "Publish publishNotes must be a string when provided.",
      PUBLISH_FIELDS.PUBLISH_NOTES
    ));
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

export function canEditPublishStatus(publish, policy = {}) {
  if (publish?.status === PUBLISH_STATUS.PUBLISHED) {
    return policy.allowPublishedPublishEdit === true;
  }

  if (publish?.status === PUBLISH_STATUS.RETIRED) {
    return policy.allowRetiredPublishEdit === true;
  }

  if (publish?.status === PUBLISH_STATUS.CANCELLED) {
    return policy.allowCancelledPublishEdit === true;
  }

  return isPublishStatus(publish?.status);
}

export function isPublishHistoricallyReferenceable(publish) {
  return publish?.status === PUBLISH_STATUS.RETIRED
    && hasNonEmptyString(publish.publishId)
    && isPublishSourceRelease(publish.sourceRelease);
}

export function isPublishVisibleToActor({
  actorId,
  publish,
  project,
  grantedProjectIds = [],
} = {}) {
  if (!hasNonEmptyString(actorId) || !publish) {
    return false;
  }

  if (actorId === publish.ownerId) {
    return true;
  }

  if (publish.visibility === PROJECT_VISIBILITY_STATES.PUBLIC || publish.visibility === PROJECT_VISIBILITY_STATES.UNLISTED) {
    return true;
  }

  if (!project || publish.projectId !== project.id) {
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

export function canActorAccessPublish({
  actorId,
  projectRole,
  permission,
  publish,
  project,
  grantedProjectIds = [],
  grantedScopes = [],
  policy = {},
} = {}) {
  if (!isIdentityPermission(permission) || !isPublishVisibleToActor({ actorId, publish, project, grantedProjectIds })) {
    return false;
  }

  if (permission === IDENTITY_PERMISSIONS.EDIT && !canEditPublishStatus(publish, policy)) {
    return false;
  }

  if (actorId === publish?.ownerId) {
    return canActorPerformPermission({
      actorId,
      role: IDENTITY_ROLES.OWNER,
      permission,
      scope: IDENTITY_PERMISSION_SCOPES.OWNED_OBJECT,
      object: {
        ownerId: publish.ownerId,
        visibility: publish.visibility,
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

function publishedSourceReleaseMismatch(publish) {
  return publish?.status === PUBLISH_STATUS.PUBLISHED
    && publish?.sourceRelease?.status !== undefined
    && publish.sourceRelease.status !== RELEASE_STATUS.PUBLISHED;
}

function collectForbiddenFieldErrors(record, errors, pathPrefix = "") {
  if (!isReferenceObject(record)) {
    return;
  }

  for (const fieldName of PUBLISH_FORBIDDEN_FIELDS) {
    if (Object.hasOwn(record, fieldName)) {
      errors.push(createContractError(
        PUBLISH_CONTRACT_ERRORS.FIELD_NOT_ALLOWED,
        "Publish records must not carry runtime, auth, marketplace moderation, or tool state data.",
        pathPrefix ? `${pathPrefix}.${fieldName}` : fieldName
      ));
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
