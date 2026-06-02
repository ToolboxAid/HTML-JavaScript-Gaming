/*
Toolbox Aid
David Quesenberry
06/02/2026
entitlementContract.js
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
  MARKETPLACE_LISTING_STATUS,
} from "./marketplaceListingContract.js";
import {
  PUBLISH_STATUS,
} from "./publishContract.js";
import {
  RELEASE_STATUS,
  isReleaseVersion,
} from "./releaseContract.js";

export const ENTITLEMENT_CONTRACT_ID = "gamefoundrystudio.entitlement.contract";
export const ENTITLEMENT_CONTRACT_VERSION = "1.0.0";

export const ENTITLEMENT_FIELDS = Object.freeze({
  ENTITLEMENT_ID: "entitlementId",
  OWNER: "ownerId",
  PROJECT: "projectId",
  MARKETPLACE_LISTING: "marketplaceListing",
  SOURCE_RELEASE: "sourceRelease",
  SOURCE_PUBLISH: "sourcePublish",
  ENTITLEMENT_TYPE: "entitlementType",
  GRANTED_AT: "grantedAt",
  REVOKED_AT: "revokedAt",
  ENTITLEMENT_NOTES: "entitlementNotes",
});

export const ENTITLEMENT_FIELD_LIST = Object.freeze([
  ENTITLEMENT_FIELDS.ENTITLEMENT_ID,
  ENTITLEMENT_FIELDS.OWNER,
  ENTITLEMENT_FIELDS.PROJECT,
  ENTITLEMENT_FIELDS.MARKETPLACE_LISTING,
  ENTITLEMENT_FIELDS.SOURCE_RELEASE,
  ENTITLEMENT_FIELDS.SOURCE_PUBLISH,
  ENTITLEMENT_FIELDS.ENTITLEMENT_TYPE,
  ENTITLEMENT_FIELDS.GRANTED_AT,
  ENTITLEMENT_FIELDS.REVOKED_AT,
  ENTITLEMENT_FIELDS.ENTITLEMENT_NOTES,
]);

export const ENTITLEMENT_TYPES = Object.freeze({
  OWNED: "owned",
  LICENSED: "licensed",
  GRANTED: "granted",
  REVOKED: "revoked",
});

export const ENTITLEMENT_TYPE_LIST = Object.freeze([
  ENTITLEMENT_TYPES.OWNED,
  ENTITLEMENT_TYPES.LICENSED,
  ENTITLEMENT_TYPES.GRANTED,
  ENTITLEMENT_TYPES.REVOKED,
]);

export const ENTITLEMENT_RULES = Object.freeze({
  REQUIRES_OWNER: true,
  REQUIRES_PROJECT: true,
  REQUIRES_MARKETPLACE_LISTING: true,
  REQUIRES_SOURCE_RELEASE: true,
  REQUIRES_SOURCE_PUBLISH: true,
  REQUIRES_MARKETPLACE_LISTING_PROJECT_LINKAGE: true,
  REQUIRES_MARKETPLACE_LISTING_RELEASE_LINKAGE: true,
  REQUIRES_MARKETPLACE_LISTING_PUBLISH_LINKAGE: true,
  REQUIRES_RELEASE_PUBLISH_LINKAGE: true,
  REQUIRES_VALID_ENTITLEMENT_TYPE: true,
  REVOKED_ENTITLEMENTS_REQUIRE_REVOKED_AT: true,
  NO_PAYMENT_STATE: true,
  NO_AUTH_SESSION_STATE: true,
  NO_RUNTIME_STATE: true,
  NO_TOOL_STATE: true,
  NO_DOWNLOAD_STATE: true,
});

export const ENTITLEMENT_FORBIDDEN_FIELDS = Object.freeze([
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
  "downloadSession",
  "downloadState",
  "downloadToken",
  "downloadUrl",
  "downloadedAt",
  "downloads",
  "identityProvider",
  "invoice",
  "localStorage",
  "paymentIntent",
  "paymentMethod",
  "paymentProvider",
  "paymentState",
  "paymentStatus",
  "payload",
  "payloadJson",
  "receipt",
  "recoveryAvailable",
  "session",
  "sessionStorage",
  "sourceToolStates",
  "stripeSession",
  "token",
  "toolState",
  "toolStateId",
  "toolStates",
  "transactionId",
  "workspace",
  "workspaceState",
]);

export const ENTITLEMENT_CONTRACT_ERRORS = Object.freeze({
  ENTITLEMENT_ID_REQUIRED: "ENTITLEMENT_ID_REQUIRED",
  OWNER_REQUIRED: "ENTITLEMENT_OWNER_REQUIRED",
  PROJECT_REQUIRED: "ENTITLEMENT_PROJECT_REQUIRED",
  MARKETPLACE_LISTING_REQUIRED: "ENTITLEMENT_MARKETPLACE_LISTING_REQUIRED",
  MARKETPLACE_LISTING_INVALID: "ENTITLEMENT_MARKETPLACE_LISTING_INVALID",
  SOURCE_RELEASE_REQUIRED: "ENTITLEMENT_SOURCE_RELEASE_REQUIRED",
  SOURCE_RELEASE_INVALID: "ENTITLEMENT_SOURCE_RELEASE_INVALID",
  SOURCE_PUBLISH_REQUIRED: "ENTITLEMENT_SOURCE_PUBLISH_REQUIRED",
  SOURCE_PUBLISH_INVALID: "ENTITLEMENT_SOURCE_PUBLISH_INVALID",
  MARKETPLACE_LISTING_PROJECT_MISMATCH: "ENTITLEMENT_MARKETPLACE_LISTING_PROJECT_MISMATCH",
  MARKETPLACE_LISTING_RELEASE_MISMATCH: "ENTITLEMENT_MARKETPLACE_LISTING_RELEASE_MISMATCH",
  MARKETPLACE_LISTING_PUBLISH_MISMATCH: "ENTITLEMENT_MARKETPLACE_LISTING_PUBLISH_MISMATCH",
  RELEASE_PUBLISH_MISMATCH: "ENTITLEMENT_RELEASE_PUBLISH_MISMATCH",
  ENTITLEMENT_TYPE_REQUIRED: "ENTITLEMENT_TYPE_REQUIRED",
  ENTITLEMENT_TYPE_INVALID: "ENTITLEMENT_TYPE_INVALID",
  GRANTED_AT_REQUIRED: "ENTITLEMENT_GRANTED_AT_REQUIRED",
  GRANTED_AT_INVALID: "ENTITLEMENT_GRANTED_AT_INVALID",
  REVOKED_AT_REQUIRED: "ENTITLEMENT_REVOKED_AT_REQUIRED",
  REVOKED_AT_INVALID: "ENTITLEMENT_REVOKED_AT_INVALID",
  ENTITLEMENT_NOTES_INVALID: "ENTITLEMENT_NOTES_INVALID",
  FIELD_NOT_ALLOWED: "ENTITLEMENT_FIELD_NOT_ALLOWED",
});

export function isEntitlementType(value) {
  return ENTITLEMENT_TYPE_LIST.includes(value);
}

export function isEntitlementMarketplaceListing(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.listingId)
    && hasNonEmptyString(value.projectId)
    && hasNonEmptyString(value.releaseId)
    && hasNonEmptyString(value.publishId)
    && (value.status === undefined || value.status === MARKETPLACE_LISTING_STATUS.LISTED || value.status === MARKETPLACE_LISTING_STATUS.RETIRED);
}

export function isEntitlementSourceRelease(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.releaseId)
    && isReleaseVersion(value.version)
    && (value.status === undefined || value.status === RELEASE_STATUS.PUBLISHED || value.status === RELEASE_STATUS.RETIRED);
}

export function isEntitlementSourcePublish(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.publishId)
    && hasNonEmptyString(value.releaseId)
    && (value.status === undefined || value.status === PUBLISH_STATUS.PUBLISHED || value.status === PUBLISH_STATUS.RETIRED);
}

export function validateEntitlementContract(entitlement) {
  const errors = [];

  collectForbiddenFieldErrors(entitlement, errors);

  if (!hasNonEmptyString(entitlement?.entitlementId)) {
    errors.push(createContractError(
      ENTITLEMENT_CONTRACT_ERRORS.ENTITLEMENT_ID_REQUIRED,
      "Entitlement records require entitlementId.",
      ENTITLEMENT_FIELDS.ENTITLEMENT_ID
    ));
  }

  if (!hasNonEmptyString(entitlement?.ownerId)) {
    errors.push(createContractError(
      ENTITLEMENT_CONTRACT_ERRORS.OWNER_REQUIRED,
      "Entitlement records require ownerId.",
      ENTITLEMENT_FIELDS.OWNER
    ));
  }

  if (!hasNonEmptyString(entitlement?.projectId)) {
    errors.push(createContractError(
      ENTITLEMENT_CONTRACT_ERRORS.PROJECT_REQUIRED,
      "Entitlement records require projectId.",
      ENTITLEMENT_FIELDS.PROJECT
    ));
  }

  if (entitlement?.marketplaceListing === undefined || entitlement?.marketplaceListing === null) {
    errors.push(createContractError(
      ENTITLEMENT_CONTRACT_ERRORS.MARKETPLACE_LISTING_REQUIRED,
      "Entitlement records require marketplaceListing.",
      ENTITLEMENT_FIELDS.MARKETPLACE_LISTING
    ));
  } else {
    collectForbiddenFieldErrors(entitlement.marketplaceListing, errors, ENTITLEMENT_FIELDS.MARKETPLACE_LISTING);

    if (!isEntitlementMarketplaceListing(entitlement.marketplaceListing)) {
      errors.push(createContractError(
        ENTITLEMENT_CONTRACT_ERRORS.MARKETPLACE_LISTING_INVALID,
        "Entitlement marketplaceListing must reference a listed or retired Marketplace Listing.",
        ENTITLEMENT_FIELDS.MARKETPLACE_LISTING
      ));
    }
  }

  if (entitlement?.sourceRelease === undefined || entitlement?.sourceRelease === null) {
    errors.push(createContractError(
      ENTITLEMENT_CONTRACT_ERRORS.SOURCE_RELEASE_REQUIRED,
      "Entitlement records require sourceRelease.",
      ENTITLEMENT_FIELDS.SOURCE_RELEASE
    ));
  } else {
    collectForbiddenFieldErrors(entitlement.sourceRelease, errors, ENTITLEMENT_FIELDS.SOURCE_RELEASE);

    if (!isEntitlementSourceRelease(entitlement.sourceRelease)) {
      errors.push(createContractError(
        ENTITLEMENT_CONTRACT_ERRORS.SOURCE_RELEASE_INVALID,
        "Entitlement sourceRelease must reference a published or retired Release.",
        ENTITLEMENT_FIELDS.SOURCE_RELEASE
      ));
    }
  }

  if (entitlement?.sourcePublish === undefined || entitlement?.sourcePublish === null) {
    errors.push(createContractError(
      ENTITLEMENT_CONTRACT_ERRORS.SOURCE_PUBLISH_REQUIRED,
      "Entitlement records require sourcePublish.",
      ENTITLEMENT_FIELDS.SOURCE_PUBLISH
    ));
  } else {
    collectForbiddenFieldErrors(entitlement.sourcePublish, errors, ENTITLEMENT_FIELDS.SOURCE_PUBLISH);

    if (!isEntitlementSourcePublish(entitlement.sourcePublish)) {
      errors.push(createContractError(
        ENTITLEMENT_CONTRACT_ERRORS.SOURCE_PUBLISH_INVALID,
        "Entitlement sourcePublish must reference a published or retired Publish record.",
        ENTITLEMENT_FIELDS.SOURCE_PUBLISH
      ));
    }
  }

  collectLinkageErrors(entitlement, errors);

  if (!hasNonEmptyString(entitlement?.entitlementType)) {
    errors.push(createContractError(
      ENTITLEMENT_CONTRACT_ERRORS.ENTITLEMENT_TYPE_REQUIRED,
      "Entitlement records require entitlementType.",
      ENTITLEMENT_FIELDS.ENTITLEMENT_TYPE
    ));
  } else if (!isEntitlementType(entitlement.entitlementType)) {
    errors.push(createContractError(
      ENTITLEMENT_CONTRACT_ERRORS.ENTITLEMENT_TYPE_INVALID,
      "Entitlement type must be owned, licensed, granted, or revoked.",
      ENTITLEMENT_FIELDS.ENTITLEMENT_TYPE
    ));
  }

  if (entitlement?.entitlementType !== ENTITLEMENT_TYPES.REVOKED) {
    if (!hasNonEmptyString(entitlement?.grantedAt)) {
      errors.push(createContractError(
        ENTITLEMENT_CONTRACT_ERRORS.GRANTED_AT_REQUIRED,
        "Active Entitlement records require grantedAt.",
        ENTITLEMENT_FIELDS.GRANTED_AT
      ));
    } else if (!isTimestamp(entitlement.grantedAt)) {
      errors.push(createContractError(
        ENTITLEMENT_CONTRACT_ERRORS.GRANTED_AT_INVALID,
        "Entitlement grantedAt must be a valid timestamp.",
        ENTITLEMENT_FIELDS.GRANTED_AT
      ));
    }
  } else if (entitlement?.grantedAt !== undefined && entitlement.grantedAt !== null && !isTimestamp(entitlement.grantedAt)) {
    errors.push(createContractError(
      ENTITLEMENT_CONTRACT_ERRORS.GRANTED_AT_INVALID,
      "Entitlement grantedAt must be a valid timestamp when provided.",
      ENTITLEMENT_FIELDS.GRANTED_AT
    ));
  }

  if (entitlement?.entitlementType === ENTITLEMENT_TYPES.REVOKED) {
    if (!hasNonEmptyString(entitlement?.revokedAt)) {
      errors.push(createContractError(
        ENTITLEMENT_CONTRACT_ERRORS.REVOKED_AT_REQUIRED,
        "Revoked Entitlement records require revokedAt.",
        ENTITLEMENT_FIELDS.REVOKED_AT
      ));
    } else if (!isTimestamp(entitlement.revokedAt)) {
      errors.push(createContractError(
        ENTITLEMENT_CONTRACT_ERRORS.REVOKED_AT_INVALID,
        "Entitlement revokedAt must be a valid timestamp.",
        ENTITLEMENT_FIELDS.REVOKED_AT
      ));
    }
  } else if (entitlement?.revokedAt !== undefined && entitlement.revokedAt !== null && !isTimestamp(entitlement.revokedAt)) {
    errors.push(createContractError(
      ENTITLEMENT_CONTRACT_ERRORS.REVOKED_AT_INVALID,
      "Entitlement revokedAt must be a valid timestamp when provided.",
      ENTITLEMENT_FIELDS.REVOKED_AT
    ));
  }

  if (entitlement?.entitlementNotes !== undefined && entitlement.entitlementNotes !== null && typeof entitlement.entitlementNotes !== "string") {
    errors.push(createContractError(
      ENTITLEMENT_CONTRACT_ERRORS.ENTITLEMENT_NOTES_INVALID,
      "Entitlement entitlementNotes must be a string when provided.",
      ENTITLEMENT_FIELDS.ENTITLEMENT_NOTES
    ));
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

export function isEntitlementActive(entitlement) {
  return entitlement?.entitlementType === ENTITLEMENT_TYPES.OWNED
    || entitlement?.entitlementType === ENTITLEMENT_TYPES.LICENSED
    || entitlement?.entitlementType === ENTITLEMENT_TYPES.GRANTED;
}

export function isEntitlementRevoked(entitlement) {
  return entitlement?.entitlementType === ENTITLEMENT_TYPES.REVOKED
    && hasNonEmptyString(entitlement.revokedAt)
    && isTimestamp(entitlement.revokedAt);
}

export function isEntitlementVisibleToActor({
  actorId,
  entitlement,
} = {}) {
  return hasNonEmptyString(actorId) && actorId === entitlement?.ownerId;
}

export function canActorAccessEntitlement({
  actorId,
  role,
  permission,
  entitlement,
  grantedScopes = [],
} = {}) {
  if (!isIdentityPermission(permission)) {
    return false;
  }

  if (actorId === entitlement?.ownerId) {
    return canActorPerformPermission({
      actorId,
      role: IDENTITY_ROLES.OWNER,
      permission,
      scope: IDENTITY_PERMISSION_SCOPES.OWNED_OBJECT,
      object: {
        ownerId: entitlement.ownerId,
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
        ownerId: entitlement?.ownerId,
        visibility: IDENTITY_VISIBILITY_STATES.ADMIN_ONLY,
      },
    });
  }

  return false;
}

function collectLinkageErrors(entitlement, errors) {
  if (isReferenceObject(entitlement?.marketplaceListing)
    && hasNonEmptyString(entitlement?.projectId)
    && hasNonEmptyString(entitlement.marketplaceListing.projectId)
    && entitlement.marketplaceListing.projectId !== entitlement.projectId) {
    errors.push(createContractError(
      ENTITLEMENT_CONTRACT_ERRORS.MARKETPLACE_LISTING_PROJECT_MISMATCH,
      "Entitlement marketplaceListing.projectId must match projectId.",
      ENTITLEMENT_FIELDS.MARKETPLACE_LISTING
    ));
  }

  if (isReferenceObject(entitlement?.marketplaceListing)
    && isReferenceObject(entitlement?.sourceRelease)
    && hasNonEmptyString(entitlement.marketplaceListing.releaseId)
    && hasNonEmptyString(entitlement.sourceRelease.releaseId)
    && entitlement.marketplaceListing.releaseId !== entitlement.sourceRelease.releaseId) {
    errors.push(createContractError(
      ENTITLEMENT_CONTRACT_ERRORS.MARKETPLACE_LISTING_RELEASE_MISMATCH,
      "Entitlement marketplaceListing.releaseId must match sourceRelease.releaseId.",
      ENTITLEMENT_FIELDS.MARKETPLACE_LISTING
    ));
  }

  if (isReferenceObject(entitlement?.marketplaceListing)
    && isReferenceObject(entitlement?.sourcePublish)
    && hasNonEmptyString(entitlement.marketplaceListing.publishId)
    && hasNonEmptyString(entitlement.sourcePublish.publishId)
    && entitlement.marketplaceListing.publishId !== entitlement.sourcePublish.publishId) {
    errors.push(createContractError(
      ENTITLEMENT_CONTRACT_ERRORS.MARKETPLACE_LISTING_PUBLISH_MISMATCH,
      "Entitlement marketplaceListing.publishId must match sourcePublish.publishId.",
      ENTITLEMENT_FIELDS.MARKETPLACE_LISTING
    ));
  }

  if (isReferenceObject(entitlement?.sourceRelease)
    && isReferenceObject(entitlement?.sourcePublish)
    && hasNonEmptyString(entitlement.sourceRelease.releaseId)
    && hasNonEmptyString(entitlement.sourcePublish.releaseId)
    && entitlement.sourceRelease.releaseId !== entitlement.sourcePublish.releaseId) {
    errors.push(createContractError(
      ENTITLEMENT_CONTRACT_ERRORS.RELEASE_PUBLISH_MISMATCH,
      "Entitlement sourcePublish.releaseId must match sourceRelease.releaseId.",
      ENTITLEMENT_FIELDS.SOURCE_PUBLISH
    ));
  }
}

function collectForbiddenFieldErrors(record, errors, pathPrefix = "") {
  if (!isReferenceObject(record)) {
    return;
  }

  for (const fieldName of ENTITLEMENT_FORBIDDEN_FIELDS) {
    if (Object.hasOwn(record, fieldName)) {
      errors.push(createContractError(
        ENTITLEMENT_CONTRACT_ERRORS.FIELD_NOT_ALLOWED,
        "Entitlement records must not carry payment, auth session, runtime, toolState, or download state.",
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
