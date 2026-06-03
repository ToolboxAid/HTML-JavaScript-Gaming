# Theme V1 Final Teardown

Task: `PR_26154_011-theme-v1-final-teardown`

## Summary

- Audited `src/engine/theme/` after the earlier Theme V1 static asset move.
- Moved no additional files.
- Confirmed the remaining files are active engine/runtime shell styling, runtime helpers, or runtime header markup.
- Updated `src/engine/theme/README.md` to remove a stale `index.js` import example and document current runtime ownership.

## Assets Already Under Theme V1

The confirmed static legacy assets are already under `assets/theme/v1/`:

- `assets/theme/v1/fontawesome/css/font-awesome.min.css`
- `assets/theme/v1/fontawesome/fonts/fontawesome-webfont.ttf`
- `assets/theme/v1/fontawesome/fonts/fontawesome-webfont.woff`
- `assets/theme/v1/fontawesome/fonts/fontawesome-webfont.woff2`
- `assets/theme/v1/images/toolboxaid-header.png`

## Remaining `src/engine/theme/` Inventory

Runtime CSS ownership:

- `src/engine/theme/accordion.css`
- `src/engine/theme/games.css`
- `src/engine/theme/header.css`
- `src/engine/theme/layout.css`
- `src/engine/theme/main.css`
- `src/engine/theme/nav.css`
- `src/engine/theme/pages.css`
- `src/engine/theme/samples.css`
- `src/engine/theme/tokens.css`
- `src/engine/theme/tool-shell.css`
- `src/engine/theme/toolboxaid-header.css`
- `src/engine/theme/tools.css`
- `src/engine/theme/accordionV2/accordionV2.css`

Runtime JS ownership:

- `src/engine/theme/Theme.js`
- `src/engine/theme/ThemeTokens.js`
- `src/engine/theme/mount-shared-header.js`
- `src/engine/theme/toolboxaid-header.js`
- `src/engine/theme/accordionV2/accordionV2.js`

Runtime markup/documentation:

- `src/engine/theme/toolboxaid-header.html`
- `src/engine/theme/README.md`

## Why These Files Remain

`docs_build/dev/PROJECT_INSTRUCTIONS.md` defines `src/engine/theme` as the engine/runtime first-class tool shell styling surface.

The remaining files are not confirmed public/static Theme V1 assets. They are runtime shell modules, runtime helper modules, or runtime-owned header assets. Moving them in this PR would cross the requested boundary:

- Do not move active engine runtime code.
- Do not deprecate `src/engine/theme` at this time.
- Do not expand into unrelated theme cleanup.

## Reference Notes

Expected active/runtime references remain:

- `tools/shared/tooling/CapturePreviewRuntime.js` imports `Theme.js` and `ThemeTokens.js`.
- `tools/dev/checkStyleSystemGuard.mjs` references runtime CSS files as its guard baseline.
- runtime/test files still reference `src/engine/theme` as an engine/runtime shell surface.

No additional `src/engine/theme` files were deleted because the folder is not empty and remains runtime-owned.

## Validation Notes

- PASS: no `src/engine/theme/fontawesome` folder remains.
- PASS: no `src/engine/theme/toolboxaid-header.png` file remains.
- PASS: static legacy Theme V1 assets resolve under `assets/theme/v1/`.
- PASS: `src/engine/theme/README.md` now references the existing `toolboxaid-header.js` helper instead of the removed `index.js` barrel.
