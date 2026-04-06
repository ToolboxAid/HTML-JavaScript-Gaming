# BUILD_PR_DEBUG_SURFACES_GAME_INTEGRATION

## Purpose
Build a docs-only, implementation-ready bundle for game integration of debug surfaces.

## Workflow
PLAN_PR -> BUILD_PR -> APPLY_PR

## PR Purpose
One PR purpose only: convert game-integration planning into apply-ready implementation guidance.

## Build Scope
- game/sample bootstrap wiring contract
- environment flag contract
- debug lifecycle contract
- validation and rollback checklist

## Authoritative Build Targets
- one sample/game integration reference (minimal and reversible)
- debug flag normalization (`debugEnabled`, `debugMode`)
- clear enable/disable lifecycle hooks
- no runtime behavior drift when disabled

## Guardrails
- docs-only
- no engine-core modifications in BUILD docs
- no unrelated tooling/feature expansion
- keep integration sample-level first

## Validation Targets
- disabled mode parity with baseline behavior
- enabled mode deterministic console/overlay lifecycle
- controlled input toggles and cleanup

## Rollback Strategy
- remove integration wiring at sample entry only
- keep debug shared modules intact
- verify baseline parity after rollback

## Next Command
`APPLY_PR_DEBUG_SURFACES_GAME_INTEGRATION`
