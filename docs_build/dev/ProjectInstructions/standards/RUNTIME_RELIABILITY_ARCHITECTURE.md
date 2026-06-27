# Runtime Reliability Architecture

Status: Approved
Owner: OWNER

## Purpose

Define the architecture standard for runtime reliability, runtime availability events, admin logs, runtime logs, future telemetry, and creator-facing failure behavior.

This document is documentation/governance only. It does not implement runtime code, API routes, database schema, browser storage, notification delivery, UI changes, or telemetry providers.

## Runtime Reliability Overview

Runtime Reliability is the operational architecture for detecting, classifying, recording, routing, and resolving runtime failures without turning transient runtime state into product data.

Runtime Reliability covers:

- page and tool loading failures
- dependency availability failures
- runtime availability events
- admin-readable operational logs
- runtime diagnostic logs
- future telemetry and observability integrations
- creator-facing failure messages

Runtime Reliability does not own:

- business events
- audit events
- user analytics
- tool state payloads
- project records
- saved product data
- hidden browser-owned source-of-truth data

Authoritative runtime reliability records must follow the environment governance model:

```text
Browser -> API -> Database
```

Browser pages may collect transient runtime context and submit it through the API/service contract. Browser pages must not become the authoritative source of runtime reliability records.

## Resilient Page Loading

Every user-facing runtime page should have a resilient loading path:

- initialize a page-load correlation ID before dependency calls begin
- load required static assets deterministically
- validate required runtime dependencies before enabling primary workflows
- show a creator-facing loading, degraded, blocked, or retry state when needed
- avoid blank pages and silent failures
- provide a bounded retry for safe, idempotent dependency reads
- stop retrying when failure is not recoverable or would duplicate writes
- record a runtime availability event for blocked or degraded loading

Resilient loading must distinguish:

- blocking failures that prevent the page or primary workflow from running
- non-blocking failures that degrade secondary features
- recoverable failures that can retry safely
- non-recoverable failures that require user or operator action

## Runtime Availability Events

Runtime Availability Events are operational records that describe runtime availability, degradation, recovery, and dependency state.

Minimum event shape for future implementation:

- `eventId`
- `correlationId`
- `environment`
- `sourcePage`
- `sourceTool`
- `sourceModule`
- `eventType`
- `severity`
- `recoverability`
- `userImpact`
- `healthState`
- `dependency`
- `message`
- `occurredAt`
- `firstSeenAt`
- `lastSeenAt`
- `duplicateCount`
- `resolutionStatus`

Runtime Availability Events are not Audit Events. If an availability failure also requires an audit trail, a separate Audit Event must be emitted through the Audit Event Contract.

## Admin Logs Architecture

Admin Logs are an operator-facing read model for runtime reliability records.

Admin Logs must:

- read from API/database-backed operational records
- support filtering by environment, severity, health state, dependency, page, tool, and correlation ID
- separate unresolved, monitoring, resolved, and closed items
- show duplicate-suppression counts and first/last seen timestamps
- link diagnostic snapshots only when snapshots are privacy-safe
- avoid exposing secrets, tokens, credentials, auth session state, or protected user payloads

Admin Logs must not:

- rely on browser storage as the source of truth
- rely on page arrays, JSON source files, or `/tmp` files as authoritative data
- mutate runtime behavior directly
- replace System Health or Audit Event records
- expose raw provider internals that belong behind service boundaries

## Runtime Logs vs Business Events

Runtime Logs are operational diagnostics. They explain runtime health, page loading, dependency failures, retries, recoveries, and technical context.

Business Events describe product or user-domain actions such as project creation, publishing, marketplace actions, collaboration, moderation, or account actions.

Rules:

- Runtime Logs must not be used as product analytics.
- Business Events must not be inferred from runtime diagnostic logs.
- Audit-required business actions must use the Audit Event Contract.
- Notifications must use the Notification Contract when user/admin delivery is required.
- Runtime Logs may reference business object IDs only when needed for diagnosis and permitted by privacy rules.
- Runtime Logs must avoid storing product payloads.

## Future Telemetry Architecture

Future telemetry must be layered behind the runtime reliability API/service contract.

Telemetry phases:

1. Runtime Availability Event contract and persistence.
2. Admin Logs read model.
3. System Health aggregation.
4. Diagnostic snapshot collection.
5. Notification routing for operational alerts.
6. External observability provider export.
7. Trend analysis, charts, and reliability service-level indicators.

