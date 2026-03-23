Toolbox Aid
David Quesenberry
03/23/2026
README.md

# PLAN_PR — Gravity Well Validation Phase 1

## Purpose
Validate Game #2 (Gravity Well) as a real engine consumer before adding polish or promoting any game-side helpers.

## Goal
Prove Gravity Well correctness for:
- boot and initial state
- thrust + gravity interaction
- win-zone detection
- deterministic repeatability
- stable motion across timing conditions

## Scope
- `games/GravityWell/`
- focused validation tests
- docs-only planning output in this PR

## Constraints
- No runtime code changes in this PR
- No engine redesign
- No gameplay expansion
- No promotion/extraction work
- Prefer validation planning over speculative cleanup

## Expected Outcome
A validation plan and next BUILD_PR ladder for hardening Gravity Well before any promotion or polish.
