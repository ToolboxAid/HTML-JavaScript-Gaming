# PR_26171_001 Manual Validation Notes

## Local API Snapshot
- The completion metrics endpoint returns 14 Game Journey buckets.
- The seeded model totals 66 planned items.
- Initial status distribution is 10 active buckets and 4 inactive buckets.
- Initial completion is 0 completed items and 0%.

## Persistence Probe
- An isolated SQLite path under `tmp/local-api` was used for validation.
- Updating bucket `001-idea` with `active: true`, `plannedCount: 4`, and `completedCount: 2` returned `percentComplete: 50`.
- Reading the SQLite row directly confirmed:
  - `plannedCount = 4`
  - `completedCount = 2`
  - `active = 1`
  - `status = active`

## UI Review
- Toolbox Game Journey accordion labels now derive from numeric API metrics.
- Placeholder `xxx%` labels were removed from the rendered accordion expectations.
- Game Journey now includes a completion metrics table with planned, completed, percent, and active/inactive status columns.

## Known Validation Issue
- `npm run test:workspace-v2` still fails in the workspace/root lane because several pages request `127.0.0.1:5501/api/...` during Playwright execution and one header-order assertion does not match the current rendered menu order.
