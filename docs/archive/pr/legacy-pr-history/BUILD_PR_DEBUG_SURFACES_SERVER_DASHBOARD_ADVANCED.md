Toolbox Aid
David Quesenberry
04/06/2026
BUILD_PR_DEBUG_SURFACES_SERVER_DASHBOARD_ADVANCED.md

# BUILD_PR_DEBUG_SURFACES_SERVER_DASHBOARD_ADVANCED

## Build Intent
Prepare an implementation-ready APPLY package for advanced shared server dashboard behavior under `engine/debug/network/dashboard` while preserving read-only and decoupled architecture rules.

## Authoritative Target Structure
```text
engine/debug/network/dashboard/
  serverDashboardHost.js
  serverDashboardRegistry.js
  serverDashboardProviders.js
  serverDashboardRenderer.js
  serverDashboardViewModel.js
  serverDashboardMetrics.js
  serverDashboardRefreshModes.js
  registerDashboardCommands.js
```

## Build Rules
- No engine core changes.
- Use public APIs for host/registry/renderer integration.
- Keep providers read-only.
- No console coupling.
- No overlay coupling.
- No persistence.

## Public API Targets
### Host
- `refreshNow()`
- `setRefreshMode(mode)`
- `getStatus()`
- `getSnapshot()`
- `destroy()`

### Registry
- deterministic section registration/listing
- visibility and priority controls through registry APIs
- read-only section snapshots

### Renderer
- consume normalized snapshots/view model only
- render advanced summary, latency, throughput, player, and connection/session sections

### Commands
- `dashboard.help`
- `dashboard.status`
- `dashboard.refresh`
- `dashboard.mode <manual|normal|fast>`
- `dashboard.snapshot`

## Ordered Build Steps
1. Add refresh mode definitions and normalization helpers.
2. Add aggregate metrics calculator.
3. Add snapshot-to-view-model normalization.
4. Extend host for refresh lifecycle + command-safe APIs.
5. Extend registry for deterministic section controls.
6. Extend renderer to consume the new view model.
7. Add dashboard command registration bridge using host APIs only.
8. Export advanced dashboard modules from `engine/debug/network/index.js`.
9. Run targeted validations.

## Validation Targets
- imports
- snapshot normalization
- refresh mode transitions
- command outputs
- sample plugin parity
- providers remain read-only
- no engine core changes

## Packaging Target
`<project folder>/tmp/APPLY_PR_DEBUG_SURFACES_SERVER_DASHBOARD_ADVANCED_delta.zip`
