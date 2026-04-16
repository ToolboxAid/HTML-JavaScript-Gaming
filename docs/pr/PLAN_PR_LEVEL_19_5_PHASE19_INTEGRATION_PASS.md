# PLAN_PR_LEVEL_19_5_PHASE19_INTEGRATION_PASS

## Purpose
Integrate Phase 19 core services and runtime layer through a single flow entry point, with targeted end-to-end validation.

## Source of Truth
- `docs/pr/BUILD_PR_LEVEL_19_3_PHASE19_CORE_SERVICES.md`
- `docs/pr/BUILD_PR_LEVEL_19_4_PHASE19_RUNTIME_LAYER.md`

## Scope
- add one Phase 19 integration-flow module that composes core services + runtime layer
- rewire sample `1901` to use the integration-flow entry point
- keep existing core-services and runtime-layer modules unchanged except as needed for integration wiring
- add targeted integration runtime validation

## Out of Scope
- no engine-core changes
- no gameplay feature logic
- no additional Phase 19 samples
- no roadmap status updates

## Exit Criteria
- integration-flow module exists and drives start/update/stop through `1901`
- targeted integration test coverage passes
- existing runtime/core tests remain passing
