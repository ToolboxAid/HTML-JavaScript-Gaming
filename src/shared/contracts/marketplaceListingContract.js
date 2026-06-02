/*
Toolbox Aid
David Quesenberry
06/02/2026
marketplaceListingContract.js
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
  PROJECT_ROLES,
  canActorAccessProject,
} from "./projectContract.js";
import {
  RELEASE_STATUS,
  isReleaseVersion,
} from "./releaseContract.js";
import {
  PUBLISH_STATUS,
} from "./publishContract.js";

export const MARKETPLACE_LISTING_CONTRACT_ID = "gamefoundrystudio.marketplace.listing.contract";
export const MARKETPLACE_LISTING_CONTRACT_VERSION = "1.0.0";

export const MARKETPLACE_LISTING_FIELDS = Object.freeze({
  LISTING_ID: "listingId",
  OWNER: "ownerId",
  PROJECT: "projectId",
  SOURCE_RELEASE: "sourceRelease",
  SOURCE_PUBLISH: "sourcePublish",
  VISIBILITY: "visibility",
  STATUS: "status",
  LISTED_AT: "listedAt",
  LISTING_TITLE: "listingTitle",
  LISTING_SUMMARY: "listingSummary",
});

export const MARKETPLACE_LISTING_FIELD_LIST = Object.freeze([
  MARKETPLACE_LISTING_FIELDS.LISTING_ID,
  MARKETPLACE_LISTING_FIELDS.OWNER,
  MARKETPLACE_LISTING_FIELDS.PROJECT,
  MARKETPLACE_LISTING_FIELDS.SOURCE_RELEASE,
  MARKETPLACE_LISTING_FIELDS.SOURCE_PUBLISH,
  MARKETPLACE_LISTING_FIELDS.VISIBILITY,
  MARKETPLACE_LISTING_FIELDS.STATUS,
  MARKETPLACE_LISTING_FIELDS.LISTED_AT,
  MARKETPLACE_LISTING_FIELDS.LISTING_TITLE,
  MARKETPLACE_LISTING_FIELDS.LISTING_SUMMARY,
]);

export const MARKETPLACE_LISTING_STATUS = Object.freeze({
  DRAFT: "draft",
  LISTED: "listed",
  UNLISTED: "unlisted",
  RETIRED: "retired",
});

export const MARKETPLACE_LISTING_STATUS_LIST = Object.freeze([
  MARKETPLACE_LISTING_STATUS.DRAFT,
  MARKETPLACE_LISTING_STATUS.LISTED,
  MARKETPLACE_LISTING_STATUS.UNLISTED,
  MARKETPLACE_LISTING_STATUS.RETIRED,
]);

export const MARKETPLACE_LISTING_VISIBILITY_STATES = Object.freeze({
  PRIVATE: IDENTITY_VISIBILITY_STATES.PRIVATE,
  UNLISTED: IDENTITY_VISIBILITY_STATES.UNLISTED,
  PUBLIC: IDENTITY_VISIBILITY_STATES.PUBLIC,
  MARKETPLACE: IDENTITY_VISIBILITY_STATES.MARKETPLACE,
});

export const MARKETPLACE_LISTING_VISIBILITY_LIST = Object.freeze([
  MARKETPLACE_LISTING_VISIBILITY_STATES.PRIVATE,
  MARKETPLACE_LISTING_VISIBILITY_STATES.UNLISTED,
  MARKETPLACE_LISTING_VISIBILITY_STATES.PUBLIC,
  MARKETPLACE_LISTING_VISIBILITY_STATES.MARKETPLACE,
]);

export const MARKETPLACE_LISTING_RULES = Object.freeze({
  REQUIRES_OWNER: true,
  REQUIRES_PROJECT: true,
  REQUIRES_SOURCE_RELEASE: true,
  REQUIRES_SOURCE_PUBLISH: true,
  REQUIRES_RELEASE_PUBLISH_LINKAGE: true,
  CANNOT_BYPASS_OWNERSHIP_VISIBILITY_PERMISSIONS: true,
  REQUIRES_VALID_VISIBILITY: true,
  REQUIRES_VALID_LIFECYCLE_STATUS: true,
  LISTED_AND_RETIRED_REQUIRE_LISTED_AT: true,
  LISTED_IMMUTABLE_UNLESS_POLICY_ALLOWS_EDIT: true,
  RETIRED_LISTINGS_REMAIN_HISTORICALLY_REFERENCEABLE: true,
  NO_RUNTIME_STATE: true,
  NO_AUTH_STATE: true,
  NO_PAYMENT_STATE: true,
  NO_MODERATION_DECISION_STATE: true,
});

export const MARKETPLACE_LISTING_FORBIDDEN_FIELDS = Object.freeze([
  "activeProjectId",
  "activeToolId",
  "activeToolStateId",
  "authProvider",
  "authState",
  "checkoutSession",
  "credentials",
  "dirty",
  "identityProvider",
  "localStorage",
  "marketplaceModerationState",
  "marketplaceReviewState",
  "moderationDecision",
  "moderationState",
  "moderationStatus",
  "moderatorId",
  "paymentIntent",
  "paymentMethod",
  "paymentProvider",
  "paymentState",
  "paymentStatus",
  "payload",
  "payloadJson",
  "recoveryAvailable",
  "rejectedAt",
  "reviewState",
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

export const MARKETPLACE_LISTING_CONTRACT_ERRORS = Object.freeze({
  LISTING_ID_REQUIRED: "MARKETPLACE_LISTING_ID_REQUIRED",
  OWNER_REQUIRED: "MARKETPLACE_LISTING_OWNER_REQUIRED",
  PROJECT_REQUIRED: "MARKETPLACE_LISTING_PROJECT_REQUIRED",
  SOURCE_RELEASE_REQUIRED: "MARKETPLACE_LISTING_SOURCE_RELEASE_REQUIRED",
  SOURCE_RELEASE_INVALID: "MARKETPLACE_LISTING_SOURCE_RELEASE_INVALID",
  SOURCE_PUBLISH_REQUIRED: "MARKETPLACE_LISTING_SOURCE_PUBLISH_REQUIRED",
  SOURCE_PUBLISH_INVALID: "MARKETPLACE_LISTING_SOURCE_PUBLISH_INVALID",
  SOURCE_LINKAGE_MISMATCH: "MARKETPLACE_LISTING_SOURCE_LINKAGE_MISMATCH",
  VISIBILITY_REQUIRED: "MARKETPLACE_LISTING_VISIBILITY_REQUIRED",
  VISIBILITY_INVALID: "MARKETPLACE_LISTING_VISIBILITY_INVALID",
  STATUS_REQUIRED: "MARKETPLACE_LISTING_STATUS_REQUIRED",
  STATUS_INVALID: "MARKETPLACE_LISTING_STATUS_INVALID",
  LISTED_AT_REQUIRED: "MARKETPLACE_LISTING_LISTED_AT_REQUIRED",
  LISTED_AT_INVALID: "MARKETPLACE_LISTING_LISTED_AT_INVALID",
  LISTING_TITLE_INVALID: "MARKETPLACE_LISTING_TITLE_INVALID",
  LISTING_SUMMARY_INVALID: "MARKETPLACE_LISTING_SUMMARY_INVALID",
  FIELD_NOT_ALLOWED: "MARKETPLACE_LISTING_FIELD_NOT_ALLOWED",
});

export function isMarketplaceListingStatus(value) {
  return MARKETPLACE_LISTING_STATUS_LIST.includes(value);
}

export function isMarketplaceListingVisibility(value) {
  return MARKETPLACE_LISTING_VISIBILITY_LIST.includes(value);
}

export function isMarketplaceListingSourceRelease(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.releaseId)
    && isReleaseVersion(value.version)
    && (value.status === undefined || value.status === RELEASE_STATUS.PUBLISHED || value.status === RELEASE_STATUS.RETIRED);
}

export function isMarketplaceListingSourcePublish(value) {
  return isReferenceObject(value)
    && hasNonEmptyString(value.publishId)
    && hasNonEmptyString(value.releaseId)
    && (value.status === undefined || value.status === PUBLISH_STATUS.PUBLISHED || value.status === PUBLISH_STATUS.RETIRED);
}

export function validateMarketplaceListingContract(listing) {
  const errors = [];

  collectForbiddenFieldErrors(listing, errors);

  if (!hasNonEmptyString(listing?.listingId)) {
    errors.push(createContractError(
      MARKETPLACE_LISTING_CONTRACT_ERRORS.LISTING_ID_REQUIRED,
      "Marketplace Listing records require listingId.",
      MARKETPLACE_LISTING_FIELDS.LISTING_ID
    ));
  }

  if (!hasNonEmptyString(listing?.ownerId)) {
    errors.push(createContractError(
      MARKETPLACE_LISTING_CONTRACT_ERRORS.OWNER_REQUIRED,
      "Marketplace Listing records require ownerId.",
      MARKETPLACE_LISTING_FIELDS.OWNER
    ));
  }

  if (!hasNonEmptyString(listing?.projectId)) {
    errors.push(createContractError(
      MARKETPLACE_LISTING_CONTRACT_ERRORS.PROJECT_REQUIRED,
      "Marketplace Listing records require projectId.",
      MARKETPLACE_LISTING_FIELDS.PROJECT
    ));
  }

  if (listing?.sourceRelease === undefined || listing?.sourceRelease === null) {
    errors.push(createContractError(
      MARKETPLACE_LISTING_CONTRACT_ERRORS.SOURCE_RELEASE_REQUIRED,
      "Marketplace Listing records require sourceRelease.",
      MARKETPLACE_LISTING_FIELDS.SOURCE_RELEASE
    ));
  } else {
    collectForbiddenFieldErrors(listing.sourceRelease, errors, MARKETPLACE_LISTING_FIELDS.SOURCE_RELEASE);

    if (!isMarketplaceListingSourceRelease(listing.sourceRelease)) {
      errors.push(createContractError(
        MARKETPLACE_LISTING_CONTRACT_ERRORS.SOURCE_RELEASE_INVALID,
        "Marketplace Listing sourceRelease must reference a published or retired Release.",
        MARKETPLACE_LISTING_FIELDS.SOURCE_RELEASE
      ));
    }
  }

  if (listing?.sourcePublish === undefined || listing?.sourcePublish === null) {
    errors.push(createContractError(
      MARKETPLACE_LISTING_CONTRACT_ERRORS.SOURCE_PUBLISH_REQUIRED,
      "Marketplace Listing records require sourcePublish.",
      MARKETPLACE_LISTING_FIELDS.SOURCE_PUBLISH
    ));
  } else {
    collectForbiddenFieldErrors(listing.sourcePublish, errors, MARKETPLACE_LISTING_FIELDS.SOURCE_PUBLISH);

    if (!isMarketplaceListingSourcePublish(listing.sourcePublish)) {
      errors.push(createContractError(
        MARKETPLACE_LISTING_CONTRACT_ERRORS.SOURCE_PUBLISH_INVALID,
        "Marketplace Listing sourcePublish must reference a published or retired Publish record.",
        MARKETPLACE_LISTING_FIELDS.SOURCE_PUBLISH
      ));
    }
  }

  if (isReferenceObject(listing?.sourceRelease)
    && isReferenceObject(listing?.sourcePublish)
    && hasNonEmptyString(listing.sourceRelease.releaseId)
    && hasNonEmptyString(listing.sourcePublish.releaseId)
    && listing.sourceRelease.releaseId !== listing.sourcePublish.releaseId) {
    errors.push(createContractError(
      MARKETPLACE_LISTING_CONTRACT_ERRORS.SOURCE_LINKAGE_MISMATCH,
      "Marketplace Listing sourcePublish must point to the same Release as sourceRelease.",
      MARKETPLACE_LISTING_FIELDS.SOURCE_PUBLISH
    ));
  }

  if (!hasNonEmptyString(listing?.visibility)) {
    errors.push(createContractError(
      MARKETPLACE_LISTING_CONTRACT_ERRORS.VISIBILITY_REQUIRED,
      "Marketplace Listing records require explicit visibility.",
      MARKETPLACE_LISTING_FIELDS.VISIBILITY
    ));
  } else if (!isMarketplaceListingVisibility(listing.visibility)) {
    errors.push(createContractError(
      MARKETPLACE_LISTING_CONTRACT_ERRORS.VISIBILITY_INVALID,
      "Marketplace Listing visibility must be private, unlisted, public, or marketplace.",
      MARKETPLACE_LISTING_FIELDS.VISIBILITY
    ));
  }

  if (!hasNonEmptyString(listing?.status)) {
    errors.push(createContractError(
      MARKETPLACE_LISTING_CONTRACT_ERRORS.STATUS_REQUIRED,
      "Marketplace Listing records require status.",
      MARKETPLACE_LISTING_FIELDS.STATUS
    ));
  } else if (!isMarketplaceListingStatus(listing.status)) {
    errors.push(createContractError(
      MARKETPLACE_LISTING_CONTRACT_ERRORS.STATUS_INVALID,
      "Marketplace Listing status must be an allowed lifecycle status.",
      MARKETPLACE_LISTING_FIELDS.STATUS
    ));
  }

  if (listing?.status === MARKETPLACE_LISTING_STATUS.LISTED || listing?.status === MARKETPLACE_LISTING_STATUS.RETIRED) {
    if (!hasNonEmptyString(listing?.listedAt)) {
      errors.push(createContractError(
        MARKETPLACE_LISTING_CONTRACT_ERRORS.LISTED_AT_REQUIRED,
        "Listed and retired Marketplace Listing records require listedAt.",
        MARKETPLACE_LISTING_FIELDS.LISTED_AT
      ));
    } else if (!isTimestamp(listing.listedAt)) {
      errors.push(createContractError(
        MARKETPLACE_LISTING_CONTRACT_ERRORS.LISTED_AT_INVALID,
        "Marketplace Listing listedAt must be a valid timestamp.",
        MARKETPLACE_LISTING_FIELDS.LISTED_AT
      ));
    }
  } else if (listing?.listedAt !== undefined && listing.listedAt !== null && !isTimestamp(listing.listedAt)) {
    errors.push(createContractError(
      MARKETPLACE_LISTING_CONTRACT_ERRORS.LISTED_AT_INVALID,
      "Marketplace Listing listedAt must be a valid timestamp when provided.",
      MARKETPLACE_LISTING_FIELDS.LISTED_AT
    ));
  }

  if (listing?.listingTitle !== undefined && listing.listingTitle !== null && !hasNonEmptyString(listing.listingTitle)) {
    errors.push(createContractError(
      MARKETPLACE_LISTING_CONTRACT_ERRORS.LISTING_TITLE_INVALID,
      "Marketplace Listing listingTitle must be a non-empty string when provided.",
      MARKETPLACE_LISTING_FIELDS.LISTING_TITLE
    ));
  }

  if (listing?.listingSummary !== undefined && listing.listingSummary !== null && typeof listing.listingSummary !== "string") {
    errors.push(createContractError(
      MARKETPLACE_LISTING_CONTRACT_ERRORS.LISTING_SUMMARY_INVALID,
      "Marketplace Listing listingSummary must be a string when provided.",
      MARKETPLACE_LISTING_FIELDS.LISTING_SUMMARY
    ));
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

export function canEditMarketplaceListingStatus(listing, policy = {}) {
  if (listing?.status === MARKETPLACE_LISTING_STATUS.LISTED) {
    return policy.allowListedMarketplaceListingEdit === true;
  }

  if (listing?.status === MARKETPLACE_LISTING_STATUS.RETIRED) {
    return policy.allowRetiredMarketplaceListingEdit === true;
  }

  return isMarketplaceListingStatus(listing?.status);
}

export function isMarketplaceListingHistoricallyReferenceable(listing) {
  return listing?.status === MARKETPLACE_LISTING_STATUS.RETIRED
    && hasNonEmptyString(listing.listingId)
    && isMarketplaceListingSourceRelease(listing.sourceRelease)
    && isMarketplaceListingSourcePublish(listing.sourcePublish);
}

export function isMarketplaceListingVisibleToActor({
  actorId,
  listing,
  project,
  grantedProjectIds = [],
} = {}) {
  if (!hasNonEmptyString(actorId) || !listing) {
    return false;
  }

  if (actorId === listing.ownerId) {
    return true;
  }

  if (listing.visibility === MARKETPLACE_LISTING_VISIBILITY_STATES.PUBLIC
    || listing.visibility === MARKETPLACE_LISTING_VISIBILITY_STATES.UNLISTED
    || listing.visibility === MARKETPLACE_LISTING_VISIBILITY_STATES.MARKETPLACE) {
    return true;
  }

  if (!project || listing.projectId !== project.id) {
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

export function canActorAccessMarketplaceListing({
  actorId,
  projectRole,
  permission,
  listing,
  project,
  grantedProjectIds = [],
  grantedScopes = [],
  policy = {},
} = {}) {
  if (!isIdentityPermission(permission) || !isMarketplaceListingVisibleToActor({ actorId, listing, project, grantedProjectIds })) {
    return false;
  }

  if (permission === IDENTITY_PERMISSIONS.EDIT && !canEditMarketplaceListingStatus(listing, policy)) {
    return false;
  }

  if (actorId === listing?.ownerId) {
    return canActorPerformPermission({
      actorId,
      role: IDENTITY_ROLES.OWNER,
      permission,
      scope: IDENTITY_PERMISSION_SCOPES.OWNED_OBJECT,
      object: {
        ownerId: listing.ownerId,
        visibility: listing.visibility,
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

function collectForbiddenFieldErrors(record, errors, pathPrefix = "") {
  if (!isReferenceObject(record)) {
    return;
  }

  for (const fieldName of MARKETPLACE_LISTING_FORBIDDEN_FIELDS) {
    if (Object.hasOwn(record, fieldName)) {
      errors.push(createContractError(
        MARKETPLACE_LISTING_CONTRACT_ERRORS.FIELD_NOT_ALLOWED,
        "Marketplace Listing records must not carry runtime, auth, payment, moderation decision, or tool state data.",
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
