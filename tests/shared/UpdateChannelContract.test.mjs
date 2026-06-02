/*
Toolbox Aid
David Quesenberry
06/02/2026
UpdateChannelContract.test.mjs
*/
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  IDENTITY_PERMISSIONS,
  IDENTITY_ROLES,
  isIdentityPermission,
} from "../../src/shared/contracts/identityPermissionsContract.js";
import {
  ENTITLEMENT_TYPES,
  validateEntitlementContract,
} from "../../src/shared/contracts/entitlementContract.js";
import {
  INSTALL_RECEIPT_STATUS,
  validateInstallReceiptContract,
} from "../../src/shared/contracts/installReceiptContract.js";
import {
  LIBRARY_ITEM_STATUS,
  validateLibraryItemContract,
} from "../../src/shared/contracts/libraryItemContract.js";
import {
  MARKETPLACE_LISTING_STATUS,
  validateMarketplaceListingContract,
} from "../../src/shared/contracts/marketplaceListingContract.js";
import {
  PUBLISH_STATUS,
  validatePublishContract,
} from "../../src/shared/contracts/publishContract.js";
import {
  PROJECT_TYPES,
  PROJECT_VISIBILITY_STATES,
  validateProjectContract,
} from "../../src/shared/contracts/projectContract.js";
import {
  RELEASE_STATUS,
  validateReleaseContract,
} from "../../src/shared/contracts/releaseContract.js";
import {
  UPDATE_CHANNEL_CONTRACT_ERRORS,
  UPDATE_CHANNEL_CONTRACT_ID,
  UPDATE_CHANNEL_CONTRACT_VERSION,
  UPDATE_CHANNEL_FIELD_LIST,
  UPDATE_CHANNEL_FIELDS,
  UPDATE_CHANNEL_FORBIDDEN_FIELDS,
  UPDATE_CHANNEL_PROMOTION_ORDER,
  UPDATE_CHANNEL_RULES,
  UPDATE_CHANNEL_TYPE_LIST,
  UPDATE_CHANNEL_TYPES,
  canActorAccessUpdateChannel,
  canPromoteUpdateChannel,
  isUpdateChannelAssignedPublish,
  isUpdateChannelAssignedRelease,
  isUpdateChannelInstallReceipt,
  isUpdateChannelLibraryItem,
  isUpdateChannelType,
  isUpdateChannelVisibleToActor,
  validateUpdateChannelContract,
} from "../../src/shared/contracts/updateChannelContract.js";

const scenariosPath = fileURLToPath(
  new URL("../fixtures/update-channels/update-channel-scenarios.json", import.meta.url)
);

