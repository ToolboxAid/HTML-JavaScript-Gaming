/*
Toolbox Aid
David Quesenberry
06/02/2026
AuditEventContract.test.mjs
*/
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  IDENTITY_PERMISSIONS,
  IDENTITY_ROLES,
} from "../../../src/shared/contracts/identityPermissionsContract.js";
import {
  AUDIT_EVENT_ACTION_LIST,
  AUDIT_EVENT_CONTRACT_ERRORS,
  AUDIT_EVENT_CONTRACT_ID,
  AUDIT_EVENT_CONTRACT_VERSION,
  AUDIT_EVENT_FIELD_LIST,
  AUDIT_EVENT_FORBIDDEN_FIELDS,
  AUDIT_EVENT_SEVERITY_LIST,
  AUDIT_EVENT_TARGET_TYPE_LIST,
  canActorAccessAuditEvent,
  isAuditEventAction,
  isAuditEventSeverity,
  isAuditEventTargetType,
  validateAuditEventContract,
} from "../../../src/shared/contracts/auditEventContract.js";

const scenariosPath = fileURLToPath(
  new URL("../fixtures/audit-events/audit-event-scenarios.json", import.meta.url)
);

export function run() {
  const scenarios = JSON.parse(readFileSync(scenariosPath, "utf8"));

  assert.equal(AUDIT_EVENT_CONTRACT_ID, "gamefoundrystudio.audit.event.contract");
  assert.equal(AUDIT_EVENT_CONTRACT_VERSION, "1.0.0");
  assert.deepEqual(AUDIT_EVENT_FIELD_LIST, [
    "auditEventId",
    "ownerId",
    "actorId",
    "action",
    "targetType",
    "targetId",
    "severity",
    "occurredAt",
    "auditNotes",
  ]);
  assert.deepEqual(AUDIT_EVENT_ACTION_LIST, ["create", "update", "delete", "share", "publish", "moderate", "administer"]);
  assert.equal(AUDIT_EVENT_TARGET_TYPE_LIST.includes("project"), true);
  assert.equal(AUDIT_EVENT_TARGET_TYPE_LIST.includes("moderationQueue"), true);
  assert.equal(AUDIT_EVENT_TARGET_TYPE_LIST.includes("restoreSnapshot"), true);
  assert.deepEqual(AUDIT_EVENT_SEVERITY_LIST, ["info", "warning", "security"]);
  assert.equal(AUDIT_EVENT_FORBIDDEN_FIELDS.includes("workspaceState"), true);
  assert.equal(AUDIT_EVENT_FORBIDDEN_FIELDS.includes("fileBytes"), true);
  assert.equal(AUDIT_EVENT_FORBIDDEN_FIELDS.includes("paymentState"), true);
  assertUnique(AUDIT_EVENT_FORBIDDEN_FIELDS);

  assert.equal(isAuditEventAction("create"), true);
  assert.equal(isAuditEventAction("approve"), false);
  assert.equal(isAuditEventTargetType("project"), true);
  assert.equal(isAuditEventTargetType("runtimeState"), false);
  assert.equal(isAuditEventSeverity("security"), true);
  assert.equal(isAuditEventSeverity("critical"), false);

  for (const scenario of scenarios.validAuditEvents) {
    const auditEvent = buildScenario(scenarios.baseAuditEvent, scenario);
    const validation = validateAuditEventContract(auditEvent);
    assert.equal(validation.valid, true, scenario.name);
    assert.deepEqual(validation.errors, scenario.expectedErrors, scenario.name);
  }

  for (const scenario of scenarios.invalidAuditEvents) {
    const auditEvent = buildScenario(scenarios.baseAuditEvent, scenario);
    const validation = validateAuditEventContract(auditEvent);
    assert.equal(validation.valid, false, scenario.name);
    assert.deepEqual(validation.errors.map((error) => error.code), scenario.expectedErrors, scenario.name);
  }

  assertErrorForScenario(scenarios, "missing owner", AUDIT_EVENT_CONTRACT_ERRORS.OWNER_REQUIRED);
  assertErrorForScenario(scenarios, "missing actor", AUDIT_EVENT_CONTRACT_ERRORS.ACTOR_REQUIRED);
  assertErrorForScenario(scenarios, "invalid action", AUDIT_EVENT_CONTRACT_ERRORS.ACTION_INVALID);
  assertErrorForScenario(scenarios, "invalid target type", AUDIT_EVENT_CONTRACT_ERRORS.TARGET_TYPE_INVALID);
  assertErrorForScenario(scenarios, "missing target id", AUDIT_EVENT_CONTRACT_ERRORS.TARGET_ID_REQUIRED);
  assertErrorForScenario(scenarios, "invalid severity", AUDIT_EVENT_CONTRACT_ERRORS.SEVERITY_INVALID);
  assertErrorForScenario(scenarios, "invalid occurred at", AUDIT_EVENT_CONTRACT_ERRORS.OCCURRED_AT_INVALID);
  assertErrorForScenario(scenarios, "runtime state leakage", AUDIT_EVENT_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "payment state leakage", AUDIT_EVENT_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "file bytes leakage", AUDIT_EVENT_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);

  const auditEvent = buildScenario(scenarios.baseAuditEvent, scenarios.validAuditEvents[0]);
  assert.equal(canActorAccessAuditEvent({
    actorId: "platform.admin",
    role: IDENTITY_ROLES.ADMIN,
    permission: IDENTITY_PERMISSIONS.ADMINISTER,
    auditEvent,
  }), true);
  assert.equal(canActorAccessAuditEvent({
    actorId: "platform.moderator",
    role: IDENTITY_ROLES.MODERATOR,
    permission: IDENTITY_PERMISSIONS.MODERATE,
    auditEvent,
  }), false);
}

function assertErrorForScenario(scenarios, name, expectedErrorCode) {
  const scenario = scenarios.invalidAuditEvents.find((item) => item.name === name);
  const auditEvent = buildScenario(scenarios.baseAuditEvent, scenario);
  const validation = validateAuditEventContract(auditEvent);
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
