/*
Toolbox Aid
David Quesenberry
06/02/2026
ContractIndexValidation.test.mjs
*/
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

export const CONTRACT_INDEX = Object.freeze([
  entry("Audit Event", "auditEventContract.js", "AuditEventContract.test.mjs", "audit-events/audit-event-scenarios.json", "AUDIT_EVENT_CONTRACT.md", "audit_event_contract_tests_validation.md"),
  entry("Backup Snapshot", "backupSnapshotContract.js", "BackupSnapshotContract.test.mjs", "backup-snapshots/backup-snapshot-scenarios.json", "BACKUP_SNAPSHOT_CONTRACT.md", "backup_snapshot_contract_tests_validation.md"),
  entry("Collaboration Role", "collaborationRoleContract.js", "CollaborationRoleContract.test.mjs", "collaboration-roles/collaboration-role-scenarios.json", "COLLABORATION_ROLE_CONTRACT.md", "collaboration_role_contract_tests_validation.md"),
  entry("Creator Profile", "creatorProfileContract.js", "CreatorProfileContract.test.mjs", "creator-profiles/creator-profile-scenarios.json", "CREATOR_PROFILE_CONTRACT.md", "creator_profile_contract_tests_validation.md"),
  entry("Download Grant", "downloadGrantContract.js", "DownloadGrantContract.test.mjs", "download-grants/download-grant-scenarios.json", "DOWNLOAD_GRANT_CONTRACT.md", "download_grant_contract_tests_validation.md"),
  entry("Entitlement", "entitlementContract.js", "EntitlementContract.test.mjs", "entitlements/entitlement-scenarios.json", "ENTITLEMENT_CONTRACT.md", "entitlement_contract_tests_validation.md"),
  entry("Game Manifest", "gameManifestContract.js", "GameManifestContract.test.mjs", "manifests/manifest-scenarios.json", "GAME_MANIFEST_CONTRACT.md", "manifest_contract_tests_validation.md"),
  entry("Identity Permissions", "identityPermissionsContract.js", "IdentityPermissionsContract.test.mjs", "identity-permissions/permission-scenarios.json", "IDENTITY_PERMISSIONS_CONTRACT.md", "identity_permissions_contract_tests_validation.md"),
  entry("Install Receipt", "installReceiptContract.js", "InstallReceiptContract.test.mjs", "install-receipts/install-receipt-scenarios.json", "INSTALL_RECEIPT_CONTRACT.md", "install_receipt_contract_tests_validation.md"),
  entry("Library Item", "libraryItemContract.js", "LibraryItemContract.test.mjs", "library-items/library-item-scenarios.json", "LIBRARY_ITEM_CONTRACT.md", "library_item_contract_tests_validation.md"),
  entry("Marketplace Listing", "marketplaceListingContract.js", "MarketplaceListingContract.test.mjs", "marketplace-listings/marketplace-listing-scenarios.json", "MARKETPLACE_LISTING_CONTRACT.md", "marketplace_listing_contract_tests_validation.md"),
  entry("Marketplace Transaction Boundary", "marketplaceTransactionBoundaryContract.js", "MarketplaceTransactionBoundaryContract.test.mjs", "marketplace-transaction-boundaries/marketplace-transaction-boundary-scenarios.json", "MARKETPLACE_TRANSACTION_BOUNDARY_CONTRACT.md", "marketplace_transaction_boundary_contract_tests_validation.md"),
  entry("Migration Plan", "migrationPlanContract.js", "MigrationPlanContract.test.mjs", "migration-plans/migration-plan-scenarios.json", "MIGRATION_PLAN_CONTRACT.md", "migration_plan_contract_tests_validation.md"),
  entry("Moderation Queue", "moderationQueueContract.js", "ModerationQueueContract.test.mjs", "moderation-queues/moderation-queue-scenarios.json", "MODERATION_QUEUE_CONTRACT.md", "moderation_queue_contract_tests_validation.md"),
  entry("Notification", "notificationContract.js", "NotificationContract.test.mjs", "notifications/notification-scenarios.json", "NOTIFICATION_CONTRACT.md", "notification_contract_tests_validation.md"),
  entry("Organization", "organizationContract.js", "OrganizationContract.test.mjs", "organizations/organization-scenarios.json", "ORGANIZATION_CONTRACT.md", "organization_contract_tests_validation.md"),
  entry("Project", "projectContract.js", "ProjectContract.test.mjs", "projects/project-scenarios.json", "PROJECT_CONTRACT.md", "project_contract_tests_validation.md"),
  entry("ProjectWorkspace Runtime", "projectWorkspaceRuntimeContract.js", "ProjectWorkspaceRuntimeContract.test.mjs", "project-workspaces/project-workspace-runtime-scenarios.json", "PROJECT_WORKSPACE_RUNTIME_CONTRACT.md", "project_workspace_contract_rename_validation.md"),
  entry("Publish", "publishContract.js", "PublishContract.test.mjs", "publish/publish-scenarios.json", "PUBLISH_CONTRACT.md", "publish_contract_tests_validation.md"),
  entry("Release", "releaseContract.js", "ReleaseContract.test.mjs", "releases/release-scenarios.json", "RELEASE_CONTRACT.md", "release_contract_tests_validation.md"),
  entry("Restore Snapshot", "restoreSnapshotContract.js", "RestoreSnapshotContract.test.mjs", "restore-snapshots/restore-snapshot-scenarios.json", "RESTORE_SNAPSHOT_CONTRACT.md", "restore_snapshot_contract_tests_validation.md"),
  entry("Review Rating", "reviewRatingContract.js", "ReviewRatingContract.test.mjs", "review-ratings/review-rating-scenarios.json", "REVIEW_RATING_CONTRACT.md", "review_rating_contract_tests_validation.md"),
  entry("Tool State", "toolStateContract.js", "ToolStateContract.test.mjs", "tool-states/tool-state-scenarios.json", "TOOL_STATE_CONTRACT.md", "tool_state_contract_tests_validation.md"),
  entry("Update Channel", "updateChannelContract.js", "UpdateChannelContract.test.mjs", "update-channels/update-channel-scenarios.json", "UPDATE_CHANNEL_CONTRACT.md", "update_channel_contract_tests_validation.md"),
  entry("Version Compatibility", "versionCompatibilityContract.js", "VersionCompatibilityContract.test.mjs", "version-compatibility/version-compatibility-scenarios.json", "VERSION_COMPATIBILITY_CONTRACT.md", "version_compatibility_contract_tests_validation.md"),
]);

