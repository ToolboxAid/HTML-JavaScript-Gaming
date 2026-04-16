# BUILD_PR_LEVEL_18_4_PHASE18_RUNTIME_LAYER

## Purpose
Implement a minimal Phase 18 runtime-layer scaffold and integrate it with the existing Phase 18 core-services skeleton.

## Source of Truth
- `docs/pr/PLAN_PR_LEVEL_18_4_PHASE18_RUNTIME_LAYER.md`
- `docs/pr/BUILD_PR_LEVEL_18_3_PHASE18_CORE_SERVICES.md`

## Exact Build Target
1. Add runtime-layer scaffolding under:
   - `samples/phase-18/shared/runtimeLayer/`
2. Include:
   - runtime loop orchestration (`start`, `update`, `stop`)
   - scheduler hooks (before/after update and state-change hook channels)
   - explicit runtime state transitions
3. Integrate runtime layer with Phase 18 core services:
   - runtime layer starts/updates/stops service registry
   - `samples/phase-18/1801` uses runtime layer instead of directly driving services

## Non-Goals
- no engine-core changes
- no gameplay/system feature logic
- no additional Phase 18 sample entries
- no roadmap status updates

## Validation
- targeted runtime test for runtime state transitions + scheduler hooks + service integration
- existing Phase 18 core-service skeleton test still passes
- sample `1801` renders runtime/service status without errors

## Packaging Rule
Package only this PR's created/modified files into:
`tmp/BUILD_PR_LEVEL_18_4_PHASE18_RUNTIME_LAYER.zip`
