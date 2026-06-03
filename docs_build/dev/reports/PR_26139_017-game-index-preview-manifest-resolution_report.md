# PR_26139_017-game-index-preview-manifest-resolution Report

## Summary

- Added shared manifest preview resolution for game thumbnails.
- `games/index.html` now renders card thumbnails from each game manifest Asset Manager V2 image asset with `role: "preview"`.
- `games/Pong/index.html` now uses the same manifest preview helper for its page thumbnail.
- Pong manifest preview path now points to `assets/images/preview1.svg`, matching the actual file.
- Missing preview-role assets show the existing safe `No Preview` placeholder and do not request a guessed thumbnail.

## Files Changed

- `games/shared/gameManifestPreviewResolver.js`
- `games/index.render.js`
- `games/index.css`
- `games/pong/game.manifest.json`
- `games/pong/index.html`
- `games/Pong/boot.js`
- `tests/playwright/games/GameIndexPreviewManifestResolution.spec.mjs`
- `docs_build/dev/reports/PR_26139_017-game-index-preview-manifest-resolution_report.md`

## Resolution Behavior

- Active preview source: `tools.asset-manager-v2.assets[*]` with `type: "image"` and `role: "preview"`.
- `games/index.render.js` ignores legacy metadata `preview` strings for active thumbnail rendering.
- `games/shared/gameManifestPreviewResolver.js` derives each game manifest path from the game href and delegates chrome asset lookup to the shared manifest chrome resolver from PR_016.
- Pong thumbnail source is `/games/Pong/assets/images/preview1.svg` only because `games/pong/game.manifest.json` now points to `assets/images/preview1.svg`.
- No fallback/default `assets/images/preview.svg` path is created.

## Validation

- PASS: `node --check games/shared/gameManifestPreviewResolver.js`
- PASS: `node --check games/index.render.js`
- PASS: `node --check games/Pong/boot.js`
- PASS: `node --check tests/playwright/games/GameIndexPreviewManifestResolution.spec.mjs`
- PASS: `npm run build:manifest`
- PASS: `npx playwright test tests/playwright/games/GameIndexPreviewManifestResolution.spec.mjs --project=playwright --workers=1 --reporter=list`
  - 3 passed.
  - Verified `games/index.html` resolves Pong card thumbnail to `/games/Pong/assets/images/preview1.svg`.
  - Verified `games/Pong/index.html` resolves its page thumbnail to `/games/Pong/assets/images/preview1.svg`.
  - Verified removing the Pong preview role keeps the safe placeholder and does not request preview image files.
  - Verified no request or 404 for `/games/Pong/assets/images/preview.svg`.
- PASS: `git diff --check`
  - Git emitted line-ending normalization warnings for touched files; command exit code was 0.

## Manual Validation

1. Open `/games/index.html`.
2. Confirm the Pong card thumbnail loads from `/games/Pong/assets/images/preview1.svg`.
3. Confirm the browser network log has no request for `/games/Pong/assets/images/preview.svg`.
4. Open `/games/Pong/index.html`.
5. Confirm the Pong page preview thumbnail loads from `/games/Pong/assets/images/preview1.svg`.
6. Temporarily remove the Pong Asset Manager preview role and confirm the Pong page shows `No Preview` with no missing thumbnail request.

## Full Samples Smoke

- Skipped as requested; this PR changes only game index/page preview thumbnail resolution and does not broadly change sample loading.
