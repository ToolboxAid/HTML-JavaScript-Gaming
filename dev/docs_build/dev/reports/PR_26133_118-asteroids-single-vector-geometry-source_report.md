# PR_26133_118-asteroids-single-vector-geometry-source Report

## Scope
- Fixed duplicate/ambiguous Asteroids vector geometry by using Object Vector Studio V2 object geometry as the single active geometry source for ship, medium asteroid, small asteroid, large UFO, and small UFO.
- Removed conflicting legacy vector-map geometry entries from the Asteroids manifest.
- Kept bullet/title vector maps because they do not duplicate Object Vector object geometry in this PR.
- Did not restore old runtime code and did not add fallback/default vector maps.

## Duplicate Geometry Removed
- `vector.asteroids.ship`
- `vector.asteroids.asteroid.medium`
- `vector.asteroids.asteroid.small`
- `vector.asteroids.ufo.large`
- `vector.asteroids.ufo.small`

## Runtime Lookup Path
- Before: `AsteroidsWorld` loaded ship and UFO collision geometry through `vectorMaps.vectorsById` and `requireAsteroidsVectorPoints(...)`; `AsteroidsGameScene.drawLives()` rendered lives from `vector.asteroids.ship`.
- Before: Asteroid collision/render geometry already used manifest Object Vector objects through role bindings and geometry profiles.
- After: `AsteroidsWorld` loads ship and UFO collision geometry through `objectVectorRoles -> objectVectorMapsById -> Object Vector object geometry`.
- After: `AsteroidsGameScene.drawLives()` renders the ship life icon through `drawObjectVectorAsset(...)` using the manifest `ship` role.
- After: required role-bound object geometry is validated during manifest load and fails with a named Object Vector role/object error when missing or empty.

## Git Commits Checked
- `31ca1521eaa26473d5133794324ac9a5d5971615` - original Asteroids runtime ship/UFO vector geometry.
- `3fc7bbce7d6375c8e396b8107c1351bb8f39e216` - pre-Object-Vector manifest asteroid vector-map geometry.
- `9d81680fd08b99ee70567d1d86fb655ac3ee96eb` - Object Vector Studio V2 Asteroids asset introduction boundary.
- `526dbdf9f53a67cfb27026f40119f71fc1ac02b6` - prior Object Vector geometry SSoT runtime migration boundary.
- `eb7c9e744183e3140882888e42e4830022bda37e` - PR117 prior delta baseline.

## Selected Source Commits
- Ship: `31ca1521eaa26473d5133794324ac9a5d5971615`, `games/Asteroids/entities/Ship.js`, `SMALL_VECTOR_MAP`.
- Large UFO: `31ca1521eaa26473d5133794324ac9a5d5971615`, `games/Asteroids/entities/Ufo.js`, `VECTOR_MAPS.large`.
- Small UFO: `31ca1521eaa26473d5133794324ac9a5d5971615`, `games/Asteroids/entities/Ufo.js`, `VECTOR_MAPS.small`.
- Medium asteroid: `3fc7bbce7d6375c8e396b8107c1351bb8f39e216`, `games/Asteroids/game.manifest.json`, `vector.asteroids.asteroid.medium`.
- Small asteroid: `3fc7bbce7d6375c8e396b8107c1351bb8f39e216`, `games/Asteroids/game.manifest.json`, `vector.asteroids.asteroid.small`.

## Changed Files
- `games/Asteroids/game.manifest.json`
- `games/Asteroids/game/AsteroidsAttractAdapter.js`
- `games/Asteroids/game/AsteroidsGameScene.js`
- `games/Asteroids/game/AsteroidsWorld.js`
- `games/Asteroids/game/asteroidsVectorMaps.js`
- `tests/games/AsteroidsAssetReferenceAdoption.test.mjs`
- `tests/games/AsteroidsPlatformDemo.test.mjs`
- `tests/games/AsteroidsValidation.test.mjs`
- `tests/games/AsteroidsVectorTransforms.test.mjs`

## Validation
- PASS: `node --check games/Asteroids/game/asteroidsVectorMaps.js`
- PASS: `node --check games/Asteroids/game/AsteroidsWorld.js`
- PASS: `node --check games/Asteroids/game/AsteroidsGameScene.js`
- PASS: `node --check games/Asteroids/game/AsteroidsAttractAdapter.js`
- PASS: `node --check tests/games/AsteroidsValidation.test.mjs`
- PASS: `node --check tests/games/AsteroidsVectorTransforms.test.mjs`
- PASS: `node --check tests/games/AsteroidsAssetReferenceAdoption.test.mjs`
- PASS: `node --check tests/games/AsteroidsPlatformDemo.test.mjs`
- PASS: targeted Asteroids manifest single-geometry validation:
  - manifest loads successfully
  - five duplicate legacy vector IDs are absent
  - ship, medium asteroid, small asteroid, large UFO, and small UFO resolve through Object Vector role/object geometry
  - all five restored objects render through `ObjectVectorRuntimeAssetService.createSvgString(...)`
  - missing small UFO object geometry fails with a role/object-specific manifest error
  - empty ship geometry fails with an actionable minimum-point manifest error
- PASS: `node -e "import('./tests/games/AsteroidsValidation.test.mjs').then(async (m) => { await m.run(); console.log('PASS AsteroidsValidation'); })"`
- PASS: `node -e "import('./tests/games/AsteroidsVectorTransforms.test.mjs').then(async (m) => { await m.run(); console.log('PASS AsteroidsVectorTransforms'); })"`
- PASS: `node -e "import('./tests/games/AsteroidsAssetReferenceAdoption.test.mjs').then(async (m) => { await m.run(); console.log('PASS AsteroidsAssetReferenceAdoption'); })"`
- PASS: `node -e "import('./tests/games/AsteroidsPlatformDemo.test.mjs').then(async (m) => { await m.run(); console.log('PASS AsteroidsPlatformDemo'); })"`
- PASS: `git diff --check` with line-ending warnings only.

## Skipped Validation
- Skipped `npm run test:workspace-v2` because PR118 requested targeted Asteroids manifest-load validation only.
- Skipped full regression and full samples smoke tests as requested.
- Playwright impacted: No Workspace V2/tool UI was changed; this PR is Asteroids manifest/runtime lookup wiring.
- Playwright V8 coverage was not produced because the requested validation was limited to targeted Asteroids manifest-load validation.

## Manual Validation
- Open Asteroids through the usual game entry after applying the delta.
- Start gameplay and verify the ship, medium asteroid, small asteroid, large UFO, and small UFO appear with the restored vector silhouettes.
- Verify ship lives render as ship icons and gameplay continues without missing vector-map fallback errors.
- Intentionally remove a required Object Vector object from `games/Asteroids/game.manifest.json` in a throwaway copy and confirm Asteroids manifest loading reports the missing role/object path.

