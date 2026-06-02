/*
Toolbox Aid
David Quesenberry
06/02/2026
releaseContract.js
*/
import {
  IDENTITY_PERMISSION_SCOPES,
  IDENTITY_PERMISSIONS,
  IDENTITY_ROLES,
  canActorPerformPermission,
  isIdentityPermission,
} from "./identityPermissionsContract.js";
import {
  GAME_MANIFEST_EXPORT_FORMATS,
  isGameManifestVersion,
} from "./gameManifestContract.js";
import {
  PROJECT_ROLES,
  PROJECT_VISIBILITY_STATES,
  canActorAccessProject,
  isProjectVisibility,
} from "./projectContract.js";

export const RELEASE_CONTRACT_ID = "gamefoundrystudio.release.contract";
export const RELEASE_CONTRACT_VERSION = "1.0.0";

export const RELEASE_FIELDS = Object.freeze({
  RELEASE_ID: "releaseId",
  OWNER: "ownerId",
  PROJECT: "projectId",
  SOURCE_MANIFEST: "sourceManifest",
  VERSION: "version",
  STATUS: "status",
  VISIBILITY: "visibility",
  PUBLISHED_AT: "publishedAt",
  RELEASE_NOTES: "releaseNotes",
});

export const RELEASE_FIELD_LIST = Object.freeze([
  RELEASE_FIELDS.RELEASE_ID,
  RELEASE_FIELDS.OWNER,
  RELEASE_FIELDS.PROJECT,
  RELEASE_FIELDS.SOURCE_MANIFEST,
  RELEASE_FIELDS.VERSION,
  RELEASE_FIELDS.STATUS,
  RELEASE_FIELDS.VISIBILITY,
  RELEASE_FIELDS.PUBLISHED_AT,
  RELEASE_FIELDS.RELEASE_NOTES,
]);

export const RELEASE_STATUS = Object.freeze({
  DRAFT: "draft",
  PUBLISHED: "published",
  RETIRED: "retired",
});

export const RELEASE_STATUS_LIST = Object.freeze([
  RELEASE_STATUS.DRAFT,
  RELEASE_STATUS.PUBLISHED,
  RELEASE_STATUS.RETIRED,
]);

export const RELEASE_RULES = Object.freeze({
  REQUIRES_OWNER: true,
  REQUIRES_PROJECT: true,
  REQUIRES_SOURCE_MANIFEST: true,
  CANNOT_BYPASS_OWNERSHIP_VISIBILITY_PERMISSIONS: true,
  PUBLISHED_IMMUTABLE_UNLESS_POLICY_ALLOWS_PATCHING: true,
  RETIRED_RELEASES_REMAIN_HISTORICALLY_REFERENCEABLE: true,
  REQUIRES_VALID_VERSION: true,
  REQUIRES_VALID_VISIBILITY: true,
});

export const RELEASE_PORTABLE_EXPORT_FIELDS = Object.freeze([
  RELEASE_FIELDS.RELEASE_ID,
  RELEASE_FIELDS.SOURCE_MANIFEST,
  RELEASE_FIELDS.VERSION,
  RELEASE_FIELDS.STATUS,
  RELEASE_FIELDS.VISIBILITY,
  RELEASE_FIELDS.PUBLISHED_AT,
  RELEASE_FIELDS.RELEASE_NOTES,
]);

export const RELEASE_CONTRACT_ERRORS = Object.freeze({
  RELEASE_ID_REQUIRED: "RELEASE_ID_REQUIRED",
  OWNER_REQUIRED: "RELEASE_OWNER_REQUIRED",
  PROJECT_REQUIRED: "RELEASE_PROJECT_REQUIRED",
  SOURCE_MANIFEST_REQUIRED: "RELEASE_SOURCE_MANIFEST_REQUIRED",
  SOURCE_MANIFEST_INVALID: "RELEASE_SOURCE_MANIFEST_INVALID",
  VERSION_REQUIRED: "RELEASE_VERSION_REQUIRED",
  VERSION_INVALID: "RELEASE_VERSION_INVALID",
  STATUS_REQUIRED: "RELEASE_STATUS_REQUIRED",
  STATUS_INVALID: "RELEASE_STATUS_INVALID",
  VISIBILITY_REQUIRED: "RELEASE_VISIBILITY_REQUIRED",
  VISIBILITY_INVALID: "RELEASE_VISIBILITY_INVALID",
  PUBLISHED_AT_REQUIRED: "RELEASE_PUBLISHED_AT_REQUIRED",
  PUBLISHED_AT_INVALID: "RELEASE_PUBLISHED_AT_INVALID",
  RELEASE_NOTES_INVALID: "RELEASE_NOTES_INVALID",
  PORTABLE_EXPORT_INVALID: "RELEASE_PORTABLE_EXPORT_INVALID",
});

