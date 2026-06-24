# System Health v1 Operational Guide

## Purpose

System Health v1 is the Team Charlie admin surface for confirming the health of
the currently deployed Game Foundry Studio environment. It is an operational
read model: the browser renders server-owned status returned by the Admin System
Health API, and operators use manual actions to ask the API to run specific
checks.

This guide is the durable operator reference for System Health v1. It describes
the approved environment model, storage model, API contract, manual actions,
safe placeholder behavior, troubleshooting steps, and manual validation path.

## Architecture

System Health is one page per deployed environment. A deployment actively checks
only itself.

The page may display a static Environment Map for operator reference, but the
Environment Map must not trigger active peer-environment checks. For example,
the UAT deployment may show Local, DEV, IST, UAT, and PRD in the reference map,
but it must only check UAT infrastructure.

The browser does not own infrastructure health state. It loads and renders the
server-owned API payload from `/api/admin/system-health/status` and submits
manual health actions to Admin System Health API endpoints. Browser-side
fallback rows may show safe pending or unavailable states while loading, but a
successful health result must come from the API/service contract.

## Environment Model

| Environment | Hosting model | Database model | Storage folder |
| --- | --- | --- | --- |
| Local | VS Code + Local API | Local Docker PostgreSQL | `/local` |
| DEV | Local Docker | Local Docker PostgreSQL | `/dev` |
| IST | Local Docker | Local Docker PostgreSQL | `/ist` |
| UAT | Cloudflare | Supabase PostgreSQL | `/uat` |
| PRD | Cloudflare | Supabase PostgreSQL | `/prd` |

The Environment Identity section displays the current deployment only:

- environment name
- hosting model
- site URL
- API URL
- database model
- storage folder
- last health check

The Environment Map is reference-only and lists all approved environments.

## Shared R2 Folder Model

GFS uses one shared Cloudflare R2 bucket with environment-scoped folders:

- `/local`
- `/dev`
- `/ist`
- `/uat`
- `/prd`

Storage Health must use the folder for the current environment only. The active
diagnostic operations are:

- bucket connectivity
- list
- upload
- read
- delete

Do not run storage diagnostics against another environment folder from the
current deployment.

## API Contract Summary

Contract version: `2026-06-24.system-health.v1`

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/admin/system-health/status` | Read current deployment System Health status. |
| POST | `/api/admin/system-health/action` | Run current deployment manual health actions. |
| POST | `/api/admin/system-health/storage-connectivity-action` | Run current deployment R2 folder diagnostics. |

The status API owns the System Health data boundary. It reports:

- current environment identity
- reference Environment Map
- environment capabilities
- Health API Contract
- Admin API Registry
- runtime feature flags
- runtime health
- service health
- configuration summary
- database health
- storage health
- scheduled monitoring foundation
- notifications foundation
- health check history

The contract must not expose secrets. Configuration values that could contain
credentials, tokens, keys, or connection strings must be omitted or masked by
the server before reaching the browser.

## Manual Health Actions

Manual health action controls submit API requests. They do not create browser
owned successful health results.

Supported controls:

- Refresh
- Run Runtime Check
- Run Database Check
- Run Storage Check
- Run Full Health Check

Each manual action is scoped to the current deployment. A Run Storage Check must
use the current environment folder, and a Run Database Check must use the
current environment database model.

## Scheduled Monitoring

Scheduled Health Monitoring is production-safe when the scheduler is not
implemented or not configured. In that state, System Health shows Not Configured
or pending rows for:

- last scheduled run
- next scheduled run
- duration
- recent result
- failures/warnings

This state is intentional and must not be treated as a hidden success. Operators
should treat it as a clear statement that automatic scheduled checks are not
active for the deployment.

## Notifications And Alerts

Notifications and alerts are production-safe when no sending contract is
configured. In that state, System Health shows Not Configured or pending rows
for:

- email alerts
- admin notifications
- webhook alerts
- messages integration, when present

System Health v1 must not send email, admin notifications, webhooks, or messages
unless an approved service contract exists.

## Troubleshooting Guide

### Page Does Not Load Status

1. Confirm the current deployment serves `admin/system-health.html`.
2. Confirm the API route `GET /api/admin/system-health/status` is reachable.
3. Check the browser console for network failures.
4. Check the Local API or deployment logs for route errors.
5. Confirm any admin authorization requirement for the deployment is satisfied.

### Environment Identity Looks Wrong

1. Confirm the deployment environment variables identify the intended
   environment.
2. Confirm the storage folder maps to the intended environment.
3. Restart the API after changing environment variables.
4. Reopen System Health and verify only the current deployment identity changed.
5. Do not use the Environment Map as proof of active environment selection; it
   is reference-only.

### Database Health Fails

1. For Local, DEV, and IST, confirm Local Docker PostgreSQL is running.
2. For UAT and PRD, confirm Supabase PostgreSQL configuration is present
   server-side.
3. Run the manual Database Check.
4. Review response time, connectivity, version, and last checked values.
5. Check server logs for connection errors without exposing credentials.

### Storage Health Fails

1. Confirm Cloudflare R2 bucket configuration is present server-side.
2. Confirm the storage folder matches the current environment.
3. Run the manual Storage Check.
4. Review bucket connectivity, list, upload, read, and delete results.
5. If upload or delete fails, confirm the deployment credentials allow test
   object writes and cleanup in the current environment folder.

### Runtime Health Fails

1. Confirm the API process is running.
2. Confirm runtime version, API version, Node version, server start time, and
   uptime fields are returned when available.
3. Run the manual Runtime Check.
4. Review deployment logs for startup or route errors.

### Scheduled Or Notification Sections Show Not Configured

This is expected until approved scheduler or notification service contracts are
implemented. Do not patch the browser to display a healthy state. Add or update
the server-side service contract first, then update System Health to render the
server-owned result.

## Manual Validation Guide

Use this checklist after System Health v1 changes or deployment configuration
changes:

1. Open the System Health page for the deployment being validated.
2. Confirm Environment Identity shows the current deployment only.
3. Confirm Environment Map lists Local, DEV, IST, UAT, and PRD as reference
   entries only.
4. Confirm no network call attempts to health-check another environment.
5. Confirm Configuration Summary contains no secrets.
6. Confirm Database Health matches the current environment database model.
7. Confirm Storage Health uses the current environment R2 folder.
8. Run Refresh.
9. Run Runtime Check.
10. Run Database Check.
11. Run Storage Check.
12. Run Full Health Check.
13. Confirm action results come from API responses.
14. Confirm Scheduled Health Monitoring shows Not Configured when no scheduler
    contract exists.
15. Confirm Notifications & Alerts shows Not Configured when no notification
    contract exists.
16. Review Health Check History for recent checks, warnings, and failures for
    the current environment only.

## Operator Guardrails

- Do not add cross-environment health checks.
- Do not let the browser invent healthy infrastructure state.
- Do not expose credentials or raw connection strings.
- Do not change environment folder mappings without updating this guide,
  Project Instructions, and the System Health API contract tests.
- Do not treat Not Configured placeholders as failures when the underlying
  scheduler or notification service contract is intentionally absent.
