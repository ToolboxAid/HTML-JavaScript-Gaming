# PR_26133_120-object-vector-shapes-ssoT-cleanup

## Summary
- Renamed the Object Vector Studio V2 manifest map collection from `vectorMaps.vectors` to `vectorMaps.shapes`.
- Removed the active vector-map entry contract that allowed separate `points` and `paths` geometry under `vectorMaps`.
- Kept `objects[].shapes[]` as the single active Asteroids object geometry source for runtime rendering and collision geometry.

## Manifest Cleanup Decisions
- `vectorMaps.vectors` was removed from `games/Asteroids/game.manifest.json`; the document now contains `vectorMaps.shapes`.
- `vectorMaps.shapes` is intentionally empty for Asteroids because the active object geometry lives in `objects[].shapes[]`.
- `vector.asteroids.bullet` was converted into `object.asteroids.bullet` with polygon geometry in `objects[]`.
- The bullet role was added to `vectorMaps.objectVectorRoles` so gameplay render and collision lookup use the same manifest object geometry.
- `vector.asteroids.ui.title` was removed from Object Vector Studio V2 ownership because the Asteroids title is rendered by UI text drawing, not object geometry.
- The `paths[]` vector-map style was removed from the Object Vector Studio V2 schema contract.
- The legacy `vectors.points` vector-map style was removed from the active contract; point geometry now appears only inside Object Vector shape geometry.
- Asteroids manifest map metadata was renamed from `html-js-gaming.asteroids-vector-map` to `html-js-gaming.asteroids-object-vector-shapes`.

## Runtime Cleanup
- Bullet rendering now uses `drawObjectVectorAsset` with the manifest role `bullet`.
- Bullet collision geometry now loads through `requireAsteroidsObjectVectorPoints`.
- Attract screen IDs now resolve through `ASTEROIDS_OBJECT_VECTOR_IDS`.
- Removed runtime hardcoded vector-map lookup helpers and render diagnostics for `vector.asteroids.*`.
- Required Asteroids manifest geometry must resolve through `object-vector-studio-v2.objects`; missing required geometry returns actionable loader errors.

## Validation
- Playwright impacted: Yes, because manifest loading and Object Vector runtime paths changed.
- PASS `node --check` for changed Asteroids runtime files and targeted test files.
- PASS Asteroids manifest JSON parse.
- PASS Object Vector Studio V2 schema JSON parse.
- PASS targeted Asteroids manifest-load and missing-geometry validation.
- PASS targeted Object Vector Studio V2 schema/runtime manifest-load validation.
- PASS `node -e "import('./tests/tools/ObjectVectorStudioV2DeleteCleanup.test.mjs').then(async (m) => { await m.run(); console.log('PASS ObjectVectorStudioV2DeleteCleanup'); })"`
- PASS `node -e "import('./tests/games/AsteroidsValidation.test.mjs').then(async (m) => { await m.run(); console.log('PASS AsteroidsValidation'); })"`
- PASS `node -e "import('./tests/games/AsteroidsVectorTransforms.test.mjs').then(async (m) => { await m.run(); console.log('PASS AsteroidsVectorTransforms'); })"`
- PASS `node -e "import('./tests/games/AsteroidsAssetReferenceAdoption.test.mjs').then(async (m) => { await m.run(); console.log('PASS AsteroidsAssetReferenceAdoption'); })"`
- PASS `node -e "import('./tests/games/AsteroidsPlatformDemo.test.mjs').then(async (m) => { await m.run(); console.log('PASS AsteroidsPlatformDemo'); })"`
- PASS `node -e "import('./tests/games/AsteroidsPresentation.test.mjs').then(async (m) => { await m.run(); console.log('PASS AsteroidsPresentation'); })"`
- PASS `git diff --check`

## Skipped
- Full regression/full samples smoke test skipped per PR instructions.
- `npm run test:workspace-v2` was not run because this PR requested targeted Asteroids/Object Vector validation only.

## Artifacts
- Review diff: `docs/dev/reports/codex_review.diff`
- Changed files report: `docs/dev/reports/codex_changed_files.txt`
- Delta ZIP: `tmp/PR_26133_120-object-vector-shapes-ssoT-cleanup_delta.zip`
