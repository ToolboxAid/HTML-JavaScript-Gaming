/*
Toolbox Aid
David Quesenberry
06/02/2026
MarketplaceListingContract.test.mjs
*/
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  IDENTITY_PERMISSIONS,
  IDENTITY_VISIBILITY_STATES,
  isIdentityPermission,
} from "../../../src/shared/contracts/identityPermissionsContract.js";
import {
  PROJECT_ROLES,
  PROJECT_TYPES,
  PROJECT_VISIBILITY_STATES,
  validateProjectContract,
} from "../../../src/shared/contracts/projectContract.js";
import {
  MARKETPLACE_LISTING_CONTRACT_ERRORS,
  MARKETPLACE_LISTING_CONTRACT_ID,
  MARKETPLACE_LISTING_CONTRACT_VERSION,
  MARKETPLACE_LISTING_FIELD_LIST,
  MARKETPLACE_LISTING_FIELDS,
  MARKETPLACE_LISTING_FORBIDDEN_FIELDS,
  MARKETPLACE_LISTING_RULES,
  MARKETPLACE_LISTING_STATUS,
  MARKETPLACE_LISTING_STATUS_LIST,
  MARKETPLACE_LISTING_VISIBILITY_LIST,
  MARKETPLACE_LISTING_VISIBILITY_STATES,
  canActorAccessMarketplaceListing,
  canEditMarketplaceListingStatus,
  isMarketplaceListingHistoricallyReferenceable,
  isMarketplaceListingSourcePublish,
  isMarketplaceListingSourceRelease,
  isMarketplaceListingStatus,
  isMarketplaceListingVisibility,
  isMarketplaceListingVisibleToActor,
  validateMarketplaceListingContract,
} from "../../../src/shared/contracts/marketplaceListingContract.js";
import {
  PUBLISH_STATUS,
  validatePublishContract,
} from "../../../src/shared/contracts/publishContract.js";
import {
  RELEASE_STATUS,
  validateReleaseContract,
} from "../../../src/shared/contracts/releaseContract.js";

const scenariosPath = fileURLToPath(
  new URL("../fixtures/marketplace-listings/marketplace-listing-scenarios.json", import.meta.url)
);

