/*
Toolbox Aid
David Quesenberry
06/02/2026
DownloadGrantContract.test.mjs
*/
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  IDENTITY_PERMISSIONS,
  IDENTITY_ROLES,
  isIdentityPermission,
} from "../../../src/shared/contracts/identityPermissionsContract.js";
import {
  ENTITLEMENT_TYPES,
  validateEntitlementContract,
} from "../../../src/shared/contracts/entitlementContract.js";
import {
  DOWNLOAD_GRANT_CONTRACT_ERRORS,
  DOWNLOAD_GRANT_CONTRACT_ID,
  DOWNLOAD_GRANT_CONTRACT_VERSION,
  DOWNLOAD_GRANT_FIELD_LIST,
  DOWNLOAD_GRANT_FIELDS,
  DOWNLOAD_GRANT_FORBIDDEN_FIELDS,
  DOWNLOAD_GRANT_RULES,
  DOWNLOAD_GRANT_STATUS,
  DOWNLOAD_GRANT_STATUS_LIST,
  canActorAccessDownloadGrant,
  isDownloadGrantActive,
  isDownloadGrantConsumed,
  isDownloadGrantEntitlement,
  isDownloadGrantExpired,
  isDownloadGrantMarketplaceListing,
  isDownloadGrantRevoked,
  isDownloadGrantSourcePublish,
  isDownloadGrantSourceRelease,
  isDownloadGrantStatus,
  isDownloadGrantUsable,
  isDownloadGrantVisibleToActor,
  validateDownloadGrantContract,
} from "../../../src/shared/contracts/downloadGrantContract.js";
import {
  MARKETPLACE_LISTING_STATUS,
  validateMarketplaceListingContract,
} from "../../../src/shared/contracts/marketplaceListingContract.js";
import {
  PUBLISH_STATUS,
  validatePublishContract,
} from "../../../src/shared/contracts/publishContract.js";
import {
  PROJECT_TYPES,
  PROJECT_VISIBILITY_STATES,
  validateProjectContract,
} from "../../../src/shared/contracts/projectContract.js";
import {
  RELEASE_STATUS,
  validateReleaseContract,
} from "../../../src/shared/contracts/releaseContract.js";

const scenariosPath = fileURLToPath(
  new URL("../fixtures/download-grants/download-grant-scenarios.json", import.meta.url)
);
const referenceTime = "2026-06-02T18:00:00.000Z";

