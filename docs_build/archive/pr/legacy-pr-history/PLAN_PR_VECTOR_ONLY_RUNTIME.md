# PLAN_PR_VECTOR_ONLY_RUNTIME

## Goal
Define a clean, surgical migration of the Asteroids demo and platform runtime path from
vector-preferred-with-sprite-fallback to true vector-only runtime behavior, while preserving
accepted platform boundaries and avoiding engine core API changes.

## Why This PR Exists
The current Asteroids vector migration is successful, but still retains `sprite.asteroids-demo`
as a temporary fallback safety path. This PR removes that runtime dependency and establishes
vector assets as the sole visual contract for the flagship demo.

## Intent
- remove sprite fallback from the Asteroids runtime/package path
- preserve registry, validation, packaging, runtime, debug, profiler, export, and publishing flows
- keep rollback information documented, but not packaged as an active runtime dependency
- keep the migration surgical and deterministic

## Scope
- remove sprite fallback from Asteroids demo visual preference contracts
- update validation rules and demo checks to enforce vector-only runtime expectations
- update packaging roots and dependency inclusion so the sprite fallback is no longer required
- preserve runtime handoff at `games/Asteroids/main.js#bootAsteroids`
- preserve gameplay loop, debug visibility, profiler coverage, export, and publishing readiness
- document rollback guidance without keeping sprite fallback in the active runtime baseline

## Non-Goals
- No engine core API changes
- No broad platform-wide removal of sprite support
- No destructive removal of unrelated sprite systems from the platform
- No gameplay redesign beyond what is required to harden vector-only visuals
- No bypass of validation, packaging, runtime, CI, export, or publishing boundaries

## Current Verified Baseline
- vector assets are already the preferred visual path
- sprite remains only as temporary migration fallback
- runtime handoff remains stable
- validation/packaging/runtime/export/publishing all pass

## Target Baseline
- Asteroids demo uses vector assets only for ship, asteroid variants, and title presentation
- runtime and package manifests no longer depend on `sprite.asteroids-demo`
- validation fails if vector-only requirements are not satisfied
- fallback documentation remains available only as historical rollback guidance

## Required Asset Set
- `vector.asteroids.ship`
- `vector.asteroids.asteroid.large`
- `vector.asteroids.asteroid.medium`
- `vector.asteroids.asteroid.small`
- `vector.asteroids.ui.title`

## Acceptance Criteria
1. Validation passes with vector-only demo requirements.
2. Packaging succeeds without including `sprite.asteroids-demo` as an active runtime dependency.
3. Runtime loader reaches ready state from vector-only packaged inputs.
4. Gameplay loop remains intact: title, start, play, score, lives, waves, game-over, restart.
5. Debug and profiler surfaces reflect vector-only participation cleanly.
6. Export and publishing remain ready.
7. No engine core APIs are changed.

## Manual Validation Checklist
1. Ship renders via vector asset only.
2. Asteroid variants render via vector assets only.
3. Title presentation renders via vector asset only where configured.
4. `sprite.asteroids-demo` is not required in packaged runtime roots/assets.
5. Validation reports no blocking findings.
6. Packaging remains deterministic.
7. Runtime reaches ready state.
8. Debug graph reflects vector-only baseline correctly.
9. Profiler captures deterministic vector-only samples.
10. No engine core APIs are changed.

## Approved Commit Comment
plan(vector-runtime): define vector-only runtime hardening for asteroids demo

## Next Command
BUILD_PR_VECTOR_ONLY_RUNTIME
