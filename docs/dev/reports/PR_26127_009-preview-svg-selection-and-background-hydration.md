# PR_26127_009-preview-svg-selection-and-background-hydration

## Scope
- Read `docs/dev/PROJECT_INSTRUCTIONS.md` and followed the single-purpose Workspace V2/tool lane.
- Kept changes scoped to Preview Generator V2 runtime hydration/capture behavior and Workspace Manager V2 Playwright coverage.
- Did not modify deprecated `tools/workspace-v2`.
- Did not modify sample JSON.

## Preview Target Hydration
- Preview Generator V2 now separates the manifest-selected preview source from the generated output target.
- Workspace launch hydration reads the Asset Manager V2 image asset with role `preview`.
- Before repo selection, the UI preview source remains the manifest-selected image, for example `games/Asteroids/assets/images/bezel.png`.
- After Pick Repo Folder succeeds, the Output Summary preview target updates to the generated output path `games/Asteroids/assets/images/preview.svg`.
- The generated output target uses `OUTPUT_NAME = "preview.svg"` and the manifest-selected preview asset folder, so it is not hardcoded to PNG.

## Manifest Asset Structure Notes
- The Asteroids manifest already uses the normalized Asset Manager V2 preview asset structure:
  ```json
  "assets.image.preview.bezel": {
    "path": "assets/images/bezel.png",
    "type": "image",
    "kind": "png",
    "role": "preview",
    "source": "manifest"
  }
  ```
- No manifest fallback asset shape was added.

## Background Hydration Notes
- Preview Generator V2 now hydrates a background source from the Asset Manager V2 image asset with role `background`.
- It hydrates a dark background color from the active Palette Manager V2 swatches by `background` or `black` name/tag.
- Asteroids resolves `assets.image.background.deluxe` and `Space Black #020617`.
- Capture output applies the hydrated color to generated SVG wrappers and html2canvas full-page capture.
- The previous hidden/default white html2canvas background fallback was removed.
- Status output logs the hydrated background asset path and palette color.

## Validation
- `node --check tools/preview-generator-v2/PreviewGeneratorV2App.js` passed.
- `node --check tools/preview-generator-v2/PreviewGeneratorV2Capture.js` passed.
- `node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs` passed.
- `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list` passed: 8 passed.
- `npm run test:workspace-v2` passed: 24 passed.
- Full samples smoke test skipped per PR instructions.
