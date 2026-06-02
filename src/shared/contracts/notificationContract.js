/*
Toolbox Aid
David Quesenberry
06/02/2026
notificationContract.js
*/
import {
  IDENTITY_PERMISSION_SCOPES,
  IDENTITY_PERMISSIONS,
  IDENTITY_ROLES,
  IDENTITY_VISIBILITY_STATES,
  canActorPerformPermission,
  isIdentityPermission,
} from "./identityPermissionsContract.js";

export const NOTIFICATION_CONTRACT_ID = "gamefoundrystudio.notification.contract";
export const NOTIFICATION_CONTRACT_VERSION = "1.0.0";

export const NOTIFICATION_FIELDS = Object.freeze({
  NOTIFICATION_ID: "notificationId",
  OWNER: "ownerId",
  RECIPIENT: "recipientId",
  NOTIFICATION_TYPE: "notificationType",
  CHANNEL: "channel",
  DELIVERY_STATUS: "deliveryStatus",
  CREATED_AT: "createdAt",
  READ_AT: "readAt",
  NOTIFICATION_TEXT: "notificationText",
});

export const NOTIFICATION_FIELD_LIST = Object.freeze([
  NOTIFICATION_FIELDS.NOTIFICATION_ID,
  NOTIFICATION_FIELDS.OWNER,
  NOTIFICATION_FIELDS.RECIPIENT,
  NOTIFICATION_FIELDS.NOTIFICATION_TYPE,
  NOTIFICATION_FIELDS.CHANNEL,
  NOTIFICATION_FIELDS.DELIVERY_STATUS,
  NOTIFICATION_FIELDS.CREATED_AT,
  NOTIFICATION_FIELDS.READ_AT,
  NOTIFICATION_FIELDS.NOTIFICATION_TEXT,
]);

export const NOTIFICATION_TYPES = Object.freeze({
  SYSTEM: "system",
  PROJECT: "project",
  MARKETPLACE: "marketplace",
  MODERATION: "moderation",
  COLLABORATION: "collaboration",
  AUDIT: "audit",
});

export const NOTIFICATION_TYPE_LIST = Object.freeze(Object.values(NOTIFICATION_TYPES));

export const NOTIFICATION_CHANNELS = Object.freeze({
  IN_APP: "inApp",
  EMAIL: "email",
});

export const NOTIFICATION_CHANNEL_LIST = Object.freeze([
  NOTIFICATION_CHANNELS.IN_APP,
  NOTIFICATION_CHANNELS.EMAIL,
]);

export const NOTIFICATION_DELIVERY_STATUS = Object.freeze({
  QUEUED: "queued",
  SENT: "sent",
  READ: "read",
  ARCHIVED: "archived",
});

export const NOTIFICATION_DELIVERY_STATUS_LIST = Object.freeze([
  NOTIFICATION_DELIVERY_STATUS.QUEUED,
  NOTIFICATION_DELIVERY_STATUS.SENT,
  NOTIFICATION_DELIVERY_STATUS.READ,
  NOTIFICATION_DELIVERY_STATUS.ARCHIVED,
]);

export const NOTIFICATION_RULES = Object.freeze({
  REQUIRES_OWNER: true,
  REQUIRES_RECIPIENT: true,
  REQUIRES_NOTIFICATION_TYPE: true,
  REQUIRES_CHANNEL: true,
  REQUIRES_DELIVERY_STATUS: true,
  REQUIRES_CREATED_AT: true,
  READ_NOTIFICATIONS_REQUIRE_READ_AT: true,
  NO_AUTH_SESSION_STATE: true,
  NO_RUNTIME_STATE: true,
  NO_TOOL_STATE: true,
  NO_PAYMENT_STATE: true,
  NO_PROVIDER_IMPLEMENTATION_DETAILS: true,
});

export const NOTIFICATION_FORBIDDEN_FIELDS = Object.freeze([
  "activeProjectId",
  "activeToolId",
  "activeToolStateId",
  "authProvider",
  "authSession",
  "authSessionState",
  "authState",
  "checkoutSession",
  "credentials",
  "dirty",
  "emailProvider",
  "paymentIntent",
  "paymentProvider",
  "paymentState",
  "payload",
  "payloadJson",
  "providerMessageId",
  "sendGridMessageId",
  "session",
  "sessionStorage",
  "sourceToolStates",
  "smtpHost",
  "toolState",
  "toolStateId",
  "toolStates",
  "workspace",
  "workspaceState",
]);

