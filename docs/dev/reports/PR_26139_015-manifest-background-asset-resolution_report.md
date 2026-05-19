# PR_26139_015-manifest-background-asset-resolution Report

## Summary

- Removed the Asteroids background image convention fallback so the runtime no longer guesses `assets/images/background.png`.
- Background image resolution now selects only an `asset-manager-v2` image asset with `role: "background"`.
- Background image loading waits for manifest resolution; when the optional background role is absent, the layer stays unavailable and does not create an image request.
- Removed the stale gameplay-only background image gate so the shared background image layer renders behind menu, attract, and gameplay screens once ready.
- Existing shared background render order remains: clear, background color, custom background callback, overlay, background image, game objects.

## Files Changed

- `src/engine/runtime/gameImageConvention.js`
- `src/engine/runtime/backgroundImage.js`
- `tests/core/BackgroundImageAndFullscreenBezel.test.mjs`
- `tests/playwright/tools/AsteroidsBackgroundAssetResolution.spec.mjs`
- `docs/dev/reports/PR_26139_015-manifest-background-asset-resolution_report.md`

## Background Asset Resolution

- Active background image source: `tools.asset-manager-v2.assets[*]` with `type: "image"` and `role: "background"`.
- Current Asteroids manifest result: `/games/Asteroids/assets/images/deluxe.png`.
- The deluxe filename is not hardcoded; it is discovered from the manifest asset entry.
- If no Asset Manager background image role exists, `backgroundImageLayer.getState()` reports `path: ""` and `status: "unavailable"`.
- No fallback/default background image path is produced.
- The background image layer no longer suppresses rendering based on scene mode.

## Validation

- PASS: `node --check src/engine/runtime/gameImageConvention.js`
- PASS: `node --check src/engine/runtime/backgroundImage.js`
- PASS: `node --check tests/playwright/tools/AsteroidsBackgroundAssetResolution.spec.mjs`
- PASS: targeted Node manifest/background absence validation
- PASS: `npm run build:manifest`
- PASS: `npx playwright test tests/playwright/tools/AsteroidsBackgroundAssetResolution.spec.mjs --project=playwright --workers=1 --reporter=list`
  - 2 passed.
  - Verified no request for `/games/Asteroids/assets/images/background.png`.
  - Verified `/games/Asteroids/assets/images/deluxe.png` loads from the Asset Manager `role: "background"` asset.
  - Verified the loaded background image changes the Asteroids menu canvas pixels from the manifest background color.
  - Verified removing the background image role causes no deluxe/background image request, no 404, and the game still boots.
- PASS: `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list --grep "loads Object Vector Studio V2 runtime assets into Asteroids gameplay rendering"`
  - 1 passed.
  - Verified background render order remains clear, background color, custom background callback, overlay, background image, game objects.
- WARN: `npm run test:workspace-v2`
  - 54 passed, 2 failed.
  - Existing unrelated failures:
    - `validates optional Text to Speech V2 schema contract through Workspace Manager V2 schema`
    - `tracks Object Vector Studio V2 dirty state through persisted edits and save outcomes`
- PASS: `git diff --check`
  - Git emitted the existing line-ending normalization warning for `tests/core/BackgroundImageAndFullscreenBezel.test.mjs`; command exit code was 0.

## Manual Validation

1. Open `games/Asteroids/index.html`.
2. Confirm the game boots without a request for `/games/Asteroids/assets/images/background.png`.
3. Confirm the background image is visible on the initial Asteroids menu screen.
4. Confirm the runtime background image path is `/games/Asteroids/assets/images/deluxe.png` only because the Asteroids manifest has an Asset Manager image asset with `role: "background"`.
5. Temporarily remove that background image role from the manifest and reload.
6. Confirm the game still boots, the background image layer is unavailable, and no missing background image request appears.

## Full Samples Smoke

- Skipped as requested; this PR changes the Asteroids/runtime background asset path only and does not broadly change sample loading.
