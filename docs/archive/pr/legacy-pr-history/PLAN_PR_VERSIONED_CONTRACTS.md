Toolbox Aid
David Quesenberry
04/05/2026
PLAN_PR_VERSIONED_CONTRACTS.md

# PLAN_PR_VERSIONED_CONTRACTS

## Goal
Execute a focused versioned-contracts slice that standardizes contract-version normalization and support checks across existing debug/render contract seams.

## Workflow
PLAN_PR -> BUILD_PR -> APPLY_PR

## In Scope
- Add a shared contract-version policy utility under `tools/shared/`
- Apply policy-based version checks in:
  - `tools/shared/renderPipelineContract.js`
  - `tools/shared/devConsoleDebugOverlay.js`
- Expose version metadata helpers for diagnostics and render contracts
- Update docs/reports and Track J roadmap status (bracket-only)

## Out of Scope
- No engine core API redesign
- No sample/game behavior feature expansion
- No refactor of unrelated tooling modules
- No protocol/network/version migration framework in this slice

## Contracts To Stabilize
1. Render contract envelope
- Preserve required `contractVersion`
- Normalize accepted semver aliases (for example `v1.0` => `1.0.0`)
- Reject unsupported major/minor versions

2. Dev diagnostics contract envelope
- Preserve required `contractVersion`
- Centralize supported-version evaluation
- Keep diagnostics envelope backward-compatible for existing `1.0.0`

## Validation Plan
- `node --check` on touched JS files
- Targeted tests:
  - `tests/tools/RenderPipelineContractAll4Tools.test.mjs`
  - `tests/tools/DevConsoleDebugOverlay.test.mjs`
- Confirm roadmap bracket change only:
  - `Versioned contracts` -> `[x]`

## Build Command
Create BUILD_PR_VERSIONED_CONTRACTS and implement only approved shared version-policy wiring plus docs/report updates.

## Commit Comment
build(versioned-contracts): execute plan/build/apply bundle with shared contract policy normalization and compatibility checks

## Next Command
Create PR_PERFORMANCE_BENCHMARKS_FULL_bundle
