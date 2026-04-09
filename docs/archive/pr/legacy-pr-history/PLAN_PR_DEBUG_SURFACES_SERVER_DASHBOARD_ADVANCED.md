Toolbox Aid
David Quesenberry
04/06/2026
PLAN_PR_DEBUG_SURFACES_SERVER_DASHBOARD_ADVANCED.md

# PLAN_PR_DEBUG_SURFACES_SERVER_DASHBOARD_ADVANCED

## Workflow Discipline
PLAN_PR -> BUILD_PR -> APPLY_PR

## Purpose
Advance the shared server dashboard under `src/engine/debug/network/dashboard` into a stronger read-only debugging surface without changing engine core APIs.

## Scope
In scope:
- Add advanced dashboard modules:
  - `serverDashboardViewModel.js`
  - `serverDashboardMetrics.js`
  - `serverDashboardRefreshModes.js`
  - `registerDashboardCommands.js`
- Extend dashboard host, registry, and renderer through public APIs only.
- Keep providers read-only.
- Validate imports, snapshot normalization, refresh modes, command outputs, and sample plugin parity.
- Update roadmap trackers with bracket-only edits.

Out of scope:
- Engine core changes.
- Console coupling.
- Overlay coupling.
- Persistence.
- Server-dashboard, docker, or transport work.

## Boundaries
- Shared ownership: `src/engine/debug/network/dashboard/*`
- Sample ownership: sample feeds and scenario data
- Engine core ownership: no changes in this PR

## Data Flow
Sample/runtime snapshots
-> read-only dashboard provider normalization
-> dashboard metrics + view model
-> dashboard renderer output
-> dashboard commands through host public APIs

## Validation Goals
- New and updated dashboard modules import cleanly.
- Snapshot normalization remains deterministic and read-only.
- Refresh modes (`manual|normal|fast`) behave as documented.
- `dashboard.*` commands return expected read-only outputs.
- Sample A/B/C debug plugin parity remains intact.
- No engine core files are changed.

## Deliverables
- `docs/pr/PLAN_PR_DEBUG_SURFACES_SERVER_DASHBOARD_ADVANCED.md`
- `docs/pr/BUILD_PR_DEBUG_SURFACES_SERVER_DASHBOARD_ADVANCED.md`
- `docs/pr/APPLY_PR_DEBUG_SURFACES_SERVER_DASHBOARD_ADVANCED.md`
- `docs/dev/CODEX_COMMANDS.md`
- `docs/dev/COMMIT_COMMENT.txt`
- `docs/dev/NEXT_COMMAND.txt`
- `docs/dev/reports/change_summary.txt`
- `docs/dev/reports/file_tree.txt`
- `docs/dev/reports/validation_checklist.txt`
