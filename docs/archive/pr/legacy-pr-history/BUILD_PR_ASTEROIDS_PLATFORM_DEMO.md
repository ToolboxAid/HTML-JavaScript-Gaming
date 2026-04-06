# BUILD_PR_ASTEROIDS_PLATFORM_DEMO

## Purpose
Implement the flagship Asteroids-style demo defined in PLAN_PR_ASTEROIDS_PLATFORM_DEMO.

## Build Scope
- create the gameplay slice for ship, bullets, asteroids, score, lives, and wave progression
- integrate demo assets through registry-owned and validated platform paths
- ensure packaging and runtime loader compatibility
- provide demo-oriented debug/profiler visibility where already supported
- keep demo structure reusable as a future template candidate
- avoid engine core API changes

## Required Contracts
- Use accepted platform boundaries only
- Keep content registry-owned and validation-compatible
- Package via strict packaging pipeline
- Run via strict runtime loader
- Preserve deterministic behavior where practical
- Keep reports readable and stable
- Do not modify engine core APIs

## Likely Files
- demo/game-specific content and configuration files
- asset registration/project files
- packaged runtime entry/bootstrap files for the demo
- docs/dev reports
- no engine core API files

## Implemented Files
- `tools/shared/asteroidsPlatformDemo.js`
- `tests/games/AsteroidsPlatformDemo.test.mjs`
- `games/Asteroids/platform/assets/palettes/asteroids-hud.palette.json`
- `games/Asteroids/platform/assets/sprites/asteroids-demo.sprite.json`
- `games/Asteroids/platform/assets/tilesets/asteroids-ui.tileset.json`
- `games/Asteroids/platform/assets/tilemaps/asteroids-stage.tilemap.json`
- `games/Asteroids/platform/assets/parallax/asteroids-title.parallax.json`
- `games/Asteroids/platform/assets/parallax/asteroids-overlay.parallax.json`

## Build Notes
- Reused the accepted `games/Asteroids` runtime entry at `games/Asteroids/main.js` as the packaged runtime handoff target.
- Added a deterministic demo definition that keeps the registry as the source of truth for sprite, tileset, tilemap, image, and parallax ownership.
- Ran the demo through validation, remediation availability, strict packaging, strict runtime loading, gameplay binding, template evaluation, multi-target export, publishing, debug visualization, and profiler reporting without changing engine core APIs.
- Kept the content paths project-relative and validation-compatible so the demo remains reusable as a future template candidate.

## Verification
- `node --check tools/shared/asteroidsPlatformDemo.js`
- `node --check tests/games/AsteroidsPlatformDemo.test.mjs`
- `node ./scripts/run-node-tests.mjs`
- Result: `106/106` explicit `run()` tests passed.

## Manual Validation Checklist
1. Playable demo loop works end-to-end.
2. Validation passes on demo content.
3. Packaging succeeds on demo project.
4. Runtime loader reaches ready state for packaged demo.
5. Core controls and gameplay loop behave consistently.
6. Score/lives/waves behave correctly.
7. Debug/profiler surfaces can inspect demo state where applicable.
8. No engine core APIs are changed.

## Approved Commit Comment
build(demo): add flagship asteroids platform demo

## Next Command
APPLY_PR_ASTEROIDS_PLATFORM_DEMO
