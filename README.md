Toolbox Aid
David Quesenberry
03/23/2026
README.md

# BUILD_PR — Asteroids Validation Phase 1 (Boot + Lifecycle + Persistence)

## Purpose
Validate the stabilized engine under real Asteroids gameplay without doing promotion/extraction yet.

## Goal
Prove engine behavior under real game flow for:
- browser boot readiness
- scene lifecycle transitions
- fullscreen affordance/use
- persistence and snapshot/player-swap safety

## Scope
- `games/Asteroids/`
- focused engine/game validation tests
- minimal supporting engine test adjustments only if required for validation
- `tests/run-tests.mjs` only if required

## Constraints
- No promotion/extraction work in this PR
- No broad engine redesign
- No gameplay feature expansion
- No sample consolidation in this PR
- Prefer validation/tests over code churn
- Any runtime fixes must be minimal and directly required by the validation target

## Expected Outcome
- Asteroids boot path is validated
- lifecycle transitions are validated through real game flow
- persistence-related flows are validated
- fullscreen/browser-entry behavior is validated
- proof is gathered before any promotion phase begins
