# BUILD_PR_LEVEL_18_3_PHASE18_CORE_SERVICES

## Purpose
Implement a minimal Phase 18 core-services skeleton and wire it into the existing `1801` foundation sample.

## Source of Truth
- `docs/pr/PLAN_PR_LEVEL_18_3_PHASE18_CORE_SERVICES.md`
- `docs/pr/BUILD_PR_LEVEL_18_2_PHASE18_FOUNDATION.md`

## Exact Build Target
1. Add a Phase 18 shared core-services skeleton under:
   - `samples/phase-18/shared/coreServices/`
2. Include:
   - one service contract validator
   - one service registry with lifecycle hooks (`start`, `update`, `stop`)
   - one communication service (channel/event bus wrapper)
   - one baseline heartbeat service
   - one bootstrap factory that registers baseline services
3. Wire sample `1801` to use the core-services skeleton:
   - initialize services in `main.js`
   - start/update/stop via scene lifecycle hooks
   - render minimal service status in sample panel

## Non-Goals
- no engine core modifications
- no gameplay/system feature implementation
- no additional Phase 18 samples
- no roadmap status updates

## Validation
- targeted runtime test for service registry lifecycle + communication path
- sample `1801` still renders with service status

## Packaging Rule
Package only this PR's created/modified files into:
`tmp/BUILD_PR_LEVEL_18_3_PHASE18_CORE_SERVICES.zip`
