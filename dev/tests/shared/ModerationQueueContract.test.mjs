/*
Toolbox Aid
David Quesenberry
06/02/2026
ModerationQueueContract.test.mjs
*/
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  IDENTITY_PERMISSIONS,
  IDENTITY_ROLES,
} from "../../../src/shared/contracts/identityPermissionsContract.js";
import {
  MODERATION_QUEUE_CONTRACT_ERRORS,
  MODERATION_QUEUE_CONTRACT_ID,
  MODERATION_QUEUE_CONTRACT_VERSION,
  MODERATION_QUEUE_FIELD_LIST,
  MODERATION_QUEUE_FORBIDDEN_FIELDS,
  MODERATION_QUEUE_STATUS_LIST,
  MODERATION_QUEUE_SUBJECT_TYPE_LIST,
  canActorAccessModerationQueue,
  canModerateQueueItem,
  isModerationQueueStatus,
  isModerationQueueSubjectType,
  validateModerationQueueContract,
} from "../../../src/shared/contracts/moderationQueueContract.js";

const scenariosPath = fileURLToPath(
  new URL("../fixtures/moderation-queues/moderation-queue-scenarios.json", import.meta.url)
);

export function run() {
  const scenarios = JSON.parse(readFileSync(scenariosPath, "utf8"));

  assert.equal(MODERATION_QUEUE_CONTRACT_ID, "gamefoundrystudio.moderation.queue.contract");
  assert.equal(MODERATION_QUEUE_CONTRACT_VERSION, "1.0.0");
  assert.deepEqual(MODERATION_QUEUE_FIELD_LIST, [
    "moderationQueueId",
    "ownerId",
    "projectId",
    "subjectType",
    "subjectId",
    "reportReason",
    "queueStatus",
    "visibility",
    "createdAt",
    "moderationNotes",
  ]);
  assert.deepEqual(MODERATION_QUEUE_SUBJECT_TYPE_LIST, ["marketplaceListing", "reviewRating", "creatorProfile", "organization", "comment"]);
  assert.deepEqual(MODERATION_QUEUE_STATUS_LIST, ["open", "inReview", "resolved", "dismissed"]);
  assert.equal(MODERATION_QUEUE_FORBIDDEN_FIELDS.includes("workspaceState"), true);
  assert.equal(MODERATION_QUEUE_FORBIDDEN_FIELDS.includes("moderationDecision"), true);
  assertUnique(MODERATION_QUEUE_FORBIDDEN_FIELDS);

  assert.equal(isModerationQueueSubjectType("reviewRating"), true);
  assert.equal(isModerationQueueSubjectType("payment"), false);
  assert.equal(isModerationQueueStatus("open"), true);
  assert.equal(isModerationQueueStatus("approved"), false);

  for (const scenario of scenarios.validModerationQueues) {
    const queueItem = buildScenario(scenarios.baseModerationQueue, scenario);
    const validation = validateModerationQueueContract(queueItem);
    assert.equal(validation.valid, true, scenario.name);
    assert.deepEqual(validation.errors, scenario.expectedErrors, scenario.name);
  }

  for (const scenario of scenarios.invalidModerationQueues) {
    const queueItem = buildScenario(scenarios.baseModerationQueue, scenario);
    const validation = validateModerationQueueContract(queueItem);
    assert.equal(validation.valid, false, scenario.name);
    assert.deepEqual(validation.errors.map((error) => error.code), scenario.expectedErrors, scenario.name);
  }

  assertErrorForScenario(scenarios, "missing owner", MODERATION_QUEUE_CONTRACT_ERRORS.OWNER_REQUIRED);
  assertErrorForScenario(scenarios, "missing project", MODERATION_QUEUE_CONTRACT_ERRORS.PROJECT_REQUIRED);
  assertErrorForScenario(scenarios, "invalid subject type", MODERATION_QUEUE_CONTRACT_ERRORS.SUBJECT_TYPE_INVALID);
  assertErrorForScenario(scenarios, "missing report reason", MODERATION_QUEUE_CONTRACT_ERRORS.REPORT_REASON_REQUIRED);
  assertErrorForScenario(scenarios, "invalid queue status", MODERATION_QUEUE_CONTRACT_ERRORS.QUEUE_STATUS_INVALID);
  assertErrorForScenario(scenarios, "invalid visibility", MODERATION_QUEUE_CONTRACT_ERRORS.VISIBILITY_INVALID);
  assertErrorForScenario(scenarios, "runtime state leakage", MODERATION_QUEUE_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "final moderation decision leakage", MODERATION_QUEUE_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);

  const queueItem = buildScenario(scenarios.baseModerationQueue, scenarios.validModerationQueues[0]);
  assert.equal(canActorAccessModerationQueue({
    actorId: "platform.moderator",
    role: IDENTITY_ROLES.MODERATOR,
    permission: IDENTITY_PERMISSIONS.MODERATE,
    queueItem,
  }), true);
  assert.equal(canModerateQueueItem({
    actorId: "platform.moderator",
    role: IDENTITY_ROLES.MODERATOR,
    queueItem,
  }), true);
}

function assertErrorForScenario(scenarios, name, expectedErrorCode) {
  const scenario = scenarios.invalidModerationQueues.find((item) => item.name === name);
  const queueItem = buildScenario(scenarios.baseModerationQueue, scenario);
  const validation = validateModerationQueueContract(queueItem);
  assert.equal(validation.errors.some((error) => error.code === expectedErrorCode), true, name);
}

function buildScenario(base, scenario) {
  const result = clone(base);
  mergeObject(result, scenario.overrides ?? {});
  return result;
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

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function assertUnique(values) {
  assert.equal(new Set(values).size, values.length);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  run();
}
