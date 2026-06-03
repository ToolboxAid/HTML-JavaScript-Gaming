# APPLY_PR_DEBUG_SURFACES_SERVER_DASHBOARD_FOUNDATION

## Purpose
Apply the approved server dashboard foundation with surgical sample-level changes only.

## Apply Rules
- Preserve existing console behavior
- Preserve existing overlay behavior
- Preserve existing combo keys
- Do not refactor unrelated network code
- Do not introduce new feature scope
- Keep all work under `tools/dev` plus sample wiring

## Ordered Apply Sequence
1. Add `serverDashboardProviders.js`
2. Add `serverDashboardRegistry.js`
3. Add `serverDashboardRenderer.js`
4. Add `serverDashboardHost.js`
5. Wire sample-level dashboard bootstrap in `MultiSystemDemoScene.js`
6. Run validation
7. Package delta ZIP

## Provider Contract
Providers must return normalized read-only snapshots such as:
- connection/session counts
- player rows
- latency summary
- rx/tx summaries
- timestamp

Providers must not:
- mutate runtime
- register commands
- write persistence
- depend on overlay render state

## Renderer Contract
Renderer must:
- render summary + player rows
- tolerate empty datasets
- remain visually simple
- avoid advanced UX controls

Renderer must not:
- execute operator commands
- mutate runtime state
- own refresh logic

## Validation
- Dashboard host starts and stops cleanly
- Snapshot refresh works at the chosen interval
- Renderer shows stable rows for sample data
- Empty state is safe
- Existing debug surfaces still work
- No engine-core files changed

## Package Output
`<project folder>/tmp/BUILD_PR_DEBUG_SURFACES_SERVER_DASHBOARD_FOUNDATION_delta.zip`

## Next Recommended Command
`APPLY_PR_DEBUG_SURFACES_SERVER_DASHBOARD_FOUNDATION`
