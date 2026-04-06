# PLAN_PR_DEBUG_SURFACES_SERVER_DASHBOARD_FOUNDATION

## Purpose
Define the smallest safe foundation for a read-only server dashboard surface that extends the current debug platform without mixing console, overlay, and remote/system views.

## Scope
- Add a server dashboard surface under `tools/dev/server-dashboard`
- Keep the dashboard read-only
- Keep all work sample-level
- Keep engine core unchanged
- Reuse the existing debug architecture direction without coupling dashboard internals to console or overlay internals

## Non-Goals
- No engine core changes
- No containerization work in this PR
- No auth model beyond debug-only access rules
- No filtering, sorting, persistence, or advanced styling
- No mutation controls, server actions, or operator commands inside the dashboard UI

## Current Context
The repo already has a stable debug platform with dev console, debug overlay HUD, command infrastructure, presets, and advanced UX at sample-level integration. The current integration target remains `MultiSystemDemoScene.js`.

## Problem
Current network debug support provides local/sample-facing diagnostics, but there is no dedicated dashboard surface for aggregated server-style visibility such as connection/session counts, per-player rows, and transport summaries.

## Proposal
Introduce a separate dashboard surface with four small building blocks:
- `serverDashboardHost`
- `serverDashboardRegistry`
- `serverDashboardProviders`
- `serverDashboardRenderer`

This surface must remain:
- read-only
- debug-only
- polling/snapshot based
- decoupled from console and overlay UI ownership

## Initial Sections
- Connection/session counts
- Per-player status rows
- Latency summary
- RX bytes summary
- TX bytes summary
- Last refresh timestamp

## Ownership
### `tools/dev/server-dashboard`
Owns:
- host lifecycle
- dashboard registry
- provider aggregation
- renderer shell

### project/sample integration
Owns:
- sample registration
- sample data adapters
- demo wiring

### engine core
Owns:
- nothing in this PR

## Guardrails
- Providers are read-only only
- Renderer consumes normalized snapshots only
- No direct runtime mutation from dashboard surface
- No dashboard-specific logic inside engine core
- No dashboard commands in this foundation PR
- No coupling where console directly manages dashboard internals
- No coupling where overlay directly renders dashboard sections

## Validation Goals
- Dashboard shell renders without breaking the sample
- Refresh loop runs deterministically
- Provider snapshots render expected sections
- Dashboard works when overlay is off
- Dashboard works when console is closed
- Dashboard remains debug-only

## Risks
### Scope creep into full admin surface
Mitigation: keep read-only and table-first

### Coupling to existing overlay panel model
Mitigation: treat dashboard as separate host surface

### Runtime mutation by convenience shortcuts
Mitigation: forbid write paths in providers and renderer

## Exit Criteria
- Build docs specify exact files, boundaries, and validation
- Apply docs remain surgical and behavior-preserving
- Packaging is ready for Codex execution under the repo ZIP workflow
