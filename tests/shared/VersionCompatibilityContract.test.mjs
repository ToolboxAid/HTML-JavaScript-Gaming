/*
Toolbox Aid
David Quesenberry
06/02/2026
VersionCompatibilityContract.test.mjs
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
  UPDATE_CHANNEL_TYPES,
  validateUpdateChannelContract,
} from "../../src/shared/contracts/updateChannelContract.js";
import {
  VERSION_COMPATIBILITY_CONTRACT_ERRORS,
  VERSION_COMPATIBILITY_CONTRACT_ID,
  VERSION_COMPATIBILITY_CONTRACT_VERSION,
  VERSION_COMPATIBILITY_FIELD_LIST,
  VERSION_COMPATIBILITY_FIELDS,
  VERSION_COMPATIBILITY_FORBIDDEN_FIELDS,
  VERSION_COMPATIBILITY_RULES,
  VERSION_COMPATIBILITY_STATE_LIST,
  VERSION_COMPATIBILITY_STATES,
  canActorAccessVersionCompatibility,
  isTargetVersionInCompatibilityRange,
  isVersionCompatibilityBlocked,
  isVersionCompatibilityCompatible,
  isVersionCompatibilityDeprecated,
  isVersionCompatibilityIncompatible,
  isVersionCompatibilityInstallReceipt,
  isVersionCompatibilityLibraryItem,
  isVersionCompatibilitySourcePublish,
  isVersionCompatibilitySourceRelease,
  isVersionCompatibilityState,
  isVersionCompatibilityUpdateChannel,
  isVersionCompatibilityVersion,
  isVersionCompatibilityVisibleToActor,
  validateVersionCompatibilityContract,
} from "../../src/shared/contracts/versionCompatibilityContract.js";

const scenariosPath = fileURLToPath(
  new URL("../fixtures/version-compatibility/version-compatibility-scenarios.json", import.meta.url)
);

export function run() {
  const scenarios = JSON.parse(readFileSync(scenariosPath, "utf8"));

  assert.equal(VERSION_COMPATIBILITY_CONTRACT_ID, "gamefoundrystudio.version.compatibility.contract");
  assert.equal(VERSION_COMPATIBILITY_CONTRACT_VERSION, "1.0.0");
  assert.deepEqual(VERSION_COMPATIBILITY_FIELD_LIST, [
    "versionCompatibilityId",
    "ownerId",
    "projectId",
    "sourceRelease",
    "sourcePublish",
    "updateChannel",
    "libraryItem",
    "installReceipt",
    "minimumVersion",
    "maximumVersion",
    "targetVersion",
    "supportedSchemaVersion",
    "compatibilityState",
    "evaluatedAt",
    "compatibilityNotes",
  ]);
  assert.deepEqual(VERSION_COMPATIBILITY_FIELDS, {
    VERSION_COMPATIBILITY_ID: "versionCompatibilityId",
    OWNER: "ownerId",
    PROJECT: "projectId",
    SOURCE_RELEASE: "sourceRelease",
    SOURCE_PUBLISH: "sourcePublish",
    UPDATE_CHANNEL: "updateChannel",
    LIBRARY_ITEM: "libraryItem",
    INSTALL_RECEIPT: "installReceipt",
    MINIMUM_VERSION: "minimumVersion",
    MAXIMUM_VERSION: "maximumVersion",
    TARGET_VERSION: "targetVersion",
    SUPPORTED_SCHEMA_VERSION: "supportedSchemaVersion",
    COMPATIBILITY_STATE: "compatibilityState",
    EVALUATED_AT: "evaluatedAt",
    COMPATIBILITY_NOTES: "compatibilityNotes",
  });
  assert.deepEqual(VERSION_COMPATIBILITY_STATE_LIST, ["incompatible", "compatible", "deprecated", "blocked"]);
  assert.equal(VERSION_COMPATIBILITY_RULES.REQUIRES_OWNER, true);
  assert.equal(VERSION_COMPATIBILITY_RULES.REQUIRES_PROJECT, true);
  assert.equal(VERSION_COMPATIBILITY_RULES.REQUIRES_SOURCE_RELEASE, true);
  assert.equal(VERSION_COMPATIBILITY_RULES.REQUIRES_SOURCE_PUBLISH, true);
  assert.equal(VERSION_COMPATIBILITY_RULES.REQUIRES_UPDATE_CHANNEL, true);
  assert.equal(VERSION_COMPATIBILITY_RULES.REQUIRES_LIBRARY_ITEM, true);
  assert.equal(VERSION_COMPATIBILITY_RULES.REQUIRES_INSTALL_RECEIPT, true);
  assert.equal(VERSION_COMPATIBILITY_RULES.REQUIRES_MINIMUM_VERSION, true);
  assert.equal(VERSION_COMPATIBILITY_RULES.REQUIRES_MAXIMUM_VERSION, true);
  assert.equal(VERSION_COMPATIBILITY_RULES.REQUIRES_TARGET_VERSION, true);
  assert.equal(VERSION_COMPATIBILITY_RULES.REQUIRES_SUPPORTED_SCHEMA_VERSION, true);
  assert.equal(VERSION_COMPATIBILITY_RULES.REQUIRES_VALID_COMPATIBILITY_STATE, true);
  assert.equal(VERSION_COMPATIBILITY_RULES.REQUIRES_EVALUATED_AT, true);
  assert.equal(VERSION_COMPATIBILITY_RULES.REQUIRES_OWNER_UPDATE_CHANNEL_LINKAGE, true);
  assert.equal(VERSION_COMPATIBILITY_RULES.REQUIRES_OWNER_LIBRARY_ITEM_LINKAGE, true);
  assert.equal(VERSION_COMPATIBILITY_RULES.REQUIRES_OWNER_INSTALL_RECEIPT_LINKAGE, true);
  assert.equal(VERSION_COMPATIBILITY_RULES.REQUIRES_PROJECT_RELEASE_LINKAGE, true);
  assert.equal(VERSION_COMPATIBILITY_RULES.REQUIRES_PROJECT_PUBLISH_LINKAGE, true);
  assert.equal(VERSION_COMPATIBILITY_RULES.REQUIRES_PROJECT_UPDATE_CHANNEL_LINKAGE, true);
  assert.equal(VERSION_COMPATIBILITY_RULES.REQUIRES_PROJECT_LIBRARY_ITEM_LINKAGE, true);
  assert.equal(VERSION_COMPATIBILITY_RULES.REQUIRES_PROJECT_INSTALL_RECEIPT_LINKAGE, true);
  assert.equal(VERSION_COMPATIBILITY_RULES.REQUIRES_RELEASE_PUBLISH_LINKAGE, true);
  assert.equal(VERSION_COMPATIBILITY_RULES.REQUIRES_RELEASE_UPDATE_CHANNEL_LINKAGE, true);
  assert.equal(VERSION_COMPATIBILITY_RULES.REQUIRES_RELEASE_LIBRARY_ITEM_LINKAGE, true);
  assert.equal(VERSION_COMPATIBILITY_RULES.REQUIRES_RELEASE_INSTALL_RECEIPT_LINKAGE, true);
  assert.equal(VERSION_COMPATIBILITY_RULES.REQUIRES_PUBLISH_UPDATE_CHANNEL_LINKAGE, true);
  assert.equal(VERSION_COMPATIBILITY_RULES.REQUIRES_PUBLISH_LIBRARY_ITEM_LINKAGE, true);
  assert.equal(VERSION_COMPATIBILITY_RULES.REQUIRES_PUBLISH_INSTALL_RECEIPT_LINKAGE, true);
  assert.equal(VERSION_COMPATIBILITY_RULES.REQUIRES_LIBRARY_ITEM_INSTALL_RECEIPT_LINKAGE, true);
  assert.equal(VERSION_COMPATIBILITY_RULES.TARGET_VERSION_MUST_MATCH_RELEASE_VERSION, true);
  assert.equal(VERSION_COMPATIBILITY_RULES.TARGET_VERSION_MUST_BE_IN_RANGE, true);
  assert.equal(VERSION_COMPATIBILITY_RULES.NO_RUNTIME_STATE, true);
  assert.equal(VERSION_COMPATIBILITY_RULES.NO_TOOL_STATE, true);
  assert.equal(VERSION_COMPATIBILITY_RULES.NO_INSTALLER_STATE, true);
  assert.equal(VERSION_COMPATIBILITY_RULES.NO_UPDATER_IMPLEMENTATION_DETAILS, true);
  assert.equal(VERSION_COMPATIBILITY_RULES.NO_MIGRATION_IMPLEMENTATION_DETAILS, true);
  assert.equal(VERSION_COMPATIBILITY_RULES.NO_FILE_BYTES, true);
  assert.equal(VERSION_COMPATIBILITY_RULES.NO_DOWNLOAD_STATE, true);
  assert.equal(VERSION_COMPATIBILITY_FORBIDDEN_FIELDS.includes("workspaceState"), true);
  assert.equal(VERSION_COMPATIBILITY_FORBIDDEN_FIELDS.includes("toolState"), true);
  assert.equal(VERSION_COMPATIBILITY_FORBIDDEN_FIELDS.includes("installerState"), true);
  assert.equal(VERSION_COMPATIBILITY_FORBIDDEN_FIELDS.includes("updaterImplementation"), true);
  assert.equal(VERSION_COMPATIBILITY_FORBIDDEN_FIELDS.includes("migrationImplementation"), true);
  assert.equal(VERSION_COMPATIBILITY_FORBIDDEN_FIELDS.includes("fileBytes"), true);
  assert.equal(VERSION_COMPATIBILITY_FORBIDDEN_FIELDS.includes("downloadState"), true);
  assertUnique(VERSION_COMPATIBILITY_STATE_LIST);
  assertUnique(VERSION_COMPATIBILITY_FORBIDDEN_FIELDS);

  assert.equal(isVersionCompatibilityState(VERSION_COMPATIBILITY_STATES.INCOMPATIBLE), true);
  assert.equal(isVersionCompatibilityState(VERSION_COMPATIBILITY_STATES.COMPATIBLE), true);
  assert.equal(isVersionCompatibilityState(VERSION_COMPATIBILITY_STATES.DEPRECATED), true);
  assert.equal(isVersionCompatibilityState(VERSION_COMPATIBILITY_STATES.BLOCKED), true);
  assert.equal(isVersionCompatibilityState("unknown"), false);
  assert.equal(isVersionCompatibilityVersion(1), true);
  assert.equal(isVersionCompatibilityVersion(0), false);
  assert.equal(isIdentityPermission(IDENTITY_PERMISSIONS.VIEW), true);

  for (const scenario of scenarios.validVersionCompatibilities) {
    const versionCompatibility = buildVersionCompatibility(scenarios.baseVersionCompatibility, scenario);
    const validation = validateVersionCompatibilityContract(versionCompatibility);
    assert.equal(validation.valid, true, scenario.name);
    assert.deepEqual(validation.errors, scenario.expectedErrors, scenario.name);
  }

  for (const scenario of scenarios.invalidVersionCompatibilities) {
    const versionCompatibility = buildVersionCompatibility(scenarios.baseVersionCompatibility, scenario);
    const validation = validateVersionCompatibilityContract(versionCompatibility);
    assert.equal(validation.valid, false, scenario.name);
    assert.deepEqual(validation.errors.map((error) => error.code), scenario.expectedErrors, scenario.name);
  }

  assertErrorForScenario(scenarios, "missing owner", VERSION_COMPATIBILITY_CONTRACT_ERRORS.OWNER_REQUIRED);
  assertErrorForScenario(scenarios, "missing project", VERSION_COMPATIBILITY_CONTRACT_ERRORS.PROJECT_REQUIRED);
  assertErrorForScenario(scenarios, "missing source release", VERSION_COMPATIBILITY_CONTRACT_ERRORS.SOURCE_RELEASE_REQUIRED);
  assertErrorForScenario(scenarios, "missing source publish", VERSION_COMPATIBILITY_CONTRACT_ERRORS.SOURCE_PUBLISH_REQUIRED);
  assertErrorForScenario(scenarios, "missing update channel", VERSION_COMPATIBILITY_CONTRACT_ERRORS.UPDATE_CHANNEL_REQUIRED);
  assertErrorForScenario(scenarios, "missing library item", VERSION_COMPATIBILITY_CONTRACT_ERRORS.LIBRARY_ITEM_REQUIRED);
  assertErrorForScenario(scenarios, "missing install receipt", VERSION_COMPATIBILITY_CONTRACT_ERRORS.INSTALL_RECEIPT_REQUIRED);
  assertErrorForScenario(scenarios, "invalid minimum version", VERSION_COMPATIBILITY_CONTRACT_ERRORS.MINIMUM_VERSION_INVALID);
  assertErrorForScenario(scenarios, "invalid maximum version", VERSION_COMPATIBILITY_CONTRACT_ERRORS.MAXIMUM_VERSION_INVALID);
  assertErrorForScenario(scenarios, "invalid target version", VERSION_COMPATIBILITY_CONTRACT_ERRORS.TARGET_VERSION_INVALID);
  assertErrorForScenario(scenarios, "invalid supported schema version", VERSION_COMPATIBILITY_CONTRACT_ERRORS.SUPPORTED_SCHEMA_VERSION_INVALID);
  assertErrorForScenario(scenarios, "minimum greater than maximum", VERSION_COMPATIBILITY_CONTRACT_ERRORS.VERSION_RANGE_INVALID);
  assertErrorForScenario(scenarios, "target outside version range", VERSION_COMPATIBILITY_CONTRACT_ERRORS.TARGET_VERSION_OUT_OF_RANGE);
  assertErrorForScenario(scenarios, "target release version mismatch", VERSION_COMPATIBILITY_CONTRACT_ERRORS.TARGET_RELEASE_VERSION_MISMATCH);
  assertErrorForScenario(scenarios, "invalid compatibility state", VERSION_COMPATIBILITY_CONTRACT_ERRORS.COMPATIBILITY_STATE_INVALID);
  assertErrorForScenario(scenarios, "release publish mismatch", VERSION_COMPATIBILITY_CONTRACT_ERRORS.RELEASE_PUBLISH_MISMATCH);
  assertErrorForScenario(scenarios, "update channel publish mismatch", VERSION_COMPATIBILITY_CONTRACT_ERRORS.PUBLISH_UPDATE_CHANNEL_MISMATCH);
  assertErrorForScenario(scenarios, "library item install receipt mismatch", VERSION_COMPATIBILITY_CONTRACT_ERRORS.LIBRARY_ITEM_INSTALL_RECEIPT_MISMATCH);
  assertErrorForScenario(scenarios, "runtime state leakage", VERSION_COMPATIBILITY_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "tool state leakage", VERSION_COMPATIBILITY_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "installer state leakage", VERSION_COMPATIBILITY_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "updater implementation leakage", VERSION_COMPATIBILITY_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "migration implementation leakage", VERSION_COMPATIBILITY_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "file bytes leakage", VERSION_COMPATIBILITY_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "download state leakage", VERSION_COMPATIBILITY_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);

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
    releaseNotes: "Release linked by version compatibility contract.",
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
    publishNotes: "Publish linked by version compatibility contract.",
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
  const updateChannel = {
    updateChannelId: "update-channel.alpha.stable",
    ownerId: "user.buyer",
    projectId: "project.game.alpha",
    channelType: UPDATE_CHANNEL_TYPES.STABLE,
    assignedRelease: {
      releaseId: release.releaseId,
      projectId: release.projectId,
      version: release.version,
      status: release.status,
    },
    assignedPublish: {
      publishId: publish.publishId,
      projectId: publish.projectId,
      releaseId: release.releaseId,
      status: publish.status,
    },
    libraryItem: {
      libraryItemId: libraryItem.libraryItemId,
      ownerId: libraryItem.ownerId,
      projectId: libraryItem.projectId,
      releaseId: release.releaseId,
      publishId: publish.publishId,
      libraryStatus: libraryItem.libraryStatus,
    },
    installReceipt: {
      installReceiptId: installReceipt.installReceiptId,
      ownerId: installReceipt.ownerId,
      projectId: installReceipt.projectId,
      libraryItemId: libraryItem.libraryItemId,
      releaseId: release.releaseId,
      publishId: publish.publishId,
      receiptStatus: installReceipt.receiptStatus,
    },
    assignedAt: "2026-06-02T22:00:00.000Z",
  };
  const versionCompatibility = buildVersionCompatibility(scenarios.baseVersionCompatibility, scenarios.validVersionCompatibilities[0]);

  assert.equal(validateProjectContract(project).valid, true);
  assert.equal(validateReleaseContract(release).valid, true);
  assert.equal(validatePublishContract(publish).valid, true);
  assert.equal(validateMarketplaceListingContract(listing).valid, true);
  assert.equal(validateEntitlementContract(entitlement).valid, true);
  assert.equal(validateLibraryItemContract(libraryItem).valid, true);
  assert.equal(validateInstallReceiptContract(installReceipt).valid, true);
  assert.equal(validateUpdateChannelContract(updateChannel).valid, true);
  assert.equal(validateVersionCompatibilityContract(versionCompatibility).valid, true);

  assert.equal(isVersionCompatibilitySourceRelease(versionCompatibility.sourceRelease), true);
  assert.equal(isVersionCompatibilitySourceRelease({
    releaseId: "release.game.alpha.2",
    projectId: "project.game.alpha",
    version: 0,
    status: RELEASE_STATUS.PUBLISHED,
  }), false);
  assert.equal(isVersionCompatibilitySourcePublish(versionCompatibility.sourcePublish), true);
  assert.equal(isVersionCompatibilitySourcePublish({
    publishId: "publish.game.alpha.2",
    projectId: "project.game.alpha",
    releaseId: "release.game.alpha.2",
    status: PUBLISH_STATUS.READY,
  }), false);
  assert.equal(isVersionCompatibilityUpdateChannel(versionCompatibility.updateChannel), true);
  assert.equal(isVersionCompatibilityUpdateChannel({
    ...versionCompatibility.updateChannel,
    channelType: "canary",
  }), false);
  assert.equal(isVersionCompatibilityLibraryItem(versionCompatibility.libraryItem), true);
  assert.equal(isVersionCompatibilityLibraryItem({
    ...versionCompatibility.libraryItem,
    libraryStatus: "installed",
  }), false);
  assert.equal(isVersionCompatibilityInstallReceipt(versionCompatibility.installReceipt), true);
  assert.equal(isVersionCompatibilityInstallReceipt({
    ...versionCompatibility.installReceipt,
    receiptStatus: "queued",
  }), false);
  assert.equal(isTargetVersionInCompatibilityRange(versionCompatibility), true);
  assert.equal(isTargetVersionInCompatibilityRange({
    minimumVersion: 1,
    maximumVersion: 2,
    targetVersion: 3,
  }), false);

  const incompatibleCompatibility = buildVersionCompatibility(
    scenarios.baseVersionCompatibility,
    scenarios.validVersionCompatibilities.find((scenario) => scenario.name === "incompatible version compatibility")
  );
  const deprecatedCompatibility = buildVersionCompatibility(
    scenarios.baseVersionCompatibility,
    scenarios.validVersionCompatibilities.find((scenario) => scenario.name === "deprecated version compatibility")
  );
  const blockedCompatibility = buildVersionCompatibility(
    scenarios.baseVersionCompatibility,
    scenarios.validVersionCompatibilities.find((scenario) => scenario.name === "blocked version compatibility")
  );
  assert.equal(isVersionCompatibilityCompatible(versionCompatibility), true);
  assert.equal(isVersionCompatibilityIncompatible(incompatibleCompatibility), true);
  assert.equal(isVersionCompatibilityDeprecated(deprecatedCompatibility), true);
  assert.equal(isVersionCompatibilityBlocked(blockedCompatibility), true);

  assert.equal(isVersionCompatibilityVisibleToActor({
    actorId: "user.buyer",
    versionCompatibility,
  }), true);
  assert.equal(isVersionCompatibilityVisibleToActor({
    actorId: "public.viewer",
    versionCompatibility,
  }), false);
  assert.equal(canActorAccessVersionCompatibility({
    actorId: "user.buyer",
    permission: IDENTITY_PERMISSIONS.VIEW,
    versionCompatibility,
  }), true, "version compatibility owner can view record");
  assert.equal(canActorAccessVersionCompatibility({
    actorId: "public.viewer",
    role: IDENTITY_ROLES.GUEST,
    permission: IDENTITY_PERMISSIONS.VIEW,
    versionCompatibility,
  }), false, "guest cannot view private version compatibility");
  assert.equal(canActorAccessVersionCompatibility({
    actorId: "platform.admin",
    role: IDENTITY_ROLES.ADMIN,
    permission: IDENTITY_PERMISSIONS.ADMINISTER,
    versionCompatibility,
  }), true, "platform admin can administer version compatibility record");
}

function assertErrorForScenario(scenarios, name, expectedErrorCode) {
  const scenario = scenarios.invalidVersionCompatibilities.find((item) => item.name === name);
  const versionCompatibility = buildVersionCompatibility(scenarios.baseVersionCompatibility, scenario);
  const validation = validateVersionCompatibilityContract(versionCompatibility);
  assert.equal(validation.errors.some((error) => error.code === expectedErrorCode), true, name);
}

function buildVersionCompatibility(baseVersionCompatibility, scenario) {
  const versionCompatibility = clone(baseVersionCompatibility);
  mergeObject(versionCompatibility, scenario.overrides ?? {});

  for (const fieldPath of scenario.removeFields ?? []) {
    removeField(versionCompatibility, fieldPath);
  }

  return versionCompatibility;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function mergeObject(target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (isPlainObject(value) && isPlainObject(target[key])) {
      mergeObject(target[key], value);
    } else {
      target[key] = clone(value);
    }
  }
}

function removeField(target, fieldPath) {
  const parts = fieldPath.split(".");
  const lastPart = parts.pop();
  const parent = parts.reduce((object, key) => object?.[key], target);

  if (parent && Object.hasOwn(parent, lastPart)) {
    delete parent[lastPart];
  }
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function assertUnique(values) {
  assert.equal(new Set(values).size, values.length);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