export function isReleaseStatus(value) {
  return RELEASE_STATUS_LIST.includes(value);
}

export function isReleaseVisibility(value) {
  return isProjectVisibility(value);
}

export function isReleaseVersion(value) {
  return Number.isInteger(value) && value >= 1;
}

export function isReleaseSourceManifest(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.manifestId)
    && (value.version === undefined || isGameManifestVersion(value.version))
    && (value.exportFormat === undefined || value.exportFormat === GAME_MANIFEST_EXPORT_FORMATS.GAME_MANIFEST_JSON);
}

export function validateReleaseContract(release) {
  const errors = [];

  if (!hasNonEmptyString(release?.releaseId)) {
    errors.push(createContractError(
      RELEASE_CONTRACT_ERRORS.RELEASE_ID_REQUIRED,
      "Release records require releaseId.",
      RELEASE_FIELDS.RELEASE_ID
    ));
  }

  if (!hasNonEmptyString(release?.ownerId)) {
    errors.push(createContractError(
      RELEASE_CONTRACT_ERRORS.OWNER_REQUIRED,
      "Release records require ownerId.",
      RELEASE_FIELDS.OWNER
    ));
  }

  if (!hasNonEmptyString(release?.projectId)) {
    errors.push(createContractError(
      RELEASE_CONTRACT_ERRORS.PROJECT_REQUIRED,
      "Release records require projectId.",
      RELEASE_FIELDS.PROJECT
    ));
  }

  if (release?.sourceManifest === undefined || release?.sourceManifest === null) {
    errors.push(createContractError(
      RELEASE_CONTRACT_ERRORS.SOURCE_MANIFEST_REQUIRED,
      "Release records require sourceManifest.",
      RELEASE_FIELDS.SOURCE_MANIFEST
    ));
  } else if (!isReleaseSourceManifest(release.sourceManifest)) {
    errors.push(createContractError(
      RELEASE_CONTRACT_ERRORS.SOURCE_MANIFEST_INVALID,
      "Release sourceManifest must reference a valid Game Manifest.",
      RELEASE_FIELDS.SOURCE_MANIFEST
    ));
  }

  if (release?.version === undefined || release?.version === null) {
    errors.push(createContractError(
      RELEASE_CONTRACT_ERRORS.VERSION_REQUIRED,
      "Release records require version.",
      RELEASE_FIELDS.VERSION
    ));
  } else if (!isReleaseVersion(release.version)) {
    errors.push(createContractError(
      RELEASE_CONTRACT_ERRORS.VERSION_INVALID,
      "Release version must be a positive integer.",
      RELEASE_FIELDS.VERSION
    ));
  }

  if (!hasNonEmptyString(release?.status)) {
    errors.push(createContractError(
      RELEASE_CONTRACT_ERRORS.STATUS_REQUIRED,
      "Release records require status.",
      RELEASE_FIELDS.STATUS
    ));
  } else if (!isReleaseStatus(release.status)) {
    errors.push(createContractError(
      RELEASE_CONTRACT_ERRORS.STATUS_INVALID,
      "Release status must be an allowed release status.",
      RELEASE_FIELDS.STATUS
    ));
  }

  if (!hasNonEmptyString(release?.visibility)) {
    errors.push(createContractError(
      RELEASE_CONTRACT_ERRORS.VISIBILITY_REQUIRED,
      "Release records require explicit visibility.",
      RELEASE_FIELDS.VISIBILITY
    ));
  } else if (!isReleaseVisibility(release.visibility)) {
    errors.push(createContractError(
      RELEASE_CONTRACT_ERRORS.VISIBILITY_INVALID,
      "Release visibility must be an allowed project visibility state.",
      RELEASE_FIELDS.VISIBILITY
    ));
  }

  if (release?.status === RELEASE_STATUS.PUBLISHED || release?.status === RELEASE_STATUS.RETIRED) {
    if (!hasNonEmptyString(release?.publishedAt)) {
      errors.push(createContractError(
        RELEASE_CONTRACT_ERRORS.PUBLISHED_AT_REQUIRED,
        "Published and retired Release records require publishedAt.",
        RELEASE_FIELDS.PUBLISHED_AT
      ));
    } else if (!isTimestamp(release.publishedAt)) {
      errors.push(createContractError(
        RELEASE_CONTRACT_ERRORS.PUBLISHED_AT_INVALID,
        "Release publishedAt must be a valid timestamp.",
        RELEASE_FIELDS.PUBLISHED_AT
      ));
    }
  } else if (release?.publishedAt !== undefined && release.publishedAt !== null && !isTimestamp(release.publishedAt)) {
    errors.push(createContractError(
      RELEASE_CONTRACT_ERRORS.PUBLISHED_AT_INVALID,
      "Release publishedAt must be a valid timestamp when provided.",
      RELEASE_FIELDS.PUBLISHED_AT
    ));
  }

  if (release?.releaseNotes !== undefined && release.releaseNotes !== null && typeof release.releaseNotes !== "string") {
    errors.push(createContractError(
      RELEASE_CONTRACT_ERRORS.RELEASE_NOTES_INVALID,
      "Release releaseNotes must be a string when provided.",
      RELEASE_FIELDS.RELEASE_NOTES
    ));
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

export function canPatchReleaseStatus(release, policy = {}) {
  if (release?.status === RELEASE_STATUS.PUBLISHED) {
    return policy.allowPublishedReleasePatch === true;
  }

  if (release?.status === RELEASE_STATUS.RETIRED) {
    return policy.allowRetiredReleasePatch === true;
  }

  return isReleaseStatus(release?.status);
}

export function isReleaseHistoricallyReferenceable(release) {
  return release?.status === RELEASE_STATUS.RETIRED && hasNonEmptyString(release.releaseId);
}

export function isReleaseVisibleToActor({
  actorId,
  release,
  project,
  grantedProjectIds = [],
} = {}) {
  if (!hasNonEmptyString(actorId) || !release) {
    return false;
  }

  if (actorId === release.ownerId) {
    return true;
  }

  if (release.visibility === PROJECT_VISIBILITY_STATES.PUBLIC || release.visibility === PROJECT_VISIBILITY_STATES.UNLISTED) {
    return true;
  }

  if (!project || release.projectId !== project.id) {
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

export function canActorAccessRelease({
  actorId,
  projectRole,
  permission,
  release,
  project,
  grantedProjectIds = [],
  grantedScopes = [],
  policy = {},
} = {}) {
  if (!isIdentityPermission(permission) || !isReleaseVisibleToActor({ actorId, release, project, grantedProjectIds })) {
    return false;
  }

  if (permission === IDENTITY_PERMISSIONS.EDIT && !canPatchReleaseStatus(release, policy)) {
    return false;
  }

  if (actorId === release?.ownerId) {
    return canActorPerformPermission({
      actorId,
      role: IDENTITY_ROLES.OWNER,
      permission,
      scope: IDENTITY_PERMISSION_SCOPES.OWNED_OBJECT,
      object: {
        ownerId: release.ownerId,
        visibility: release.visibility,
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

export function createPortableReleaseExport(release) {
  const validation = validateReleaseContract(release);

  if (!validation.valid) {
    return Object.freeze({
      valid: false,
      errors: validation.errors,
      export: null,
    });
  }

  const portableExport = Object.freeze({
    contractId: RELEASE_CONTRACT_ID,
    contractVersion: RELEASE_CONTRACT_VERSION,
    releaseId: release.releaseId,
    sourceManifest: Object.freeze(JSON.parse(JSON.stringify(release.sourceManifest))),
    version: release.version,
    status: release.status,
    visibility: release.visibility,
    publishedAt: release.publishedAt ?? null,
    releaseNotes: release.releaseNotes ?? "",
    portable: true,
  });

  return Object.freeze({
    valid: true,
    errors: Object.freeze([]),
    export: portableExport,
  });
}

export function validatePortableReleaseExport(portableExport) {
  const errors = [];

  if (!portableExport?.portable) {
    errors.push(createContractError(
      RELEASE_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID,
      "Portable Release export must declare portable=true.",
      "portable"
    ));
  }

  if (hasNonEmptyString(portableExport?.ownerId) || hasNonEmptyString(portableExport?.projectId) || hasNonEmptyString(portableExport?.databaseId)) {
    errors.push(createContractError(
      RELEASE_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID,
      "Portable Release export must not carry database owner, project, or database ids.",
      "portable"
    ));
  }

  const portableRelease = {
    ...portableExport,
    ownerId: "portable.owner",
    projectId: "portable.project",
  };
  const validation = validateReleaseContract(portableRelease);

  validation.errors.forEach((error) => {
    errors.push(createContractError(
      RELEASE_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID,
      error.message,
      error.path
    ));
  });

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
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
