# PR_26132_015-object-vector-runtime-integration

## Scope

Integrates Object Vector Studio V2 durable object assets into runtime rendering and Asteroids gameplay only. The change stays within Object Vector Studio V2 runtime preview, Asteroids object rendering, the shared Object Vector runtime asset service, and targeted Workspace V2 Playwright coverage.

## Changes

- Added `ObjectVectorRuntimeAssetService` for runtime Object Vector Studio V2 asset validation, caching, state/frame resolution, Canvas rendering, and SVG preview generation.
- Exported the runtime asset service from `src/engine/rendering/index.js`.
- Loaded Asteroids Object Vector Studio V2 manifest payloads through the runtime asset service.
- Rendered the Asteroids ship, asteroids, and UFOs through Object Vector Studio V2 runtime assets.
- Added Asteroids object states/frames for ship idle/thrust and active asteroid/UFO assets.
- Added runtime diagnostics for asset load results, cache state, render attempts, and state/frame playback events.
- Added actionable FAIL logging when runtime asset validation or rendering blocks gameplay rendering.
- Added Object Vector Studio V2 runtime preview action for the selected object/state/frame.
- Preserved palette as workspace/session runtime input and kept palette data out of Object Vector Studio V2 object JSON.

## Validation

Playwright impacted: Yes.

Commands run:

- `node --check src/engine/rendering/ObjectVectorRuntimeAssetService.js`
- `node --check src/engine/rendering/index.js`
- `node --check games/Asteroids/index.js`
- `node --check games/Asteroids/game/AsteroidsGameScene.js`
- `node --check tools/object-vector-studio-v2/js/ToolStarterApp.js`
- `node --check tools/object-vector-studio-v2/js/bootstrap.js`
- `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list -g "Object Vector Studio V2 animation|loads Object Vector Studio V2 runtime"`
- `npm run test:workspace-v2`

Result:

- Targeted Object Vector Studio V2 and Asteroids runtime validation passed: 2 passed.
- Full Workspace Manager V2 suite passed: 44 passed.
- Playwright V8 coverage report generated and copied to `docs/dev/reports/playwright_v8_coverage.txt`.
- Full samples smoke test skipped per request; this PR targets Object Vector runtime integration and Asteroids gameplay validation only.

## Playwright Coverage

Validates:

- Object Vector Studio V2 runtime preview launches for the selected state/frame.
- Runtime preview validates the object payload through the runtime asset service.
- Runtime preview uses workspace/session palette without embedding palette data in object JSON.
- Runtime invalid assets are rejected with schema validation failures.
- Asteroids loads Object Vector Studio V2 runtime assets from `game.manifest.json`.
- Asteroids renders ship, asteroid, and UFO objects through the runtime asset renderer.
- State/frame playback hooks emit runtime events for gameplay objects.

Expected pass behavior:

- Valid Object Vector Studio V2 assets load, cache, resolve selected state/frame data, and render through the runtime vector pipeline.

Expected fail behavior:

- Invalid runtime asset payloads fail validation before render and log actionable FAIL entries without silent fallback rendering.

## Manual Validation

1. Open `tools/object-vector-studio-v2/index.html`.
2. Load a schema-valid Object Vector Studio V2 payload and runtime palette.
3. Select an object, state, and frame, then click `Runtime Preview`.
4. Open Asteroids and start gameplay.
5. Confirm the ship, asteroids, and UFOs render from Object Vector Studio V2 assets.

Expected outcome:

- Runtime preview displays the selected state/frame, Asteroids renders Object Vector assets in-game, and logs show runtime load, cache, state/frame, and render events.

## Out Of Scope

- No World Vector Studio V2 changes.
- No sample JSON changes.
- No full samples smoke test.
