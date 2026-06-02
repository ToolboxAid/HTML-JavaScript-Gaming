# Notification Contract

## Purpose

Notification records describe delivery metadata for platform, project, marketplace, moderation, collaboration, and audit notices.

## Rules

- Every Notification requires `ownerId`, `recipientId`, `notificationType`, `channel`, `deliveryStatus`, and `createdAt`.
- Notification type must be `system`, `project`, `marketplace`, `moderation`, `collaboration`, or `audit`.
- Channel must be `inApp` or `email`.
- Delivery status must be `queued`, `sent`, `read`, or `archived`.
- Read notifications require `readAt`.
- Notification records do not contain auth session state, runtime state, toolState, payment state, or provider implementation details.

## Validation

- Contract: `src/shared/contracts/notificationContract.js`
- Test: `tests/shared/NotificationContract.test.mjs`
- Fixture: `tests/fixtures/notifications/notification-scenarios.json`
