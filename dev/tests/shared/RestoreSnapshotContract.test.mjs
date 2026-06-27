/*
Toolbox Aid
David Quesenberry
06/02/2026
RestoreSnapshotContract.test.mjs
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
  RESTORE_SNAPSHOT_CONTRACT_ERRORS,
  RESTORE_SNAPSHOT_CONTRACT_ID,
  RESTORE_SNAPSHOT_CONTRACT_VERSION,
  RESTORE_SNAPSHOT_FIELD_LIST,
  RESTORE_SNAPSHOT_FIELDS,
  RESTORE_SNAPSHOT_FORBIDDEN_FIELDS,
  RESTORE_SNAPSHOT_RULES,
  canActorAccessRestoreSnapshot,
  isRestoreSnapshotBackupSnapshot,
  isRestoreSnapshotCompatibilityAllowed,
  isRestoreSnapshotTargetRelease,
  isRestoreSnapshotVersion,
  isRestoreSnapshotVersionCompatibility,
  isRestoreSnapshotVisibleToActor,
  validateRestoreSnapshotContract,
} from "../../../src/shared/contracts/restoreSnapshotContract.js";

const scenariosPath = fileURLToPath(
  new URL("../fixtures/restore-snapshots/restore-snapshot-scenarios.json", import.meta.url)
);

export function run() {
  const scenarios = JSON.parse(readFileSync(scenariosPath, "utf8"));

  assert.equal(RESTORE_SNAPSHOT_CONTRACT_ID, "gamefoundrystudio.restore.snapshot.contract");
  assert.equal(RESTORE_SNAPSHOT_CONTRACT_VERSION, "1.0.0");
  assert.deepEqual(RESTORE_SNAPSHOT_FIELD_LIST, [
    "restoreSnapshotId",
    "ownerId",
    "projectId",
    "backupSnapshot",
    "targetRelease",
    "versionCompatibility",
    "restoredAt",
    "restoreNotes",
  ]);
  assert.deepEqual(RESTORE_SNAPSHOT_FIELDS, {
    RESTORE_SNAPSHOT_ID: "restoreSnapshotId",
    OWNER: "ownerId",
    PROJECT: "projectId",
    BACKUP_SNAPSHOT: "backupSnapshot",
    TARGET_RELEASE: "targetRelease",
    VERSION_COMPATIBILITY: "versionCompatibility",
    RESTORED_AT: "restoredAt",
    RESTORE_NOTES: "restoreNotes",
  });
  assert.equal(RESTORE_SNAPSHOT_RULES.REQUIRES_OWNER, true);
  assert.equal(RESTORE_SNAPSHOT_RULES.REQUIRES_PROJECT, true);
  assert.equal(RESTORE_SNAPSHOT_RULES.REQUIRES_BACKUP_SNAPSHOT, true);
  assert.equal(RESTORE_SNAPSHOT_RULES.REQUIRES_TARGET_RELEASE, true);
  assert.equal(RESTORE_SNAPSHOT_RULES.REQUIRES_VERSION_COMPATIBILITY, true);
  assert.equal(RESTORE_SNAPSHOT_RULES.REQUIRES_RESTORED_AT, true);
  assert.equal(RESTORE_SNAPSHOT_RULES.REQUIRES_OWNER_BACKUP_SNAPSHOT_LINKAGE, true);
  assert.equal(RESTORE_SNAPSHOT_RULES.REQUIRES_OWNER_COMPATIBILITY_LINKAGE, true);
  assert.equal(RESTORE_SNAPSHOT_RULES.REQUIRES_PROJECT_BACKUP_SNAPSHOT_LINKAGE, true);
  assert.equal(RESTORE_SNAPSHOT_RULES.REQUIRES_PROJECT_TARGET_RELEASE_LINKAGE, true);
  assert.equal(RESTORE_SNAPSHOT_RULES.REQUIRES_PROJECT_COMPATIBILITY_LINKAGE, true);
  assert.equal(RESTORE_SNAPSHOT_RULES.REQUIRES_RELEASE_BACKUP_TARGET_LINKAGE, true);
  assert.equal(RESTORE_SNAPSHOT_RULES.REQUIRES_RELEASE_COMPATIBILITY_LINKAGE, true);
  assert.equal(RESTORE_SNAPSHOT_RULES.REQUIRES_PUBLISH_BACKUP_COMPATIBILITY_LINKAGE, true);
  assert.equal(RESTORE_SNAPSHOT_RULES.SNAPSHOT_VERSION_MUST_MATCH_TARGET_RELEASE_VERSION, true);
  assert.equal(RESTORE_SNAPSHOT_RULES.SNAPSHOT_SCHEMA_MUST_MATCH_COMPATIBILITY_SCHEMA, true);
  assert.equal(RESTORE_SNAPSHOT_RULES.COMPATIBILITY_MUST_ALLOW_RESTORE, true);
  assert.equal(RESTORE_SNAPSHOT_RULES.NO_RUNTIME_STATE, true);
  assert.equal(RESTORE_SNAPSHOT_RULES.NO_TOOL_STATE, true);
  assert.equal(RESTORE_SNAPSHOT_RULES.NO_FILE_BYTES, true);
  assert.equal(RESTORE_SNAPSHOT_RULES.NO_AUTH_SESSION_STATE, true);
  assert.equal(RESTORE_SNAPSHOT_RULES.NO_INSTALLER_STATE, true);
  assert.equal(RESTORE_SNAPSHOT_RULES.NO_UPDATER_IMPLEMENTATION_DETAILS, true);
  assert.equal(RESTORE_SNAPSHOT_RULES.NO_STORAGE_IMPLEMENTATION_DETAILS, true);
  assert.equal(RESTORE_SNAPSHOT_FORBIDDEN_FIELDS.includes("workspaceState"), true);
  assert.equal(RESTORE_SNAPSHOT_FORBIDDEN_FIELDS.includes("toolState"), true);
  assert.equal(RESTORE_SNAPSHOT_FORBIDDEN_FIELDS.includes("fileBytes"), true);
  assert.equal(RESTORE_SNAPSHOT_FORBIDDEN_FIELDS.includes("authSessionState"), true);
  assert.equal(RESTORE_SNAPSHOT_FORBIDDEN_FIELDS.includes("installerState"), true);
  assert.equal(RESTORE_SNAPSHOT_FORBIDDEN_FIELDS.includes("updaterImplementation"), true);
  assert.equal(RESTORE_SNAPSHOT_FORBIDDEN_FIELDS.includes("storageProvider"), true);
  assertUnique(RESTORE_SNAPSHOT_FORBIDDEN_FIELDS);

  assert.equal(isRestoreSnapshotVersion(1), true);
  assert.equal(isRestoreSnapshotVersion(0), false);
  assert.equal(isIdentityPermission(IDENTITY_PERMISSIONS.VIEW), true);

  for (const scenario of scenarios.validRestoreSnapshots) {
    const restoreSnapshot = buildRestoreSnapshot(scenarios.baseRestoreSnapshot, scenario);
    const validation = validateRestoreSnapshotContract(restoreSnapshot);
    assert.equal(validation.valid, true, scenario.name);
    assert.deepEqual(validation.errors, scenario.expectedErrors, scenario.name);
  }

  for (const scenario of scenarios.invalidRestoreSnapshots) {
    const restoreSnapshot = buildRestoreSnapshot(scenarios.baseRestoreSnapshot, scenario);
    const validation = validateRestoreSnapshotContract(restoreSnapshot);
    assert.equal(validation.valid, false, scenario.name);
    assert.deepEqual(validation.errors.map((error) => error.code), scenario.expectedErrors, scenario.name);
  }

  assertErrorForScenario(scenarios, "missing owner", RESTORE_SNAPSHOT_CONTRACT_ERRORS.OWNER_REQUIRED);
  assertErrorForScenario(scenarios, "missing project", RESTORE_SNAPSHOT_CONTRACT_ERRORS.PROJECT_REQUIRED);
  assertErrorForScenario(scenarios, "missing backup snapshot", RESTORE_SNAPSHOT_CONTRACT_ERRORS.BACKUP_SNAPSHOT_REQUIRED);
  assertErrorForScenario(scenarios, "missing target release", RESTORE_SNAPSHOT_CONTRACT_ERRORS.TARGET_RELEASE_REQUIRED);
  assertErrorForScenario(scenarios, "missing version compatibility", RESTORE_SNAPSHOT_CONTRACT_ERRORS.VERSION_COMPATIBILITY_REQUIRED);
  assertErrorForScenario(scenarios, "invalid backup snapshot", RESTORE_SNAPSHOT_CONTRACT_ERRORS.BACKUP_SNAPSHOT_INVALID);
  assertErrorForScenario(scenarios, "invalid target release", RESTORE_SNAPSHOT_CONTRACT_ERRORS.TARGET_RELEASE_INVALID);
  assertErrorForScenario(scenarios, "invalid version compatibility", RESTORE_SNAPSHOT_CONTRACT_ERRORS.VERSION_COMPATIBILITY_INVALID);
  assertErrorForScenario(scenarios, "invalid restored timestamp", RESTORE_SNAPSHOT_CONTRACT_ERRORS.RESTORED_AT_INVALID);
  assertErrorForScenario(scenarios, "backup snapshot owner mismatch", RESTORE_SNAPSHOT_CONTRACT_ERRORS.OWNER_BACKUP_SNAPSHOT_MISMATCH);
  assertErrorForScenario(scenarios, "version compatibility owner mismatch", RESTORE_SNAPSHOT_CONTRACT_ERRORS.OWNER_COMPATIBILITY_MISMATCH);
  assertErrorForScenario(scenarios, "target release project mismatch", RESTORE_SNAPSHOT_CONTRACT_ERRORS.PROJECT_TARGET_RELEASE_MISMATCH);
  assertErrorForScenario(scenarios, "backup target release mismatch", RESTORE_SNAPSHOT_CONTRACT_ERRORS.RELEASE_BACKUP_TARGET_MISMATCH);
  assertErrorForScenario(scenarios, "version compatibility release mismatch", RESTORE_SNAPSHOT_CONTRACT_ERRORS.RELEASE_COMPATIBILITY_MISMATCH);
  assertErrorForScenario(scenarios, "publish compatibility mismatch", RESTORE_SNAPSHOT_CONTRACT_ERRORS.PUBLISH_BACKUP_COMPATIBILITY_MISMATCH);
  assertErrorForScenario(scenarios, "target release version mismatch", RESTORE_SNAPSHOT_CONTRACT_ERRORS.TARGET_RELEASE_VERSION_MISMATCH);
  assertErrorForScenario(scenarios, "schema version mismatch", RESTORE_SNAPSHOT_CONTRACT_ERRORS.SCHEMA_VERSION_MISMATCH);
  assertErrorForScenario(scenarios, "blocked compatibility", RESTORE_SNAPSHOT_CONTRACT_ERRORS.COMPATIBILITY_GATE_BLOCKED);
  assertErrorForScenario(scenarios, "incompatible compatibility", RESTORE_SNAPSHOT_CONTRACT_ERRORS.COMPATIBILITY_GATE_BLOCKED);
  assertErrorForScenario(scenarios, "runtime state leakage", RESTORE_SNAPSHOT_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "tool state leakage", RESTORE_SNAPSHOT_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "file bytes leakage", RESTORE_SNAPSHOT_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "auth session leakage", RESTORE_SNAPSHOT_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "installer state leakage", RESTORE_SNAPSHOT_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "updater implementation leakage", RESTORE_SNAPSHOT_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "storage implementation leakage", RESTORE_SNAPSHOT_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);

  const restoreSnapshot = buildRestoreSnapshot(scenarios.baseRestoreSnapshot, scenarios.validRestoreSnapshots[0]);
  assert.equal(isRestoreSnapshotBackupSnapshot(restoreSnapshot.backupSnapshot), true);
  assert.equal(isRestoreSnapshotBackupSnapshot({
    ...restoreSnapshot.backupSnapshot,
    schemaVersion: 0,
  }), false);
  assert.equal(isRestoreSnapshotTargetRelease(restoreSnapshot.targetRelease), true);
  assert.equal(isRestoreSnapshotTargetRelease({
    releaseId: "release.game.alpha.2",
    projectId: "project.game.alpha",
    version: 2,
    status: "draft",
  }), false);
  assert.equal(isRestoreSnapshotVersionCompatibility(restoreSnapshot.versionCompatibility), true);
  assert.equal(isRestoreSnapshotVersionCompatibility({
    ...restoreSnapshot.versionCompatibility,
    compatibilityState: "unknown",
  }), false);
  assert.equal(isRestoreSnapshotCompatibilityAllowed(restoreSnapshot), true);
  assert.equal(isRestoreSnapshotCompatibilityAllowed(buildRestoreSnapshot(
    scenarios.baseRestoreSnapshot,
    scenarios.invalidRestoreSnapshots.find((scenario) => scenario.name === "blocked compatibility")
  )), false);

  assert.equal(isRestoreSnapshotVisibleToActor({
    actorId: "user.buyer",
    restoreSnapshot,
  }), true);
  assert.equal(isRestoreSnapshotVisibleToActor({
    actorId: "public.viewer",
    restoreSnapshot,
  }), false);
  assert.equal(canActorAccessRestoreSnapshot({
    actorId: "user.buyer",
    permission: IDENTITY_PERMISSIONS.VIEW,
    restoreSnapshot,
  }), true, "restore snapshot owner can view record");
  assert.equal(canActorAccessRestoreSnapshot({
    actorId: "public.viewer",
    role: IDENTITY_ROLES.GUEST,
    permission: IDENTITY_PERMISSIONS.VIEW,
    restoreSnapshot,
  }), false, "guest cannot view private restore snapshot");
  assert.equal(canActorAccessRestoreSnapshot({
    actorId: "platform.admin",
    role: IDENTITY_ROLES.ADMIN,
    permission: IDENTITY_PERMISSIONS.ADMINISTER,
    restoreSnapshot,
  }), true, "platform admin can administer restore snapshot record");
}

function assertErrorForScenario(scenarios, name, expectedErrorCode) {
  const scenario = scenarios.invalidRestoreSnapshots.find((item) => item.name === name);
  const restoreSnapshot = buildRestoreSnapshot(scenarios.baseRestoreSnapshot, scenario);
  const validation = validateRestoreSnapshotContract(restoreSnapshot);
  assert.equal(validation.errors.some((error) => error.code === expectedErrorCode), true, name);
}

function buildRestoreSnapshot(baseRestoreSnapshot, scenario) {
  const restoreSnapshot = clone(baseRestoreSnapshot);
  mergeObject(restoreSnapshot, scenario.overrides ?? {});

  for (const fieldPath of scenario.removeFields ?? []) {
    removeField(restoreSnapshot, fieldPath);
  }

  return restoreSnapshot;
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