export const NOTIFICATION_CONTRACT_ERRORS = Object.freeze({
  NOTIFICATION_ID_REQUIRED: "NOTIFICATION_ID_REQUIRED",
  OWNER_REQUIRED: "NOTIFICATION_OWNER_REQUIRED",
  RECIPIENT_REQUIRED: "NOTIFICATION_RECIPIENT_REQUIRED",
  NOTIFICATION_TYPE_REQUIRED: "NOTIFICATION_TYPE_REQUIRED",
  NOTIFICATION_TYPE_INVALID: "NOTIFICATION_TYPE_INVALID",
  CHANNEL_REQUIRED: "NOTIFICATION_CHANNEL_REQUIRED",
  CHANNEL_INVALID: "NOTIFICATION_CHANNEL_INVALID",
  DELIVERY_STATUS_REQUIRED: "NOTIFICATION_DELIVERY_STATUS_REQUIRED",
  DELIVERY_STATUS_INVALID: "NOTIFICATION_DELIVERY_STATUS_INVALID",
  CREATED_AT_REQUIRED: "NOTIFICATION_CREATED_AT_REQUIRED",
  CREATED_AT_INVALID: "NOTIFICATION_CREATED_AT_INVALID",
  READ_AT_REQUIRED: "NOTIFICATION_READ_AT_REQUIRED",
  READ_AT_INVALID: "NOTIFICATION_READ_AT_INVALID",
  NOTIFICATION_TEXT_INVALID: "NOTIFICATION_TEXT_INVALID",
  FIELD_NOT_ALLOWED: "NOTIFICATION_FIELD_NOT_ALLOWED",
});

export function isNotificationType(value) {
  return NOTIFICATION_TYPE_LIST.includes(value);
}

export function isNotificationChannel(value) {
  return NOTIFICATION_CHANNEL_LIST.includes(value);
}

export function isNotificationDeliveryStatus(value) {
  return NOTIFICATION_DELIVERY_STATUS_LIST.includes(value);
}

