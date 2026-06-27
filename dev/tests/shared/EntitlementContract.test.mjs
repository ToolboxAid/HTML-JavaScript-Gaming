/*
Toolbox Aid
David Quesenberry
06/02/2026
EntitlementContract.test.mjs
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
  PROJECT_TYPES,
  PROJECT_VISIBILITY_STATES,
  validateProjectContract,
} from "../../../src/shared/contracts/projectContract.js";
import {
  ENTITLEMENT_CONTRACT_ERRORS,
  ENTITLEMENT_CONTRACT_ID,
  ENTITLEMENT_CONTRACT_VERSION,
  ENTITLEMENT_FIELD_LIST,
  ENTITLEMENT_FIELDS,
  ENTITLEMENT_FORBIDDEN_FIELDS,
  ENTITLEMENT_RULES,
  ENTITLEMENT_TYPE_LIST,
  ENTITLEMENT_TYPES,
  canActorAccessEntitlement,
  isEntitlementActive,
  isEntitlementMarketplaceListing,
  isEntitlementRevoked,
  isEntitlementSourcePublish,
  isEntitlementSourceRelease,
  isEntitlementType,
  isEntitlementVisibleToActor,
  validateEntitlementContract,
} from "../../../src/shared/contracts/entitlementContract.js";
import {
  MARKETPLACE_LISTING_STATUS,
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
  new URL("../fixtures/entitlements/entitlement-scenarios.json", import.meta.url)
);

export function run() {
  const scenarios = JSON.parse(readFileSync(scenariosPath, "utf8"));

  assert.equal(ENTITLEMENT_CONTRACT_ID, "gamefoundrystudio.entitlement.contract");
  assert.equal(ENTITLEMENT_CONTRACT_VERSION, "1.0.0");
  assert.deepEqual(ENTITLEMENT_FIELD_LIST, [
    "entitlementId",
    "ownerId",
    "projectId",
    "marketplaceListing",
    "sourceRelease",
    "sourcePublish",
    "entitlementType",
    "grantedAt",
    "revokedAt",
    "entitlementNotes",
  ]);
  assert.deepEqual(ENTITLEMENT_FIELDS, {
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
  assert.deepEqual(ENTITLEMENT_TYPE_LIST, ["owned", "licensed", "granted", "revoked"]);
  assert.equal(ENTITLEMENT_RULES.REQUIRES_OWNER, true);
  assert.equal(ENTITLEMENT_RULES.REQUIRES_PROJECT, true);
  assert.equal(ENTITLEMENT_RULES.REQUIRES_MARKETPLACE_LISTING, true);
  assert.equal(ENTITLEMENT_RULES.REQUIRES_SOURCE_RELEASE, true);
  assert.equal(ENTITLEMENT_RULES.REQUIRES_SOURCE_PUBLISH, true);
  assert.equal(ENTITLEMENT_RULES.REQUIRES_MARKETPLACE_LISTING_PROJECT_LINKAGE, true);
  assert.equal(ENTITLEMENT_RULES.REQUIRES_MARKETPLACE_LISTING_RELEASE_LINKAGE, true);
  assert.equal(ENTITLEMENT_RULES.REQUIRES_MARKETPLACE_LISTING_PUBLISH_LINKAGE, true);
  assert.equal(ENTITLEMENT_RULES.REQUIRES_RELEASE_PUBLISH_LINKAGE, true);
  assert.equal(ENTITLEMENT_RULES.REQUIRES_VALID_ENTITLEMENT_TYPE, true);
  assert.equal(ENTITLEMENT_RULES.REVOKED_ENTITLEMENTS_REQUIRE_REVOKED_AT, true);
  assert.equal(ENTITLEMENT_RULES.NO_PAYMENT_STATE, true);
  assert.equal(ENTITLEMENT_RULES.NO_AUTH_SESSION_STATE, true);
  assert.equal(ENTITLEMENT_RULES.NO_RUNTIME_STATE, true);
  assert.equal(ENTITLEMENT_RULES.NO_TOOL_STATE, true);
  assert.equal(ENTITLEMENT_RULES.NO_DOWNLOAD_STATE, true);
  assert.equal(ENTITLEMENT_FORBIDDEN_FIELDS.includes("paymentState"), true);
  assert.equal(ENTITLEMENT_FORBIDDEN_FIELDS.includes("authSessionState"), true);
  assert.equal(ENTITLEMENT_FORBIDDEN_FIELDS.includes("workspaceState"), true);
  assert.equal(ENTITLEMENT_FORBIDDEN_FIELDS.includes("toolState"), true);
  assert.equal(ENTITLEMENT_FORBIDDEN_FIELDS.includes("downloadState"), true);
  assertUnique(ENTITLEMENT_TYPE_LIST);
  assertUnique(ENTITLEMENT_FORBIDDEN_FIELDS);

  assert.equal(isEntitlementType(ENTITLEMENT_TYPES.OWNED), true);
  assert.equal(isEntitlementType(ENTITLEMENT_TYPES.LICENSED), true);
  assert.equal(isEntitlementType(ENTITLEMENT_TYPES.GRANTED), true);
  assert.equal(isEntitlementType(ENTITLEMENT_TYPES.REVOKED), true);
  assert.equal(isEntitlementType("trial"), false);
  assert.equal(isIdentityPermission(IDENTITY_PERMISSIONS.VIEW), true);

  for (const scenario of scenarios.validEntitlements) {
    const validation = validateEntitlementContract(scenario.entitlement);
    assert.equal(validation.valid, true, scenario.name);
    assert.deepEqual(validation.errors, scenario.expectedErrors, scenario.name);
  }

  for (const scenario of scenarios.invalidEntitlements) {
    const validation = validateEntitlementContract(scenario.entitlement);
    assert.equal(validation.valid, false, scenario.name);
    assert.deepEqual(validation.errors.map((error) => error.code), scenario.expectedErrors, scenario.name);
  }

  assertErrorForScenario(scenarios, "missing owner", ENTITLEMENT_CONTRACT_ERRORS.OWNER_REQUIRED);
  assertErrorForScenario(scenarios, "missing project", ENTITLEMENT_CONTRACT_ERRORS.PROJECT_REQUIRED);
  assertErrorForScenario(scenarios, "missing marketplace listing", ENTITLEMENT_CONTRACT_ERRORS.MARKETPLACE_LISTING_REQUIRED);
  assertErrorForScenario(scenarios, "missing source release", ENTITLEMENT_CONTRACT_ERRORS.SOURCE_RELEASE_REQUIRED);
  assertErrorForScenario(scenarios, "missing source publish", ENTITLEMENT_CONTRACT_ERRORS.SOURCE_PUBLISH_REQUIRED);
  assertErrorForScenario(scenarios, "invalid entitlement type", ENTITLEMENT_CONTRACT_ERRORS.ENTITLEMENT_TYPE_INVALID);
  assertErrorForScenario(scenarios, "marketplace listing project mismatch", ENTITLEMENT_CONTRACT_ERRORS.MARKETPLACE_LISTING_PROJECT_MISMATCH);
  assertErrorForScenario(scenarios, "marketplace listing release mismatch", ENTITLEMENT_CONTRACT_ERRORS.MARKETPLACE_LISTING_RELEASE_MISMATCH);
  assertErrorForScenario(scenarios, "marketplace listing publish mismatch", ENTITLEMENT_CONTRACT_ERRORS.MARKETPLACE_LISTING_PUBLISH_MISMATCH);
  assertErrorForScenario(scenarios, "release publish mismatch", ENTITLEMENT_CONTRACT_ERRORS.RELEASE_PUBLISH_MISMATCH);
  assertErrorForScenario(scenarios, "revoked without timestamp", ENTITLEMENT_CONTRACT_ERRORS.REVOKED_AT_REQUIRED);
  assertErrorForScenario(scenarios, "payment state leakage", ENTITLEMENT_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "auth session state leakage", ENTITLEMENT_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "runtime state leakage", ENTITLEMENT_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "tool state leakage", ENTITLEMENT_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "download state leakage", ENTITLEMENT_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);

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
    releaseNotes: "Release linked by entitlement contract.",
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
    publishNotes: "Publish linked by entitlement contract.",
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
  assert.equal(validateProjectContract(project).valid, true);
  assert.equal(validateReleaseContract(release).valid, true);
  assert.equal(validatePublishContract(publish).valid, true);
  assert.equal(validateMarketplaceListingContract(listing).valid, true);

  const entitlement = scenarios.validEntitlements[0].entitlement;
  assert.equal(isEntitlementMarketplaceListing(entitlement.marketplaceListing), true);
  assert.equal(isEntitlementMarketplaceListing({
    ...entitlement.marketplaceListing,
    status: "draft",
  }), false);
  assert.equal(isEntitlementSourceRelease(entitlement.sourceRelease), true);
  assert.equal(isEntitlementSourceRelease({
    releaseId: "release.game.alpha.1",
    version: 0,
    status: RELEASE_STATUS.PUBLISHED,
  }), false);
  assert.equal(isEntitlementSourcePublish(entitlement.sourcePublish), true);
  assert.equal(isEntitlementSourcePublish({
    publishId: "publish.game.alpha.1",
    releaseId: "release.game.alpha.1",
    status: PUBLISH_STATUS.READY,
  }), false);

  const owned = scenarios.validEntitlements.find((scenario) => scenario.name === "owned marketplace entitlement").entitlement;
  const licensed = scenarios.validEntitlements.find((scenario) => scenario.name === "licensed marketplace entitlement").entitlement;
  const granted = scenarios.validEntitlements.find((scenario) => scenario.name === "granted marketplace entitlement").entitlement;
  const revoked = scenarios.validEntitlements.find((scenario) => scenario.name === "revoked marketplace entitlement").entitlement;
  assert.equal(isEntitlementActive(owned), true);
  assert.equal(isEntitlementActive(licensed), true);
  assert.equal(isEntitlementActive(granted), true);
  assert.equal(isEntitlementActive(revoked), false);
  assert.equal(isEntitlementRevoked(revoked), true);

  assert.equal(isEntitlementVisibleToActor({
    actorId: "user.buyer",
    entitlement: owned,
  }), true);
  assert.equal(isEntitlementVisibleToActor({
    actorId: "user.other",
    entitlement: owned,
  }), false);
  assert.equal(canActorAccessEntitlement({
    actorId: "user.buyer",
    permission: IDENTITY_PERMISSIONS.VIEW,
    entitlement: owned,
  }), true, "entitlement owner can view entitlement");
  assert.equal(canActorAccessEntitlement({
    actorId: "user.buyer",
    permission: IDENTITY_PERMISSIONS.DELETE,
    entitlement: owned,
  }), true, "entitlement owner keeps object control");
  assert.equal(canActorAccessEntitlement({
    actorId: "public.viewer",
    role: IDENTITY_ROLES.GUEST,
    permission: IDENTITY_PERMISSIONS.VIEW,
    entitlement: owned,
  }), false, "guest cannot view private entitlement");
  assert.equal(canActorAccessEntitlement({
    actorId: "platform.admin",
    role: IDENTITY_ROLES.ADMIN,
    permission: IDENTITY_PERMISSIONS.ADMINISTER,
    entitlement: owned,
  }), true, "platform admin can administer entitlement record");
}

function assertErrorForScenario(scenarios, name, expectedErrorCode) {
  const scenario = scenarios.invalidEntitlements.find((item) => item.name === name);
  const validation = validateEntitlementContract(scenario.entitlement);
  assert.equal(validation.errors.some((error) => error.code === expectedErrorCode), true, name);
}

function assertUnique(values) {
  assert.equal(new Set(values).size, values.length);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