const legacySharedContractFiles = Object.freeze([
  "projectDataStoreContract.js",
  "replayContracts.js",
  "sharedStateContracts.js",
]);

export function run() {
  assert.equal(CONTRACT_INDEX.length, 25, "active platform contract index count");
  assertUnique(CONTRACT_INDEX.map((contract) => contract.name), "contract names");
  assertUnique(CONTRACT_INDEX.map((contract) => contract.contractPath), "contract files");
  assertUnique(CONTRACT_INDEX.map((contract) => contract.testPath), "test files");
  assertUnique(CONTRACT_INDEX.map((contract) => contract.fixturePath), "fixture files");
  assertUnique(CONTRACT_INDEX.map((contract) => contract.specPath), "spec files");
  assertUnique(CONTRACT_INDEX.map((contract) => contract.reportPath), "report files");

  const indexedContractFiles = CONTRACT_INDEX.map((contract) => path.basename(contract.contractPath)).sort();
  const unindexedSharedContractFiles = new Set(legacySharedContractFiles);
  const actualRootContractFiles = fs.readdirSync(resolvePath("src/shared/contracts"))
    .filter((fileName) => fileName.endsWith("Contract.js"))
    .filter((fileName) => !unindexedSharedContractFiles.has(fileName))
    .sort();

  assert.deepEqual(
    actualRootContractFiles,
    indexedContractFiles,
    "all active root shared contracts are indexed one-to-one"
  );

  for (const contract of CONTRACT_INDEX) {
    for (const fieldName of ["contractPath", "testPath", "fixturePath", "specPath", "reportPath"]) {
      assertFileExists(contract[fieldName], `${contract.name} ${fieldName}`);
      assertScopedPath(contract[fieldName], `${contract.name} ${fieldName}`);
    }
  }

  for (const fileName of legacySharedContractFiles) {
    assertFileExists(`src/shared/contracts/${fileName}`, `legacy shared helper ${fileName}`);
  }
}

function entry(name, contractFile, testFile, fixtureFile, specFile, reportFile) {
  return Object.freeze({
    name,
    contractPath: `src/shared/contracts/${contractFile}`,
    testPath: `dev/tests/shared/${testFile}`,
    fixturePath: `dev/tests/fixtures/${fixtureFile}`,
    specPath: `dev/build/ProjectInstructions/standards/${specFile}`,
    reportPath: `dev/reports/${reportFile}`,
  });
}

function assertUnique(values, label) {
  assert.equal(new Set(values).size, values.length, `${label} must be unique`);
}

function assertFileExists(repoRelativePath, label) {
  assert.equal(fs.existsSync(resolvePath(repoRelativePath)), true, `${label} exists at ${repoRelativePath}`);
}

function assertScopedPath(repoRelativePath, label) {
  assert.equal(repoRelativePath.includes("samples/"), false, `${label} is not a sample path`);
  assert.equal(repoRelativePath.includes("GameFoundryStudio/"), false, `${label} is not a public page path`);
  assert.equal(repoRelativePath.includes("toolbox/"), false, `${label} is not a tool runtime path`);
  assert.equal(repoRelativePath.includes("games/"), false, `${label} is not a game runtime path`);
  assert.equal(repoRelativePath.includes("src/shared/contracts/tools/"), false, `${label} does not consolidate tool contracts`);
}

function resolvePath(repoRelativePath) {
  return path.join(repoRoot, repoRelativePath);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  run();
}