export function run() {
  const scenarios = JSON.parse(readFileSync(scenariosPath, "utf8"));

  assert.equal(UPDATE_CHANNEL_CONTRACT_ID, "gamefoundrystudio.update.channel.contract");
  assert.equal(UPDATE_CHANNEL_CONTRACT_VERSION, "1.0.0");
  assert.deepEqual(UPDATE_CHANNEL_FIELD_LIST, [
    "updateChannelId",
    "ownerId",
    "projectId",
    "channelType",
    "assignedRelease",
    "assignedPublish",
    "libraryItem",
    "installReceipt",
    "assignedAt",
    "promotesFrom",
    "promotedAt",
    "channelNotes",
  ]);
  assert.deepEqual(UPDATE_CHANNEL_FIELDS, {
    UPDATE_CHANNEL_ID: "updateChannelId",
    OWNER: "ownerId",
    PROJECT: "projectId",
    CHANNEL_TYPE: "channelType",
    ASSIGNED_RELEASE: "assignedRelease",
    ASSIGNED_PUBLISH: "assignedPublish",
    LIBRARY_ITEM: "libraryItem",
    INSTALL_RECEIPT: "installReceipt",
    ASSIGNED_AT: "assignedAt",
    PROMOTES_FROM: "promotesFrom",
    PROMOTED_AT: "promotedAt",
    CHANNEL_NOTES: "channelNotes",
  });
  assert.deepEqual(UPDATE_CHANNEL_TYPE_LIST, ["stable", "beta", "alpha", "preview"]);
  assert.deepEqual(UPDATE_CHANNEL_PROMOTION_ORDER, ["preview", "alpha", "beta", "stable"]);
  assert.equal(UPDATE_CHANNEL_RULES.REQUIRES_OWNER, true);
  assert.equal(UPDATE_CHANNEL_RULES.REQUIRES_PROJECT, true);
  assert.equal(UPDATE_CHANNEL_RULES.REQUIRES_VALID_CHANNEL_TYPE, true);
  assert.equal(UPDATE_CHANNEL_RULES.REQUIRES_ASSIGNED_RELEASE, true);
  assert.equal(UPDATE_CHANNEL_RULES.REQUIRES_ASSIGNED_PUBLISH, true);
  assert.equal(UPDATE_CHANNEL_RULES.REQUIRES_LIBRARY_ITEM, true);
  assert.equal(UPDATE_CHANNEL_RULES.REQUIRES_INSTALL_RECEIPT, true);
  assert.equal(UPDATE_CHANNEL_RULES.REQUIRES_ASSIGNED_AT, true);
  assert.equal(UPDATE_CHANNEL_RULES.REQUIRES_OWNER_LIBRARY_ITEM_LINKAGE, true);
  assert.equal(UPDATE_CHANNEL_RULES.REQUIRES_OWNER_INSTALL_RECEIPT_LINKAGE, true);
  assert.equal(UPDATE_CHANNEL_RULES.REQUIRES_PROJECT_RELEASE_LINKAGE, true);
  assert.equal(UPDATE_CHANNEL_RULES.REQUIRES_PROJECT_PUBLISH_LINKAGE, true);
  assert.equal(UPDATE_CHANNEL_RULES.REQUIRES_PROJECT_LIBRARY_ITEM_LINKAGE, true);
  assert.equal(UPDATE_CHANNEL_RULES.REQUIRES_PROJECT_INSTALL_RECEIPT_LINKAGE, true);
  assert.equal(UPDATE_CHANNEL_RULES.REQUIRES_RELEASE_PUBLISH_LINKAGE, true);
  assert.equal(UPDATE_CHANNEL_RULES.REQUIRES_RELEASE_LIBRARY_ITEM_LINKAGE, true);
  assert.equal(UPDATE_CHANNEL_RULES.REQUIRES_RELEASE_INSTALL_RECEIPT_LINKAGE, true);
  assert.equal(UPDATE_CHANNEL_RULES.REQUIRES_PUBLISH_LIBRARY_ITEM_LINKAGE, true);
  assert.equal(UPDATE_CHANNEL_RULES.REQUIRES_PUBLISH_INSTALL_RECEIPT_LINKAGE, true);
  assert.equal(UPDATE_CHANNEL_RULES.REQUIRES_LIBRARY_ITEM_INSTALL_RECEIPT_LINKAGE, true);
  assert.equal(UPDATE_CHANNEL_RULES.PROMOTION_MUST_MOVE_TOWARD_STABLE_CHANNEL, true);
  assert.equal(UPDATE_CHANNEL_RULES.PROMOTION_REQUIRES_PROMOTED_AT, true);
  assert.equal(UPDATE_CHANNEL_RULES.NO_PAYMENT_STATE, true);
  assert.equal(UPDATE_CHANNEL_RULES.NO_AUTH_SESSION_STATE, true);
  assert.equal(UPDATE_CHANNEL_RULES.NO_RUNTIME_STATE, true);
  assert.equal(UPDATE_CHANNEL_RULES.NO_TOOL_STATE, true);
  assert.equal(UPDATE_CHANNEL_RULES.NO_INSTALLER_STATE, true);
  assert.equal(UPDATE_CHANNEL_RULES.NO_UPDATER_IMPLEMENTATION_DETAILS, true);
  assert.equal(UPDATE_CHANNEL_RULES.NO_DOWNLOAD_STATE, true);
  assert.equal(UPDATE_CHANNEL_FORBIDDEN_FIELDS.includes("paymentState"), true);
  assert.equal(UPDATE_CHANNEL_FORBIDDEN_FIELDS.includes("authSessionState"), true);
  assert.equal(UPDATE_CHANNEL_FORBIDDEN_FIELDS.includes("workspaceState"), true);
  assert.equal(UPDATE_CHANNEL_FORBIDDEN_FIELDS.includes("toolState"), true);
  assert.equal(UPDATE_CHANNEL_FORBIDDEN_FIELDS.includes("installerState"), true);
  assert.equal(UPDATE_CHANNEL_FORBIDDEN_FIELDS.includes("updaterImplementation"), true);
  assert.equal(UPDATE_CHANNEL_FORBIDDEN_FIELDS.includes("downloadState"), true);
  assertUnique(UPDATE_CHANNEL_TYPE_LIST);
  assertUnique(UPDATE_CHANNEL_FORBIDDEN_FIELDS);

  assert.equal(isUpdateChannelType(UPDATE_CHANNEL_TYPES.STABLE), true);
  assert.equal(isUpdateChannelType(UPDATE_CHANNEL_TYPES.BETA), true);
  assert.equal(isUpdateChannelType(UPDATE_CHANNEL_TYPES.ALPHA), true);
  assert.equal(isUpdateChannelType(UPDATE_CHANNEL_TYPES.PREVIEW), true);
  assert.equal(isUpdateChannelType("canary"), false);
  assert.equal(isIdentityPermission(IDENTITY_PERMISSIONS.VIEW), true);

  for (const scenario of scenarios.validUpdateChannels) {
    const validation = validateUpdateChannelContract(scenario.updateChannel);
    assert.equal(validation.valid, true, scenario.name);
    assert.deepEqual(validation.errors, scenario.expectedErrors, scenario.name);
  }

  for (const scenario of scenarios.invalidUpdateChannels) {
    const validation = validateUpdateChannelContract(scenario.updateChannel);
    assert.equal(validation.valid, false, scenario.name);
    assert.deepEqual(validation.errors.map((error) => error.code), scenario.expectedErrors, scenario.name);
  }

  assertErrorForScenario(scenarios, "missing owner", UPDATE_CHANNEL_CONTRACT_ERRORS.OWNER_REQUIRED);
  assertErrorForScenario(scenarios, "missing assigned release", UPDATE_CHANNEL_CONTRACT_ERRORS.ASSIGNED_RELEASE_REQUIRED);
  assertErrorForScenario(scenarios, "missing assigned publish", UPDATE_CHANNEL_CONTRACT_ERRORS.ASSIGNED_PUBLISH_REQUIRED);
  assertErrorForScenario(scenarios, "missing library item", UPDATE_CHANNEL_CONTRACT_ERRORS.LIBRARY_ITEM_REQUIRED);
  assertErrorForScenario(scenarios, "missing install receipt", UPDATE_CHANNEL_CONTRACT_ERRORS.INSTALL_RECEIPT_REQUIRED);
  assertErrorForScenario(scenarios, "invalid channel type", UPDATE_CHANNEL_CONTRACT_ERRORS.CHANNEL_TYPE_INVALID);
  assertErrorForScenario(scenarios, "invalid assigned release", UPDATE_CHANNEL_CONTRACT_ERRORS.ASSIGNED_RELEASE_INVALID);
  assertErrorForScenario(scenarios, "owner library item mismatch", UPDATE_CHANNEL_CONTRACT_ERRORS.OWNER_LIBRARY_ITEM_MISMATCH);
  assertErrorForScenario(scenarios, "project release mismatch", UPDATE_CHANNEL_CONTRACT_ERRORS.PROJECT_RELEASE_MISMATCH);
  assertErrorForScenario(scenarios, "release publish mismatch", UPDATE_CHANNEL_CONTRACT_ERRORS.RELEASE_PUBLISH_MISMATCH);
  assertErrorForScenario(scenarios, "library item release mismatch", UPDATE_CHANNEL_CONTRACT_ERRORS.RELEASE_LIBRARY_ITEM_MISMATCH);
  assertErrorForScenario(scenarios, "install receipt library item mismatch", UPDATE_CHANNEL_CONTRACT_ERRORS.LIBRARY_ITEM_INSTALL_RECEIPT_MISMATCH);
  assertErrorForScenario(scenarios, "invalid assigned timestamp", UPDATE_CHANNEL_CONTRACT_ERRORS.ASSIGNED_AT_INVALID);
  assertErrorForScenario(scenarios, "invalid promotion order", UPDATE_CHANNEL_CONTRACT_ERRORS.PROMOTION_ORDER_INVALID);
  assertErrorForScenario(scenarios, "promotion without timestamp", UPDATE_CHANNEL_CONTRACT_ERRORS.PROMOTED_AT_REQUIRED);
  assertErrorForScenario(scenarios, "promoted timestamp without source channel", UPDATE_CHANNEL_CONTRACT_ERRORS.PROMOTES_FROM_REQUIRED);
  assertErrorForScenario(scenarios, "payment state leakage", UPDATE_CHANNEL_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "auth session state leakage", UPDATE_CHANNEL_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "runtime state leakage", UPDATE_CHANNEL_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "tool state leakage", UPDATE_CHANNEL_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "installer state leakage", UPDATE_CHANNEL_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "updater implementation leakage", UPDATE_CHANNEL_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "download state leakage", UPDATE_CHANNEL_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);

  const project = {
    id: "project.game.alpha",
    ownerId: "user.creator",
    projectType: PROJECT_TYPES.GAME,
    state: "marketplace",
    visibility: PROJECT_VISIBILITY_STATES.PUBLIC,
  };
  const release = {
    releaseId: "release.game.alpha.2",
    ownerId: "user.creator",
    projectId: "project.game.alpha",
    sourceManifest: {
      manifestId: "manifest.game.alpha",
      version: 2,
      exportFormat: "game-manifest-json",
    },
    version: 2,
    status: RELEASE_STATUS.PUBLISHED,
    visibility: PROJECT_VISIBILITY_STATES.PUBLIC,
    publishedAt: "2026-06-02T19:00:00.000Z",
    releaseNotes: "Release linked by update channel contract.",
  };
  const publish = {
    publishId: "publish.game.alpha.2",
    ownerId: "user.creator",
    projectId: "project.game.alpha",
    sourceRelease: {
      releaseId: release.releaseId,
      version: release.version,
      status: release.status,
    },
    visibility: PROJECT_VISIBILITY_STATES.PUBLIC,
    status: PUBLISH_STATUS.PUBLISHED,
    publishedAt: "2026-06-02T19:30:00.000Z",
    publishNotes: "Publish linked by update channel contract.",
  };
  const listing = {
    listingId: "listing.game.alpha.2",
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
    listedAt: "2026-06-02T20:00:00.000Z",
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
    grantedAt: "2026-06-02T20:30:00.000Z",
  };
  const libraryItem = {
    libraryItemId: "library-item.alpha.available.1",
    ownerId: "user.buyer",
    projectId: "project.game.alpha",
    entitlement: {
      entitlementId: entitlement.entitlementId,
      ownerId: entitlement.ownerId,
      projectId: entitlement.projectId,
      listingId: listing.listingId,
      releaseId: release.releaseId,
      publishId: publish.publishId,
      entitlementType: entitlement.entitlementType,
    },
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
    libraryStatus: LIBRARY_ITEM_STATUS.AVAILABLE,
    addedAt: "2026-06-02T21:00:00.000Z",
  };
  const installReceipt = {
    installReceiptId: "install-receipt.alpha.installed.2",
    ownerId: "user.buyer",
    projectId: "project.game.alpha",
    libraryItem: {
      libraryItemId: libraryItem.libraryItemId,
      ownerId: libraryItem.ownerId,
      projectId: libraryItem.projectId,
      entitlementId: entitlement.entitlementId,
      listingId: listing.listingId,
      releaseId: release.releaseId,
      publishId: publish.publishId,
      libraryStatus: libraryItem.libraryStatus,
    },
    entitlement: {
      entitlementId: entitlement.entitlementId,
      ownerId: entitlement.ownerId,
      projectId: entitlement.projectId,
      listingId: listing.listingId,
      releaseId: release.releaseId,
      publishId: publish.publishId,
      entitlementType: entitlement.entitlementType,
    },
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
    receiptStatus: INSTALL_RECEIPT_STATUS.INSTALLED,
    installedAt: "2026-06-02T21:30:00.000Z",
  };
  const updateChannel = scenarios.validUpdateChannels.find((scenario) => scenario.name === "stable channel promoted from beta").updateChannel;

  assert.equal(validateProjectContract(project).valid, true);
  assert.equal(validateReleaseContract(release).valid, true);
  assert.equal(validatePublishContract(publish).valid, true);
  assert.equal(validateMarketplaceListingContract(listing).valid, true);
  assert.equal(validateEntitlementContract(entitlement).valid, true);
  assert.equal(validateLibraryItemContract(libraryItem).valid, true);
  assert.equal(validateInstallReceiptContract(installReceipt).valid, true);
  assert.equal(validateUpdateChannelContract(updateChannel).valid, true);

  assert.equal(isUpdateChannelAssignedRelease(updateChannel.assignedRelease), true);
  assert.equal(isUpdateChannelAssignedRelease({
    releaseId: "release.game.alpha.2",
    projectId: "project.game.alpha",
    version: 0,
    status: RELEASE_STATUS.PUBLISHED,
  }), false);
  assert.equal(isUpdateChannelAssignedPublish(updateChannel.assignedPublish), true);
  assert.equal(isUpdateChannelAssignedPublish({
    publishId: "publish.game.alpha.2",
    projectId: "project.game.alpha",
    releaseId: "release.game.alpha.2",
    status: PUBLISH_STATUS.READY,
  }), false);
  assert.equal(isUpdateChannelLibraryItem(updateChannel.libraryItem), true);
  assert.equal(isUpdateChannelLibraryItem({
    ...updateChannel.libraryItem,
    libraryStatus: "installed",
  }), false);
  assert.equal(isUpdateChannelInstallReceipt(updateChannel.installReceipt), true);
  assert.equal(isUpdateChannelInstallReceipt({
    ...updateChannel.installReceipt,
    receiptStatus: "queued",
  }), false);

  assert.equal(canPromoteUpdateChannel({
    fromChannelType: UPDATE_CHANNEL_TYPES.BETA,
    toChannelType: UPDATE_CHANNEL_TYPES.STABLE,
  }), true);
  assert.equal(canPromoteUpdateChannel({
    fromChannelType: UPDATE_CHANNEL_TYPES.PREVIEW,
    toChannelType: UPDATE_CHANNEL_TYPES.ALPHA,
  }), true);
  assert.equal(canPromoteUpdateChannel({
    fromChannelType: UPDATE_CHANNEL_TYPES.STABLE,
    toChannelType: UPDATE_CHANNEL_TYPES.BETA,
  }), false);
  assert.equal(canPromoteUpdateChannel({
    fromChannelType: UPDATE_CHANNEL_TYPES.BETA,
    toChannelType: UPDATE_CHANNEL_TYPES.BETA,
  }), false);
  assert.equal(canPromoteUpdateChannel({
    fromChannelType: "canary",
    toChannelType: UPDATE_CHANNEL_TYPES.BETA,
  }), false);

  assert.equal(isUpdateChannelVisibleToActor({
    actorId: "user.buyer",
    updateChannel,
  }), true);
  assert.equal(isUpdateChannelVisibleToActor({
    actorId: "public.viewer",
    updateChannel,
  }), false);
  assert.equal(canActorAccessUpdateChannel({
    actorId: "user.buyer",
    permission: IDENTITY_PERMISSIONS.VIEW,
    updateChannel,
  }), true, "update channel owner can view channel record");
  assert.equal(canActorAccessUpdateChannel({
    actorId: "public.viewer",
    role: IDENTITY_ROLES.GUEST,
    permission: IDENTITY_PERMISSIONS.VIEW,
    updateChannel,
  }), false, "guest cannot view private update channel");
  assert.equal(canActorAccessUpdateChannel({
    actorId: "platform.admin",
    role: IDENTITY_ROLES.ADMIN,
    permission: IDENTITY_PERMISSIONS.ADMINISTER,
    updateChannel,
  }), true, "platform admin can administer update channel record");
}

function assertErrorForScenario(scenarios, name, expectedErrorCode) {
  const scenario = scenarios.invalidUpdateChannels.find((item) => item.name === name);
  const validation = validateUpdateChannelContract(scenario.updateChannel);
  assert.equal(validation.errors.some((error) => error.code === expectedErrorCode), true, name);
}

function assertUnique(values) {
  assert.equal(new Set(values).size, values.length);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
