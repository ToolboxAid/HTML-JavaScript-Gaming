# BUILD_PR_LEVEL_19_3_PHASE19_CORE_SERVICES

## Purpose
Implement a minimal Phase 19 core-services skeleton and wire it into the existing `1901` foundation sample.

## Source of Truth
- `docs/pr/PLAN_PR_LEVEL_19_3_PHASE19_CORE_SERVICES.md`
- `docs/pr/BUILD_PR_LEVEL_19_2_PHASE19_FOUNDATION.md`

## Exact Build Target
1. Add a Phase 19 shared core-services skeleton under:
   - `samples/phase-19/shared/coreServices/`
2. Include:
   - one service contract validator
   - one service registry with lifecycle hooks (`start`, `update`, `stop`)
   - one communication service (channel/event bus wrapper)
   - one baseline heartbeat service
   - one bootstrap factory that registers baseline services
3. Wire sample `1901` to use the core-services skeleton:
   - initialize services in `main.js`
   - start/update/stop via scene lifecycle hooks
   - render minimal service status in sample panel
4. Add targeted runtime validation:
   - core-service lifecycle + communication path
   - sample `1901` service-status rendering path

## Non-Goals
- no engine core modifications
- no gameplay/system feature implementation
- no runtime-layer or integration-flow implementation
- no additional Phase 19 samples
- no roadmap status updates

## Validation
- targeted runtime test for service registry lifecycle + communication path passes
- sample `1901` still renders and surfaces heartbeat/service status without errors

## Packaging Rule
Package only this PR's created/modified files into:
`tmp/BUILD_PR_LEVEL_19_3_PHASE19_CORE_SERVICES.zip`
