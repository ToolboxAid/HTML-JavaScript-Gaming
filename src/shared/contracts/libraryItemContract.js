/*
Toolbox Aid
David Quesenberry
06/02/2026
libraryItemContract.js
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

export const LIBRARY_ITEM_CONTRACT_ID = "gamefoundrystudio.library.item.contract";
export const LIBRARY_ITEM_CONTRACT_VERSION = "1.0.0";

export const LIBRARY_ITEM_FIELDS = Object.freeze({
  LIBRARY_ITEM_ID: "libraryItemId",
  OWNER: "ownerId",
  PROJECT: "projectId",
  ENTITLEMENT: "entitlement",
  MARKETPLACE_LISTING: "marketplaceListing",
  SOURCE_RELEASE: "sourceRelease",
  SOURCE_PUBLISH: "sourcePublish",
  LIBRARY_STATUS: "libraryStatus",
  ADDED_AT: "addedAt",
  HIDDEN_AT: "hiddenAt",
  REVOKED_AT: "revokedAt",
  ARCHIVED_AT: "archivedAt",
  LIBRARY_NOTES: "libraryNotes",
});

export const LIBRARY_ITEM_FIELD_LIST = Object.freeze([
  LIBRARY_ITEM_FIELDS.LIBRARY_ITEM_ID,
  LIBRARY_ITEM_FIELDS.OWNER,
  LIBRARY_ITEM_FIELDS.PROJECT,
  LIBRARY_ITEM_FIELDS.ENTITLEMENT,
  LIBRARY_ITEM_FIELDS.MARKETPLACE_LISTING,
  LIBRARY_ITEM_FIELDS.SOURCE_RELEASE,
  LIBRARY_ITEM_FIELDS.SOURCE_PUBLISH,
  LIBRARY_ITEM_FIELDS.LIBRARY_STATUS,
  LIBRARY_ITEM_FIELDS.ADDED_AT,
  LIBRARY_ITEM_FIELDS.HIDDEN_AT,
  LIBRARY_ITEM_FIELDS.REVOKED_AT,
  LIBRARY_ITEM_FIELDS.ARCHIVED_AT,
  LIBRARY_ITEM_FIELDS.LIBRARY_NOTES,
]);

export const LIBRARY_ITEM_STATUS = Object.freeze({
  AVAILABLE: "available",
  HIDDEN: "hidden",
  REVOKED: "revoked",
  ARCHIVED: "archived",
});

export const LIBRARY_ITEM_STATUS_LIST = Object.freeze([
  LIBRARY_ITEM_STATUS.AVAILABLE,
  LIBRARY_ITEM_STATUS.HIDDEN,
  LIBRARY_ITEM_STATUS.REVOKED,
  LIBRARY_ITEM_STATUS.ARCHIVED,
]);

export const LIBRARY_ITEM_RULES = Object.freeze({
  REQUIRES_OWNER: true,
  REQUIRES_PROJECT: true,
  REQUIRES_ENTITLEMENT: true,
  REQUIRES_MARKETPLACE_LISTING: true,
  REQUIRES_SOURCE_RELEASE: true,
  REQUIRES_SOURCE_PUBLISH: true,
  REQUIRES_VALID_LIBRARY_STATUS: true,
  REQUIRES_ADDED_AT: true,
  HIDDEN_ITEMS_REQUIRE_HIDDEN_AT: true,
  REVOKED_ITEMS_REQUIRE_REVOKED_AT: true,
  ARCHIVED_ITEMS_REQUIRE_ARCHIVED_AT: true,
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
  NO_CDN_DETAILS: true,
  NO_INSTALL_STATE: true,
});

export const LIBRARY_ITEM_FORBIDDEN_FIELDS = Object.freeze([
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
  "buffer",
  "bytes",
  "cdnKey",
  "cdnProvider",
  "cdnUrl",
  "checkoutSession",
  "content",
  "credentials",
  "dirty",
  "fileBytes",
  "fileData",
  "identityProvider",
  "installPath",
  "installState",
  "installToken",
  "installationId",
  "installedAt",
  "installedFiles",
  "installerState",
  "invoice",
  "launcherInstallState",
  "localInstallPath",
  "localStorage",
  "manifestInstallState",
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
  "signedUrl",
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

export const LIBRARY_ITEM_CONTRACT_ERRORS = Object.freeze({
  LIBRARY_ITEM_ID_REQUIRED: "LIBRARY_ITEM_ID_REQUIRED",
  OWNER_REQUIRED: "LIBRARY_ITEM_OWNER_REQUIRED",
  PROJECT_REQUIRED: "LIBRARY_ITEM_PROJECT_REQUIRED",
  ENTITLEMENT_REQUIRED: "LIBRARY_ITEM_ENTITLEMENT_REQUIRED",
  ENTITLEMENT_INVALID: "LIBRARY_ITEM_ENTITLEMENT_INVALID",
  MARKETPLACE_LISTING_REQUIRED: "LIBRARY_ITEM_MARKETPLACE_LISTING_REQUIRED",
  MARKETPLACE_LISTING_INVALID: "LIBRARY_ITEM_MARKETPLACE_LISTING_INVALID",
  SOURCE_RELEASE_REQUIRED: "LIBRARY_ITEM_SOURCE_RELEASE_REQUIRED",
  SOURCE_RELEASE_INVALID: "LIBRARY_ITEM_SOURCE_RELEASE_INVALID",
  SOURCE_PUBLISH_REQUIRED: "LIBRARY_ITEM_SOURCE_PUBLISH_REQUIRED",
  SOURCE_PUBLISH_INVALID: "LIBRARY_ITEM_SOURCE_PUBLISH_INVALID",
  OWNER_ENTITLEMENT_MISMATCH: "LIBRARY_ITEM_OWNER_ENTITLEMENT_MISMATCH",
  PROJECT_ENTITLEMENT_MISMATCH: "LIBRARY_ITEM_PROJECT_ENTITLEMENT_MISMATCH",
  ENTITLEMENT_LISTING_MISMATCH: "LIBRARY_ITEM_ENTITLEMENT_LISTING_MISMATCH",
  ENTITLEMENT_RELEASE_MISMATCH: "LIBRARY_ITEM_ENTITLEMENT_RELEASE_MISMATCH",
  ENTITLEMENT_PUBLISH_MISMATCH: "LIBRARY_ITEM_ENTITLEMENT_PUBLISH_MISMATCH",
  LISTING_PROJECT_MISMATCH: "LIBRARY_ITEM_LISTING_PROJECT_MISMATCH",
  LISTING_RELEASE_MISMATCH: "LIBRARY_ITEM_LISTING_RELEASE_MISMATCH",
  LISTING_PUBLISH_MISMATCH: "LIBRARY_ITEM_LISTING_PUBLISH_MISMATCH",
  RELEASE_PUBLISH_MISMATCH: "LIBRARY_ITEM_RELEASE_PUBLISH_MISMATCH",
  LIBRARY_STATUS_REQUIRED: "LIBRARY_ITEM_STATUS_REQUIRED",
  LIBRARY_STATUS_INVALID: "LIBRARY_ITEM_STATUS_INVALID",
  ADDED_AT_REQUIRED: "LIBRARY_ITEM_ADDED_AT_REQUIRED",
  ADDED_AT_INVALID: "LIBRARY_ITEM_ADDED_AT_INVALID",
  HIDDEN_AT_REQUIRED: "LIBRARY_ITEM_HIDDEN_AT_REQUIRED",
  HIDDEN_AT_INVALID: "LIBRARY_ITEM_HIDDEN_AT_INVALID",
  REVOKED_AT_REQUIRED: "LIBRARY_ITEM_REVOKED_AT_REQUIRED",
  REVOKED_AT_INVALID: "LIBRARY_ITEM_REVOKED_AT_INVALID",
  ARCHIVED_AT_REQUIRED: "LIBRARY_ITEM_ARCHIVED_AT_REQUIRED",
  ARCHIVED_AT_INVALID: "LIBRARY_ITEM_ARCHIVED_AT_INVALID",
  LIBRARY_NOTES_INVALID: "LIBRARY_ITEM_NOTES_INVALID",
  FIELD_NOT_ALLOWED: "LIBRARY_ITEM_FIELD_NOT_ALLOWED",
});

export function isLibraryItemStatus(value) {
  return LIBRARY_ITEM_STATUS_LIST.includes(value);
}

export function isLibraryItemEntitlement(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.entitlementId)
    && hasNonEmptyString(value.ownerId)
    && hasNonEmptyString(value.projectId)
    && hasNonEmptyString(value.listingId)
    && hasNonEmptyString(value.releaseId)
    && hasNonEmptyString(value.publishId)
    && (value.entitlementType === undefined || Object.values(ENTITLEMENT_TYPES).includes(value.entitlementType));
}

export function isLibraryItemMarketplaceListing(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.listingId)
    && hasNonEmptyString(value.projectId)
    && hasNonEmptyString(value.releaseId)
    && hasNonEmptyString(value.publishId)
    && (value.status === undefined || value.status === MARKETPLACE_LISTING_STATUS.LISTED || value.status === MARKETPLACE_LISTING_STATUS.RETIRED);
}

export function isLibraryItemSourceRelease(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.releaseId)
    && isReleaseVersion(value.version)
    && (value.status === undefined || value.status === RELEASE_STATUS.PUBLISHED || value.status === RELEASE_STATUS.RETIRED);
}

export function isLibraryItemSourcePublish(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.publishId)
    && hasNonEmptyString(value.releaseId)
    && (value.status === undefined || value.status === PUBLISH_STATUS.PUBLISHED || value.status === PUBLISH_STATUS.RETIRED);
}

export function validateLibraryItemContract(libraryItem) {
  const errors = [];

  collectForbiddenFieldErrors(libraryItem, errors);

  if (!hasNonEmptyString(libraryItem?.libraryItemId)) {
    errors.push(createContractError(
      LIBRARY_ITEM_CONTRACT_ERRORS.LIBRARY_ITEM_ID_REQUIRED,
      "Library Item records require libraryItemId.",
      LIBRARY_ITEM_FIELDS.LIBRARY_ITEM_ID
    ));
  }

  if (!hasNonEmptyString(libraryItem?.ownerId)) {
    errors.push(createContractError(
      LIBRARY_ITEM_CONTRACT_ERRORS.OWNER_REQUIRED,
      "Library Item records require ownerId.",
      LIBRARY_ITEM_FIELDS.OWNER
    ));
  }

  if (!hasNonEmptyString(libraryItem?.projectId)) {
    errors.push(createContractError(
      LIBRARY_ITEM_CONTRACT_ERRORS.PROJECT_REQUIRED,
      "Library Item records require projectId.",
      LIBRARY_ITEM_FIELDS.PROJECT
    ));
  }

  if (libraryItem?.entitlement === undefined || libraryItem?.entitlement === null) {
    errors.push(createContractError(
      LIBRARY_ITEM_CONTRACT_ERRORS.ENTITLEMENT_REQUIRED,
      "Library Item records require entitlement.",
      LIBRARY_ITEM_FIELDS.ENTITLEMENT
    ));
  } else {
    collectForbiddenFieldErrors(libraryItem.entitlement, errors, LIBRARY_ITEM_FIELDS.ENTITLEMENT);

    if (!isLibraryItemEntitlement(libraryItem.entitlement)) {
      errors.push(createContractError(
        LIBRARY_ITEM_CONTRACT_ERRORS.ENTITLEMENT_INVALID,
        "Library Item entitlement must reference an Entitlement.",
        LIBRARY_ITEM_FIELDS.ENTITLEMENT
      ));
    }
  }

  if (libraryItem?.marketplaceListing === undefined || libraryItem?.marketplaceListing === null) {
    errors.push(createContractError(
      LIBRARY_ITEM_CONTRACT_ERRORS.MARKETPLACE_LISTING_REQUIRED,
      "Library Item records require marketplaceListing.",
      LIBRARY_ITEM_FIELDS.MARKETPLACE_LISTING
    ));
  } else {
    collectForbiddenFieldErrors(libraryItem.marketplaceListing, errors, LIBRARY_ITEM_FIELDS.MARKETPLACE_LISTING);

    if (!isLibraryItemMarketplaceListing(libraryItem.marketplaceListing)) {
      errors.push(createContractError(
        LIBRARY_ITEM_CONTRACT_ERRORS.MARKETPLACE_LISTING_INVALID,
        "Library Item marketplaceListing must reference a listed or retired Marketplace Listing.",
        LIBRARY_ITEM_FIELDS.MARKETPLACE_LISTING
      ));
    }
  }

  if (libraryItem?.sourceRelease === undefined || libraryItem?.sourceRelease === null) {
    errors.push(createContractError(
      LIBRARY_ITEM_CONTRACT_ERRORS.SOURCE_RELEASE_REQUIRED,
      "Library Item records require sourceRelease.",
      LIBRARY_ITEM_FIELDS.SOURCE_RELEASE
    ));
  } else {
    collectForbiddenFieldErrors(libraryItem.sourceRelease, errors, LIBRARY_ITEM_FIELDS.SOURCE_RELEASE);

    if (!isLibraryItemSourceRelease(libraryItem.sourceRelease)) {
      errors.push(createContractError(
        LIBRARY_ITEM_CONTRACT_ERRORS.SOURCE_RELEASE_INVALID,
        "Library Item sourceRelease must reference a published or retired Release.",
        LIBRARY_ITEM_FIELDS.SOURCE_RELEASE
      ));
    }
  }

  if (libraryItem?.sourcePublish === undefined || libraryItem?.sourcePublish === null) {
    errors.push(createContractError(
      LIBRARY_ITEM_CONTRACT_ERRORS.SOURCE_PUBLISH_REQUIRED,
      "Library Item records require sourcePublish.",
      LIBRARY_ITEM_FIELDS.SOURCE_PUBLISH
    ));
  } else {
    collectForbiddenFieldErrors(libraryItem.sourcePublish, errors, LIBRARY_ITEM_FIELDS.SOURCE_PUBLISH);

    if (!isLibraryItemSourcePublish(libraryItem.sourcePublish)) {
      errors.push(createContractError(
        LIBRARY_ITEM_CONTRACT_ERRORS.SOURCE_PUBLISH_INVALID,
        "Library Item sourcePublish must reference a published or retired Publish record.",
        LIBRARY_ITEM_FIELDS.SOURCE_PUBLISH
      ));
    }
  }

  collectLinkageErrors(libraryItem, errors);

  if (!hasNonEmptyString(libraryItem?.libraryStatus)) {
    errors.push(createContractError(
      LIBRARY_ITEM_CONTRACT_ERRORS.LIBRARY_STATUS_REQUIRED,
      "Library Item records require libraryStatus.",
      LIBRARY_ITEM_FIELDS.LIBRARY_STATUS
    ));
  } else if (!isLibraryItemStatus(libraryItem.libraryStatus)) {
    errors.push(createContractError(
      LIBRARY_ITEM_CONTRACT_ERRORS.LIBRARY_STATUS_INVALID,
      "Library Item status must be available, hidden, revoked, or archived.",
      LIBRARY_ITEM_FIELDS.LIBRARY_STATUS
    ));
  }

  if (!hasNonEmptyString(libraryItem?.addedAt)) {
    errors.push(createContractError(
      LIBRARY_ITEM_CONTRACT_ERRORS.ADDED_AT_REQUIRED,
      "Library Item records require addedAt.",
      LIBRARY_ITEM_FIELDS.ADDED_AT
    ));
  } else if (!isTimestamp(libraryItem.addedAt)) {
    errors.push(createContractError(
      LIBRARY_ITEM_CONTRACT_ERRORS.ADDED_AT_INVALID,
      "Library Item addedAt must be a valid timestamp.",
      LIBRARY_ITEM_FIELDS.ADDED_AT
    ));
  }

  validateStatusTimestamp(libraryItem, errors, LIBRARY_ITEM_STATUS.HIDDEN, "hiddenAt", LIBRARY_ITEM_CONTRACT_ERRORS.HIDDEN_AT_REQUIRED, LIBRARY_ITEM_CONTRACT_ERRORS.HIDDEN_AT_INVALID, LIBRARY_ITEM_FIELDS.HIDDEN_AT);
  validateStatusTimestamp(libraryItem, errors, LIBRARY_ITEM_STATUS.REVOKED, "revokedAt", LIBRARY_ITEM_CONTRACT_ERRORS.REVOKED_AT_REQUIRED, LIBRARY_ITEM_CONTRACT_ERRORS.REVOKED_AT_INVALID, LIBRARY_ITEM_FIELDS.REVOKED_AT);
  validateStatusTimestamp(libraryItem, errors, LIBRARY_ITEM_STATUS.ARCHIVED, "archivedAt", LIBRARY_ITEM_CONTRACT_ERRORS.ARCHIVED_AT_REQUIRED, LIBRARY_ITEM_CONTRACT_ERRORS.ARCHIVED_AT_INVALID, LIBRARY_ITEM_FIELDS.ARCHIVED_AT);

  if (libraryItem?.libraryNotes !== undefined && libraryItem.libraryNotes !== null && typeof libraryItem.libraryNotes !== "string") {
    errors.push(createContractError(
      LIBRARY_ITEM_CONTRACT_ERRORS.LIBRARY_NOTES_INVALID,
      "Library Item libraryNotes must be a string when provided.",
      LIBRARY_ITEM_FIELDS.LIBRARY_NOTES
    ));
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

export function isLibraryItemAvailable(libraryItem) {
  return libraryItem?.libraryStatus === LIBRARY_ITEM_STATUS.AVAILABLE;
}

export function isLibraryItemHidden(libraryItem) {
  return libraryItem?.libraryStatus === LIBRARY_ITEM_STATUS.HIDDEN
    && isTimestamp(libraryItem.hiddenAt);
}

export function isLibraryItemRevoked(libraryItem) {
  return libraryItem?.libraryStatus === LIBRARY_ITEM_STATUS.REVOKED
    && isTimestamp(libraryItem.revokedAt);
}

export function isLibraryItemArchived(libraryItem) {
  return libraryItem?.libraryStatus === LIBRARY_ITEM_STATUS.ARCHIVED
    && isTimestamp(libraryItem.archivedAt);
}

export function isLibraryItemVisibleToActor({
  actorId,
  libraryItem,
} = {}) {
  return hasNonEmptyString(actorId) && actorId === libraryItem?.ownerId;
}

export function canActorAccessLibraryItem({
  actorId,
  role,
  permission,
  libraryItem,
  grantedScopes = [],
} = {}) {
  if (!isIdentityPermission(permission)) {
    return false;
  }

  if (actorId === libraryItem?.ownerId) {
    return canActorPerformPermission({
      actorId,
      role: IDENTITY_ROLES.OWNER,
      permission,
      scope: IDENTITY_PERMISSION_SCOPES.OWNED_OBJECT,
      object: {
        ownerId: libraryItem.ownerId,
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
        ownerId: libraryItem?.ownerId,
        visibility: IDENTITY_VISIBILITY_STATES.ADMIN_ONLY,
      },
    });
  }

  return false;
}

function collectLinkageErrors(libraryItem, errors) {
  if (isReferenceObject(libraryItem?.entitlement)
    && hasNonEmptyString(libraryItem?.ownerId)
    && hasNonEmptyString(libraryItem.entitlement.ownerId)
    && libraryItem.entitlement.ownerId !== libraryItem.ownerId) {
    errors.push(createContractError(
      LIBRARY_ITEM_CONTRACT_ERRORS.OWNER_ENTITLEMENT_MISMATCH,
      "Library Item entitlement.ownerId must match ownerId.",
      LIBRARY_ITEM_FIELDS.ENTITLEMENT
    ));
  }

  if (isReferenceObject(libraryItem?.entitlement)
    && hasNonEmptyString(libraryItem?.projectId)
    && hasNonEmptyString(libraryItem.entitlement.projectId)
    && libraryItem.entitlement.projectId !== libraryItem.projectId) {
    errors.push(createContractError(
      LIBRARY_ITEM_CONTRACT_ERRORS.PROJECT_ENTITLEMENT_MISMATCH,
      "Library Item entitlement.projectId must match projectId.",
      LIBRARY_ITEM_FIELDS.ENTITLEMENT
    ));
  }

  if (isReferenceObject(libraryItem?.entitlement)
    && isReferenceObject(libraryItem?.marketplaceListing)
    && hasNonEmptyString(libraryItem.entitlement.listingId)
    && hasNonEmptyString(libraryItem.marketplaceListing.listingId)
    && libraryItem.entitlement.listingId !== libraryItem.marketplaceListing.listingId) {
    errors.push(createContractError(
      LIBRARY_ITEM_CONTRACT_ERRORS.ENTITLEMENT_LISTING_MISMATCH,
      "Library Item entitlement.listingId must match marketplaceListing.listingId.",
      LIBRARY_ITEM_FIELDS.ENTITLEMENT
    ));
  }

  if (isReferenceObject(libraryItem?.entitlement)
    && isReferenceObject(libraryItem?.sourceRelease)
    && hasNonEmptyString(libraryItem.entitlement.releaseId)
    && hasNonEmptyString(libraryItem.sourceRelease.releaseId)
    && libraryItem.entitlement.releaseId !== libraryItem.sourceRelease.releaseId) {
    errors.push(createContractError(
      LIBRARY_ITEM_CONTRACT_ERRORS.ENTITLEMENT_RELEASE_MISMATCH,
      "Library Item entitlement.releaseId must match sourceRelease.releaseId.",
      LIBRARY_ITEM_FIELDS.ENTITLEMENT
    ));
  }

  if (isReferenceObject(libraryItem?.entitlement)
    && isReferenceObject(libraryItem?.sourcePublish)
    && hasNonEmptyString(libraryItem.entitlement.publishId)
    && hasNonEmptyString(libraryItem.sourcePublish.publishId)
    && libraryItem.entitlement.publishId !== libraryItem.sourcePublish.publishId) {
    errors.push(createContractError(
      LIBRARY_ITEM_CONTRACT_ERRORS.ENTITLEMENT_PUBLISH_MISMATCH,
      "Library Item entitlement.publishId must match sourcePublish.publishId.",
      LIBRARY_ITEM_FIELDS.ENTITLEMENT
    ));
  }

  if (isReferenceObject(libraryItem?.marketplaceListing)
    && hasNonEmptyString(libraryItem?.projectId)
    && hasNonEmptyString(libraryItem.marketplaceListing.projectId)
    && libraryItem.marketplaceListing.projectId !== libraryItem.projectId) {
    errors.push(createContractError(
      LIBRARY_ITEM_CONTRACT_ERRORS.LISTING_PROJECT_MISMATCH,
      "Library Item marketplaceListing.projectId must match projectId.",
      LIBRARY_ITEM_FIELDS.MARKETPLACE_LISTING
    ));
  }

  if (isReferenceObject(libraryItem?.marketplaceListing)
    && isReferenceObject(libraryItem?.sourceRelease)
    && hasNonEmptyString(libraryItem.marketplaceListing.releaseId)
    && hasNonEmptyString(libraryItem.sourceRelease.releaseId)
    && libraryItem.marketplaceListing.releaseId !== libraryItem.sourceRelease.releaseId) {
    errors.push(createContractError(
      LIBRARY_ITEM_CONTRACT_ERRORS.LISTING_RELEASE_MISMATCH,
      "Library Item marketplaceListing.releaseId must match sourceRelease.releaseId.",
      LIBRARY_ITEM_FIELDS.MARKETPLACE_LISTING
    ));
  }

  if (isReferenceObject(libraryItem?.marketplaceListing)
    && isReferenceObject(libraryItem?.sourcePublish)
    && hasNonEmptyString(libraryItem.marketplaceListing.publishId)
    && hasNonEmptyString(libraryItem.sourcePublish.publishId)
    && libraryItem.marketplaceListing.publishId !== libraryItem.sourcePublish.publishId) {
    errors.push(createContractError(
      LIBRARY_ITEM_CONTRACT_ERRORS.LISTING_PUBLISH_MISMATCH,
      "Library Item marketplaceListing.publishId must match sourcePublish.publishId.",
      LIBRARY_ITEM_FIELDS.MARKETPLACE_LISTING
    ));
  }

  if (isReferenceObject(libraryItem?.sourceRelease)
    && isReferenceObject(libraryItem?.sourcePublish)
    && hasNonEmptyString(libraryItem.sourceRelease.releaseId)
    && hasNonEmptyString(libraryItem.sourcePublish.releaseId)
    && libraryItem.sourceRelease.releaseId !== libraryItem.sourcePublish.releaseId) {
    errors.push(createContractError(
      LIBRARY_ITEM_CONTRACT_ERRORS.RELEASE_PUBLISH_MISMATCH,
      "Library Item sourcePublish.releaseId must match sourceRelease.releaseId.",
      LIBRARY_ITEM_FIELDS.SOURCE_PUBLISH
    ));
  }
}

function validateStatusTimestamp(libraryItem, errors, status, timestampField, requiredError, invalidError, path) {
  if (libraryItem?.libraryStatus === status) {
    if (!hasNonEmptyString(libraryItem?.[timestampField])) {
      errors.push(createContractError(
        requiredError,
        `Library Item records with ${status} status require ${timestampField}.`,
        path
      ));
    } else if (!isTimestamp(libraryItem[timestampField])) {
      errors.push(createContractError(
        invalidError,
        `Library Item ${timestampField} must be a valid timestamp.`,
        path
      ));
    }
  } else if (libraryItem?.[timestampField] !== undefined && libraryItem[timestampField] !== null && !isTimestamp(libraryItem[timestampField])) {
    errors.push(createContractError(
      invalidError,
      `Library Item ${timestampField} must be a valid timestamp when provided.`,
      path
    ));
  }
}

function collectForbiddenFieldErrors(record, errors, pathPrefix = "") {
  if (!isReferenceObject(record)) {
    return;
  }

  for (const fieldName of LIBRARY_ITEM_FORBIDDEN_FIELDS) {
    if (Object.hasOwn(record, fieldName)) {
      errors.push(createContractError(
        LIBRARY_ITEM_CONTRACT_ERRORS.FIELD_NOT_ALLOWED,
        "Library Item records must not carry payment, auth session, runtime, toolState, file bytes, CDN, or install state.",
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
