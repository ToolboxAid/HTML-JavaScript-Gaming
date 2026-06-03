# PR_26139_016-final-manifest-runtime-cleanup Report

## Summary

- Removed remaining optional chrome asset path assumptions from shared runtime conventions.
- Background, bezel, and preview image paths now resolve from Asset Manager V2 manifest image assets by `role` only.
- Optional background/bezel/preview assets remain optional: if the role is absent, the runtime/tool path is empty and no hardcoded file is requested.
- Workspace Manager V2 preview tile lookup no longer invents `assets/images/preview.svg`; it uses the manifest preview asset role when present.
- Preserved Asteroids manifest object geometry, ship flame flicker, asteroid scale tuning, and the shared collision/transform path.

## Files Changed

- `src/engine/runtime/gameImageConvention.js`
- `src/engine/runtime/fullscreenBezel.js`
- `tools/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js`
- `tests/core/BackgroundImageAndFullscreenBezel.test.mjs`
- `tests/playwright/tools/AsteroidsBackgroundAssetResolution.spec.mjs`
- `docs_build/dev/reports/PR_26139_016-final-manifest-runtime-cleanup_report.md`

## Cleanup Decisions

- `resolveGameImageConventionPaths()` now returns empty optional chrome paths for background, bezel, and preview. It no longer constructs game-local optional image filenames.
- `resolveManifestChromeAssetPaths()` selects image assets only from `tools.asset-manager-v2.assets` where `type: "image"` and `role` is `background`, `bezel`, or `preview`.
- `fullscreenBezel` accepts a provided manifest payload and waits for manifest chrome resolution before attaching a bezel element.
- Workspace Manager V2 preview status now resolves the preview path from the active game manifest Asset Manager `role: "preview"` entry.
- The remaining `vectorMaps` reference in Object Vector Studio V2 is an intentional deprecated-input rejection guard, not active runtime/tool dependency.
- Asset Manager authoring defaults, Asteroids gameplay state defaults, ship flame flicker, and asteroid scale tuning were preserved as intentional behavior.

## Asset Resolution Results

- Current Asteroids background role resolves to `/games/Asteroids/assets/images/deluxe.png`.
- Current Asteroids bezel role resolves to `/games/Asteroids/assets/images/bezel.png`.
- Current Asteroids preview role resolves to `games/Asteroids/assets/images/preview.png` for Workspace Manager V2 repo-relative preview status.
- Removing the background role leaves the background layer unavailable without requesting `background.png` or `deluxe.png`.
- Removing the bezel role leaves the bezel layer detached with `path: ""` and no request for `bezel.png`.
- No optional background/bezel/preview fallback path is produced by shared runtime conventions.

## Validation

- PASS: `node --check src/engine/runtime/gameImageConvention.js`
- PASS: `node --check src/engine/runtime/fullscreenBezel.js`
- PASS: `node --check tools/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js`
- PASS: `node --check tests/playwright/tools/AsteroidsBackgroundAssetResolution.spec.mjs`
- PASS: `node --check tests/core/BackgroundImageAndFullscreenBezel.test.mjs`
- PASS: `npm run build:manifest`
- PASS: `npx playwright test tests/playwright/tools/AsteroidsBackgroundAssetResolution.spec.mjs --project=playwright --workers=1 --reporter=list`
  - 3 passed.
  - Verified no request for `/games/Asteroids/assets/images/background.png`.
  - Verified background image loads only from the Asset Manager background role.
  - Verified bezel image loads only from the Asset Manager bezel role.
  - Verified absent background role causes no optional background image request or 404.
  - Verified absent bezel role causes no optional bezel image request or 404.
- PASS: `npx playwright test tests/playwright/tools/CollisionInspectorV2.spec.mjs --project=playwright --workers=1 --reporter=list`
  - 4 passed.
  - Verified Collision Inspector V2 remains on the shared manifest/collision path.
- PASS: `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list --grep "loads Object Vector Studio V2 runtime assets into Asteroids gameplay rendering"`
  - 1 passed.
  - Verified Asteroids manifest object loading and Object Vector Studio V2 runtime geometry path.
- PASS: targeted Asteroids launch validation
  - Boot reached `boot-complete`.
  - Object Vector runtime loaded from manifest objects.
  - Background path was `/games/Asteroids/assets/images/deluxe.png`.
  - Bezel path was `/games/Asteroids/assets/images/bezel.png`.
  - No page errors or failed requests were observed.
- PASS: targeted manifest chrome/Workspace preview validation
  - Convention paths returned empty optional chrome paths.
  - Manifest chrome resolved background, bezel, and preview from Asset Manager roles.
  - Removing preview role returned an empty Workspace Manager preview path.
- PASS: `git diff --check`
  - Git emitted line-ending normalization warnings for two touched test files; command exit code was 0.

## Non-Gate Note

- Attempted `node -e "import('./tests/core/BackgroundImageAndFullscreenBezel.test.mjs').then((m)=>m.run())"`.
- It failed at the existing fullscreen-host expectation before the new optional-asset assertions: `testResolvePreferredFullscreenTargetKeepsCanvasOnlyParent` still expects a canvas-only parent to remain the fullscreen target, while the current runtime wraps it in a dedicated fullscreen host.
- This was treated as outside the PR_016 validation gate because the requested validations are the browser/runtime manifest asset paths and shared tool launch paths.

## Full Regression

- Full regression and full samples smoke were not run per the PR request.
