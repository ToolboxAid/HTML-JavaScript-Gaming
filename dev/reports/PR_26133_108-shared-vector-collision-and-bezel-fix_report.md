# PR_26133_108-shared-vector-collision-and-bezel-fix

## Summary
- Promoted concave vector polygon collision accuracy into the shared `arePolygonsColliding` engine path.
- Removed the duplicated Asteroids-only vector collision helpers so Asteroids bullet, UFO, ship, and asteroid polygon collisions all use the shared collision path.
- Hardened fullscreen bezel image attachment so the overlay is tracked before loading and syncs visible immediately after image readiness in normal and fullscreen modes.
- Added targeted shared collision, Asteroids collision, and Asteroids bezel assertions.

## Scope Notes
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before implementation.
- Used the PR_26133_107 report/current baseline as prior reference; `tmp/PR_26133_107-asteroids-bezel-collision-fixes_delta.zip` was not present in this workspace.
- Scope stayed limited to shared vector collision accuracy and bezel visibility.
- No sample JSON, `start_of_day`, workspace manifest/schema contracts, or `imageDataUrl` contracts were changed.

## Playwright Impact
- Playwright impacted: Yes.
- Validated Asteroids normal-page bezel display, fullscreen bezel display, fullscreen transparent-window canvas fit, and Object Vector Asteroids runtime rendering.
- Expected pass behavior: the actual bezel image is mounted, `display:block`, and sized in both normal page window mode and fullscreen mode; shared vector collision detects concave edge overlaps and avoids concave notch false positives.
- Expected fail behavior: tests fail if the bezel is fullscreen-only, the overlay image is not visibly mounted, fullscreen canvas fit regresses, or vector polygon collision falls back to convex-only SAT behavior.

## Validation Results
- PASS `node --check src/engine/collision/polygon.js`
- PASS `node --check games/Asteroids/game/AsteroidsWorld.js`
- PASS `node --check src/engine/runtime/fullscreenBezel.js`
- PASS `node --check tests/final/PrecisionCollisionSystems.test.mjs`
- PASS `node --check tests/games/AsteroidsCollisionTimingStress.test.mjs`
- PASS `node --input-type=module -e "import { run } from './tests/final/PrecisionCollisionSystems.test.mjs'; run();"`
- PASS `node --input-type=module -e "import { run } from './tests/games/AsteroidsCollisionTimingStress.test.mjs'; run();"`
- PASS `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --grep "fits the game canvas inside the fullscreen play area|loads Object Vector Studio V2 runtime assets into Asteroids gameplay rendering" --project=playwright --workers=1 --reporter=list` (2 passed)
- PASS `npm run test:workspace-v2` (56 passed)
- PASS `git diff --check`
- PASS Playwright V8 coverage report generated at `docs_build/dev/reports/playwright_v8_coverage_report.txt`.
  - `(57%) games/Asteroids/game/AsteroidsWorld.js - changed JS file with browser V8 coverage`
  - `(88%) src/engine/runtime/fullscreenBezel.js - changed JS file with browser V8 coverage`
  - `(91%) src/engine/collision/polygon.js - changed JS file with browser V8 coverage`

## Manual Validation
1. Open `/games/Asteroids/index.html`.
2. Confirm the bezel is visible around the canvas before entering fullscreen.
3. Click the canvas to enter fullscreen and confirm the bezel remains visible and the canvas fits inside the transparent bezel window.
4. Start a game and verify slow or stationary ship overlap with the visible large-asteroid vector edge destroys the ship.
5. Verify bullets and UFOs do not trigger hits while sitting in the concave empty notch of the visible large asteroid.

## Full Samples Smoke
- Skipped as requested.
- Reason: this PR is limited to shared vector collision behavior, Asteroids collision/bezel validation, and does not modify shared sample loading, sample JSON, or broad sample runtime behavior.
