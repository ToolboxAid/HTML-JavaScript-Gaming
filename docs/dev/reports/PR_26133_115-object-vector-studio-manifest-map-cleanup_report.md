# PR_26133_115 Object Vector Studio Manifest Map Cleanup Report

## Summary
- Read `docs/dev/PROJECT_INSTRUCTIONS.md` before implementation.
- Used the current `PR_26133_114` workspace delta and `tmp/PR_26133_114-asteroids-manifest-geometry-completion_delta.zip` as the prior reference.
- Moved Asteroids restored vector maps from `tools.vector-map-editor.vectorMapDocument` to `tools.object-vector-studio-v2.vectorMaps`.
- Removed the separate `vector.asteroids.attract.*` map entries from the Asteroids manifest.
- Updated `ASTEROIDS_VECTOR_MAP_IDS.attractAsteroid`, `attractShip`, and `attractUfo` to resolve to `object.asteroids.large-asteroid`, `object.asteroids.ship`, and `object.asteroids.large-ufo`.
- Kept runtime vector-map loading manifest-only, with missing required vector maps or required Object Vector maps reported as actionable validation failures.
- Marked `vector-map-editor` schema as deprecated and pointed future game-owned vector-map work to `object-vector-studio-v2.vectorMaps`.

## Changed Files
- `games/Asteroids/game.manifest.json`
- `games/Asteroids/game/AsteroidsAttractAdapter.js`
- `games/Asteroids/game/AsteroidsGameScene.js`
- `games/Asteroids/game/asteroidsVectorMaps.js`
- `tests/games/AsteroidsAssetReferenceAdoption.test.mjs`
- `tests/games/AsteroidsPlatformDemo.test.mjs`
- `tests/games/AsteroidsPresentation.test.mjs`
- `tests/games/AsteroidsValidation.test.mjs`
- `tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- `tools/schemas/game.manifest.schema.json`
- `tools/schemas/tools/object-vector-studio-v2.schema.json`
- `tools/schemas/tools/vector-map-editor.schema.json`
- `docs/dev/reports/PR_26133_115-object-vector-studio-manifest-map-cleanup_report.md`

## Validation
- PASS: `node --check games/Asteroids/game/asteroidsVectorMaps.js`
- PASS: `node --check games/Asteroids/game/AsteroidsAttractAdapter.js`
- PASS: `node --check games/Asteroids/game/AsteroidsGameScene.js`
- PASS: JSON parse validation for Asteroids manifest and impacted schemas.
- PASS: targeted Asteroids manifest vector-map validation confirmed:
  - `tools.vector-map-editor` is absent from `games/Asteroids/game.manifest.json`.
  - restored vector maps live under `tools.object-vector-studio-v2.vectorMaps`.
  - `vector.asteroids.attract.ship`, `vector.asteroids.attract.asteroid`, and `vector.asteroids.attract.ufo` are absent.
  - attract constants resolve to the exact Object Vector map IDs requested.
- PASS: targeted Object Vector runtime loader validation accepted the migrated Asteroids payload and resolved the three attract Object Vector IDs.
- PASS: targeted Object Vector Studio schema validation accepted the migrated Asteroids payload.
- PASS: targeted Asteroids tests:
  - `AsteroidsValidation`
  - `AsteroidsPresentation`
  - `AsteroidsVectorTransforms`
  - `AsteroidsAssetReferenceAdoption`
  - `AsteroidsPlatformDemo`
  - `AsteroidsHardening`
  - `AsteroidsCollisionTimingStress`
- PASS: targeted Playwright impacted tool validation:
  - `loads Object Vector Studio V2 runtime assets into Asteroids gameplay rendering`
  - `uses header lifecycle controls and launches tools from fixed Workspace Manager V2 tiles`
- PASS: `git diff --check` (line-ending warnings only)

## Skipped
- Skipped `npm run test:workspace-v2` by request; current BUILD requested targeted Asteroids and impacted tool validation only.
- Skipped full samples smoke test by request.

## Expected Behavior
- Asteroids loads restored vector maps only from `tools.object-vector-studio-v2.vectorMaps`.
- Attract Ship, Asteroid, and UFO rendering use manifest-owned Object Vector objects instead of duplicate attract vector maps.
- Missing `vector.asteroids.bullet` or a required attract Object Vector map fails validation with the missing ID named.
- Workspace Manager V2 and Object Vector Studio V2 no longer select `vector-map-editor` for current Asteroids restored vector maps.

## ZIP
- Output path: `tmp/PR_26133_115-object-vector-studio-manifest-map-cleanup_delta.zip`
