Toolbox Aid
David Quesenberry
04/06/2026
APPLY_PR_DEBUG_SURFACES_SERVER_DASHBOARD_ADVANCED.md

# APPLY_PR_DEBUG_SURFACES_SERVER_DASHBOARD_ADVANCED

## Apply Intent
Implement advanced shared server dashboard behavior in `engine/debug/network/dashboard` with read-only providers and command-safe host APIs.

## Guardrails
- No engine core changes.
- No console coupling.
- No overlay coupling.
- No persistence.
- Keep implementation scoped to shared dashboard modules.

## Required File Work
- `engine/debug/network/dashboard/serverDashboardHost.js`
- `engine/debug/network/dashboard/serverDashboardRegistry.js`
- `engine/debug/network/dashboard/serverDashboardProviders.js`
- `engine/debug/network/dashboard/serverDashboardRenderer.js`
- `engine/debug/network/dashboard/serverDashboardViewModel.js`
- `engine/debug/network/dashboard/serverDashboardMetrics.js`
- `engine/debug/network/dashboard/serverDashboardRefreshModes.js`
- `engine/debug/network/dashboard/registerDashboardCommands.js`
- `engine/debug/network/index.js` (exports only)

## Command Contract
- `dashboard.help` lists commands and modes
- `dashboard.status` returns mode, refresh status, section count, and key counts
- `dashboard.refresh` triggers one immediate read-only refresh
- `dashboard.mode` reads/sets refresh mode through host API
- `dashboard.snapshot` returns normalized dashboard snapshot summary

## Validation Sequence
1. Import checks for all advanced dashboard modules.
2. Snapshot normalization smoke test with mixed input shapes.
3. Refresh mode checks for `manual`, `normal`, and `fast`.
4. Command output checks via `registerDashboardCommands`.
5. Sample plugin parity checks for Sample A/B/C network debug plugins.
6. Confirm no engine core API files changed.

## Roadmap Edits
Only bracket state edits in:
- `docs/dev/roadmaps/NETWORK_SAMPLES_PLAN.md`
- `docs/dev/roadmaps/BIG_PICTURE_ROADMAP.md`

No wording, ordering, or structure edits.

## Packaging
Build zip automatically at:
`<project folder>/tmp/APPLY_PR_DEBUG_SURFACES_SERVER_DASHBOARD_ADVANCED_delta.zip`
