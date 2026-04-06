# PLAN_PR_ASTEROIDS_PLATFORM_DEMO

## Goal
Define a flagship demo game that proves the full platform end-to-end by building an Asteroids-style game
using the accepted ecosystem baseline without bypassing platform contracts.

## Why This Demo Exists
The platform is now complete enough to support a real product-style demonstration. This PR defines a
single, focused game that exercises authoring, validation, remediation, packaging, runtime, streaming,
profiling, publishing, and ecosystem features in one coherent experience.

## Demo Intent
This is a flagship demo, not a throwaway sample.
It should feel like a real game slice while staying small enough to build and validate surgically.

## Core Demo Pillars
- classic Asteroids-inspired gameplay
- registry-owned assets
- validated content pipeline
- strict packaging and runtime loading
- optional debug/profiler views
- publishable output
- reusable template value for future games

## Scope
- player ship, thrust, rotation, shooting
- asteroid spawning, splitting, and destruction
- score and lives
- wave progression
- title/start/game-over loop
- asset registration for sprites, palettes, tiles where applicable
- packaging/runtime compatibility
- validation scenarios and baseline demo reports
- debug/profiler hooks where already supported by platform baseline

## Non-Goals
- No engine core API changes
- No uncontrolled gameplay framework redesign
- No multiplayer requirement
- No marketplace dependency for first playable slice
- No bypass of validation, packaging, runtime, or CI boundaries

## Platform Mapping
### Authoring
- Sprite Editor provides ship, asteroid, bullet, UI, and effects assets
- Tile/Parallax tooling may provide background or UI framing where useful
- AI authoring may be used only through approved, auditable assistant paths

### Core Pipeline
- registry owns assets
- dependency graph tracks relationships
- validation enforces correctness
- remediation resolves issues
- packaging produces deterministic output
- runtime loader consumes packaged demo output

### Expansion Systems
- profiler can measure runtime hotspots
- debug visualization can expose dependencies and runtime state
- hot reload can accelerate gameplay tuning where already supported
- publishing pipeline can produce playable demo distribution artifact

## Likely Content Model
- ship sprite set
- asteroid sprite variants
- bullet sprite/effect assets
- title/game-over UI assets
- gameplay config/state documents
- packaged runtime bootstrap entry for demo

## Acceptance Criteria
1. Demo can be authored entirely within accepted platform boundaries.
2. Demo validates successfully under enforced validation rules.
3. Demo packages successfully with deterministic outputs.
4. Demo runtime reaches ready state and plays end-to-end.
5. Core gameplay loop is complete enough for a public-facing demo.
6. Debug/profiler surfaces can observe demo state where applicable.
7. No engine core APIs are changed.

## Manual Validation Checklist
1. Title screen loads.
2. Start flow enters gameplay.
3. Ship rotates, thrusts, and fires.
4. Asteroids spawn and split correctly.
5. Score and lives update correctly.
6. Game-over flow returns to title or restart path.
7. Demo validates, packages, and runs through strict platform flow.
8. Reports remain readable and stable.
9. No engine core APIs are changed.

## Next Command
BUILD_PR_ASTEROIDS_PLATFORM_DEMO
