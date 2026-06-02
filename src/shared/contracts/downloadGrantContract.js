/*
Toolbox Aid
David Quesenberry
06/02/2026
downloadGrantContract.js
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
  ENTITLEMENT_TYPES,
} from "./entitlementContract.js";
import {
  MARKETPLACE_LISTING_STATUS,
} from "./marketplaceListingContract.js";
import {
  PUBLISH_STATUS,
} from "./publishContract.js";
import {
  RELEASE_STATUS,
  isReleaseVersion,
} from "./releaseContract.js";

export const DOWNLOAD_GRANT_CONTRACT_ID = "gamefoundrystudio.download.grant.contract";
export const DOWNLOAD_GRANT_CONTRACT_VERSION = "1.0.0";

export const DOWNLOAD_GRANT_FIELDS = Object.freeze({
  DOWNLOAD_GRANT_ID: "downloadGrantId",
  OWNER: "ownerId",
  PROJECT: "projectId",
  ENTITLEMENT: "entitlement",
  MARKETPLACE_LISTING: "marketplaceListing",
  SOURCE_RELEASE: "sourceRelease",
  SOURCE_PUBLISH: "sourcePublish",
  GRANT_STATUS: "grantStatus",
  GRANTED_AT: "grantedAt",
  EXPIRES_AT: "expiresAt",
  REVOKED_AT: "revokedAt",
  CONSUMED_AT: "consumedAt",
  GRANT_NOTES: "grantNotes",
});

export const DOWNLOAD_GRANT_FIELD_LIST = Object.freeze([
  DOWNLOAD_GRANT_FIELDS.DOWNLOAD_GRANT_ID,
  DOWNLOAD_GRANT_FIELDS.OWNER,
  DOWNLOAD_GRANT_FIELDS.PROJECT,
  DOWNLOAD_GRANT_FIELDS.ENTITLEMENT,
  DOWNLOAD_GRANT_FIELDS.MARKETPLACE_LISTING,
  DOWNLOAD_GRANT_FIELDS.SOURCE_RELEASE,
  DOWNLOAD_GRANT_FIELDS.SOURCE_PUBLISH,
  DOWNLOAD_GRANT_FIELDS.GRANT_STATUS,
  DOWNLOAD_GRANT_FIELDS.GRANTED_AT,
  DOWNLOAD_GRANT_FIELDS.EXPIRES_AT,
  DOWNLOAD_GRANT_FIELDS.REVOKED_AT,
  DOWNLOAD_GRANT_FIELDS.CONSUMED_AT,
  DOWNLOAD_GRANT_FIELDS.GRANT_NOTES,
]);

export const DOWNLOAD_GRANT_STATUS = Object.freeze({
  ACTIVE: "active",
  EXPIRED: "expired",
  REVOKED: "revoked",
  CONSUMED: "consumed",
});

export const DOWNLOAD_GRANT_STATUS_LIST = Object.freeze([
  DOWNLOAD_GRANT_STATUS.ACTIVE,
  DOWNLOAD_GRANT_STATUS.EXPIRED,
  DOWNLOAD_GRANT_STATUS.REVOKED,
  DOWNLOAD_GRANT_STATUS.CONSUMED,
]);

export const DOWNLOAD_GRANT_RULES = Object.freeze({
  REQUIRES_OWNER: true,
  REQUIRES_PROJECT: true,
  REQUIRES_ENTITLEMENT: true,
  REQUIRES_MARKETPLACE_LISTING: true,
  REQUIRES_SOURCE_RELEASE: true,
  REQUIRES_SOURCE_PUBLISH: true,
  REQUIRES_VALID_GRANT_STATUS: true,
  REQUIRES_GRANTED_AT: true,
  ACTIVE_GRANTS_REQUIRE_FUTURE_EXPIRATION: true,
  EXPIRED_GRANTS_REQUIRE_EXPIRED_EXPIRATION: true,
  REVOKED_GRANTS_REQUIRE_REVOKED_AT: true,
  CONSUMED_GRANTS_REQUIRE_CONSUMED_AT: true,
  REQUIRES_OWNER_ENTITLEMENT_LINKAGE: true,
  REQUIRES_PROJECT_ENTITLEMENT_LINKAGE: true,
  REQUIRES_ENTITLEMENT_LISTING_LINKAGE: true,
  REQUIRES_ENTITLEMENT_RELEASE_LINKAGE: true,
  REQUIRES_ENTITLEMENT_PUBLISH_LINKAGE: true,
  REQUIRES_LISTING_PROJECT_LINKAGE: true,
  REQUIRES_LISTING_RELEASE_LINKAGE: true,
  REQUIRES_LISTING_PUBLISH_LINKAGE: true,
  REQUIRES_RELEASE_PUBLISH_LINKAGE: true,
  NO_PAYMENT_STATE: true,
  NO_AUTH_SESSION_STATE: true,
  NO_RUNTIME_STATE: true,
  NO_TOOL_STATE: true,
  NO_FILE_BYTES: true,
  NO_CDN_IMPLEMENTATION_DETAILS: true,
  NO_STORAGE_IMPLEMENTATION_DETAILS: true,
});

export const DOWNLOAD_GRANT_FORBIDDEN_FIELDS = Object.freeze([
  "activeProjectId",
  "activeToolId",
  "activeToolStateId",
  "arrayBuffer",
  "authProvider",
  "authSession",
  "authSessionState",
  "authState",
  "azureContainer",
  "base64",
  "binary",
  "blob",
  "buffer",
  "bytes",
  "cdnKey",
  "cdnProvider",
  "cdnUrl",
  "checkoutSession",
  "cloudfrontDistributionId",
  "content",
  "credentials",
  "databaseId",
  "dirty",
  "downloadSession",
  "downloadState",
  "downloadToken",
  "downloadUrl",
  "edgeCacheKey",
  "fileBytes",
  "fileData",
  "gcsBucket",
  "identityProvider",
  "invoice",
  "localStorage",
  "objectStoreKey",
  "paymentIntent",
  "paymentMethod",
  "paymentProvider",
  "paymentState",
  "paymentStatus",
  "payload",
  "payloadJson",
  "receipt",
  "recoveryAvailable",
  "s3Bucket",
  "s3Key",
  "session",
  "sessionStorage",
  "signedUrl",
  "sourceToolStates",
  "storageBucket",
  "storageKey",
  "stripeSession",
  "token",
  "toolState",
  "toolStateId",
  "toolStates",
  "transactionId",
  "workspace",
  "workspaceState",
]);

export const DOWNLOAD_GRANT_CONTRACT_ERRORS = Object.freeze({
  DOWNLOAD_GRANT_ID_REQUIRED: "DOWNLOAD_GRANT_ID_REQUIRED",
  OWNER_REQUIRED: "DOWNLOAD_GRANT_OWNER_REQUIRED",
  PROJECT_REQUIRED: "DOWNLOAD_GRANT_PROJECT_REQUIRED",
  ENTITLEMENT_REQUIRED: "DOWNLOAD_GRANT_ENTITLEMENT_REQUIRED",
  ENTITLEMENT_INVALID: "DOWNLOAD_GRANT_ENTITLEMENT_INVALID",
  MARKETPLACE_LISTING_REQUIRED: "DOWNLOAD_GRANT_MARKETPLACE_LISTING_REQUIRED",
  MARKETPLACE_LISTING_INVALID: "DOWNLOAD_GRANT_MARKETPLACE_LISTING_INVALID",
  SOURCE_RELEASE_REQUIRED: "DOWNLOAD_GRANT_SOURCE_RELEASE_REQUIRED",
  SOURCE_RELEASE_INVALID: "DOWNLOAD_GRANT_SOURCE_RELEASE_INVALID",
  SOURCE_PUBLISH_REQUIRED: "DOWNLOAD_GRANT_SOURCE_PUBLISH_REQUIRED",
  SOURCE_PUBLISH_INVALID: "DOWNLOAD_GRANT_SOURCE_PUBLISH_INVALID",
  OWNER_ENTITLEMENT_MISMATCH: "DOWNLOAD_GRANT_OWNER_ENTITLEMENT_MISMATCH",
  PROJECT_ENTITLEMENT_MISMATCH: "DOWNLOAD_GRANT_PROJECT_ENTITLEMENT_MISMATCH",
  ENTITLEMENT_LISTING_MISMATCH: "DOWNLOAD_GRANT_ENTITLEMENT_LISTING_MISMATCH",
  ENTITLEMENT_RELEASE_MISMATCH: "DOWNLOAD_GRANT_ENTITLEMENT_RELEASE_MISMATCH",
  ENTITLEMENT_PUBLISH_MISMATCH: "DOWNLOAD_GRANT_ENTITLEMENT_PUBLISH_MISMATCH",
  LISTING_PROJECT_MISMATCH: "DOWNLOAD_GRANT_LISTING_PROJECT_MISMATCH",
  LISTING_RELEASE_MISMATCH: "DOWNLOAD_GRANT_LISTING_RELEASE_MISMATCH",
  LISTING_PUBLISH_MISMATCH: "DOWNLOAD_GRANT_LISTING_PUBLISH_MISMATCH",
  RELEASE_PUBLISH_MISMATCH: "DOWNLOAD_GRANT_RELEASE_PUBLISH_MISMATCH",
  GRANT_STATUS_REQUIRED: "DOWNLOAD_GRANT_STATUS_REQUIRED",
  GRANT_STATUS_INVALID: "DOWNLOAD_GRANT_STATUS_INVALID",
  GRANTED_AT_REQUIRED: "DOWNLOAD_GRANT_GRANTED_AT_REQUIRED",
  GRANTED_AT_INVALID: "DOWNLOAD_GRANT_GRANTED_AT_INVALID",
  EXPIRES_AT_REQUIRED: "DOWNLOAD_GRANT_EXPIRES_AT_REQUIRED",
  EXPIRES_AT_INVALID: "DOWNLOAD_GRANT_EXPIRES_AT_INVALID",
  ACTIVE_GRANT_EXPIRED: "DOWNLOAD_GRANT_ACTIVE_EXPIRED",
  EXPIRED_GRANT_NOT_EXPIRED: "DOWNLOAD_GRANT_EXPIRED_NOT_EXPIRED",
  REVOKED_AT_REQUIRED: "DOWNLOAD_GRANT_REVOKED_AT_REQUIRED",
  REVOKED_AT_INVALID: "DOWNLOAD_GRANT_REVOKED_AT_INVALID",
  CONSUMED_AT_REQUIRED: "DOWNLOAD_GRANT_CONSUMED_AT_REQUIRED",
  CONSUMED_AT_INVALID: "DOWNLOAD_GRANT_CONSUMED_AT_INVALID",
  GRANT_NOTES_INVALID: "DOWNLOAD_GRANT_NOTES_INVALID",
  FIELD_NOT_ALLOWED: "DOWNLOAD_GRANT_FIELD_NOT_ALLOWED",
});

export function isDownloadGrantStatus(value) {
  return DOWNLOAD_GRANT_STATUS_LIST.includes(value);
}

export function isDownloadGrantEntitlement(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.entitlementId)
    && hasNonEmptyString(value.ownerId)
    && hasNonEmptyString(value.projectId)
    && hasNonEmptyString(value.listingId)
    && hasNonEmptyString(value.releaseId)
    && hasNonEmptyString(value.publishId)
    && (value.entitlementType === ENTITLEMENT_TYPES.OWNED
      || value.entitlementType === ENTITLEMENT_TYPES.LICENSED
      || value.entitlementType === ENTITLEMENT_TYPES.GRANTED);
}

export function isDownloadGrantMarketplaceListing(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.listingId)
    && hasNonEmptyString(value.projectId)
    && hasNonEmptyString(value.releaseId)
    && hasNonEmptyString(value.publishId)
    && (value.status === undefined || value.status === MARKETPLACE_LISTING_STATUS.LISTED || value.status === MARKETPLACE_LISTING_STATUS.RETIRED);
}

export function isDownloadGrantSourceRelease(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.releaseId)
    && isReleaseVersion(value.version)
    && (value.status === undefined || value.status === RELEASE_STATUS.PUBLISHED || value.status === RELEASE_STATUS.RETIRED);
}

export function isDownloadGrantSourcePublish(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.publishId)
    && hasNonEmptyString(value.releaseId)
    && (value.status === undefined || value.status === PUBLISH_STATUS.PUBLISHED || value.status === PUBLISH_STATUS.RETIRED);
}

export function validateDownloadGrantContract(downloadGrant, options = {}) {
  const errors = [];
  const referenceTime = getReferenceTime(options);

  collectForbiddenFieldErrors(downloadGrant, errors);

  if (!hasNonEmptyString(downloadGrant?.downloadGrantId)) {
    errors.push(createContractError(
      DOWNLOAD_GRANT_CONTRACT_ERRORS.DOWNLOAD_GRANT_ID_REQUIRED,
      "Download Grant records require downloadGrantId.",
      DOWNLOAD_GRANT_FIELDS.DOWNLOAD_GRANT_ID
    ));
  }

  if (!hasNonEmptyString(downloadGrant?.ownerId)) {
    errors.push(createContractError(
      DOWNLOAD_GRANT_CONTRACT_ERRORS.OWNER_REQUIRED,
      "Download Grant records require ownerId.",
      DOWNLOAD_GRANT_FIELDS.OWNER
    ));
  }

  if (!hasNonEmptyString(downloadGrant?.projectId)) {
    errors.push(createContractError(
      DOWNLOAD_GRANT_CONTRACT_ERRORS.PROJECT_REQUIRED,
      "Download Grant records require projectId.",
      DOWNLOAD_GRANT_FIELDS.PROJECT
    ));
  }

  if (downloadGrant?.entitlement === undefined || downloadGrant?.entitlement === null) {
    errors.push(createContractError(
      DOWNLOAD_GRANT_CONTRACT_ERRORS.ENTITLEMENT_REQUIRED,
      "Download Grant records require entitlement.",
      DOWNLOAD_GRANT_FIELDS.ENTITLEMENT
    ));
  } else {
    collectForbiddenFieldErrors(downloadGrant.entitlement, errors, DOWNLOAD_GRANT_FIELDS.ENTITLEMENT);

    if (!isDownloadGrantEntitlement(downloadGrant.entitlement)) {
      errors.push(createContractError(
        DOWNLOAD_GRANT_CONTRACT_ERRORS.ENTITLEMENT_INVALID,
        "Download Grant entitlement must reference an active Entitlement.",
        DOWNLOAD_GRANT_FIELDS.ENTITLEMENT
      ));
    }
  }

  if (downloadGrant?.marketplaceListing === undefined || downloadGrant?.marketplaceListing === null) {
    errors.push(createContractError(
      DOWNLOAD_GRANT_CONTRACT_ERRORS.MARKETPLACE_LISTING_REQUIRED,
      "Download Grant records require marketplaceListing.",
      DOWNLOAD_GRANT_FIELDS.MARKETPLACE_LISTING
    ));
  } else {
    collectForbiddenFieldErrors(downloadGrant.marketplaceListing, errors, DOWNLOAD_GRANT_FIELDS.MARKETPLACE_LISTING);

    if (!isDownloadGrantMarketplaceListing(downloadGrant.marketplaceListing)) {
      errors.push(createContractError(
        DOWNLOAD_GRANT_CONTRACT_ERRORS.MARKETPLACE_LISTING_INVALID,
        "Download Grant marketplaceListing must reference a listed or retired Marketplace Listing.",
        DOWNLOAD_GRANT_FIELDS.MARKETPLACE_LISTING
      ));
    }
  }

  if (downloadGrant?.sourceRelease === undefined || downloadGrant?.sourceRelease === null) {
    errors.push(createContractError(
      DOWNLOAD_GRANT_CONTRACT_ERRORS.SOURCE_RELEASE_REQUIRED,
      "Download Grant records require sourceRelease.",
      DOWNLOAD_GRANT_FIELDS.SOURCE_RELEASE
    ));
  } else {
    collectForbiddenFieldErrors(downloadGrant.sourceRelease, errors, DOWNLOAD_GRANT_FIELDS.SOURCE_RELEASE);

    if (!isDownloadGrantSourceRelease(downloadGrant.sourceRelease)) {
      errors.push(createContractError(
        DOWNLOAD_GRANT_CONTRACT_ERRORS.SOURCE_RELEASE_INVALID,
        "Download Grant sourceRelease must reference a published or retired Release.",
        DOWNLOAD_GRANT_FIELDS.SOURCE_RELEASE
      ));
    }
  }

  if (downloadGrant?.sourcePublish === undefined || downloadGrant?.sourcePublish === null) {
    errors.push(createContractError(
      DOWNLOAD_GRANT_CONTRACT_ERRORS.SOURCE_PUBLISH_REQUIRED,
      "Download Grant records require sourcePublish.",
      DOWNLOAD_GRANT_FIELDS.SOURCE_PUBLISH
    ));
  } else {
    collectForbiddenFieldErrors(downloadGrant.sourcePublish, errors, DOWNLOAD_GRANT_FIELDS.SOURCE_PUBLISH);

    if (!isDownloadGrantSourcePublish(downloadGrant.sourcePublish)) {
      errors.push(createContractError(
        DOWNLOAD_GRANT_CONTRACT_ERRORS.SOURCE_PUBLISH_INVALID,
        "Download Grant sourcePublish must reference a published or retired Publish record.",
        DOWNLOAD_GRANT_FIELDS.SOURCE_PUBLISH
      ));
    }
  }

  collectLinkageErrors(downloadGrant, errors);

  if (!hasNonEmptyString(downloadGrant?.grantStatus)) {
    errors.push(createContractError(
      DOWNLOAD_GRANT_CONTRACT_ERRORS.GRANT_STATUS_REQUIRED,
      "Download Grant records require grantStatus.",
      DOWNLOAD_GRANT_FIELDS.GRANT_STATUS
    ));
  } else if (!isDownloadGrantStatus(downloadGrant.grantStatus)) {
    errors.push(createContractError(
      DOWNLOAD_GRANT_CONTRACT_ERRORS.GRANT_STATUS_INVALID,
      "Download Grant status must be active, expired, revoked, or consumed.",
      DOWNLOAD_GRANT_FIELDS.GRANT_STATUS
    ));
  }

  if (!hasNonEmptyString(downloadGrant?.grantedAt)) {
    errors.push(createContractError(
      DOWNLOAD_GRANT_CONTRACT_ERRORS.GRANTED_AT_REQUIRED,
      "Download Grant records require grantedAt.",
      DOWNLOAD_GRANT_FIELDS.GRANTED_AT
    ));
  } else if (!isTimestamp(downloadGrant.grantedAt)) {
    errors.push(createContractError(
      DOWNLOAD_GRANT_CONTRACT_ERRORS.GRANTED_AT_INVALID,
      "Download Grant grantedAt must be a valid timestamp.",
      DOWNLOAD_GRANT_FIELDS.GRANTED_AT
    ));
  }

  validateExpiration(downloadGrant, errors, referenceTime);
  validateRevocation(downloadGrant, errors);
  validateConsumption(downloadGrant, errors);

  if (downloadGrant?.grantNotes !== undefined && downloadGrant.grantNotes !== null && typeof downloadGrant.grantNotes !== "string") {
    errors.push(createContractError(
      DOWNLOAD_GRANT_CONTRACT_ERRORS.GRANT_NOTES_INVALID,
      "Download Grant grantNotes must be a string when provided.",
      DOWNLOAD_GRANT_FIELDS.GRANT_NOTES
    ));
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

export function isDownloadGrantActive(downloadGrant, options = {}) {
  const referenceTime = getReferenceTime(options);

  return downloadGrant?.grantStatus === DOWNLOAD_GRANT_STATUS.ACTIVE
    && isTimestamp(downloadGrant.expiresAt)
    && Date.parse(downloadGrant.expiresAt) > referenceTime;
}

export function isDownloadGrantExpired(downloadGrant, options = {}) {
  const referenceTime = getReferenceTime(options);

  return downloadGrant?.grantStatus === DOWNLOAD_GRANT_STATUS.EXPIRED
    && isTimestamp(downloadGrant.expiresAt)
    && Date.parse(downloadGrant.expiresAt) <= referenceTime;
}

export function isDownloadGrantRevoked(downloadGrant) {
  return downloadGrant?.grantStatus === DOWNLOAD_GRANT_STATUS.REVOKED
    && isTimestamp(downloadGrant.revokedAt);
}

export function isDownloadGrantConsumed(downloadGrant) {
  return downloadGrant?.grantStatus === DOWNLOAD_GRANT_STATUS.CONSUMED
    && isTimestamp(downloadGrant.consumedAt);
}

export function isDownloadGrantUsable(downloadGrant, options = {}) {
  return isDownloadGrantActive(downloadGrant, options);
}

export function isDownloadGrantVisibleToActor({
  actorId,
  downloadGrant,
} = {}) {
  return hasNonEmptyString(actorId) && actorId === downloadGrant?.ownerId;
}

export function canActorAccessDownloadGrant({
  actorId,
  role,
  permission,
  downloadGrant,
  grantedScopes = [],
} = {}) {
  if (!isIdentityPermission(permission)) {
    return false;
  }

  if (actorId === downloadGrant?.ownerId) {
    return canActorPerformPermission({
      actorId,
      role: IDENTITY_ROLES.OWNER,
      permission,
      scope: IDENTITY_PERMISSION_SCOPES.OWNED_OBJECT,
      object: {
        ownerId: downloadGrant.ownerId,
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
        ownerId: downloadGrant?.ownerId,
        visibility: IDENTITY_VISIBILITY_STATES.ADMIN_ONLY,
      },
    });
  }

  return false;
}

function validateExpiration(downloadGrant, errors, referenceTime) {
  if (downloadGrant?.grantStatus === DOWNLOAD_GRANT_STATUS.ACTIVE || downloadGrant?.grantStatus === DOWNLOAD_GRANT_STATUS.EXPIRED) {
    if (!hasNonEmptyString(downloadGrant?.expiresAt)) {
      errors.push(createContractError(
        DOWNLOAD_GRANT_CONTRACT_ERRORS.EXPIRES_AT_REQUIRED,
        "Active and expired Download Grant records require expiresAt.",
        DOWNLOAD_GRANT_FIELDS.EXPIRES_AT
      ));
      return;
    }

    if (!isTimestamp(downloadGrant.expiresAt)) {
      errors.push(createContractError(
        DOWNLOAD_GRANT_CONTRACT_ERRORS.EXPIRES_AT_INVALID,
        "Download Grant expiresAt must be a valid timestamp.",
        DOWNLOAD_GRANT_FIELDS.EXPIRES_AT
      ));
      return;
    }

    if (downloadGrant.grantStatus === DOWNLOAD_GRANT_STATUS.ACTIVE && Date.parse(downloadGrant.expiresAt) <= referenceTime) {
      errors.push(createContractError(
        DOWNLOAD_GRANT_CONTRACT_ERRORS.ACTIVE_GRANT_EXPIRED,
        "Active Download Grant records must not be expired.",
        DOWNLOAD_GRANT_FIELDS.EXPIRES_AT
      ));
    }

    if (downloadGrant.grantStatus === DOWNLOAD_GRANT_STATUS.EXPIRED && Date.parse(downloadGrant.expiresAt) > referenceTime) {
      errors.push(createContractError(
        DOWNLOAD_GRANT_CONTRACT_ERRORS.EXPIRED_GRANT_NOT_EXPIRED,
        "Expired Download Grant records must have an expired expiresAt timestamp.",
        DOWNLOAD_GRANT_FIELDS.EXPIRES_AT
      ));
    }
  } else if (downloadGrant?.expiresAt !== undefined && downloadGrant.expiresAt !== null && !isTimestamp(downloadGrant.expiresAt)) {
    errors.push(createContractError(
      DOWNLOAD_GRANT_CONTRACT_ERRORS.EXPIRES_AT_INVALID,
      "Download Grant expiresAt must be a valid timestamp when provided.",
      DOWNLOAD_GRANT_FIELDS.EXPIRES_AT
    ));
  }
}

function validateRevocation(downloadGrant, errors) {
  if (downloadGrant?.grantStatus === DOWNLOAD_GRANT_STATUS.REVOKED) {
    if (!hasNonEmptyString(downloadGrant?.revokedAt)) {
      errors.push(createContractError(
        DOWNLOAD_GRANT_CONTRACT_ERRORS.REVOKED_AT_REQUIRED,
        "Revoked Download Grant records require revokedAt.",
        DOWNLOAD_GRANT_FIELDS.REVOKED_AT
      ));
    } else if (!isTimestamp(downloadGrant.revokedAt)) {
      errors.push(createContractError(
        DOWNLOAD_GRANT_CONTRACT_ERRORS.REVOKED_AT_INVALID,
        "Download Grant revokedAt must be a valid timestamp.",
        DOWNLOAD_GRANT_FIELDS.REVOKED_AT
      ));
    }
  } else if (downloadGrant?.revokedAt !== undefined && downloadGrant.revokedAt !== null && !isTimestamp(downloadGrant.revokedAt)) {
    errors.push(createContractError(
      DOWNLOAD_GRANT_CONTRACT_ERRORS.REVOKED_AT_INVALID,
      "Download Grant revokedAt must be a valid timestamp when provided.",
      DOWNLOAD_GRANT_FIELDS.REVOKED_AT
    ));
  }
}

function validateConsumption(downloadGrant, errors) {
  if (downloadGrant?.grantStatus === DOWNLOAD_GRANT_STATUS.CONSUMED) {
    if (!hasNonEmptyString(downloadGrant?.consumedAt)) {
      errors.push(createContractError(
        DOWNLOAD_GRANT_CONTRACT_ERRORS.CONSUMED_AT_REQUIRED,
        "Consumed Download Grant records require consumedAt.",
        DOWNLOAD_GRANT_FIELDS.CONSUMED_AT
      ));
    } else if (!isTimestamp(downloadGrant.consumedAt)) {
      errors.push(createContractError(
        DOWNLOAD_GRANT_CONTRACT_ERRORS.CONSUMED_AT_INVALID,
        "Download Grant consumedAt must be a valid timestamp.",
        DOWNLOAD_GRANT_FIELDS.CONSUMED_AT
      ));
    }
  } else if (downloadGrant?.consumedAt !== undefined && downloadGrant.consumedAt !== null && !isTimestamp(downloadGrant.consumedAt)) {
    errors.push(createContractError(
      DOWNLOAD_GRANT_CONTRACT_ERRORS.CONSUMED_AT_INVALID,
      "Download Grant consumedAt must be a valid timestamp when provided.",
      DOWNLOAD_GRANT_FIELDS.CONSUMED_AT
    ));
  }
}

function collectLinkageErrors(downloadGrant, errors) {
  if (isReferenceObject(downloadGrant?.entitlement)
    && hasNonEmptyString(downloadGrant?.ownerId)
    && hasNonEmptyString(downloadGrant.entitlement.ownerId)
    && downloadGrant.entitlement.ownerId !== downloadGrant.ownerId) {
    errors.push(createContractError(
      DOWNLOAD_GRANT_CONTRACT_ERRORS.OWNER_ENTITLEMENT_MISMATCH,
      "Download Grant entitlement.ownerId must match ownerId.",
      DOWNLOAD_GRANT_FIELDS.ENTITLEMENT
    ));
  }

  if (isReferenceObject(downloadGrant?.entitlement)
    && hasNonEmptyString(downloadGrant?.projectId)
    && hasNonEmptyString(downloadGrant.entitlement.projectId)
    && downloadGrant.entitlement.projectId !== downloadGrant.projectId) {
    errors.push(createContractError(
      DOWNLOAD_GRANT_CONTRACT_ERRORS.PROJECT_ENTITLEMENT_MISMATCH,
      "Download Grant entitlement.projectId must match projectId.",
      DOWNLOAD_GRANT_FIELDS.ENTITLEMENT
    ));
  }

  if (isReferenceObject(downloadGrant?.entitlement)
    && isReferenceObject(downloadGrant?.marketplaceListing)
    && hasNonEmptyString(downloadGrant.entitlement.listingId)
    && hasNonEmptyString(downloadGrant.marketplaceListing.listingId)
    && downloadGrant.entitlement.listingId !== downloadGrant.marketplaceListing.listingId) {
    errors.push(createContractError(
      DOWNLOAD_GRANT_CONTRACT_ERRORS.ENTITLEMENT_LISTING_MISMATCH,
      "Download Grant entitlement.listingId must match marketplaceListing.listingId.",
      DOWNLOAD_GRANT_FIELDS.ENTITLEMENT
    ));
  }

  if (isReferenceObject(downloadGrant?.entitlement)
    && isReferenceObject(downloadGrant?.sourceRelease)
    && hasNonEmptyString(downloadGrant.entitlement.releaseId)
    && hasNonEmptyString(downloadGrant.sourceRelease.releaseId)
    && downloadGrant.entitlement.releaseId !== downloadGrant.sourceRelease.releaseId) {
    errors.push(createContractError(
      DOWNLOAD_GRANT_CONTRACT_ERRORS.ENTITLEMENT_RELEASE_MISMATCH,
      "Download Grant entitlement.releaseId must match sourceRelease.releaseId.",
      DOWNLOAD_GRANT_FIELDS.ENTITLEMENT
    ));
  }

  if (isReferenceObject(downloadGrant?.entitlement)
    && isReferenceObject(downloadGrant?.sourcePublish)
    && hasNonEmptyString(downloadGrant.entitlement.publishId)
    && hasNonEmptyString(downloadGrant.sourcePublish.publishId)
    && downloadGrant.entitlement.publishId !== downloadGrant.sourcePublish.publishId) {
    errors.push(createContractError(
      DOWNLOAD_GRANT_CONTRACT_ERRORS.ENTITLEMENT_PUBLISH_MISMATCH,
      "Download Grant entitlement.publishId must match sourcePublish.publishId.",
      DOWNLOAD_GRANT_FIELDS.ENTITLEMENT
    ));
  }

  if (isReferenceObject(downloadGrant?.marketplaceListing)
    && hasNonEmptyString(downloadGrant?.projectId)
    && hasNonEmptyString(downloadGrant.marketplaceListing.projectId)
    && downloadGrant.marketplaceListing.projectId !== downloadGrant.projectId) {
    errors.push(createContractError(
      DOWNLOAD_GRANT_CONTRACT_ERRORS.LISTING_PROJECT_MISMATCH,
      "Download Grant marketplaceListing.projectId must match projectId.",
      DOWNLOAD_GRANT_FIELDS.MARKETPLACE_LISTING
    ));
  }

  if (isReferenceObject(downloadGrant?.marketplaceListing)
    && isReferenceObject(downloadGrant?.sourceRelease)
    && hasNonEmptyString(downloadGrant.marketplaceListing.releaseId)
    && hasNonEmptyString(downloadGrant.sourceRelease.releaseId)
    && downloadGrant.marketplaceListing.releaseId !== downloadGrant.sourceRelease.releaseId) {
    errors.push(createContractError(
      DOWNLOAD_GRANT_CONTRACT_ERRORS.LISTING_RELEASE_MISMATCH,
      "Download Grant marketplaceListing.releaseId must match sourceRelease.releaseId.",
      DOWNLOAD_GRANT_FIELDS.MARKETPLACE_LISTING
    ));
  }

  if (isReferenceObject(downloadGrant?.marketplaceListing)
    && isReferenceObject(downloadGrant?.sourcePublish)
    && hasNonEmptyString(downloadGrant.marketplaceListing.publishId)
    && hasNonEmptyString(downloadGrant.sourcePublish.publishId)
    && downloadGrant.marketplaceListing.publishId !== downloadGrant.sourcePublish.publishId) {
    errors.push(createContractError(
      DOWNLOAD_GRANT_CONTRACT_ERRORS.LISTING_PUBLISH_MISMATCH,
      "Download Grant marketplaceListing.publishId must match sourcePublish.publishId.",
      DOWNLOAD_GRANT_FIELDS.MARKETPLACE_LISTING
    ));
  }

  if (isReferenceObject(downloadGrant?.sourceRelease)
    && isReferenceObject(downloadGrant?.sourcePublish)
    && hasNonEmptyString(downloadGrant.sourceRelease.releaseId)
    && hasNonEmptyString(downloadGrant.sourcePublish.releaseId)
    && downloadGrant.sourceRelease.releaseId !== downloadGrant.sourcePublish.releaseId) {
    errors.push(createContractError(
      DOWNLOAD_GRANT_CONTRACT_ERRORS.RELEASE_PUBLISH_MISMATCH,
      "Download Grant sourcePublish.releaseId must match sourceRelease.releaseId.",
      DOWNLOAD_GRANT_FIELDS.SOURCE_PUBLISH
    ));
  }
}

function collectForbiddenFieldErrors(record, errors, pathPrefix = "") {
  if (!isReferenceObject(record)) {
    return;
  }

  for (const fieldName of DOWNLOAD_GRANT_FORBIDDEN_FIELDS) {
    if (Object.hasOwn(record, fieldName)) {
      errors.push(createContractError(
        DOWNLOAD_GRANT_CONTRACT_ERRORS.FIELD_NOT_ALLOWED,
        "Download Grant records must not carry payment, auth session, runtime, toolState, file bytes, CDN, or storage implementation data.",
        pathPrefix ? `${pathPrefix}.${fieldName}` : fieldName
      ));
    }
  }
}

function getReferenceTime(options) {
  if (options?.now !== undefined && options.now !== null && isTimestamp(options.now)) {
    return Date.parse(options.now);
  }

  return Date.now();
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
