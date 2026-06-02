/*
Toolbox Aid
David Quesenberry
06/02/2026
restoreRequestContract.js
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
  RELEASE_STATUS,
  isReleaseVersion,
} from "./releaseContract.js";
import {
  VERSION_COMPATIBILITY_STATES,
} from "./versionCompatibilityContract.js";

export const RESTORE_REQUEST_CONTRACT_ID = "gamefoundrystudio.restore.request.contract";
export const RESTORE_REQUEST_CONTRACT_VERSION = "1.0.0";

export const RESTORE_REQUEST_FIELDS = Object.freeze({
  RESTORE_REQUEST_ID: "restoreRequestId",
  OWNER: "ownerId",
  PROJECT: "projectId",
  BACKUP_SNAPSHOT: "backupSnapshot",
  TARGET_RELEASE: "targetRelease",
  VERSION_COMPATIBILITY: "versionCompatibility",
  REQUESTED_AT: "requestedAt",
  RESTORE_NOTES: "restoreNotes",
});

export const RESTORE_REQUEST_FIELD_LIST = Object.freeze([
  RESTORE_REQUEST_FIELDS.RESTORE_REQUEST_ID,
  RESTORE_REQUEST_FIELDS.OWNER,
  RESTORE_REQUEST_FIELDS.PROJECT,
  RESTORE_REQUEST_FIELDS.BACKUP_SNAPSHOT,
  RESTORE_REQUEST_FIELDS.TARGET_RELEASE,
  RESTORE_REQUEST_FIELDS.VERSION_COMPATIBILITY,
  RESTORE_REQUEST_FIELDS.REQUESTED_AT,
  RESTORE_REQUEST_FIELDS.RESTORE_NOTES,
]);

export const RESTORE_REQUEST_RULES = Object.freeze({
  REQUIRES_OWNER: true,
  REQUIRES_PROJECT: true,
  REQUIRES_BACKUP_SNAPSHOT: true,
  REQUIRES_TARGET_RELEASE: true,
  REQUIRES_VERSION_COMPATIBILITY: true,
  REQUIRES_REQUESTED_AT: true,
  REQUIRES_OWNER_BACKUP_SNAPSHOT_LINKAGE: true,
  REQUIRES_OWNER_COMPATIBILITY_LINKAGE: true,
  REQUIRES_PROJECT_BACKUP_SNAPSHOT_LINKAGE: true,
  REQUIRES_PROJECT_TARGET_RELEASE_LINKAGE: true,
  REQUIRES_PROJECT_COMPATIBILITY_LINKAGE: true,
  REQUIRES_RELEASE_BACKUP_TARGET_LINKAGE: true,
  REQUIRES_RELEASE_COMPATIBILITY_LINKAGE: true,
  REQUIRES_PUBLISH_BACKUP_COMPATIBILITY_LINKAGE: true,
  SNAPSHOT_VERSION_MUST_MATCH_TARGET_RELEASE_VERSION: true,
  SNAPSHOT_SCHEMA_MUST_MATCH_COMPATIBILITY_SCHEMA: true,
  COMPATIBILITY_MUST_ALLOW_RESTORE: true,
  NO_RUNTIME_STATE: true,
  NO_TOOL_STATE: true,
  NO_FILE_BYTES: true,
  NO_AUTH_SESSION_STATE: true,
  NO_INSTALLER_STATE: true,
  NO_UPDATER_IMPLEMENTATION_DETAILS: true,
  NO_STORAGE_IMPLEMENTATION_DETAILS: true,
});

export const RESTORE_REQUEST_FORBIDDEN_FIELDS = Object.freeze([
  "activeProjectId",
  "activeToolId",
  "activeToolStateId",
  "arrayBuffer",
  "authProvider",
  "authSession",
  "authSessionState",
  "authState",
  "base64",
  "binary",
  "blob",
  "bucketName",
  "buffer",
  "bytes",
  "cdnKey",
  "cdnProvider",
  "cdnUrl",
  "content",
  "credentials",
  "databaseId",
  "dirty",
  "fileBytes",
  "fileData",
  "filePath",
  "installLog",
  "installPath",
  "installPlan",
  "installSession",
  "installState",
  "installSteps",
  "installedFiles",
  "installerImplementation",
  "installerState",
  "localStorage",
  "objectKey",
  "payload",
  "payloadJson",
  "recoveryAvailable",
  "restoreBytes",
  "restorePayload",
  "restoredPayload",
  "s3Bucket",
  "s3Key",
  "session",
  "sessionStorage",
  "signedUrl",
  "sourceToolStates",
  "storageBucket",
  "storageKey",
  "storagePath",
  "storageProvider",
  "storageRegion",
  "toolState",
  "toolStateId",
  "toolStates",
  "token",
  "updateJobId",
  "updateManifestUrl",
  "updatePlan",
  "updateSession",
  "updateState",
  "updateUrl",
  "updaterImplementation",
  "updaterSession",
  "updaterState",
  "workspace",
  "workspaceState",
]);

export const RESTORE_REQUEST_CONTRACT_ERRORS = Object.freeze({
  RESTORE_REQUEST_ID_REQUIRED: "RESTORE_REQUEST_ID_REQUIRED",
  OWNER_REQUIRED: "RESTORE_REQUEST_OWNER_REQUIRED",
  PROJECT_REQUIRED: "RESTORE_REQUEST_PROJECT_REQUIRED",
  BACKUP_SNAPSHOT_REQUIRED: "RESTORE_REQUEST_BACKUP_SNAPSHOT_REQUIRED",
  BACKUP_SNAPSHOT_INVALID: "RESTORE_REQUEST_BACKUP_SNAPSHOT_INVALID",
  TARGET_RELEASE_REQUIRED: "RESTORE_REQUEST_TARGET_RELEASE_REQUIRED",
  TARGET_RELEASE_INVALID: "RESTORE_REQUEST_TARGET_RELEASE_INVALID",
  VERSION_COMPATIBILITY_REQUIRED: "RESTORE_REQUEST_VERSION_COMPATIBILITY_REQUIRED",
  VERSION_COMPATIBILITY_INVALID: "RESTORE_REQUEST_VERSION_COMPATIBILITY_INVALID",
  REQUESTED_AT_REQUIRED: "RESTORE_REQUEST_REQUESTED_AT_REQUIRED",
  REQUESTED_AT_INVALID: "RESTORE_REQUEST_REQUESTED_AT_INVALID",
  RESTORE_NOTES_INVALID: "RESTORE_REQUEST_NOTES_INVALID",
  OWNER_BACKUP_SNAPSHOT_MISMATCH: "RESTORE_REQUEST_OWNER_BACKUP_SNAPSHOT_MISMATCH",
  OWNER_COMPATIBILITY_MISMATCH: "RESTORE_REQUEST_OWNER_COMPATIBILITY_MISMATCH",
  PROJECT_BACKUP_SNAPSHOT_MISMATCH: "RESTORE_REQUEST_PROJECT_BACKUP_SNAPSHOT_MISMATCH",
  PROJECT_TARGET_RELEASE_MISMATCH: "RESTORE_REQUEST_PROJECT_TARGET_RELEASE_MISMATCH",
  PROJECT_COMPATIBILITY_MISMATCH: "RESTORE_REQUEST_PROJECT_COMPATIBILITY_MISMATCH",
  RELEASE_BACKUP_TARGET_MISMATCH: "RESTORE_REQUEST_RELEASE_BACKUP_TARGET_MISMATCH",
  RELEASE_COMPATIBILITY_MISMATCH: "RESTORE_REQUEST_RELEASE_COMPATIBILITY_MISMATCH",
  PUBLISH_BACKUP_COMPATIBILITY_MISMATCH: "RESTORE_REQUEST_PUBLISH_BACKUP_COMPATIBILITY_MISMATCH",
  TARGET_RELEASE_VERSION_MISMATCH: "RESTORE_REQUEST_TARGET_RELEASE_VERSION_MISMATCH",
  SCHEMA_VERSION_MISMATCH: "RESTORE_REQUEST_SCHEMA_VERSION_MISMATCH",
  COMPATIBILITY_GATE_BLOCKED: "RESTORE_REQUEST_COMPATIBILITY_GATE_BLOCKED",
  FIELD_NOT_ALLOWED: "RESTORE_REQUEST_FIELD_NOT_ALLOWED",
});

export function isRestoreRequestVersion(value) {
  return Number.isInteger(value) && value >= 1;
}

export function isRestoreRequestBackupSnapshot(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.backupSnapshotId)
    && hasNonEmptyString(value.ownerId)
    && hasNonEmptyString(value.projectId)
    && hasNonEmptyString(value.releaseId)
    && hasNonEmptyString(value.publishId)
    && isRestoreRequestVersion(value.snapshotVersion)
    && isRestoreRequestVersion(value.schemaVersion);
}

export function isRestoreRequestTargetRelease(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.releaseId)
    && hasNonEmptyString(value.projectId)
    && isReleaseVersion(value.version)
    && (value.status === undefined || value.status === RELEASE_STATUS.PUBLISHED || value.status === RELEASE_STATUS.RETIRED);
}

export function isRestoreRequestVersionCompatibility(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.versionCompatibilityId)
    && hasNonEmptyString(value.ownerId)
    && hasNonEmptyString(value.projectId)
    && hasNonEmptyString(value.releaseId)
    && hasNonEmptyString(value.publishId)
    && isRestoreRequestVersion(value.targetVersion)
    && isRestoreRequestVersion(value.supportedSchemaVersion)
    && Object.values(VERSION_COMPATIBILITY_STATES).includes(value.compatibilityState);
}

export function validateRestoreRequestContract(restoreRequest) {
  const errors = [];

  collectForbiddenFieldErrors(restoreRequest, errors);

  if (!hasNonEmptyString(restoreRequest?.restoreRequestId)) {
    errors.push(createContractError(
      RESTORE_REQUEST_CONTRACT_ERRORS.RESTORE_REQUEST_ID_REQUIRED,
      "Restore Request records require restoreRequestId.",
      RESTORE_REQUEST_FIELDS.RESTORE_REQUEST_ID
    ));
  }

  if (!hasNonEmptyString(restoreRequest?.ownerId)) {
    errors.push(createContractError(
      RESTORE_REQUEST_CONTRACT_ERRORS.OWNER_REQUIRED,
      "Restore Request records require ownerId.",
      RESTORE_REQUEST_FIELDS.OWNER
    ));
  }

  if (!hasNonEmptyString(restoreRequest?.projectId)) {
    errors.push(createContractError(
      RESTORE_REQUEST_CONTRACT_ERRORS.PROJECT_REQUIRED,
      "Restore Request records require projectId.",
      RESTORE_REQUEST_FIELDS.PROJECT
    ));
  }

  validateReference(restoreRequest, errors, "backupSnapshot", RESTORE_REQUEST_FIELDS.BACKUP_SNAPSHOT, RESTORE_REQUEST_CONTRACT_ERRORS.BACKUP_SNAPSHOT_REQUIRED, RESTORE_REQUEST_CONTRACT_ERRORS.BACKUP_SNAPSHOT_INVALID, isRestoreRequestBackupSnapshot, "Restore Request records require backupSnapshot.", "Restore Request backupSnapshot must reference a Backup Snapshot.");
  validateReference(restoreRequest, errors, "targetRelease", RESTORE_REQUEST_FIELDS.TARGET_RELEASE, RESTORE_REQUEST_CONTRACT_ERRORS.TARGET_RELEASE_REQUIRED, RESTORE_REQUEST_CONTRACT_ERRORS.TARGET_RELEASE_INVALID, isRestoreRequestTargetRelease, "Restore Request records require targetRelease.", "Restore Request targetRelease must reference a published or retired Release.");
  validateReference(restoreRequest, errors, "versionCompatibility", RESTORE_REQUEST_FIELDS.VERSION_COMPATIBILITY, RESTORE_REQUEST_CONTRACT_ERRORS.VERSION_COMPATIBILITY_REQUIRED, RESTORE_REQUEST_CONTRACT_ERRORS.VERSION_COMPATIBILITY_INVALID, isRestoreRequestVersionCompatibility, "Restore Request records require versionCompatibility.", "Restore Request versionCompatibility must reference a Version Compatibility record.");

  collectLinkageErrors(restoreRequest, errors);
  validateVersionAndCompatibility(restoreRequest, errors);

  if (!hasNonEmptyString(restoreRequest?.requestedAt)) {
    errors.push(createContractError(
      RESTORE_REQUEST_CONTRACT_ERRORS.REQUESTED_AT_REQUIRED,
      "Restore Request records require requestedAt.",
      RESTORE_REQUEST_FIELDS.REQUESTED_AT
    ));
  } else if (!isTimestamp(restoreRequest.requestedAt)) {
    errors.push(createContractError(
      RESTORE_REQUEST_CONTRACT_ERRORS.REQUESTED_AT_INVALID,
      "Restore Request requestedAt must be a valid timestamp.",
      RESTORE_REQUEST_FIELDS.REQUESTED_AT
    ));
  }

  if (restoreRequest?.restoreNotes !== undefined && restoreRequest.restoreNotes !== null && typeof restoreRequest.restoreNotes !== "string") {
    errors.push(createContractError(
      RESTORE_REQUEST_CONTRACT_ERRORS.RESTORE_NOTES_INVALID,
      "Restore Request restoreNotes must be a string when provided.",
      RESTORE_REQUEST_FIELDS.RESTORE_NOTES
    ));
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

export function isRestoreRequestCompatibilityAllowed(restoreRequest) {
  return restoreRequest?.versionCompatibility?.compatibilityState === VERSION_COMPATIBILITY_STATES.COMPATIBLE
    || restoreRequest?.versionCompatibility?.compatibilityState === VERSION_COMPATIBILITY_STATES.DEPRECATED;
}

export function isRestoreRequestVisibleToActor({
  actorId,
  restoreRequest,
} = {}) {
  return hasNonEmptyString(actorId) && actorId === restoreRequest?.ownerId;
}

export function canActorAccessRestoreRequest({
  actorId,
  role,
  permission,
  restoreRequest,
  grantedScopes = [],
} = {}) {
  if (!isIdentityPermission(permission)) {
    return false;
  }

  if (actorId === restoreRequest?.ownerId) {
    return canActorPerformPermission({
      actorId,
      role: IDENTITY_ROLES.OWNER,
      permission,
      scope: IDENTITY_PERMISSION_SCOPES.OWNED_OBJECT,
      object: {
        ownerId: restoreRequest.ownerId,
        visibility: IDENTITY_VISIBILITY_STATES.PRIVATE,
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
        ownerId: restoreRequest?.ownerId,
        visibility: IDENTITY_VISIBILITY_STATES.ADMIN_ONLY,
      },
    });
  }

  return false;
}

function validateReference(record, errors, recordField, contractPath, requiredError, invalidError, referenceValidator, requiredMessage, invalidMessage) {
  if (record?.[recordField] === undefined || record?.[recordField] === null) {
    errors.push(createContractError(requiredError, requiredMessage, contractPath));
    return;
  }

  collectForbiddenFieldErrors(record[recordField], errors, contractPath);

  if (!referenceValidator(record[recordField])) {
    errors.push(createContractError(invalidError, invalidMessage, contractPath));
  }
}

function collectLinkageErrors(restoreRequest, errors) {
  compareReference(restoreRequest?.backupSnapshot, restoreRequest, "ownerId", RESTORE_REQUEST_CONTRACT_ERRORS.OWNER_BACKUP_SNAPSHOT_MISMATCH, "Restore Request backupSnapshot.ownerId must match ownerId.", RESTORE_REQUEST_FIELDS.BACKUP_SNAPSHOT, errors);
  compareReference(restoreRequest?.versionCompatibility, restoreRequest, "ownerId", RESTORE_REQUEST_CONTRACT_ERRORS.OWNER_COMPATIBILITY_MISMATCH, "Restore Request versionCompatibility.ownerId must match ownerId.", RESTORE_REQUEST_FIELDS.VERSION_COMPATIBILITY, errors);
  compareReference(restoreRequest?.backupSnapshot, restoreRequest, "projectId", RESTORE_REQUEST_CONTRACT_ERRORS.PROJECT_BACKUP_SNAPSHOT_MISMATCH, "Restore Request backupSnapshot.projectId must match projectId.", RESTORE_REQUEST_FIELDS.BACKUP_SNAPSHOT, errors);
  compareReference(restoreRequest?.targetRelease, restoreRequest, "projectId", RESTORE_REQUEST_CONTRACT_ERRORS.PROJECT_TARGET_RELEASE_MISMATCH, "Restore Request targetRelease.projectId must match projectId.", RESTORE_REQUEST_FIELDS.TARGET_RELEASE, errors);
  compareReference(restoreRequest?.versionCompatibility, restoreRequest, "projectId", RESTORE_REQUEST_CONTRACT_ERRORS.PROJECT_COMPATIBILITY_MISMATCH, "Restore Request versionCompatibility.projectId must match projectId.", RESTORE_REQUEST_FIELDS.VERSION_COMPATIBILITY, errors);
  compareReference(restoreRequest?.backupSnapshot, restoreRequest?.targetRelease, "releaseId", RESTORE_REQUEST_CONTRACT_ERRORS.RELEASE_BACKUP_TARGET_MISMATCH, "Restore Request backupSnapshot.releaseId must match targetRelease.releaseId.", RESTORE_REQUEST_FIELDS.BACKUP_SNAPSHOT, errors);
  compareReference(restoreRequest?.versionCompatibility, restoreRequest?.targetRelease, "releaseId", RESTORE_REQUEST_CONTRACT_ERRORS.RELEASE_COMPATIBILITY_MISMATCH, "Restore Request versionCompatibility.releaseId must match targetRelease.releaseId.", RESTORE_REQUEST_FIELDS.VERSION_COMPATIBILITY, errors);
  compareReference(restoreRequest?.versionCompatibility, restoreRequest?.backupSnapshot, "publishId", RESTORE_REQUEST_CONTRACT_ERRORS.PUBLISH_BACKUP_COMPATIBILITY_MISMATCH, "Restore Request versionCompatibility.publishId must match backupSnapshot.publishId.", RESTORE_REQUEST_FIELDS.VERSION_COMPATIBILITY, errors);
}

function validateVersionAndCompatibility(restoreRequest, errors) {
  if (isReferenceObject(restoreRequest?.backupSnapshot)
    && isReferenceObject(restoreRequest?.targetRelease)
    && isRestoreRequestVersion(restoreRequest.backupSnapshot.snapshotVersion)
    && isRestoreRequestVersion(restoreRequest.targetRelease.version)
    && restoreRequest.backupSnapshot.snapshotVersion !== restoreRequest.targetRelease.version) {
    errors.push(createContractError(
      RESTORE_REQUEST_CONTRACT_ERRORS.TARGET_RELEASE_VERSION_MISMATCH,
      "Restore Request backupSnapshot.snapshotVersion must match targetRelease.version.",
      RESTORE_REQUEST_FIELDS.BACKUP_SNAPSHOT
    ));
  }

  if (isReferenceObject(restoreRequest?.backupSnapshot)
    && isReferenceObject(restoreRequest?.versionCompatibility)
    && isRestoreRequestVersion(restoreRequest.backupSnapshot.schemaVersion)
    && isRestoreRequestVersion(restoreRequest.versionCompatibility.supportedSchemaVersion)
    && restoreRequest.backupSnapshot.schemaVersion !== restoreRequest.versionCompatibility.supportedSchemaVersion) {
    errors.push(createContractError(
      RESTORE_REQUEST_CONTRACT_ERRORS.SCHEMA_VERSION_MISMATCH,
      "Restore Request backupSnapshot.schemaVersion must match versionCompatibility.supportedSchemaVersion.",
      RESTORE_REQUEST_FIELDS.VERSION_COMPATIBILITY
    ));
  }

  if (isReferenceObject(restoreRequest?.versionCompatibility)
    && (restoreRequest.versionCompatibility.compatibilityState === VERSION_COMPATIBILITY_STATES.BLOCKED
      || restoreRequest.versionCompatibility.compatibilityState === VERSION_COMPATIBILITY_STATES.INCOMPATIBLE)) {
    errors.push(createContractError(
      RESTORE_REQUEST_CONTRACT_ERRORS.COMPATIBILITY_GATE_BLOCKED,
      "Restore Request requires compatible or deprecated versionCompatibility state.",
      RESTORE_REQUEST_FIELDS.VERSION_COMPATIBILITY
    ));
  }
}

function compareReference(left, right, fieldName, errorCode, message, path, errors) {
  if (isReferenceObject(left)
    && isReferenceObject(right)
    && hasNonEmptyString(left[fieldName])
    && hasNonEmptyString(right[fieldName])
    && left[fieldName] !== right[fieldName]) {
    errors.push(createContractError(errorCode, message, path));
  }
}

function collectForbiddenFieldErrors(record, errors, pathPrefix = "") {
  if (!isReferenceObject(record)) {
    return;
  }

  for (const fieldName of RESTORE_REQUEST_FORBIDDEN_FIELDS) {
    if (Object.hasOwn(record, fieldName)) {
      errors.push(createContractError(
        RESTORE_REQUEST_CONTRACT_ERRORS.FIELD_NOT_ALLOWED,
        "Restore Request records must not carry runtime, toolState, file bytes, auth session, installer, updater, or storage implementation details.",
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
