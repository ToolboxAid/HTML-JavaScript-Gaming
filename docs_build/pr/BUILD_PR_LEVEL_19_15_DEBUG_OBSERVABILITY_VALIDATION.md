# BUILD_PR_LEVEL_19_15_DEBUG_OBSERVABILITY_VALIDATION

## Purpose
Complete the next real execution PR for Level 19 by validating the remaining Track D item:
- [ ] ensure all systems expose debug data

## Scope
- one PR purpose only
- execute debug-observability validation work
- make only the smallest validation-backed runtime changes needed
- no feature creation
- no broad repo cleanup
- no unrelated roadmap promotion

## Target Systems
Validate debug-data exposure for the core systems already called out in Level 19 Track A:
- rendering
- input
- physics
- state/replay
- networking
- debug platform integration points where needed to surface the above

## Required Execution
1. Inspect the existing debug provider/panel/data-surface path.
2. Verify each target system exposes meaningful debug data through the existing debug architecture.
3. If any target system is missing exposure, add the smallest non-feature provider or wiring change needed.
4. Add or update focused tests/harness coverage to prove the exposure path.
5. Record exactly what was validated and what commands were run.
6. Update the roadmap only if this PR actually proves the remaining Track D item.

## Preferred Change Areas
- `src/engine/**` only where tiny provider exposure fixes are required
- `tests/**`
- existing debug provider/panel wiring
- validation scripts/harnesses if needed

## Validation Commands
Use the non-duplicative test flow:
- `node ./scripts/run-node-tests.mjs`
- `npm run test:launch-smoke` only if needed to prove runtime/debug exposure beyond the node suite

Do not run both `npm test` and `node ./scripts/run-node-tests.mjs` when they execute the same suite.

## Acceptance
- all target systems are shown to expose debug data through the existing debug surfaces
- evidence is captured in reports
- roadmap advances only for the execution-backed Track D item
- ZIP artifact produced at `<project folder>/tmp/BUILD_PR_LEVEL_19_15_DEBUG_OBSERVABILITY_VALIDATION.zip`