export function run() {
  const scenarios = JSON.parse(readFileSync(scenariosPath, "utf8"));

  assert.equal(DOWNLOAD_GRANT_CONTRACT_ID, "gamefoundrystudio.download.grant.contract");
  assert.equal(DOWNLOAD_GRANT_CONTRACT_VERSION, "1.0.0");
  assert.deepEqual(DOWNLOAD_GRANT_FIELD_LIST, [
    "downloadGrantId",
    "ownerId",
    "projectId",
    "entitlement",
    "marketplaceListing",
    "sourceRelease",
    "sourcePublish",
    "grantStatus",
    "grantedAt",
    "expiresAt",
    "revokedAt",
    "consumedAt",
    "grantNotes",
  ]);
  assert.deepEqual(DOWNLOAD_GRANT_FIELDS, {
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
  assert.deepEqual(DOWNLOAD_GRANT_STATUS_LIST, ["active", "expired", "revoked", "consumed"]);
  assert.equal(DOWNLOAD_GRANT_RULES.REQUIRES_OWNER, true);
  assert.equal(DOWNLOAD_GRANT_RULES.REQUIRES_PROJECT, true);
  assert.equal(DOWNLOAD_GRANT_RULES.REQUIRES_ENTITLEMENT, true);
  assert.equal(DOWNLOAD_GRANT_RULES.REQUIRES_MARKETPLACE_LISTING, true);
  assert.equal(DOWNLOAD_GRANT_RULES.REQUIRES_SOURCE_RELEASE, true);
  assert.equal(DOWNLOAD_GRANT_RULES.REQUIRES_SOURCE_PUBLISH, true);
  assert.equal(DOWNLOAD_GRANT_RULES.REQUIRES_VALID_GRANT_STATUS, true);
  assert.equal(DOWNLOAD_GRANT_RULES.REQUIRES_GRANTED_AT, true);
  assert.equal(DOWNLOAD_GRANT_RULES.ACTIVE_GRANTS_REQUIRE_FUTURE_EXPIRATION, true);
  assert.equal(DOWNLOAD_GRANT_RULES.EXPIRED_GRANTS_REQUIRE_EXPIRED_EXPIRATION, true);
  assert.equal(DOWNLOAD_GRANT_RULES.REVOKED_GRANTS_REQUIRE_REVOKED_AT, true);
  assert.equal(DOWNLOAD_GRANT_RULES.CONSUMED_GRANTS_REQUIRE_CONSUMED_AT, true);
  assert.equal(DOWNLOAD_GRANT_RULES.REQUIRES_OWNER_ENTITLEMENT_LINKAGE, true);
  assert.equal(DOWNLOAD_GRANT_RULES.REQUIRES_PROJECT_ENTITLEMENT_LINKAGE, true);
  assert.equal(DOWNLOAD_GRANT_RULES.REQUIRES_ENTITLEMENT_LISTING_LINKAGE, true);
  assert.equal(DOWNLOAD_GRANT_RULES.REQUIRES_ENTITLEMENT_RELEASE_LINKAGE, true);
  assert.equal(DOWNLOAD_GRANT_RULES.REQUIRES_ENTITLEMENT_PUBLISH_LINKAGE, true);
  assert.equal(DOWNLOAD_GRANT_RULES.REQUIRES_LISTING_PROJECT_LINKAGE, true);
  assert.equal(DOWNLOAD_GRANT_RULES.REQUIRES_LISTING_RELEASE_LINKAGE, true);
  assert.equal(DOWNLOAD_GRANT_RULES.REQUIRES_LISTING_PUBLISH_LINKAGE, true);
  assert.equal(DOWNLOAD_GRANT_RULES.REQUIRES_RELEASE_PUBLISH_LINKAGE, true);
  assert.equal(DOWNLOAD_GRANT_RULES.NO_PAYMENT_STATE, true);
  assert.equal(DOWNLOAD_GRANT_RULES.NO_AUTH_SESSION_STATE, true);
  assert.equal(DOWNLOAD_GRANT_RULES.NO_RUNTIME_STATE, true);
  assert.equal(DOWNLOAD_GRANT_RULES.NO_TOOL_STATE, true);
  assert.equal(DOWNLOAD_GRANT_RULES.NO_FILE_BYTES, true);
  assert.equal(DOWNLOAD_GRANT_RULES.NO_CDN_IMPLEMENTATION_DETAILS, true);
  assert.equal(DOWNLOAD_GRANT_RULES.NO_STORAGE_IMPLEMENTATION_DETAILS, true);
  assert.equal(DOWNLOAD_GRANT_FORBIDDEN_FIELDS.includes("paymentState"), true);
  assert.equal(DOWNLOAD_GRANT_FORBIDDEN_FIELDS.includes("authSessionState"), true);
  assert.equal(DOWNLOAD_GRANT_FORBIDDEN_FIELDS.includes("workspaceState"), true);
  assert.equal(DOWNLOAD_GRANT_FORBIDDEN_FIELDS.includes("toolState"), true);
  assert.equal(DOWNLOAD_GRANT_FORBIDDEN_FIELDS.includes("fileBytes"), true);
  assert.equal(DOWNLOAD_GRANT_FORBIDDEN_FIELDS.includes("cdnUrl"), true);
  assert.equal(DOWNLOAD_GRANT_FORBIDDEN_FIELDS.includes("storageBucket"), true);
  assertUnique(DOWNLOAD_GRANT_STATUS_LIST);
  assertUnique(DOWNLOAD_GRANT_FORBIDDEN_FIELDS);

  assert.equal(isDownloadGrantStatus(DOWNLOAD_GRANT_STATUS.ACTIVE), true);
  assert.equal(isDownloadGrantStatus(DOWNLOAD_GRANT_STATUS.EXPIRED), true);
  assert.equal(isDownloadGrantStatus(DOWNLOAD_GRANT_STATUS.REVOKED), true);
  assert.equal(isDownloadGrantStatus(DOWNLOAD_GRANT_STATUS.CONSUMED), true);
  assert.equal(isDownloadGrantStatus("pending"), false);
  assert.equal(isIdentityPermission(IDENTITY_PERMISSIONS.VIEW), true);

  for (const scenario of scenarios.validDownloadGrants) {
    const validation = validateDownloadGrantContract(scenario.downloadGrant, { now: referenceTime });
    assert.equal(validation.valid, true, scenario.name);
    assert.deepEqual(validation.errors, scenario.expectedErrors, scenario.name);
  }

  for (const scenario of scenarios.invalidDownloadGrants) {
    const validation = validateDownloadGrantContract(scenario.downloadGrant, { now: referenceTime });
    assert.equal(validation.valid, false, scenario.name);
    assert.deepEqual(validation.errors.map((error) => error.code), scenario.expectedErrors, scenario.name);
  }

  assertErrorForScenario(scenarios, "missing owner", DOWNLOAD_GRANT_CONTRACT_ERRORS.OWNER_REQUIRED);
  assertErrorForScenario(scenarios, "missing entitlement", DOWNLOAD_GRANT_CONTRACT_ERRORS.ENTITLEMENT_REQUIRED);
  assertErrorForScenario(scenarios, "missing marketplace listing", DOWNLOAD_GRANT_CONTRACT_ERRORS.MARKETPLACE_LISTING_REQUIRED);
  assertErrorForScenario(scenarios, "missing source release", DOWNLOAD_GRANT_CONTRACT_ERRORS.SOURCE_RELEASE_REQUIRED);
  assertErrorForScenario(scenarios, "missing source publish", DOWNLOAD_GRANT_CONTRACT_ERRORS.SOURCE_PUBLISH_REQUIRED);
  assertErrorForScenario(scenarios, "invalid grant status", DOWNLOAD_GRANT_CONTRACT_ERRORS.GRANT_STATUS_INVALID);
  assertErrorForScenario(scenarios, "owner entitlement mismatch", DOWNLOAD_GRANT_CONTRACT_ERRORS.OWNER_ENTITLEMENT_MISMATCH);
  assertErrorForScenario(scenarios, "entitlement listing mismatch", DOWNLOAD_GRANT_CONTRACT_ERRORS.ENTITLEMENT_LISTING_MISMATCH);
  assertErrorForScenario(scenarios, "listing release mismatch", DOWNLOAD_GRANT_CONTRACT_ERRORS.LISTING_RELEASE_MISMATCH);
  assertErrorForScenario(scenarios, "release publish mismatch", DOWNLOAD_GRANT_CONTRACT_ERRORS.RELEASE_PUBLISH_MISMATCH);
  assertErrorForScenario(scenarios, "active grant expired", DOWNLOAD_GRANT_CONTRACT_ERRORS.ACTIVE_GRANT_EXPIRED);
  assertErrorForScenario(scenarios, "expired grant not expired", DOWNLOAD_GRANT_CONTRACT_ERRORS.EXPIRED_GRANT_NOT_EXPIRED);
  assertErrorForScenario(scenarios, "revoked without timestamp", DOWNLOAD_GRANT_CONTRACT_ERRORS.REVOKED_AT_REQUIRED);
  assertErrorForScenario(scenarios, "consumed without timestamp", DOWNLOAD_GRANT_CONTRACT_ERRORS.CONSUMED_AT_REQUIRED);
  assertErrorForScenario(scenarios, "payment state leakage", DOWNLOAD_GRANT_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "auth session state leakage", DOWNLOAD_GRANT_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "runtime state leakage", DOWNLOAD_GRANT_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "tool state leakage", DOWNLOAD_GRANT_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "file bytes leakage", DOWNLOAD_GRANT_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "cdn implementation leakage", DOWNLOAD_GRANT_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "storage implementation leakage", DOWNLOAD_GRANT_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);

  const project = {
    id: "project.game.alpha",
    ownerId: "user.creator",
    projectType: PROJECT_TYPES.GAME,
    state: "marketplace",
    visibility: PROJECT_VISIBILITY_STATES.PUBLIC,
  };
  const release = {
    releaseId: "release.game.alpha.1",
    ownerId: "user.creator",
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
    releaseNotes: "Release linked by download grant contract.",
  };
  const publish = {
    publishId: "publish.game.alpha.1",
    ownerId: "user.creator",
    projectId: "project.game.alpha",
    sourceRelease: {
      releaseId: release.releaseId,
      version: release.version,
      status: release.status,
    },
    visibility: PROJECT_VISIBILITY_STATES.PUBLIC,
    status: PUBLISH_STATUS.PUBLISHED,
    publishedAt: "2026-06-02T15:00:00.000Z",
    publishNotes: "Publish linked by download grant contract.",
  };
  const listing = {
    listingId: "listing.game.alpha.1",
    ownerId: "user.creator",
    projectId: "project.game.alpha",
    sourceRelease: {
      releaseId: release.releaseId,
      version: release.version,
      status: release.status,
    },
    sourcePublish: {
      publishId: publish.publishId,
      releaseId: release.releaseId,
      status: publish.status,
    },
    visibility: "marketplace",
    status: MARKETPLACE_LISTING_STATUS.LISTED,
    listedAt: "2026-06-02T16:00:00.000Z",
    listingTitle: "Alpha Quest",
  };
  const entitlement = {
    entitlementId: "entitlement.alpha.owner.1",
    ownerId: "user.buyer",
    projectId: "project.game.alpha",
    marketplaceListing: {
      listingId: listing.listingId,
      projectId: listing.projectId,
      releaseId: release.releaseId,
      publishId: publish.publishId,
      status: listing.status,
    },
    sourceRelease: {
      releaseId: release.releaseId,
      version: release.version,
      status: release.status,
    },
    sourcePublish: {
      publishId: publish.publishId,
      releaseId: release.releaseId,
      status: publish.status,
    },
    entitlementType: ENTITLEMENT_TYPES.OWNED,
    grantedAt: "2026-06-02T17:00:00.000Z",
  };
  assert.equal(validateProjectContract(project).valid, true);
  assert.equal(validateReleaseContract(release).valid, true);
  assert.equal(validatePublishContract(publish).valid, true);
  assert.equal(validateMarketplaceListingContract(listing).valid, true);
  assert.equal(validateEntitlementContract(entitlement).valid, true);

  const activeGrant = scenarios.validDownloadGrants.find((scenario) => scenario.name === "active download grant").downloadGrant;
  const expiredGrant = scenarios.validDownloadGrants.find((scenario) => scenario.name === "expired download grant").downloadGrant;
  const revokedGrant = scenarios.validDownloadGrants.find((scenario) => scenario.name === "revoked download grant").downloadGrant;
  const consumedGrant = scenarios.validDownloadGrants.find((scenario) => scenario.name === "consumed download grant").downloadGrant;
  assert.equal(isDownloadGrantEntitlement(activeGrant.entitlement), true);
  assert.equal(isDownloadGrantEntitlement({
    ...activeGrant.entitlement,
    entitlementType: ENTITLEMENT_TYPES.REVOKED,
  }), false);
  assert.equal(isDownloadGrantMarketplaceListing(activeGrant.marketplaceListing), true);
  assert.equal(isDownloadGrantMarketplaceListing({
    ...activeGrant.marketplaceListing,
    status: "draft",
  }), false);
  assert.equal(isDownloadGrantSourceRelease(activeGrant.sourceRelease), true);
  assert.equal(isDownloadGrantSourceRelease({
    releaseId: "release.game.alpha.1",
    version: 0,
    status: RELEASE_STATUS.PUBLISHED,
  }), false);
  assert.equal(isDownloadGrantSourcePublish(activeGrant.sourcePublish), true);
  assert.equal(isDownloadGrantSourcePublish({
    publishId: "publish.game.alpha.1",
    releaseId: "release.game.alpha.1",
    status: PUBLISH_STATUS.READY,
  }), false);
  assert.equal(isDownloadGrantActive(activeGrant, { now: referenceTime }), true);
  assert.equal(isDownloadGrantUsable(activeGrant, { now: referenceTime }), true);
  assert.equal(isDownloadGrantExpired(expiredGrant, { now: referenceTime }), true);
  assert.equal(isDownloadGrantUsable(expiredGrant, { now: referenceTime }), false);
  assert.equal(isDownloadGrantRevoked(revokedGrant), true);
  assert.equal(isDownloadGrantConsumed(consumedGrant), true);

  assert.equal(isDownloadGrantVisibleToActor({
    actorId: "user.buyer",
    downloadGrant: activeGrant,
  }), true);
  assert.equal(isDownloadGrantVisibleToActor({
    actorId: "user.other",
    downloadGrant: activeGrant,
  }), false);
  assert.equal(canActorAccessDownloadGrant({
    actorId: "user.buyer",
    permission: IDENTITY_PERMISSIONS.VIEW,
    downloadGrant: activeGrant,
  }), true, "download grant owner can view grant");
  assert.equal(canActorAccessDownloadGrant({
    actorId: "public.viewer",
    role: IDENTITY_ROLES.GUEST,
    permission: IDENTITY_PERMISSIONS.VIEW,
    downloadGrant: activeGrant,
  }), false, "guest cannot view private download grant");
  assert.equal(canActorAccessDownloadGrant({
    actorId: "platform.admin",
    role: IDENTITY_ROLES.ADMIN,
    permission: IDENTITY_PERMISSIONS.ADMINISTER,
    downloadGrant: activeGrant,
  }), true, "platform admin can administer download grant record");
}

function assertErrorForScenario(scenarios, name, expectedErrorCode) {
  const scenario = scenarios.invalidDownloadGrants.find((item) => item.name === name);
  const validation = validateDownloadGrantContract(scenario.downloadGrant, { now: referenceTime });
  assert.equal(validation.errors.some((error) => error.code === expectedErrorCode), true, name);
}

function assertUnique(values) {
  assert.equal(new Set(values).size, values.length);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