Telemetry exports must be optional and environment-managed. The deployable artifact must remain identical across environments; only `.env` or environment-managed secret/configuration values may differ.

## Severity Classifications

Runtime reliability severity is operational severity. It is separate from Audit Event severity.

Allowed runtime severity levels:

- `debug`: troubleshooting detail that does not indicate a failure.
- `info`: normal operational state or successful recovery.
- `warning`: degraded behavior or recoverable failure.
- `error`: failed runtime behavior requiring attention or visible degradation.
- `critical`: primary workflow unavailable or broad runtime outage.
- `security`: suspected security, authorization, secret, or policy issue.

Severity must be assigned from observable impact, not from exception text alone.

## Recoverability Classifications

Allowed recoverability classifications:

- `autoRecovered`: the runtime recovered without user or operator action.
- `retryable`: retry may succeed and is safe for the affected operation.
- `userActionRequired`: the user can resolve the condition, such as reconnecting or signing in.
- `operatorActionRequired`: an admin/operator must resolve dependency, configuration, or data issues.
- `nonRecoverable`: the operation cannot continue safely in the current session.

Recoverability determines retry behavior, creator-facing messaging, and notification routing.

## User Impact Classifications

Allowed user impact classifications:

- `none`: no visible user impact.
- `minor`: secondary feature degraded; primary workflow still works.
- `degraded`: primary workflow works with reduced capability.
- `blocked`: primary workflow cannot continue.
- `dataRisk`: unsaved work, persistence, or integrity may be affected.
- `securityRisk`: security or authorization may be affected.

User impact must be visible in Admin Logs and must drive creator-facing messaging.

## Correlation IDs

Correlation IDs connect page-load events, API calls, dependency checks, runtime logs, diagnostic snapshots, and admin log entries.

Rules:

- Create a page-load correlation ID before dependency calls begin.
- Propagate the correlation ID through API calls where supported.
- Include the correlation ID in runtime availability events.
- Include the correlation ID in diagnostic snapshots.
- Show the correlation ID in creator-facing support text only when it helps support triage.
- Do not encode secrets, user identifiers, project payloads, or environment secrets in correlation IDs.

## Dependency Model

Runtime reliability must classify dependencies before implementation.

Dependency categories:

- `staticAssets`: HTML, CSS, JavaScript, images, and manifest assets.
- `auth`: Supabase Auth and session state.
- `api`: shared API/service contract.
- `database`: Postgres-backed persistence.
- `storage`: Cloudflare R2-backed object storage.
- `runtimeEngine`: engine/runtime modules.
- `toolRuntime`: tool bootstrap and hosted tool context.
- `externalProvider`: external service or provider integration.
- `browserCapability`: browser APIs required for the current workflow.

Dependency records must identify whether the dependency is required, optional, degraded-capable, retryable, or environment-managed.

## Retry Policies

Retry must be bounded and safe.

Rules:

- Retry only idempotent reads or explicitly safe operations.
- Use bounded exponential backoff with jitter for retryable dependency reads.
- Stop retrying when the operation is non-recoverable.
- Do not retry writes that could duplicate product data unless the API provides idempotency keys.
- Do not hide persistent failures behind endless retries.
- Emit one availability event for the failure group and update duplicate counts instead of logging each retry as a new incident.
- Surface creator-facing retry controls only when the user can safely retry.

## Health States

Allowed health states:

- `healthy`: expected behavior is available.
- `degraded`: feature is available with reduced capability.
- `partialOutage`: one or more required dependencies are unavailable while other areas still work.
- `unavailable`: primary workflow cannot run.
- `maintenance`: planned operator action limits availability.
- `unknown`: health cannot be determined.

Health states must be derivable from runtime availability events and dependency state.

## Duplicate Suppression

Duplicate suppression prevents noisy repeated failures from flooding Admin Logs and notifications.

Rules:

- Compute a stable failure fingerprint from source, dependency, event type, severity, recoverability, and sanitized message category.
- Group duplicates within a bounded time window.
- Preserve `firstSeenAt`, `lastSeenAt`, and `duplicateCount`.
- Preserve the latest safe diagnostic summary.
- Escalate if severity or user impact increases.
- Do not suppress distinct correlation IDs when they indicate separate user-impacting sessions that require triage.

## Notification Routing

Notification routing decides who receives operational alerts.

Default routes:

