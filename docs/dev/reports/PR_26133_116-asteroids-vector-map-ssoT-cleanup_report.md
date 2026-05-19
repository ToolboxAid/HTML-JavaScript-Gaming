# PR_26133_116 Asteroids Vector Map SSoT Cleanup Report

## Summary
- Read `docs/dev/PROJECT_INSTRUCTIONS.md` before implementation.
- Used PR_26133_115 as the prior reference from committed `HEAD` (`1d22d12c7`) and `docs/dev/reports/PR_26133_115-object-vector-studio-manifest-map-cleanup_report.md`; the local PR115 delta ZIP was not present under `tmp/`.
- Replaced collision-suffixed Asteroids vector map IDs with unsuffixed manifest-owned IDs:
  - `vector.asteroids.ship`
  - `vector.asteroids.ufo.large`
  - `vector.asteroids.ufo.small`
- Removed `ASTEROIDS_REQUIRED_OBJECT_VECTOR_MAP_IDS`; `ASTEROIDS_REQUIRED_VECTOR_MAP_IDS` is now the single required-ID validation list for manifest vector entries and required Object Vector object IDs.
- Restored older Asteroids vector geometry from git history:
  - ship path/points from pre-Object-Vector manifest vector data (`3fc7bbce7`)
  - UFO polylines and Bullet square geometry from the original Asteroids runtime (`31ca1521e`)
- Removed the active workspace manifest schema `$ref` to `vector-map-editor.schema.json`; the deprecated schema remains only as historical metadata.

## Changed Files
- `games/Asteroids/game.manifest.json`
- `games/Asteroids/game/AsteroidsGameScene.js`
- `games/Asteroids/game/AsteroidsWorld.js`
- `games/Asteroids/game/asteroidsVectorMaps.js`
- `tests/games/AsteroidsAssetReferenceAdoption.test.mjs`
- `tests/games/AsteroidsPlatformDemo.test.mjs`
- `tests/games/AsteroidsValidation.test.mjs`
- `tests/games/AsteroidsVectorTransforms.test.mjs`
- `tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- `tests/tools/ToolWorkspaceSchemaManifestBoundaries.test.mjs`
- `tools/schemas/tools/README.md`
- `tools/schemas/workspace.manifest.schema.json`
- `docs/dev/reports/PR_26133_116-asteroids-vector-map-ssoT-cleanup_report.md`

## Validation
- PASS: `node --check games/Asteroids/game/asteroidsVectorMaps.js`
- PASS: `node --check games/Asteroids/game/AsteroidsWorld.js`
- PASS: `node --check games/Asteroids/game/AsteroidsGameScene.js`
- PASS: syntax checks for changed targeted test files.
- PASS: JSON parse validation for Asteroids manifest and impacted schemas.
- PASS: targeted Asteroids required vector map SSoT validation confirmed all `ASTEROIDS_REQUIRED_VECTOR_MAP_IDS` resolve and collision-suffixed IDs are absent.
- PASS: targeted Asteroids tests:
  - `AsteroidsValidation`
  - `AsteroidsVectorTransforms`
  - `AsteroidsAssetReferenceAdoption`
  - `AsteroidsPlatformDemo`
  - `AsteroidsPresentation`
  - `AsteroidsHardening`
  - `AsteroidsCollisionTimingStress`
- PASS: targeted Object Vector runtime loader validation accepted the migrated Asteroids payload.
- PASS: targeted Object Vector Studio schema validation accepted the migrated Asteroids payload.
- PASS: targeted workspace schema audit confirmed `tools/schemas/workspace.manifest.schema.json` no longer allows `vector-map-editor`.
- PASS: targeted Playwright impacted tool validation:
  - `loads Object Vector Studio V2 runtime assets into Asteroids gameplay rendering`
  - `uses header lifecycle controls and launches tools from fixed Workspace Manager V2 tiles`
- PASS: `git diff --check` (line-ending warnings only)
- WARN: attempted non-targeted `ToolWorkspaceSchemaManifestBoundaries` execution fails on an unrelated stale Palette Manager assertion; the schema file itself still passes syntax/JSON and targeted vector-map-editor reference checks.

## Skipped
- Skipped `npm run test:workspace-v2` by request; this PR requested targeted Asteroids and impacted tool validation only.
- Skipped full samples smoke test by request.

## Expected Behavior
- Asteroids vector map runtime loading uses manifest data only.
- Required manifest IDs resolve from `ASTEROIDS_REQUIRED_VECTOR_MAP_IDS`.
- `vector.asteroids.ship.collision`, `vector.asteroids.ship.life`, `vector.asteroids.ufo.large.collision`, and `vector.asteroids.ufo.small.collision` are no longer active Asteroids vector map IDs.
- Missing required manifest vector entries or required Object Vector objects fail validation with the missing ID named.
- Current workspace schemas do not actively depend on `vector-map-editor.schema.json`.

## ZIP
- Output path: `tmp/PR_26133_116-asteroids-vector-map-ssoT-cleanup_delta.zip`
