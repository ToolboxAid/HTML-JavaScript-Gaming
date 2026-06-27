Toolbox Aid
David Quesenberry
04/05/2026
PLAN_PR_PRODUCTIZATION_ASTEROIDS_SHOWCASE.md

# PLAN_PR_PRODUCTIZATION_ASTEROIDS_SHOWCASE

## Goal
Execute a focused PLAN+BUILD+APPLY bundle that productizes the completed debug platform through a canonical Asteroids showcase sample.

## Workflow
PLAN_PR -> BUILD_PR -> APPLY_PR

## In Scope
- Define Asteroids as the canonical showcase sample.
- Define and implement full debug integration visibility for:
  - ship
  - bullets
  - asteroids
  - score/lives
  - waves
- Define debug event visibility and showcase preset commands.
- Define production-safe debug gating.
- Define and publish showcase documentation set.
- Finalize reports and control files.

## Out of Scope
- Track G
- Track H
- unrelated engine refactors
- non-showcase game genres

## Implementation Plan
1. Add sample-level debug integration wiring in `games/Asteroids/main.js` with explicit build/runtime debug flags.
2. Add Asteroids-specific showcase debug module for panels, event visibility, and preset commands.
3. Wire scene-level diagnostics and bounded event stream from `AsteroidsGameScene`.
4. Keep debug optional and disabled-safe in production mode.
5. Publish release-facing showcase docs and maintainer guidance.
6. Update PLAN/BUILD/APPLY docs and reports, then package the bundle zip.

## Validation Plan
- `node --check` on touched Asteroids and test JS files.
- Run targeted regression checks:
  - `AsteroidsValidation.test.mjs`
  - `AsteroidsPlatformDemo.test.mjs`
- Confirm no Track G/H changes.
- Confirm no engine-core API refactors.

## Commit Comment
build(productization): deliver asteroids showcase as canonical debug platform productization sample

## Next Command
Create PLAN_PR_PRODUCTIZATION_MULTI_GAME_SHOWCASE_EXPANSION
