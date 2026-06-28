/*
Toolbox Aid
David Quesenberry
06/02/2026
ContractFixtureIsolationValidation.test.mjs
*/
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

const FIXTURE_FILES = Object.freeze([
  "dev/tests/fixtures/audit-events/audit-event-scenarios.json",
  "dev/tests/fixtures/backup-snapshots/backup-snapshot-scenarios.json",
  "dev/tests/fixtures/collaboration-roles/collaboration-role-scenarios.json",
  "dev/tests/fixtures/creator-profiles/creator-profile-scenarios.json",
  "dev/tests/fixtures/download-grants/download-grant-scenarios.json",
  "dev/tests/fixtures/entitlements/entitlement-scenarios.json",
  "dev/tests/fixtures/identity-permissions/permission-scenarios.json",
  "dev/tests/fixtures/install-receipts/install-receipt-scenarios.json",
  "dev/tests/fixtures/library-items/library-item-scenarios.json",
  "dev/tests/fixtures/manifests/manifest-scenarios.json",
  "dev/tests/fixtures/marketplace-listings/marketplace-listing-scenarios.json",
  "dev/tests/fixtures/marketplace-transaction-boundaries/marketplace-transaction-boundary-scenarios.json",
  "dev/tests/fixtures/migration-plans/migration-plan-scenarios.json",
  "dev/tests/fixtures/moderation-queues/moderation-queue-scenarios.json",
  "dev/tests/fixtures/notifications/notification-scenarios.json",
  "dev/tests/fixtures/organizations/organization-scenarios.json",
  "dev/tests/fixtures/project-workspaces/project-workspace-runtime-scenarios.json",
  "dev/tests/fixtures/projects/project-scenarios.json",
  "dev/tests/fixtures/publish/publish-scenarios.json",
  "dev/tests/fixtures/releases/release-scenarios.json",
  "dev/tests/fixtures/restore-snapshots/restore-snapshot-scenarios.json",
  "dev/tests/fixtures/review-ratings/review-rating-scenarios.json",
  "dev/tests/fixtures/tool-states/tool-state-scenarios.json",
  "dev/tests/fixtures/update-channels/update-channel-scenarios.json",
  "dev/tests/fixtures/version-compatibility/version-compatibility-scenarios.json",
]);

const FORBIDDEN_DEPENDENCY_FIELDS = Object.freeze([
  "localStorage",
  "sessionStorage",
  "sample",
  "samples",
  "sampleId",
  "bootstrap",
  "bootstrapData",
  "hiddenBootstrapData",
  "dependsOn",
  "previousScenario",
  "nextScenario",
  "executionOrder",
  "sharedMutableState",
]);

export function run() {
  assert.equal(FIXTURE_FILES.length, 25, "active platform contract fixture count");

  for (const fixturePath of FIXTURE_FILES) {
    assertScopedFixturePath(fixturePath);
    const firstRead = readFixture(fixturePath);
    const secondRead = readFixture(fixturePath);

    assert.notEqual(firstRead, secondRead, `${fixturePath} parses into an isolated object`);
    assert.deepEqual(firstRead, secondRead, `${fixturePath} is deterministic across reads`);
    assertNoForbiddenFields(firstRead, fixturePath);
    assertUniqueScenarioNames(firstRead, fixturePath);
    assertNoSharedObjectReferences(firstRead, fixturePath);
  }
}

function readFixture(fixturePath) {
  const resolvedPath = path.join(repoRoot, fixturePath);
  assert.equal(fs.existsSync(resolvedPath), true, `${fixturePath} exists`);
  assert.equal(path.extname(resolvedPath), ".json", `${fixturePath} is JSON`);
  return JSON.parse(fs.readFileSync(resolvedPath, "utf8"));
}

function assertScopedFixturePath(fixturePath) {
  assert.equal(fixturePath.startsWith("dev/tests/fixtures/"), true, `${fixturePath} is under dev/tests/fixtures`);
  assert.equal(fixturePath.includes("/samples/"), false, `${fixturePath} does not use sample fixtures`);
  assert.equal(fixturePath.includes("/workspace-v2/"), false, `${fixturePath} does not rely on Workspace V2 bootstrap fixtures`);
  assert.equal(fixturePath.includes("/v2-tools/"), false, `${fixturePath} does not rely on tool runtime fixtures`);
}

function assertNoForbiddenFields(value, contextPath) {
  if (!value || typeof value !== "object") {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoForbiddenFields(item, `${contextPath}[${index}]`));
    return;
  }

  for (const [fieldName, fieldValue] of Object.entries(value)) {
    assert.equal(
      FORBIDDEN_DEPENDENCY_FIELDS.includes(fieldName),
      false,
      `${contextPath}.${fieldName} does not rely on storage, sample, bootstrap, or execution-order data`
    );
    assertNoForbiddenFields(fieldValue, `${contextPath}.${fieldName}`);
  }
}

function assertUniqueScenarioNames(fixture, fixturePath) {
  for (const [collectionName, collection] of Object.entries(fixture)) {
    if (!Array.isArray(collection)) {
      continue;
    }

    const scenarioNames = collection
      .map((scenario) => scenario?.name)
      .filter((name) => typeof name === "string");

    assert.equal(
      new Set(scenarioNames).size,
      scenarioNames.length,
      `${fixturePath}.${collectionName} scenario names are unique`
    );
  }
}

function assertNoSharedObjectReferences(fixture, fixturePath) {
  const objects = new Set();
  collectObjectReferences(fixture, objects, fixturePath);
}

function collectObjectReferences(value, objects, contextPath) {
  if (!value || typeof value !== "object") {
    return;
  }

  assert.equal(objects.has(value), false, `${contextPath} does not reuse mutable object references`);
  objects.add(value);

  if (Array.isArray(value)) {
    value.forEach((item, index) => collectObjectReferences(item, objects, `${contextPath}[${index}]`));
    return;
  }

  for (const [fieldName, fieldValue] of Object.entries(value)) {
    collectObjectReferences(fieldValue, objects, `${contextPath}.${fieldName}`);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  run();
}
