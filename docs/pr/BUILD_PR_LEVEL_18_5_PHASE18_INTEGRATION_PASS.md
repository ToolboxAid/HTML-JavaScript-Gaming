# BUILD_PR_LEVEL_18_5_PHASE18_INTEGRATION_PASS

## Purpose
Integrate Phase 18 core services and runtime layer through a single flow entry point and validate end-to-end interaction behavior.

## Source of Truth
- `docs/pr/PLAN_PR_LEVEL_18_5_PHASE18_INTEGRATION_PASS.md`
- `docs/pr/BUILD_PR_LEVEL_18_3_PHASE18_CORE_SERVICES.md`
- `docs/pr/BUILD_PR_LEVEL_18_4_PHASE18_RUNTIME_LAYER.md`

## Exact Build Target
1. Add a Phase 18 integration-flow module that composes:
   - core services registry
   - runtime layer
   - flow-level event subscriptions and snapshots
2. Rewire sample `1801` to use the integration-flow module instead of directly composing runtime/core services.
3. Keep runtime and service modules unchanged except as needed for integration wiring.
4. Add targeted runtime integration validation for:
   - start/update/stop flow path
   - runtime state event flow
   - heartbeat flow through integration snapshot

## Non-Goals
- no engine-core changes
- no gameplay feature implementation
- no additional Phase 18 sample entries
- no roadmap status changes

## Validation
- targeted integration flow test passes
- existing runtime/core service targeted tests still pass
- sample `1801` renders integration flow status without errors

## Packaging Rule
Package only this PR's created/modified files into:
`tmp/BUILD_PR_LEVEL_18_5_PHASE18_INTEGRATION_PASS.zip`
