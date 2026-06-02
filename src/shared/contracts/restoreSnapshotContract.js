/*
Toolbox Aid
David Quesenberry
06/02/2026
restoreSnapshotContract.js
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

export const RESTORE_SNAPSHOT_CONTRACT_ID = "gamefoundrystudio.restore.snapshot.contract";
export const RESTORE_SNAPSHOT_CONTRACT_VERSION = "1.0.0";

export const RESTORE_SNAPSHOT_FIELDS = Object.freeze({
  RESTORE_SNAPSHOT_ID: "restoreSnapshotId",
  OWNER: "ownerId",
  PROJECT: "projectId",
  BACKUP_SNAPSHOT: "backupSnapshot",
  TARGET_RELEASE: "targetRelease",
  VERSION_COMPATIBILITY: "versionCompatibility",
  RESTORED_AT: "restoredAt",
  RESTORE_NOTES: "restoreNotes",
});

export const RESTORE_SNAPSHOT_FIELD_LIST = Object.freeze([
  RESTORE_SNAPSHOT_FIELDS.RESTORE_SNAPSHOT_ID,
  RESTORE_SNAPSHOT_FIELDS.OWNER,
  RESTORE_SNAPSHOT_FIELDS.PROJECT,
  RESTORE_SNAPSHOT_FIELDS.BACKUP_SNAPSHOT,
  RESTORE_SNAPSHOT_FIELDS.TARGET_RELEASE,
  RESTORE_SNAPSHOT_FIELDS.VERSION_COMPATIBILITY,
  RESTORE_SNAPSHOT_FIELDS.RESTORED_AT,
  RESTORE_SNAPSHOT_FIELDS.RESTORE_NOTES,
]);

export const RESTORE_SNAPSHOT_RULES = Object.freeze({
  REQUIRES_OWNER: true,
  REQUIRES_PROJECT: true,
  REQUIRES_BACKUP_SNAPSHOT: true,
  REQUIRES_TARGET_RELEASE: true,
  REQUIRES_VERSION_COMPATIBILITY: true,
  REQUIRES_RESTORED_AT: true,
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

export const RESTORE_SNAPSHOT_FORBIDDEN_FIELDS = Object.freeze([
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

export const RESTORE_SNAPSHOT_CONTRACT_ERRORS = Object.freeze({
  RESTORE_SNAPSHOT_ID_REQUIRED: "RESTORE_SNAPSHOT_ID_REQUIRED",
  OWNER_REQUIRED: "RESTORE_SNAPSHOT_OWNER_REQUIRED",
  PROJECT_REQUIRED: "RESTORE_SNAPSHOT_PROJECT_REQUIRED",
  BACKUP_SNAPSHOT_REQUIRED: "RESTORE_SNAPSHOT_BACKUP_SNAPSHOT_REQUIRED",
  BACKUP_SNAPSHOT_INVALID: "RESTORE_SNAPSHOT_BACKUP_SNAPSHOT_INVALID",
  TARGET_RELEASE_REQUIRED: "RESTORE_SNAPSHOT_TARGET_RELEASE_REQUIRED",
  TARGET_RELEASE_INVALID: "RESTORE_SNAPSHOT_TARGET_RELEASE_INVALID",
  VERSION_COMPATIBILITY_REQUIRED: "RESTORE_SNAPSHOT_VERSION_COMPATIBILITY_REQUIRED",
  VERSION_COMPATIBILITY_INVALID: "RESTORE_SNAPSHOT_VERSION_COMPATIBILITY_INVALID",
  RESTORED_AT_REQUIRED: "RESTORE_SNAPSHOT_RESTORED_AT_REQUIRED",
  RESTORED_AT_INVALID: "RESTORE_SNAPSHOT_RESTORED_AT_INVALID",
  RESTORE_NOTES_INVALID: "RESTORE_SNAPSHOT_NOTES_INVALID",
  OWNER_BACKUP_SNAPSHOT_MISMATCH: "RESTORE_SNAPSHOT_OWNER_BACKUP_SNAPSHOT_MISMATCH",
  OWNER_COMPATIBILITY_MISMATCH: "RESTORE_SNAPSHOT_OWNER_COMPATIBILITY_MISMATCH",
  PROJECT_BACKUP_SNAPSHOT_MISMATCH: "RESTORE_SNAPSHOT_PROJECT_BACKUP_SNAPSHOT_MISMATCH",
  PROJECT_TARGET_RELEASE_MISMATCH: "RESTORE_SNAPSHOT_PROJECT_TARGET_RELEASE_MISMATCH",
  PROJECT_COMPATIBILITY_MISMATCH: "RESTORE_SNAPSHOT_PROJECT_COMPATIBILITY_MISMATCH",
  RELEASE_BACKUP_TARGET_MISMATCH: "RESTORE_SNAPSHOT_RELEASE_BACKUP_TARGET_MISMATCH",
  RELEASE_COMPATIBILITY_MISMATCH: "RESTORE_SNAPSHOT_RELEASE_COMPATIBILITY_MISMATCH",
  PUBLISH_BACKUP_COMPATIBILITY_MISMATCH: "RESTORE_SNAPSHOT_PUBLISH_BACKUP_COMPATIBILITY_MISMATCH",
  TARGET_RELEASE_VERSION_MISMATCH: "RESTORE_SNAPSHOT_TARGET_RELEASE_VERSION_MISMATCH",
  SCHEMA_VERSION_MISMATCH: "RESTORE_SNAPSHOT_SCHEMA_VERSION_MISMATCH",
  COMPATIBILITY_GATE_BLOCKED: "RESTORE_SNAPSHOT_COMPATIBILITY_GATE_BLOCKED",
  FIELD_NOT_ALLOWED: "RESTORE_SNAPSHOT_FIELD_NOT_ALLOWED",
});

export function isRestoreSnapshotVersion(value) {
  return Number.isInteger(value) && value >= 1;
}

export function isRestoreSnapshotBackupSnapshot(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.backupSnapshotId)
    && hasNonEmptyString(value.ownerId)
    && hasNonEmptyString(value.projectId)
    && hasNonEmptyString(value.releaseId)
    && hasNonEmptyString(value.publishId)
    && isRestoreSnapshotVersion(value.snapshotVersion)
    && isRestoreSnapshotVersion(value.schemaVersion);
}

export function isRestoreSnapshotTargetRelease(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.releaseId)
    && hasNonEmptyString(value.projectId)
    && isReleaseVersion(value.version)
    && (value.status === undefined || value.status === RELEASE_STATUS.PUBLISHED || value.status === RELEASE_STATUS.RETIRED);
}

export function isRestoreSnapshotVersionCompatibility(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.versionCompatibilityId)
    && hasNonEmptyString(value.ownerId)
    && hasNonEmptyString(value.projectId)
    && hasNonEmptyString(value.releaseId)
    && hasNonEmptyString(value.publishId)
    && isRestoreSnapshotVersion(value.targetVersion)
    && isRestoreSnapshotVersion(value.supportedSchemaVersion)
    && Object.values(VERSION_COMPATIBILITY_STATES).includes(value.compatibilityState);
}

export function validateRestoreSnapshotContract(restoreSnapshot) {
  const errors = [];

  collectForbiddenFieldErrors(restoreSnapshot, errors);

  if (!hasNonEmptyString(restoreSnapshot?.restoreSnapshotId)) {
    errors.push(createContractError(
      RESTORE_SNAPSHOT_CONTRACT_ERRORS.RESTORE_SNAPSHOT_ID_REQUIRED,
      "Restore Snapshot records require restoreSnapshotId.",
      RESTORE_SNAPSHOT_FIELDS.RESTORE_SNAPSHOT_ID
    ));
  }

  if (!hasNonEmptyString(restoreSnapshot?.ownerId)) {
    errors.push(createContractError(
      RESTORE_SNAPSHOT_CONTRACT_ERRORS.OWNER_REQUIRED,
      "Restore Snapshot records require ownerId.",
      RESTORE_SNAPSHOT_FIELDS.OWNER
    ));
  }

  if (!hasNonEmptyString(restoreSnapshot?.projectId)) {
    errors.push(createContractError(
      RESTORE_SNAPSHOT_CONTRACT_ERRORS.PROJECT_REQUIRED,
      "Restore Snapshot records require projectId.",
      RESTORE_SNAPSHOT_FIELDS.PROJECT
    ));
  }

  validateReference(restoreSnapshot, errors, "backupSnapshot", RESTORE_SNAPSHOT_FIELDS.BACKUP_SNAPSHOT, RESTORE_SNAPSHOT_CONTRACT_ERRORS.BACKUP_SNAPSHOT_REQUIRED, RESTORE_SNAPSHOT_CONTRACT_ERRORS.BACKUP_SNAPSHOT_INVALID, isRestoreSnapshotBackupSnapshot, "Restore Snapshot records require backupSnapshot.", "Restore Snapshot backupSnapshot must reference a Backup Snapshot.");
  validateReference(restoreSnapshot, errors, "targetRelease", RESTORE_SNAPSHOT_FIELDS.TARGET_RELEASE, RESTORE_SNAPSHOT_CONTRACT_ERRORS.TARGET_RELEASE_REQUIRED, RESTORE_SNAPSHOT_CONTRACT_ERRORS.TARGET_RELEASE_INVALID, isRestoreSnapshotTargetRelease, "Restore Snapshot records require targetRelease.", "Restore Snapshot targetRelease must reference a published or retired Release.");
  validateReference(restoreSnapshot, errors, "versionCompatibility", RESTORE_SNAPSHOT_FIELDS.VERSION_COMPATIBILITY, RESTORE_SNAPSHOT_CONTRACT_ERRORS.VERSION_COMPATIBILITY_REQUIRED, RESTORE_SNAPSHOT_CONTRACT_ERRORS.VERSION_COMPATIBILITY_INVALID, isRestoreSnapshotVersionCompatibility, "Restore Snapshot records require versionCompatibility.", "Restore Snapshot versionCompatibility must reference a Version Compatibility record.");

  collectLinkageErrors(restoreSnapshot, errors);
  validateVersionAndCompatibility(restoreSnapshot, errors);

  if (!hasNonEmptyString(restoreSnapshot?.restoredAt)) {
    errors.push(createContractError(
      RESTORE_SNAPSHOT_CONTRACT_ERRORS.RESTORED_AT_REQUIRED,
      "Restore Snapshot records require restoredAt.",
      RESTORE_SNAPSHOT_FIELDS.RESTORED_AT
    ));
  } else if (!isTimestamp(restoreSnapshot.restoredAt)) {
    errors.push(createContractError(
      RESTORE_SNAPSHOT_CONTRACT_ERRORS.RESTORED_AT_INVALID,
      "Restore Snapshot restoredAt must be a valid timestamp.",
      RESTORE_SNAPSHOT_FIELDS.RESTORED_AT
    ));
  }

  if (restoreSnapshot?.restoreNotes !== undefined && restoreSnapshot.restoreNotes !== null && typeof restoreSnapshot.restoreNotes !== "string") {
    errors.push(createContractError(
      RESTORE_SNAPSHOT_CONTRACT_ERRORS.RESTORE_NOTES_INVALID,
      "Restore Snapshot restoreNotes must be a string when provided.",
      RESTORE_SNAPSHOT_FIELDS.RESTORE_NOTES
    ));
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

export function isRestoreSnapshotCompatibilityAllowed(restoreSnapshot) {
  return restoreSnapshot?.versionCompatibility?.compatibilityState === VERSION_COMPATIBILITY_STATES.COMPATIBLE
    || restoreSnapshot?.versionCompatibility?.compatibilityState === VERSION_COMPATIBILITY_STATES.DEPRECATED;
}

export function isRestoreSnapshotVisibleToActor({
  actorId,
  restoreSnapshot,
} = {}) {
  return hasNonEmptyString(actorId) && actorId === restoreSnapshot?.ownerId;
}

export function canActorAccessRestoreSnapshot({
  actorId,
  role,
  permission,
  restoreSnapshot,
  grantedScopes = [],
} = {}) {
  if (!isIdentityPermission(permission)) {
    return false;
  }

  if (actorId === restoreSnapshot?.ownerId) {
    return canActorPerformPermission({
      actorId,
      role: IDENTITY_ROLES.OWNER,
      permission,
      scope: IDENTITY_PERMISSION_SCOPES.OWNED_OBJECT,
      object: {
        ownerId: restoreSnapshot.ownerId,
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
        ownerId: restoreSnapshot?.ownerId,
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

function collectLinkageErrors(restoreSnapshot, errors) {
  compareReference(restoreSnapshot?.backupSnapshot, restoreSnapshot, "ownerId", RESTORE_SNAPSHOT_CONTRACT_ERRORS.OWNER_BACKUP_SNAPSHOT_MISMATCH, "Restore Snapshot backupSnapshot.ownerId must match ownerId.", RESTORE_SNAPSHOT_FIELDS.BACKUP_SNAPSHOT, errors);
  compareReference(restoreSnapshot?.versionCompatibility, restoreSnapshot, "ownerId", RESTORE_SNAPSHOT_CONTRACT_ERRORS.OWNER_COMPATIBILITY_MISMATCH, "Restore Snapshot versionCompatibility.ownerId must match ownerId.", RESTORE_SNAPSHOT_FIELDS.VERSION_COMPATIBILITY, errors);
  compareReference(restoreSnapshot?.backupSnapshot, restoreSnapshot, "projectId", RESTORE_SNAPSHOT_CONTRACT_ERRORS.PROJECT_BACKUP_SNAPSHOT_MISMATCH, "Restore Snapshot backupSnapshot.projectId must match projectId.", RESTORE_SNAPSHOT_FIELDS.BACKUP_SNAPSHOT, errors);
  compareReference(restoreSnapshot?.targetRelease, restoreSnapshot, "projectId", RESTORE_SNAPSHOT_CONTRACT_ERRORS.PROJECT_TARGET_RELEASE_MISMATCH, "Restore Snapshot targetRelease.projectId must match projectId.", RESTORE_SNAPSHOT_FIELDS.TARGET_RELEASE, errors);
  compareReference(restoreSnapshot?.versionCompatibility, restoreSnapshot, "projectId", RESTORE_SNAPSHOT_CONTRACT_ERRORS.PROJECT_COMPATIBILITY_MISMATCH, "Restore Snapshot versionCompatibility.projectId must match projectId.", RESTORE_SNAPSHOT_FIELDS.VERSION_COMPATIBILITY, errors);
  compareReference(restoreSnapshot?.backupSnapshot, restoreSnapshot?.targetRelease, "releaseId", RESTORE_SNAPSHOT_CONTRACT_ERRORS.RELEASE_BACKUP_TARGET_MISMATCH, "Restore Snapshot backupSnapshot.releaseId must match targetRelease.releaseId.", RESTORE_SNAPSHOT_FIELDS.BACKUP_SNAPSHOT, errors);
  compareReference(restoreSnapshot?.versionCompatibility, restoreSnapshot?.targetRelease, "releaseId", RESTORE_SNAPSHOT_CONTRACT_ERRORS.RELEASE_COMPATIBILITY_MISMATCH, "Restore Snapshot versionCompatibility.releaseId must match targetRelease.releaseId.", RESTORE_SNAPSHOT_FIELDS.VERSION_COMPATIBILITY, errors);
  compareReference(restoreSnapshot?.versionCompatibility, restoreSnapshot?.backupSnapshot, "publishId", RESTORE_SNAPSHOT_CONTRACT_ERRORS.PUBLISH_BACKUP_COMPATIBILITY_MISMATCH, "Restore Snapshot versionCompatibility.publishId must match backupSnapshot.publishId.", RESTORE_SNAPSHOT_FIELDS.VERSION_COMPATIBILITY, errors);
}

function validateVersionAndCompatibility(restoreSnapshot, errors) {
  if (isReferenceObject(restoreSnapshot?.backupSnapshot)
    && isReferenceObject(restoreSnapshot?.targetRelease)
    && isRestoreSnapshotVersion(restoreSnapshot.backupSnapshot.snapshotVersion)
    && isRestoreSnapshotVersion(restoreSnapshot.targetRelease.version)
    && restoreSnapshot.backupSnapshot.snapshotVersion !== restoreSnapshot.targetRelease.version) {
    errors.push(createContractError(
      RESTORE_SNAPSHOT_CONTRACT_ERRORS.TARGET_RELEASE_VERSION_MISMATCH,
      "Restore Snapshot backupSnapshot.snapshotVersion must match targetRelease.version.",
      RESTORE_SNAPSHOT_FIELDS.BACKUP_SNAPSHOT
    ));
  }

  if (isReferenceObject(restoreSnapshot?.backupSnapshot)
    && isReferenceObject(restoreSnapshot?.versionCompatibility)
    && isRestoreSnapshotVersion(restoreSnapshot.backupSnapshot.schemaVersion)
    && isRestoreSnapshotVersion(restoreSnapshot.versionCompatibility.supportedSchemaVersion)
    && restoreSnapshot.backupSnapshot.schemaVersion !== restoreSnapshot.versionCompatibility.supportedSchemaVersion) {
    errors.push(createContractError(
      RESTORE_SNAPSHOT_CONTRACT_ERRORS.SCHEMA_VERSION_MISMATCH,
      "Restore Snapshot backupSnapshot.schemaVersion must match versionCompatibility.supportedSchemaVersion.",
      RESTORE_SNAPSHOT_FIELDS.VERSION_COMPATIBILITY
    ));
  }

  if (isReferenceObject(restoreSnapshot?.versionCompatibility)
    && (restoreSnapshot.versionCompatibility.compatibilityState === VERSION_COMPATIBILITY_STATES.BLOCKED
      || restoreSnapshot.versionCompatibility.compatibilityState === VERSION_COMPATIBILITY_STATES.INCOMPATIBLE)) {
    errors.push(createContractError(
      RESTORE_SNAPSHOT_CONTRACT_ERRORS.COMPATIBILITY_GATE_BLOCKED,
      "Restore Snapshot requires compatible or deprecated versionCompatibility state.",
      RESTORE_SNAPSHOT_FIELDS.VERSION_COMPATIBILITY
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

  for (const fieldName of RESTORE_SNAPSHOT_FORBIDDEN_FIELDS) {
    if (Object.hasOwn(record, fieldName)) {
      errors.push(createContractError(
        RESTORE_SNAPSHOT_CONTRACT_ERRORS.FIELD_NOT_ALLOWED,
        "Restore Snapshot records must not carry runtime, toolState, file bytes, auth session, installer, updater, or storage implementation details.",
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
