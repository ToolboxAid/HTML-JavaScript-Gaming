Toolbox Aid
David Quesenberry
04/06/2026
BUILD_PR_DEBUG_SURFACES_SERVER_DASHBOARD_FOUNDATION.md

# BUILD_PR_DEBUG_SURFACES_SERVER_DASHBOARD_FOUNDATION

## Build Summary
Prepared a docs-first foundation bundle for a read-only server dashboard surface scoped to `tools/dev/server-dashboard`. This BUILD_PR remains one-purpose, sample-level, and does not modify engine core APIs or behavior.

## Workflow Discipline
PLAN_PR -> BUILD_PR -> APPLY_PR

## Scope and Boundaries
- docs-first only in this bundle
- no engine core changes
- no server mutation controls
- no containerization/docker work
- no transport implementation work
- keep console and overlay decoupled from dashboard internals
- keep combo keys unchanged

## Server Dashboard Foundation Surface
### Target folder
`tools/dev/server-dashboard/`

### Planned implementation units
- `serverDashboardHost.js`
- `serverDashboardRegistry.js`
- `serverDashboardProviders.js`
- `serverDashboardRenderer.js`

## Responsibility Contract
### Host responsibility (`serverDashboardHost`)
- own start/stop lifecycle
- own refresh cadence and polling schedule
- request normalized snapshots from providers
- coordinate registry + renderer handoff
- remain debug-only and read-only from the dashboard perspective

### Registry responsibility (`serverDashboardRegistry`)
- register known dashboard sections
- enforce deterministic section ordering
- return immutable section descriptors for rendering
- isolate dashboard section metadata from console/overlay plugin internals

### Provider responsibility (`serverDashboardProviders`)
- collect read-only sample-facing telemetry snapshots
- normalize connection/session/player/network summaries
- expose stable payload shape for renderer consumption
- forbid runtime mutation and transport write actions

### Renderer responsibility (`serverDashboardRenderer`)
- render shell + summary rows + player rows
- tolerate empty/partial datasets safely
- avoid ownership of refresh, polling, or provider logic
- avoid coupling to console renderer and overlay renderer internals

## Decoupling Rules
- console and overlay remain independent debug surfaces
- dashboard host must not require console open state
- dashboard host must not require overlay visibility
- dashboard internals are not managed by combo key handlers
- existing combo key behavior stays unchanged

## Sample-Level Integration Rule
- integration remains sample-level only
- no engine-level promotion in this BUILD_PR
- initial consumer/proving surface remains sample-owned wiring

## Validation Targets (Docs-First)
- host/registry/providers/renderer ownership is explicit and non-overlapping
- provider payloads are read-only by contract
- dashboard flow is deterministic and polling-based
- decoupling from console and overlay is explicit
- combo key behavior is explicitly unchanged
- no engine-core work is requested

## Apply Gate for Next PR
APPLY_PR should only implement the documented foundation surface under `tools/dev/server-dashboard` plus sample wiring, with no scope expansion.

## Packaging Target
`<project folder>/tmp/BUILD_PR_DEBUG_SURFACES_SERVER_DASHBOARD_FOUNDATION_delta.zip`
