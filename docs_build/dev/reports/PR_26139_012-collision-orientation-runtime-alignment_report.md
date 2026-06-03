# PR_26139_012-collision-orientation-runtime-alignment

## Scope
- Added `src/engine/rendering/OrientationTransform.js` beside the shared world/screen scale helper.
- Routed Object Vector runtime shape transforms, SVG transform output, shared collision geometry, Collision Inspector V2 heading guides, and Object Vector Studio V2 preview point transforms through the shared orientation helper.
- Kept Asteroids runtime heading as radians and made Asteroids object render calls explicit with `rotationUnit: 'radians'`.
- Kept Collision Inspector V2 rotate controls in degrees and made inspector instances explicit with `rotationUnit: "degrees"`.
- Preserved manifest geometry as the SSoT, intentional asteroid scale tuning, and ship flame flicker behavior.

## Orientation Contract
- Runtime object instance rotation uses radians unless a caller explicitly provides `rotationUnit`.
- Manifest shape transforms remain degrees.
- Collision Inspector V2 UI rotation remains degrees, then converts through the shared helper before collision/heading rendering.
- Object Vector Studio V2 remains an editor surface; its preview shape transforms call the same helper for SVG transforms, point transforms, inverse point transforms, origin normalization, and rotation normalization.
- Object instance `x/y` remains the Asteroids runtime source-of-truth world position for the object's local coordinate origin. Manifest `objectOrigin` is transformed through the same runtime orientation path for diagnostics and inspector origin markers.

## Validation
- PASS: `node --check src/engine/rendering/OrientationTransform.js`
- PASS: `node --check src/engine/rendering/WorldScreenTransform.js`
- PASS: `node --check src/engine/rendering/ObjectVectorRuntimeAssetService.js`
- PASS: `node --check src/engine/collision/objectVector.js`
- PASS: `node --check toolbox/collision-inspector-v2/js/CollisionInspectorV2App.js`
- PASS: `node --check toolbox/collision-inspector-v2/js/CollisionInspectorV2Controls.js`
- PASS: `node --check toolbox/collision-inspector-v2/js/CollisionInspectorV2Renderer.js`
- PASS: `node --check toolbox/object-vector-studio-v2/js/ToolStarterApp.js`
- PASS: `node --check games/Asteroids/game/AsteroidsGameScene.js`
- PASS: `node --check games/Asteroids/game/AsteroidsAttractAdapter.js`
- PASS: `node --check games/Asteroids/entities/Ufo.js`
- PASS: `node --check tests/games/AsteroidsPresentation.test.mjs`
- PASS: `node --check tests/playwright/tools/CollisionInspectorV2.spec.mjs`
- PASS: `node --input-type=module -e "import('./tests/games/AsteroidsPresentation.test.mjs').then((module) => module.run())"`
  - Validates Asteroids gameplay, attract, UFO, ship, asteroid, and bullet render calls use manifest object IDs and the runtime radians convention.
- PASS: `node --input-type=module -e "import('./tests/final/PrecisionCollisionSystems.test.mjs').then((module) => module.run())"`
  - Validates shared collision transform behavior still matches existing radians expectations.
- PASS: `npx playwright test tests/playwright/tools/CollisionInspectorV2.spec.mjs --project=playwright --workers=1 --reporter=list`
  - `4 passed`
  - Validates Collision Inspector V2 layout and shared collision path.
  - Validates runtime render bounds and shared collision bounds align for ship, asteroid, UFO, and bullet orientation samples.
  - Validates bullet transformed points differ at `0`, `90`, `180`, and `270` degree headings while resolving through the same runtime/collision helper.
  - Validates inspector heading guides use explicit rotation units.
  - Validates Object Vector Studio V2 preview transforms match the shared orientation helper.
- PASS: `npm run build:manifest`
  - Available repo build script wrote `docs/build/sample-manifest.json`; generated output was removed after validation.
- PASS: `git diff --check`
  - Only existing line-ending conversion warnings were reported.
- PASS: Playwright V8 coverage report generated at `docs_build/dev/reports/playwright_v8_coverage_report.txt`.

## Full Samples Smoke Test
- Skipped. This PR is limited to shared orientation/runtime alignment and targeted Collision Inspector V2, Object Vector Studio V2, and Asteroids orientation validation.

## Manual Test Notes
- Open `toolbox/collision-inspector-v2/index.html?manifestPath=/games/Asteroids/game.manifest.json`.
- Select ship, bullet, asteroid, and UFO objects and rotate A/B; expected result is heading guides, origins, transformed points, and collision results updating consistently.
- Launch `games/Asteroids/index.html`, fire bullets at several ship headings, and verify bullet render direction and collision behavior track the ship heading.
- Open Object Vector Studio V2 and rotate/edit object geometry; expected result is unchanged editor zoom behavior with preview transforms matching runtime/collision orientation math.