- `debug` and `info`: Admin Logs only.
- `warning`: Admin Logs; System Health aggregation when repeated or dependency-wide.
- `error`: Admin Logs and System Health; notify operators when unresolved or repeated.
- `critical`: Admin Logs, System Health, and operator notification.
- `security`: Admin Logs, security/audit review path, and operator notification.

Creator-facing notifications must be limited to actionable, user-safe information. They must not expose internal dependency names, stack traces, secrets, SQL errors, provider details, or protected operational internals.

## Resolution Lifecycle

Allowed resolution lifecycle states:

- `detected`: event captured and recorded.
- `triaged`: owner, dependency, and impact classification reviewed.
- `mitigated`: workaround or retry restored user workflow, but root cause may remain.
- `monitoring`: recovery observed and duplicates monitored.
- `resolved`: root cause or configuration issue resolved.
- `closed`: no further action required and retention policy applies.

Resolution records should include:

- owner
- status
- resolution summary
- mitigation summary
- linked correlation IDs
- linked diagnostic snapshots
- timestamps for state changes

## Diagnostic Snapshots

Diagnostic snapshots are privacy-safe operational summaries captured for triage.

Allowed content:

- correlation ID
- environment
- page/tool/module identifiers
- dependency status
- sanitized error category
- retry count
- timing summary
- health state
- browser capability summary

Prohibited content:

- secrets, tokens, credentials, cookies, or auth provider session state
- raw SQL, stack traces containing secrets, or provider internals
- tool payloads, project records, product data, or user-generated content
- file bytes or image data URLs
- payment state or protected marketplace transaction details

Large snapshots may be stored in R2 only through server/API ownership with privacy-safe metadata in Postgres.

## Privacy Requirements

Runtime reliability records must follow privacy-by-default rules:

- collect the minimum data needed for diagnosis
- sanitize messages before persistence
- avoid user-generated payloads
- avoid browser-owned product data
- avoid secrets and credentials
- use stable identifiers only when required for support or triage
- enforce retention and deletion policy before external telemetry export
- separate operational diagnostics from business analytics

## Creator-facing Messaging Guidelines

Creator-facing messaging should be calm, actionable, and safe.

Messages should:

- name what is affected in user terms
- say whether the user can retry
- preserve unsaved work where possible
- provide a support-safe correlation ID when useful
- avoid blame or internal provider details
- avoid stack traces and implementation names
- distinguish temporary degradation from blocked workflows

Example message patterns:

- "This tool could not finish loading. Try again, or contact support with reference {correlationId}."
- "Some runtime services are delayed. You can keep editing, but saving may be unavailable until the connection recovers."
- "This action is temporarily unavailable. Your current page remains open."

## Blocking vs Non-Blocking Failures

Blocking failures prevent the page or primary workflow from continuing safely.

Examples:

- authentication unavailable for a protected workflow
- API unavailable for required product data
- database write unavailable for a save operation
- required runtime module failed to load
- required project/tool state cannot be read

Non-blocking failures degrade secondary behavior while preserving the primary workflow.

Examples:

- optional preview unavailable
- non-required telemetry export unavailable
- delayed health aggregation
- optional notification delivery failure
- degraded chart or admin summary view

Blocking status must be visible to the creator. Non-blocking status may be visible through subtle degraded-state messaging and Admin Logs.

## Runtime Logging Lifecycle

Runtime logging lifecycle:

1. Capture transient browser/runtime context.
2. Normalize into a safe runtime event envelope.
3. Attach correlation ID and dependency classification.
4. Classify severity, recoverability, user impact, and health state.
5. Suppress duplicates.
6. Submit through the API/service contract.
7. Persist authoritative records in the database.
8. Route to Admin Logs, System Health, notification queues, or future telemetry exporters.
9. Resolve through the resolution lifecycle.
10. Retain, archive, or delete according to privacy and operational retention rules.

Browser capture is transient. The database-backed record is authoritative.

## Future Observability Roadmap

Future implementation should proceed in small PRs:

1. Runtime Availability Event contract and validation.
2. API/database persistence for availability events.
3. Runtime page-load correlation ID standard.
4. Resilient page loading hooks for selected high-value pages.
5. Admin Logs read model.
6. Duplicate suppression and resolution lifecycle.
7. Diagnostic snapshot capture with privacy guardrails.
8. System Health aggregation from runtime availability records.
9. Notification routing for critical and security events.
10. External telemetry exporter behind environment-managed configuration.

No future observability work may introduce browser-owned product data, mock repositories as completion state, or environment-specific runtime code.