export function validateNotificationContract(notification) {
  const errors = [];

  collectForbiddenFieldErrors(notification, errors);

  if (!hasNonEmptyString(notification?.notificationId)) {
    errors.push(createContractError(NOTIFICATION_CONTRACT_ERRORS.NOTIFICATION_ID_REQUIRED, "Notification records require notificationId.", NOTIFICATION_FIELDS.NOTIFICATION_ID));
  }

  if (!hasNonEmptyString(notification?.ownerId)) {
    errors.push(createContractError(NOTIFICATION_CONTRACT_ERRORS.OWNER_REQUIRED, "Notification records require ownerId.", NOTIFICATION_FIELDS.OWNER));
  }

  if (!hasNonEmptyString(notification?.recipientId)) {
    errors.push(createContractError(NOTIFICATION_CONTRACT_ERRORS.RECIPIENT_REQUIRED, "Notification records require recipientId.", NOTIFICATION_FIELDS.RECIPIENT));
  }

  if (!hasNonEmptyString(notification?.notificationType)) {
    errors.push(createContractError(NOTIFICATION_CONTRACT_ERRORS.NOTIFICATION_TYPE_REQUIRED, "Notification records require notificationType.", NOTIFICATION_FIELDS.NOTIFICATION_TYPE));
  } else if (!isNotificationType(notification.notificationType)) {
    errors.push(createContractError(NOTIFICATION_CONTRACT_ERRORS.NOTIFICATION_TYPE_INVALID, "Notification type must be an allowed notification type.", NOTIFICATION_FIELDS.NOTIFICATION_TYPE));
  }

  if (!hasNonEmptyString(notification?.channel)) {
    errors.push(createContractError(NOTIFICATION_CONTRACT_ERRORS.CHANNEL_REQUIRED, "Notification records require channel.", NOTIFICATION_FIELDS.CHANNEL));
  } else if (!isNotificationChannel(notification.channel)) {
    errors.push(createContractError(NOTIFICATION_CONTRACT_ERRORS.CHANNEL_INVALID, "Notification channel must be inApp or email.", NOTIFICATION_FIELDS.CHANNEL));
  }

  if (!hasNonEmptyString(notification?.deliveryStatus)) {
    errors.push(createContractError(NOTIFICATION_CONTRACT_ERRORS.DELIVERY_STATUS_REQUIRED, "Notification records require deliveryStatus.", NOTIFICATION_FIELDS.DELIVERY_STATUS));
  } else if (!isNotificationDeliveryStatus(notification.deliveryStatus)) {
    errors.push(createContractError(NOTIFICATION_CONTRACT_ERRORS.DELIVERY_STATUS_INVALID, "Notification deliveryStatus must be queued, sent, read, or archived.", NOTIFICATION_FIELDS.DELIVERY_STATUS));
  }

  if (!hasNonEmptyString(notification?.createdAt)) {
    errors.push(createContractError(NOTIFICATION_CONTRACT_ERRORS.CREATED_AT_REQUIRED, "Notification records require createdAt.", NOTIFICATION_FIELDS.CREATED_AT));
  } else if (!isTimestamp(notification.createdAt)) {
    errors.push(createContractError(NOTIFICATION_CONTRACT_ERRORS.CREATED_AT_INVALID, "Notification createdAt must be a valid timestamp.", NOTIFICATION_FIELDS.CREATED_AT));
  }

  if (notification?.deliveryStatus === NOTIFICATION_DELIVERY_STATUS.READ) {
    if (!hasNonEmptyString(notification?.readAt)) {
      errors.push(createContractError(NOTIFICATION_CONTRACT_ERRORS.READ_AT_REQUIRED, "Read Notification records require readAt.", NOTIFICATION_FIELDS.READ_AT));
    } else if (!isTimestamp(notification.readAt)) {
      errors.push(createContractError(NOTIFICATION_CONTRACT_ERRORS.READ_AT_INVALID, "Notification readAt must be a valid timestamp.", NOTIFICATION_FIELDS.READ_AT));
    }
  } else if (notification?.readAt !== undefined && notification.readAt !== null && !isTimestamp(notification.readAt)) {
    errors.push(createContractError(NOTIFICATION_CONTRACT_ERRORS.READ_AT_INVALID, "Notification readAt must be a valid timestamp when provided.", NOTIFICATION_FIELDS.READ_AT));
  }

  if (notification?.notificationText !== undefined && notification.notificationText !== null && typeof notification.notificationText !== "string") {
    errors.push(createContractError(NOTIFICATION_CONTRACT_ERRORS.NOTIFICATION_TEXT_INVALID, "Notification notificationText must be a string when provided.", NOTIFICATION_FIELDS.NOTIFICATION_TEXT));
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

export function isNotificationVisibleToActor({
  actorId,
  notification,
} = {}) {
  return hasNonEmptyString(actorId)
    && (actorId === notification?.ownerId || actorId === notification?.recipientId);
}

export function canActorAccessNotification({
  actorId,
  role,
  permission,
  notification,
  grantedScopes = [],
} = {}) {
  if (!isIdentityPermission(permission)) {
    return false;
  }

  if (actorId === notification?.ownerId) {
    return canActorPerformPermission({
      actorId,
      role: IDENTITY_ROLES.OWNER,
      permission,
      scope: IDENTITY_PERMISSION_SCOPES.OWNED_OBJECT,
      object: {
        ownerId: notification.ownerId,
        visibility: IDENTITY_VISIBILITY_STATES.PRIVATE,
      },
    });
  }

  if (actorId === notification?.recipientId) {
    return permission === IDENTITY_PERMISSIONS.VIEW;
  }

  if (permission === IDENTITY_PERMISSIONS.ADMINISTER) {
    return canActorPerformPermission({
      actorId,
      role,
      permission,
      scope: IDENTITY_PERMISSION_SCOPES.PLATFORM,
      grantedScopes,
      object: {
        ownerId: notification?.ownerId,
        visibility: IDENTITY_VISIBILITY_STATES.ADMIN_ONLY,
      },
    });
  }

  return false;
}

function collectForbiddenFieldErrors(record, errors, pathPrefix = "") {
  if (!isReferenceObject(record)) {
    return;
  }

  for (const fieldName of NOTIFICATION_FORBIDDEN_FIELDS) {
    if (Object.hasOwn(record, fieldName)) {
      errors.push(createContractError(NOTIFICATION_CONTRACT_ERRORS.FIELD_NOT_ALLOWED, "Notification records must not carry auth session, runtime, toolState, payment, or provider implementation details.", pathPrefix ? `${pathPrefix}.${fieldName}` : fieldName));
    }
  }
}

function isReferenceObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isTimestamp(value) {
  return hasNonEmptyString(value) && Number.isFinite(Date.parse(value));
}

function createContractError(code, message, path) {
  return Object.freeze({ code, message, path });
}
