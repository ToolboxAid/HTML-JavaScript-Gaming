# PR_26132_012-game-fullscreen-canvas-fix

## Scope

Fixes shared game fullscreen behavior so the game/canvas play area is the fullscreen target and the canvas resizes to the available fullscreen surface.

## Changes

- Fullscreen target resolution now creates and uses a dedicated `data-runtime-fullscreen-host="canvas"` wrapper around the game canvas.
- The shared runtime no longer promotes the broader page/body shell as the preferred fullscreen target when a canvas host can be created.
- Canvas fullscreen layout now fits the canvas to the active fullscreen host when no bezel/chrome overlay is available.
- Canvas inline layout styles are captured before runtime fullscreen changes and restored after fullscreen exit.
- Shared game CSS includes explicit fullscreen host/canvas rules for viewport-sized play surfaces.
- `FullscreenService` now treats fullscreen as active only when the configured runtime target is the active fullscreen element.

## Validation

Playwright impacted: Yes.

Commands run:

- `node --check src/engine/runtime/fullscreenBezel.js`
- `node --check src/engine/runtime/FullscreenService.js`
- `node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list -g "fits the game canvas inside the fullscreen play area"`
- `npm run test:workspace-v2`

Result:

- Targeted fullscreen validation passed.
- `npm run test:workspace-v2`: 41 passed.
- Full samples smoke test skipped because this PR changes shared game fullscreen runtime behavior and is covered by targeted Asteroids game/canvas fullscreen validation plus Workspace V2 regression coverage; broad sample JSON/smoke coverage was explicitly out of scope.

## Playwright Coverage

The targeted fullscreen test validates:

- Asteroids boots through the real game launch path.
- Fullscreen request targets the dedicated canvas host, not `body` or `documentElement`.
- Canvas resizes to fill the mocked fullscreen play area.
- Exiting fullscreen clears fullscreen state and restores normal canvas/browser layout.
- Shared header height remains restored after fullscreen exit.

## Manual Validation

1. Open `games/Asteroids/index.html`.
2. Click the game canvas to enter fullscreen.
3. Confirm the play surface, not the full page shell, becomes fullscreen.
4. Confirm the canvas fills the available fullscreen play area.
5. Exit fullscreen and confirm the normal page layout and header return.

## Out Of Scope

- No gameplay rule changes.
- No sample JSON changes.
- No full samples smoke test.
