# PR_26133_117 Asteroids Older Vector Geometry Restore Report

## Summary
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before implementation.
- Used PR_26133_116 as the prior reference from committed `HEAD` (`830a4b6ef`) and `docs_build/dev/reports/PR_26133_116-asteroids-vector-map-ssoT-cleanup_report.md`; the local PR116 delta ZIP was not present under `tmp/`.
- Searched farther back before Object Vector V2 work:
  - original Asteroids runtime geometry in `055a629ab`, `fe340bde3`, and `31ca1521e`
  - pre-Object-Vector manifest vector map geometry in `3fc7bbce7`
  - Object Vector V2 migration boundary in `9d81680fd` and `526dbdf9f`
- Restored manifest-owned vector map geometry only:
  - `vector.asteroids.ship` now uses the older right-facing runtime ship points.
  - `vector.asteroids.asteroid.medium` was restored from the older manifest vector path.
  - `vector.asteroids.asteroid.small` was restored from the older manifest vector path.
  - `vector.asteroids.ufo.large` and `vector.asteroids.ufo.small` were verified against the older runtime UFO polylines and left unchanged.
- Kept Asteroids runtime loading manifest-only; no runtime fallback/default vector maps or hardcoded map constants were added.
- Preserved the manifest cleanup that was already dirty at the start of PR117: the current ship Object Vector hull point and removal of the duplicate `object.asteroids.medium-asteroid-2`.

## Changed Files
- `games/Asteroids/game.manifest.json`
- `tests/games/AsteroidsAssetReferenceAdoption.test.mjs`
- `tests/games/AsteroidsValidation.test.mjs`
- `tests/games/AsteroidsVectorTransforms.test.mjs`
- `docs_build/dev/reports/PR_26133_117-asteroids-older-vector-geometry-restore_report.md`

## Validation
- PASS: syntax checks for changed targeted Asteroids test files.
- PASS: Asteroids manifest JSON parse.
- PASS: targeted manifest load and restored vector geometry validation for ship, medium asteroid, small asteroid, large UFO, and small UFO.
- PASS: targeted required vector map resolution and missing required map failure validation.
- PASS: targeted Asteroids tests:
  - `AsteroidsValidation`
  - `AsteroidsVectorTransforms`
  - `AsteroidsAssetReferenceAdoption`
  - `AsteroidsPlatformDemo`
  - `AsteroidsPresentation`
  - `AsteroidsHardening`
  - `AsteroidsCollisionTimingStress`
- PASS: targeted scan found no active Asteroids runtime fallback/default vector maps or collision-suffixed manifest vector IDs; remaining matches are test-only simulated duplicate objects and generic non-vector fallback helpers.
- PASS: `git diff --check` (line-ending warnings only).

## Skipped
- Skipped `npm run test:workspace-v2` by request; this PR requested targeted Asteroids validation only.
- Skipped full regression and full samples smoke test by request.

## Manual Validation
1. Open the Asteroids workspace/game manifest and confirm `tools.object-vector-studio-v2.vectorMaps.vectors` contains `vector.asteroids.ship`, `vector.asteroids.asteroid.medium`, `vector.asteroids.asteroid.small`, `vector.asteroids.ufo.large`, and `vector.asteroids.ufo.small`.
2. Confirm the ship map points are `[14,0]`, `[-10,-8]`, `[-6,-3]`, `[-6,3]`, `[-10,8]`, `[14,0]`.
3. Confirm the medium and small asteroid vector map paths/points match the restored older manifest geometry.
4. Confirm removing a required manifest vector map, such as `vector.asteroids.ship`, produces an actionable validation failure naming the missing ID.

## ZIP
- Output path: `tmp/PR_26133_117-asteroids-older-vector-geometry-restore_delta.zip`