export function run() {
  const scenarios = JSON.parse(readFileSync(scenariosPath, "utf8"));

  assert.equal(MARKETPLACE_LISTING_CONTRACT_ID, "gamefoundrystudio.marketplace.listing.contract");
  assert.equal(MARKETPLACE_LISTING_CONTRACT_VERSION, "1.0.0");
  assert.deepEqual(MARKETPLACE_LISTING_FIELD_LIST, [
    "listingId",
    "ownerId",
    "projectId",
    "sourceRelease",
    "sourcePublish",
    "visibility",
    "status",
    "listedAt",
    "listingTitle",
    "listingSummary",
  ]);
  assert.deepEqual(MARKETPLACE_LISTING_FIELDS, {
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
  assert.deepEqual(MARKETPLACE_LISTING_STATUS_LIST, ["draft", "listed", "unlisted", "retired"]);
  assert.deepEqual(MARKETPLACE_LISTING_VISIBILITY_LIST, ["private", "unlisted", "public", "marketplace"]);
  assert.deepEqual(MARKETPLACE_LISTING_VISIBILITY_STATES, {
    PRIVATE: IDENTITY_VISIBILITY_STATES.PRIVATE,
    UNLISTED: IDENTITY_VISIBILITY_STATES.UNLISTED,
    PUBLIC: IDENTITY_VISIBILITY_STATES.PUBLIC,
    MARKETPLACE: IDENTITY_VISIBILITY_STATES.MARKETPLACE,
  });
  assert.equal(MARKETPLACE_LISTING_RULES.REQUIRES_OWNER, true);
  assert.equal(MARKETPLACE_LISTING_RULES.REQUIRES_PROJECT, true);
  assert.equal(MARKETPLACE_LISTING_RULES.REQUIRES_SOURCE_RELEASE, true);
  assert.equal(MARKETPLACE_LISTING_RULES.REQUIRES_SOURCE_PUBLISH, true);
  assert.equal(MARKETPLACE_LISTING_RULES.REQUIRES_RELEASE_PUBLISH_LINKAGE, true);
  assert.equal(MARKETPLACE_LISTING_RULES.CANNOT_BYPASS_OWNERSHIP_VISIBILITY_PERMISSIONS, true);
  assert.equal(MARKETPLACE_LISTING_RULES.REQUIRES_VALID_VISIBILITY, true);
  assert.equal(MARKETPLACE_LISTING_RULES.REQUIRES_VALID_LIFECYCLE_STATUS, true);
  assert.equal(MARKETPLACE_LISTING_RULES.LISTED_AND_RETIRED_REQUIRE_LISTED_AT, true);
  assert.equal(MARKETPLACE_LISTING_RULES.LISTED_IMMUTABLE_UNLESS_POLICY_ALLOWS_EDIT, true);
  assert.equal(MARKETPLACE_LISTING_RULES.RETIRED_LISTINGS_REMAIN_HISTORICALLY_REFERENCEABLE, true);
  assert.equal(MARKETPLACE_LISTING_RULES.NO_RUNTIME_STATE, true);
  assert.equal(MARKETPLACE_LISTING_RULES.NO_AUTH_STATE, true);
  assert.equal(MARKETPLACE_LISTING_RULES.NO_PAYMENT_STATE, true);
  assert.equal(MARKETPLACE_LISTING_RULES.NO_MODERATION_DECISION_STATE, true);
  assert.equal(MARKETPLACE_LISTING_FORBIDDEN_FIELDS.includes("workspaceState"), true);
  assert.equal(MARKETPLACE_LISTING_FORBIDDEN_FIELDS.includes("authState"), true);
  assert.equal(MARKETPLACE_LISTING_FORBIDDEN_FIELDS.includes("paymentState"), true);
  assert.equal(MARKETPLACE_LISTING_FORBIDDEN_FIELDS.includes("moderationDecision"), true);
  assertUnique(MARKETPLACE_LISTING_STATUS_LIST);
  assertUnique(MARKETPLACE_LISTING_VISIBILITY_LIST);
  assertUnique(MARKETPLACE_LISTING_FORBIDDEN_FIELDS);

  assert.equal(isMarketplaceListingStatus(MARKETPLACE_LISTING_STATUS.LISTED), true);
  assert.equal(isMarketplaceListingStatus("approved"), false);
  assert.equal(isMarketplaceListingVisibility(MARKETPLACE_LISTING_VISIBILITY_STATES.MARKETPLACE), true);
  assert.equal(isMarketplaceListingVisibility("team"), false);
  assert.equal(isIdentityPermission(IDENTITY_PERMISSIONS.EDIT), true);

  for (const scenario of scenarios.validListings) {
    const validation = validateMarketplaceListingContract(scenario.listing);
    assert.equal(validation.valid, true, scenario.name);
    assert.deepEqual(validation.errors, scenario.expectedErrors, scenario.name);
  }

  for (const scenario of scenarios.invalidListings) {
    const validation = validateMarketplaceListingContract(scenario.listing);
    assert.equal(validation.valid, false, scenario.name);
    assert.deepEqual(validation.errors.map((error) => error.code), scenario.expectedErrors, scenario.name);
  }

  assertErrorForScenario(scenarios, "missing owner", MARKETPLACE_LISTING_CONTRACT_ERRORS.OWNER_REQUIRED);
  assertErrorForScenario(scenarios, "missing project", MARKETPLACE_LISTING_CONTRACT_ERRORS.PROJECT_REQUIRED);
  assertErrorForScenario(scenarios, "missing source release", MARKETPLACE_LISTING_CONTRACT_ERRORS.SOURCE_RELEASE_REQUIRED);
  assertErrorForScenario(scenarios, "missing source publish", MARKETPLACE_LISTING_CONTRACT_ERRORS.SOURCE_PUBLISH_REQUIRED);
  assertErrorForScenario(scenarios, "invalid source release", MARKETPLACE_LISTING_CONTRACT_ERRORS.SOURCE_RELEASE_INVALID);
  assertErrorForScenario(scenarios, "invalid source publish", MARKETPLACE_LISTING_CONTRACT_ERRORS.SOURCE_PUBLISH_INVALID);
  assertErrorForScenario(scenarios, "source linkage mismatch", MARKETPLACE_LISTING_CONTRACT_ERRORS.SOURCE_LINKAGE_MISMATCH);
  assertErrorForScenario(scenarios, "invalid visibility", MARKETPLACE_LISTING_CONTRACT_ERRORS.VISIBILITY_INVALID);
  assertErrorForScenario(scenarios, "invalid status", MARKETPLACE_LISTING_CONTRACT_ERRORS.STATUS_INVALID);
  assertErrorForScenario(scenarios, "listed without timestamp", MARKETPLACE_LISTING_CONTRACT_ERRORS.LISTED_AT_REQUIRED);
  assertErrorForScenario(scenarios, "runtime state leakage", MARKETPLACE_LISTING_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "auth state leakage", MARKETPLACE_LISTING_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "payment state leakage", MARKETPLACE_LISTING_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "moderation decision leakage", MARKETPLACE_LISTING_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);

  const project = {
    id: "project.game.alpha",
    ownerId: "user.owner",
    projectType: PROJECT_TYPES.GAME,
    state: "marketplace",
    visibility: PROJECT_VISIBILITY_STATES.PUBLIC,
  };
  const sourceReleaseRecord = {
    releaseId: "release.game.alpha.1",
    ownerId: "user.owner",
    projectId: "project.game.alpha",
    sourceManifest: {
      manifestId: "manifest.game.alpha",
      version: 1,
      exportFormat: "game-manifest-json",
    },
    version: 1,
    status: RELEASE_STATUS.PUBLISHED,
    visibility: PROJECT_VISIBILITY_STATES.PUBLIC,
    publishedAt: "2026-06-02T14:00:00.000Z",
    releaseNotes: "Release linked by marketplace listing contract.",
  };
  const sourcePublishRecord = {
    publishId: "publish.game.alpha.1",
    ownerId: "user.owner",
    projectId: "project.game.alpha",
    sourceRelease: {
      releaseId: sourceReleaseRecord.releaseId,
      version: sourceReleaseRecord.version,
      status: sourceReleaseRecord.status,
    },
    visibility: PROJECT_VISIBILITY_STATES.PUBLIC,
    status: PUBLISH_STATUS.PUBLISHED,
    publishedAt: "2026-06-02T15:00:00.000Z",
    publishNotes: "Publish record linked by marketplace listing contract.",
  };
  const sourceReleaseReference = {
    releaseId: sourceReleaseRecord.releaseId,
    version: sourceReleaseRecord.version,
    status: sourceReleaseRecord.status,
  };
  const sourcePublishReference = {
    publishId: sourcePublishRecord.publishId,
    releaseId: sourceReleaseRecord.releaseId,
    status: sourcePublishRecord.status,
  };
  assert.equal(validateProjectContract(project).valid, true);
  assert.equal(validateReleaseContract(sourceReleaseRecord).valid, true);
  assert.equal(validatePublishContract(sourcePublishRecord).valid, true);
  assert.equal(isMarketplaceListingSourceRelease(sourceReleaseReference), true);
  assert.equal(isMarketplaceListingSourceRelease({
    releaseId: sourceReleaseRecord.releaseId,
    version: 1,
    status: "draft",
  }), false);
  assert.equal(isMarketplaceListingSourcePublish(sourcePublishReference), true);
  assert.equal(isMarketplaceListingSourcePublish({
    publishId: sourcePublishRecord.publishId,
    releaseId: sourceReleaseRecord.releaseId,
    status: PUBLISH_STATUS.READY,
  }), false);

  const listing = scenarios.validListings[0].listing;
  assert.equal(isMarketplaceListingVisibleToActor({
    actorId: "user.other",
    listing: {
      ...listing,
      visibility: MARKETPLACE_LISTING_VISIBILITY_STATES.PRIVATE,
    },
    project,
  }), false);
  assert.equal(isMarketplaceListingVisibleToActor({
    actorId: "public.viewer",
    listing,
    project,
  }), true);
  assert.equal(isMarketplaceListingVisibleToActor({
    actorId: "public.viewer",
    listing: {
      ...listing,
      visibility: MARKETPLACE_LISTING_VISIBILITY_STATES.UNLISTED,
    },
    project,
  }), true);
  assert.equal(isMarketplaceListingVisibleToActor({
    actorId: "user.viewer",
    listing: {
      ...listing,
      visibility: MARKETPLACE_LISTING_VISIBILITY_STATES.PRIVATE,
    },
    project: {
      ...project,
      visibility: PROJECT_VISIBILITY_STATES.PROJECT,
    },
    grantedProjectIds: ["project.game.alpha"],
  }), true);

  assert.equal(canActorAccessMarketplaceListing({
    actorId: "user.viewer",
    projectRole: PROJECT_ROLES.VIEWER,
    permission: IDENTITY_PERMISSIONS.EDIT,
    listing,
    project,
  }), false, "marketplace visibility does not grant edit permission");
  assert.equal(canActorAccessMarketplaceListing({
    actorId: "user.collaborator",
    projectRole: PROJECT_ROLES.COLLABORATOR,
    permission: IDENTITY_PERMISSIONS.EDIT,
    listing,
    project,
    grantedProjectIds: ["project.game.alpha"],
    grantedScopes: ["project"],
  }), false, "listed marketplace listing immutable by default");
  assert.equal(canActorAccessMarketplaceListing({
    actorId: "user.collaborator",
    projectRole: PROJECT_ROLES.COLLABORATOR,
    permission: IDENTITY_PERMISSIONS.EDIT,
    listing,
    project,
    grantedProjectIds: ["project.game.alpha"],
    grantedScopes: ["project"],
    policy: {
      allowListedMarketplaceListingEdit: true,
    },
  }), true, "listed marketplace listing editable when policy allows");
  assert.equal(canActorAccessMarketplaceListing({
    actorId: "user.owner",
    projectRole: PROJECT_ROLES.OWNER,
    permission: IDENTITY_PERMISSIONS.DELETE,
    listing,
    project,
  }), true, "owner keeps object control");

  assert.equal(canEditMarketplaceListingStatus(listing), false);
  assert.equal(canEditMarketplaceListingStatus(listing, { allowListedMarketplaceListingEdit: true }), true);

  const draftListing = scenarios.validListings.find((scenario) => scenario.name === "draft private marketplace listing").listing;
  assert.equal(canEditMarketplaceListingStatus(draftListing), true);

  const retiredListing = scenarios.validListings.find((scenario) => scenario.name === "retired historically referenceable listing").listing;
  assert.equal(validateMarketplaceListingContract(retiredListing).valid, true);
  assert.equal(isMarketplaceListingHistoricallyReferenceable(retiredListing), true);
  assert.equal(canEditMarketplaceListingStatus(retiredListing), false);
  assert.equal(canEditMarketplaceListingStatus(retiredListing, { allowRetiredMarketplaceListingEdit: true }), true);
}

function assertErrorForScenario(scenarios, name, expectedErrorCode) {
  const scenario = scenarios.invalidListings.find((item) => item.name === name);
  const validation = validateMarketplaceListingContract(scenario.listing);
  assert.equal(validation.errors.some((error) => error.code === expectedErrorCode), true, name);
}

function assertUnique(values) {
  assert.equal(new Set(values).size, values.length);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
