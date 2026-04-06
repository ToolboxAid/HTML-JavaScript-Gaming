# BUILD_PR_ENGINE_MATURITY

## Purpose
Build a docs-first, implementation-ready engine maturity bundle from `PLAN_PR_ENGINE_MATURITY`.

## Workflow
PLAN_PR -> BUILD_PR -> APPLY_PR

## Scope
- stable debug API seams
- plugin lifecycle boundaries
- versioned contract metadata
- external documentation ownership
- performance benchmark entry points and rules

## Constraints
- docs-only
- no runtime code changes
- no engine core API pollution
- preserve public/internal/transitional boundaries
- preserve `docs/pr` history

## Stable Debug API Seams
- command registration/discovery/execution output contract
- panel registration + descriptor contract
- provider registration + read-only snapshot contract
- runtime debug visibility/render-order control seams

## Plugin Lifecycle Boundaries
- `register(context)`
- `enable(context)`
- `disable(context)`
- `dispose(context)`

Rules:
- plugins use public seams only
- no direct private-state mutation
- failure isolation is required

## Versioned Contract Metadata
Required fields:
- `contractId`
- `contractVersion`
- `compatibility` (`backwardCompatible`, `notes`)
- `status` (`active|deprecated`)
- `deprecatedSince` (optional)
- `replacementContractId` (optional)

Versioning:
- MAJOR = breaking
- MINOR = backward-compatible addition
- PATCH = non-breaking fix/clarification

## External Documentation Ownership
- `docs/pr/` for phase/PR intent and history
- `docs/dev/` for active controls and maturity reference docs
- one canonical source per concern, cross-link only

## Performance Benchmark Entry Points
- command execution latency
- overlay render/update cost
- provider polling/snapshot overhead
- panel show/hide/toggle cost
- preset apply/reset cost

Rules:
- compare debug-disabled vs debug-enabled
- measure cold-open and steady-state
- capture environment/sample/scenario metadata
- treat repeated regressions as maturity blockers

## Apply Handoff
`APPLY_PR_ENGINE_MATURITY` should implement only approved seams and stabilization paths without widening scope.
