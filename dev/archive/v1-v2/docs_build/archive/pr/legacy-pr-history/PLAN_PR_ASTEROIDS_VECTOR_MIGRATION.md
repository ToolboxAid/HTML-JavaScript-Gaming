# PLAN_PR_ASTEROIDS_VECTOR_MIGRATION

## Goal
Define a migration of the flagship Asteroids platform demo from sprite-led asset rendering to vector-led asset rendering
using the accepted first-class vector asset system, while preserving all accepted platform boundaries.

## Why This PR Exists
The flagship Asteroids demo already proves the platform end-to-end, but Asteroids is fundamentally a vector game.
Now that vector assets are a first-class platform type, the demo should migrate to authentic vector-driven content.

## Intent
- Move key Asteroids gameplay visuals to vector assets
- Preserve strict validation, packaging, runtime, debug, profiler, export, and publishing flows
- Keep the migration surgical and reusable for future vector-native templates

## Scope
- migrate player ship visual to vector asset
- migrate asteroid variants to vector assets
- optionally migrate select title/UI assets where vector is a better fit
- update registry/dependency graph participation for migrated demo assets
- preserve gameplay loop and demo validation coverage
- preserve packaging/runtime handoff for the Asteroids demo
- keep migration reusable as a future vector-native demo/template baseline

## Non-Goals
- No engine core API changes
- No destructive removal of existing demo content until vector path is verified
- No gameplay redesign beyond what is needed for vector-led rendering
- No bypass of validation, packaging, runtime, CI, export, or publishing boundaries

## Migration Strategy
1. Keep the existing Asteroids demo as the verified baseline.
2. Introduce vector asset equivalents for ship and asteroid visuals.
3. Update demo asset references to consume vector assets as the preferred path.
4. Preserve fallback/reference documentation for prior sprite-led demo assets only as migration safety.
5. Re-run full platform validation, packaging, runtime, export, publishing, debug, and profiler flows.

## Proposed Vector IDs
- `vector.asteroids.ship`
- `vector.asteroids.asteroid.large`
- `vector.asteroids.asteroid.medium`
- `vector.asteroids.asteroid.small`
- `vector.asteroids.ui.title` (optional)

## Likely Files
- vector asset definitions under `games/Asteroids/platform/assets/vectors/`
- updated demo content/config references
- validation and packaging reports
- no engine core API files

## Acceptance Criteria
1. Asteroids demo validates successfully with vector-led assets.
2. Packaging succeeds with vector assets included deterministically.
3. Runtime reaches ready state with vector assets as the preferred visual path.
4. Gameplay loop remains intact: title, start, play, score, lives, waves, game-over, restart.
5. Debug and profiler surfaces show vector asset participation.
6. No engine core APIs are changed.

## Manual Validation Checklist
1. Ship renders through vector asset path.
2. Asteroids render through vector asset path.
3. Rotation and scale feel correct for vector-led visuals.
4. Validation passes with no blocking findings.
5. Packaging includes migrated vector assets.
6. Runtime loader reaches ready state.
7. Debug graph reflects vector nodes/edges.
8. Profiler captures vector participation deterministically.
9. No engine core APIs are changed.

## Approved Commit Comment
plan(demo): define vector migration for flagship asteroids demo

## Next Command
BUILD_PR_ASTEROIDS_VECTOR_MIGRATION
