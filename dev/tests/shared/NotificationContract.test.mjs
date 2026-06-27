/*
Toolbox Aid
David Quesenberry
06/02/2026
NotificationContract.test.mjs
*/
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  IDENTITY_PERMISSIONS,
  IDENTITY_ROLES,
} from "../../../src/shared/contracts/identityPermissionsContract.js";
import {
  NOTIFICATION_CHANNEL_LIST,
  NOTIFICATION_CONTRACT_ERRORS,
  NOTIFICATION_CONTRACT_ID,
  NOTIFICATION_CONTRACT_VERSION,
  NOTIFICATION_DELIVERY_STATUS_LIST,
  NOTIFICATION_FIELD_LIST,
  NOTIFICATION_FORBIDDEN_FIELDS,
  NOTIFICATION_TYPE_LIST,
  canActorAccessNotification,
  isNotificationChannel,
  isNotificationDeliveryStatus,
  isNotificationType,
  isNotificationVisibleToActor,
  validateNotificationContract,
} from "../../../src/shared/contracts/notificationContract.js";

const scenariosPath = fileURLToPath(
  new URL("../fixtures/notifications/notification-scenarios.json", import.meta.url)
);

export function run() {
  const scenarios = JSON.parse(readFileSync(scenariosPath, "utf8"));

  assert.equal(NOTIFICATION_CONTRACT_ID, "gamefoundrystudio.notification.contract");
  assert.equal(NOTIFICATION_CONTRACT_VERSION, "1.0.0");
  assert.deepEqual(NOTIFICATION_FIELD_LIST, [
    "notificationId",
    "ownerId",
    "recipientId",
    "notificationType",
    "channel",
    "deliveryStatus",
    "createdAt",
    "readAt",
    "notificationText",
  ]);
  assert.deepEqual(NOTIFICATION_TYPE_LIST, ["system", "project", "marketplace", "moderation", "collaboration", "audit"]);
  assert.deepEqual(NOTIFICATION_CHANNEL_LIST, ["inApp", "email"]);
  assert.deepEqual(NOTIFICATION_DELIVERY_STATUS_LIST, ["queued", "sent", "read", "archived"]);
  assert.equal(NOTIFICATION_FORBIDDEN_FIELDS.includes("workspaceState"), true);
  assert.equal(NOTIFICATION_FORBIDDEN_FIELDS.includes("sendGridMessageId"), true);
  assert.equal(NOTIFICATION_FORBIDDEN_FIELDS.includes("authSession"), true);
  assertUnique(NOTIFICATION_FORBIDDEN_FIELDS);

  assert.equal(isNotificationType("marketplace"), true);
  assert.equal(isNotificationType("payment"), false);
  assert.equal(isNotificationChannel("inApp"), true);
  assert.equal(isNotificationChannel("sms"), false);
  assert.equal(isNotificationDeliveryStatus("read"), true);
  assert.equal(isNotificationDeliveryStatus("delivered"), false);

  for (const scenario of scenarios.validNotifications) {
    const notification = buildScenario(scenarios.baseNotification, scenario);
    const validation = validateNotificationContract(notification);
    assert.equal(validation.valid, true, scenario.name);
    assert.deepEqual(validation.errors, scenario.expectedErrors, scenario.name);
  }

  for (const scenario of scenarios.invalidNotifications) {
    const notification = buildScenario(scenarios.baseNotification, scenario);
    const validation = validateNotificationContract(notification);
    assert.equal(validation.valid, false, scenario.name);
    assert.deepEqual(validation.errors.map((error) => error.code), scenario.expectedErrors, scenario.name);
  }

  assertErrorForScenario(scenarios, "missing owner", NOTIFICATION_CONTRACT_ERRORS.OWNER_REQUIRED);
  assertErrorForScenario(scenarios, "missing recipient", NOTIFICATION_CONTRACT_ERRORS.RECIPIENT_REQUIRED);
  assertErrorForScenario(scenarios, "invalid type", NOTIFICATION_CONTRACT_ERRORS.NOTIFICATION_TYPE_INVALID);
  assertErrorForScenario(scenarios, "invalid channel", NOTIFICATION_CONTRACT_ERRORS.CHANNEL_INVALID);
  assertErrorForScenario(scenarios, "invalid delivery status", NOTIFICATION_CONTRACT_ERRORS.DELIVERY_STATUS_INVALID);
  assertErrorForScenario(scenarios, "read status without read at", NOTIFICATION_CONTRACT_ERRORS.READ_AT_REQUIRED);
  assertErrorForScenario(scenarios, "invalid read at", NOTIFICATION_CONTRACT_ERRORS.READ_AT_INVALID);
  assertErrorForScenario(scenarios, "provider detail leakage", NOTIFICATION_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "runtime state leakage", NOTIFICATION_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "auth session leakage", NOTIFICATION_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);

  const notification = buildScenario(scenarios.baseNotification, scenarios.validNotifications[0]);
  assert.equal(isNotificationVisibleToActor({ actorId: "user.creator", notification }), true);
  assert.equal(isNotificationVisibleToActor({ actorId: "public.viewer", notification }), false);
  assert.equal(canActorAccessNotification({
    actorId: "user.creator",
    permission: IDENTITY_PERMISSIONS.VIEW,
    notification,
  }), true);
  assert.equal(canActorAccessNotification({
    actorId: "platform.admin",
    role: IDENTITY_ROLES.ADMIN,
    permission: IDENTITY_PERMISSIONS.ADMINISTER,
    notification,
  }), true);
}

function assertErrorForScenario(scenarios, name, expectedErrorCode) {
  const scenario = scenarios.invalidNotifications.find((item) => item.name === name);
  const notification = buildScenario(scenarios.baseNotification, scenario);
  const validation = validateNotificationContract(notification);
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
