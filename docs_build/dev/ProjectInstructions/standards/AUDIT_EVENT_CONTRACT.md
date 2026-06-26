# Audit Event Contract

## Purpose

Audit Event records describe immutable platform audit metadata for important ownership, collaboration, marketplace, backup, restore, and moderation actions.

## Rules

- Every Audit Event requires `ownerId`, `actorId`, `action`, `targetType`, `targetId`, `severity`, and `occurredAt`.
- Action must be `create`, `update`, `delete`, `share`, `publish`, `moderate`, or `administer`.
- Target type must reference an approved platform contract record type.
- Severity must be `info`, `warning`, or `security`.
- Audit Event records do not contain auth session state, runtime state, toolState, file bytes, or payment state.

## Validation

- Contract: `src/shared/contracts/auditEventContract.js`
- Test: `tests/shared/AuditEventContract.test.mjs`
- Fixture: `tests/fixtures/audit-events/audit-event-scenarios.json`
