/*
Toolbox Aid
David Quesenberry
06/02/2026
BackupSnapshotContract.test.mjs
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
  BACKUP_SNAPSHOT_CONTRACT_ERRORS,
  BACKUP_SNAPSHOT_CONTRACT_ID,
  BACKUP_SNAPSHOT_CONTRACT_VERSION,
  BACKUP_SNAPSHOT_FIELD_LIST,
  BACKUP_SNAPSHOT_FIELDS,
  BACKUP_SNAPSHOT_FORBIDDEN_FIELDS,
  BACKUP_SNAPSHOT_RULES,
  canActorAccessBackupSnapshot,
  isBackupSnapshotInstallReceipt,
  isBackupSnapshotLibraryItem,
  isBackupSnapshotMigrationPlan,
  isBackupSnapshotSourcePublish,
  isBackupSnapshotSourceRelease,
  isBackupSnapshotVersion,
  isBackupSnapshotVisibleToActor,
  validateBackupSnapshotContract,
} from "../../../src/shared/contracts/backupSnapshotContract.js";

const scenariosPath = fileURLToPath(
  new URL("../fixtures/backup-snapshots/backup-snapshot-scenarios.json", import.meta.url)
);

export function run() {
  const scenarios = JSON.parse(readFileSync(scenariosPath, "utf8"));

  assert.equal(BACKUP_SNAPSHOT_CONTRACT_ID, "gamefoundrystudio.backup.snapshot.contract");
  assert.equal(BACKUP_SNAPSHOT_CONTRACT_VERSION, "1.0.0");
  assert.deepEqual(BACKUP_SNAPSHOT_FIELD_LIST, [
    "backupSnapshotId",
    "ownerId",
    "projectId",
    "sourceRelease",
    "sourcePublish",
    "libraryItem",
    "installReceipt",
    "migrationPlan",
    "snapshotVersion",
    "schemaVersion",
    "createdAt",
    "backupNotes",
  ]);
  assert.deepEqual(BACKUP_SNAPSHOT_FIELDS, {
    BACKUP_SNAPSHOT_ID: "backupSnapshotId",
    OWNER: "ownerId",
    PROJECT: "projectId",
    SOURCE_RELEASE: "sourceRelease",
    SOURCE_PUBLISH: "sourcePublish",
    LIBRARY_ITEM: "libraryItem",
    INSTALL_RECEIPT: "installReceipt",
    MIGRATION_PLAN: "migrationPlan",
    SNAPSHOT_VERSION: "snapshotVersion",
    SCHEMA_VERSION: "schemaVersion",
    CREATED_AT: "createdAt",
    BACKUP_NOTES: "backupNotes",
  });
  assert.equal(BACKUP_SNAPSHOT_RULES.REQUIRES_OWNER, true);
  assert.equal(BACKUP_SNAPSHOT_RULES.REQUIRES_PROJECT, true);
  assert.equal(BACKUP_SNAPSHOT_RULES.REQUIRES_SOURCE_RELEASE, true);
  assert.equal(BACKUP_SNAPSHOT_RULES.REQUIRES_SOURCE_PUBLISH, true);
  assert.equal(BACKUP_SNAPSHOT_RULES.REQUIRES_LIBRARY_ITEM, true);
  assert.equal(BACKUP_SNAPSHOT_RULES.REQUIRES_INSTALL_RECEIPT, true);
  assert.equal(BACKUP_SNAPSHOT_RULES.REQUIRES_MIGRATION_PLAN, true);
  assert.equal(BACKUP_SNAPSHOT_RULES.REQUIRES_SNAPSHOT_VERSION, true);
  assert.equal(BACKUP_SNAPSHOT_RULES.REQUIRES_SCHEMA_VERSION, true);
  assert.equal(BACKUP_SNAPSHOT_RULES.REQUIRES_CREATED_AT, true);
  assert.equal(BACKUP_SNAPSHOT_RULES.REQUIRES_OWNER_LIBRARY_ITEM_LINKAGE, true);
  assert.equal(BACKUP_SNAPSHOT_RULES.REQUIRES_OWNER_INSTALL_RECEIPT_LINKAGE, true);
  assert.equal(BACKUP_SNAPSHOT_RULES.REQUIRES_OWNER_MIGRATION_PLAN_LINKAGE, true);
  assert.equal(BACKUP_SNAPSHOT_RULES.REQUIRES_PROJECT_RELEASE_LINKAGE, true);
  assert.equal(BACKUP_SNAPSHOT_RULES.REQUIRES_PROJECT_PUBLISH_LINKAGE, true);
  assert.equal(BACKUP_SNAPSHOT_RULES.REQUIRES_PROJECT_LIBRARY_ITEM_LINKAGE, true);
  assert.equal(BACKUP_SNAPSHOT_RULES.REQUIRES_PROJECT_INSTALL_RECEIPT_LINKAGE, true);
  assert.equal(BACKUP_SNAPSHOT_RULES.REQUIRES_PROJECT_MIGRATION_PLAN_LINKAGE, true);
  assert.equal(BACKUP_SNAPSHOT_RULES.REQUIRES_RELEASE_PUBLISH_LINKAGE, true);
  assert.equal(BACKUP_SNAPSHOT_RULES.REQUIRES_RELEASE_LIBRARY_ITEM_LINKAGE, true);
  assert.equal(BACKUP_SNAPSHOT_RULES.REQUIRES_RELEASE_INSTALL_RECEIPT_LINKAGE, true);
  assert.equal(BACKUP_SNAPSHOT_RULES.REQUIRES_RELEASE_MIGRATION_PLAN_LINKAGE, true);
  assert.equal(BACKUP_SNAPSHOT_RULES.REQUIRES_PUBLISH_LIBRARY_ITEM_LINKAGE, true);
  assert.equal(BACKUP_SNAPSHOT_RULES.REQUIRES_PUBLISH_INSTALL_RECEIPT_LINKAGE, true);
  assert.equal(BACKUP_SNAPSHOT_RULES.REQUIRES_PUBLISH_MIGRATION_PLAN_LINKAGE, true);
  assert.equal(BACKUP_SNAPSHOT_RULES.REQUIRES_LIBRARY_ITEM_INSTALL_RECEIPT_LINKAGE, true);
  assert.equal(BACKUP_SNAPSHOT_RULES.REQUIRES_LIBRARY_ITEM_MIGRATION_PLAN_LINKAGE, true);
  assert.equal(BACKUP_SNAPSHOT_RULES.REQUIRES_INSTALL_RECEIPT_MIGRATION_PLAN_LINKAGE, true);
  assert.equal(BACKUP_SNAPSHOT_RULES.SNAPSHOT_VERSION_MUST_MATCH_RELEASE_VERSION, true);
  assert.equal(BACKUP_SNAPSHOT_RULES.SNAPSHOT_VERSION_MUST_MATCH_MIGRATION_PLAN_TARGET, true);
  assert.equal(BACKUP_SNAPSHOT_RULES.SCHEMA_VERSION_MUST_MATCH_MIGRATION_PLAN_SCHEMA, true);
  assert.equal(BACKUP_SNAPSHOT_RULES.NO_RUNTIME_STATE, true);
  assert.equal(BACKUP_SNAPSHOT_RULES.NO_TOOL_STATE, true);
  assert.equal(BACKUP_SNAPSHOT_RULES.NO_FILE_BYTES, true);
  assert.equal(BACKUP_SNAPSHOT_RULES.NO_AUTH_SESSION_STATE, true);
  assert.equal(BACKUP_SNAPSHOT_RULES.NO_INSTALLER_STATE, true);
  assert.equal(BACKUP_SNAPSHOT_RULES.NO_UPDATER_IMPLEMENTATION_DETAILS, true);
  assert.equal(BACKUP_SNAPSHOT_RULES.NO_STORAGE_IMPLEMENTATION_DETAILS, true);
  assert.equal(BACKUP_SNAPSHOT_FORBIDDEN_FIELDS.includes("workspaceState"), true);
  assert.equal(BACKUP_SNAPSHOT_FORBIDDEN_FIELDS.includes("toolState"), true);
  assert.equal(BACKUP_SNAPSHOT_FORBIDDEN_FIELDS.includes("fileBytes"), true);
  assert.equal(BACKUP_SNAPSHOT_FORBIDDEN_FIELDS.includes("authSessionState"), true);
  assert.equal(BACKUP_SNAPSHOT_FORBIDDEN_FIELDS.includes("installerState"), true);
  assert.equal(BACKUP_SNAPSHOT_FORBIDDEN_FIELDS.includes("updaterImplementation"), true);
  assert.equal(BACKUP_SNAPSHOT_FORBIDDEN_FIELDS.includes("storageProvider"), true);
  assertUnique(BACKUP_SNAPSHOT_FORBIDDEN_FIELDS);

  assert.equal(isBackupSnapshotVersion(1), true);
  assert.equal(isBackupSnapshotVersion(0), false);
  assert.equal(isIdentityPermission(IDENTITY_PERMISSIONS.VIEW), true);

  for (const scenario of scenarios.validBackupSnapshots) {
    const backupSnapshot = buildBackupSnapshot(scenarios.baseBackupSnapshot, scenario);
    const validation = validateBackupSnapshotContract(backupSnapshot);
    assert.equal(validation.valid, true, scenario.name);
    assert.deepEqual(validation.errors, scenario.expectedErrors, scenario.name);
  }

  for (const scenario of scenarios.invalidBackupSnapshots) {
    const backupSnapshot = buildBackupSnapshot(scenarios.baseBackupSnapshot, scenario);
    const validation = validateBackupSnapshotContract(backupSnapshot);
    assert.equal(validation.valid, false, scenario.name);
    assert.deepEqual(validation.errors.map((error) => error.code), scenario.expectedErrors, scenario.name);
  }

  assertErrorForScenario(scenarios, "missing owner", BACKUP_SNAPSHOT_CONTRACT_ERRORS.OWNER_REQUIRED);
  assertErrorForScenario(scenarios, "missing project", BACKUP_SNAPSHOT_CONTRACT_ERRORS.PROJECT_REQUIRED);
  assertErrorForScenario(scenarios, "missing source release", BACKUP_SNAPSHOT_CONTRACT_ERRORS.SOURCE_RELEASE_REQUIRED);
  assertErrorForScenario(scenarios, "missing source publish", BACKUP_SNAPSHOT_CONTRACT_ERRORS.SOURCE_PUBLISH_REQUIRED);
  assertErrorForScenario(scenarios, "missing library item", BACKUP_SNAPSHOT_CONTRACT_ERRORS.LIBRARY_ITEM_REQUIRED);
  assertErrorForScenario(scenarios, "missing install receipt", BACKUP_SNAPSHOT_CONTRACT_ERRORS.INSTALL_RECEIPT_REQUIRED);
  assertErrorForScenario(scenarios, "missing migration plan", BACKUP_SNAPSHOT_CONTRACT_ERRORS.MIGRATION_PLAN_REQUIRED);
  assertErrorForScenario(scenarios, "invalid snapshot version", BACKUP_SNAPSHOT_CONTRACT_ERRORS.SNAPSHOT_VERSION_INVALID);
  assertErrorForScenario(scenarios, "invalid schema version", BACKUP_SNAPSHOT_CONTRACT_ERRORS.SCHEMA_VERSION_INVALID);
  assertErrorForScenario(scenarios, "source release version mismatch", BACKUP_SNAPSHOT_CONTRACT_ERRORS.RELEASE_VERSION_MISMATCH);
  assertErrorForScenario(scenarios, "migration plan target version mismatch", BACKUP_SNAPSHOT_CONTRACT_ERRORS.MIGRATION_PLAN_TARGET_VERSION_MISMATCH);
  assertErrorForScenario(scenarios, "migration plan schema mismatch", BACKUP_SNAPSHOT_CONTRACT_ERRORS.MIGRATION_PLAN_SCHEMA_MISMATCH);
  assertErrorForScenario(scenarios, "library item owner mismatch", BACKUP_SNAPSHOT_CONTRACT_ERRORS.OWNER_LIBRARY_ITEM_MISMATCH);
  assertErrorForScenario(scenarios, "source release project mismatch", BACKUP_SNAPSHOT_CONTRACT_ERRORS.PROJECT_RELEASE_MISMATCH);
  assertErrorForScenario(scenarios, "source publish release mismatch", BACKUP_SNAPSHOT_CONTRACT_ERRORS.RELEASE_PUBLISH_MISMATCH);
  assertErrorForScenario(scenarios, "migration plan publish mismatch", BACKUP_SNAPSHOT_CONTRACT_ERRORS.PUBLISH_MIGRATION_PLAN_MISMATCH);
  assertErrorForScenario(scenarios, "install receipt library item mismatch", BACKUP_SNAPSHOT_CONTRACT_ERRORS.LIBRARY_ITEM_INSTALL_RECEIPT_MISMATCH);
  assertErrorForScenario(scenarios, "migration plan install receipt mismatch", BACKUP_SNAPSHOT_CONTRACT_ERRORS.INSTALL_RECEIPT_MIGRATION_PLAN_MISMATCH);
  assertErrorForScenario(scenarios, "runtime state leakage", BACKUP_SNAPSHOT_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "tool state leakage", BACKUP_SNAPSHOT_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "file bytes leakage", BACKUP_SNAPSHOT_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "auth session leakage", BACKUP_SNAPSHOT_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "installer state leakage", BACKUP_SNAPSHOT_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "updater implementation leakage", BACKUP_SNAPSHOT_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "storage implementation leakage", BACKUP_SNAPSHOT_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);

  const backupSnapshot = buildBackupSnapshot(scenarios.baseBackupSnapshot, scenarios.validBackupSnapshots[0]);
  assert.equal(isBackupSnapshotSourceRelease(backupSnapshot.sourceRelease), true);
  assert.equal(isBackupSnapshotSourceRelease({
    releaseId: "release.game.alpha.2",
    projectId: "project.game.alpha",
    version: 2,
    status: "draft",
  }), false);
  assert.equal(isBackupSnapshotSourcePublish(backupSnapshot.sourcePublish), true);
  assert.equal(isBackupSnapshotSourcePublish({
    publishId: "publish.game.alpha.2",
    projectId: "project.game.alpha",
    releaseId: "release.game.alpha.2",
    status: "ready",
  }), false);
  assert.equal(isBackupSnapshotLibraryItem(backupSnapshot.libraryItem), true);
  assert.equal(isBackupSnapshotLibraryItem({
    ...backupSnapshot.libraryItem,
    libraryStatus: "installed",
  }), false);
  assert.equal(isBackupSnapshotInstallReceipt(backupSnapshot.installReceipt), true);
  assert.equal(isBackupSnapshotInstallReceipt({
    ...backupSnapshot.installReceipt,
    receiptStatus: "queued",
  }), false);
  assert.equal(isBackupSnapshotMigrationPlan(backupSnapshot.migrationPlan), true);
  assert.equal(isBackupSnapshotMigrationPlan({
    ...backupSnapshot.migrationPlan,
    migrationState: "running",
  }), false);

  assert.equal(isBackupSnapshotVisibleToActor({
    actorId: "user.buyer",
    backupSnapshot,
  }), true);
  assert.equal(isBackupSnapshotVisibleToActor({
    actorId: "public.viewer",
    backupSnapshot,
  }), false);
  assert.equal(canActorAccessBackupSnapshot({
    actorId: "user.buyer",
    permission: IDENTITY_PERMISSIONS.VIEW,
    backupSnapshot,
  }), true, "backup snapshot owner can view record");
  assert.equal(canActorAccessBackupSnapshot({
    actorId: "public.viewer",
    role: IDENTITY_ROLES.GUEST,
    permission: IDENTITY_PERMISSIONS.VIEW,
    backupSnapshot,
  }), false, "guest cannot view private backup snapshot");
  assert.equal(canActorAccessBackupSnapshot({
    actorId: "platform.admin",
    role: IDENTITY_ROLES.ADMIN,
    permission: IDENTITY_PERMISSIONS.ADMINISTER,
    backupSnapshot,
  }), true, "platform admin can administer backup snapshot record");
}

function assertErrorForScenario(scenarios, name, expectedErrorCode) {
  const scenario = scenarios.invalidBackupSnapshots.find((item) => item.name === name);
  const backupSnapshot = buildBackupSnapshot(scenarios.baseBackupSnapshot, scenario);
  const validation = validateBackupSnapshotContract(backupSnapshot);
  assert.equal(validation.errors.some((error) => error.code === expectedErrorCode), true, name);
}

function buildBackupSnapshot(baseBackupSnapshot, scenario) {
  const backupSnapshot = clone(baseBackupSnapshot);
  mergeObject(backupSnapshot, scenario.overrides ?? {});

  for (const fieldPath of scenario.removeFields ?? []) {
    removeField(backupSnapshot, fieldPath);
  }

  return backupSnapshot;
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
