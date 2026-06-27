# PR_26126_094 Asset Manager V2 Preview Helper Location Notes

## Helper Location
- Moved preview helper code from `src/shared/assets/assetPreviewHelpers.js` to `toolbox/asset-manager-v2/js/assetPreviewHelpers.js`.
- `AssetCatalogControl` now imports the Asset Manager V2-local helper with `../assetPreviewHelpers.js`.
- The old shared helper file was removed.

## Scope
- Preview behavior remains scoped to Asset Manager V2.
- The local helper covers image, audio, font, video, shader, data, localization, and color previews.
- Workspace V2 game asset path resolution remains in the local helper.

## Validation
- Playwright dynamically imports `/toolbox/asset-manager-v2/js/assetPreviewHelpers.js`.
- Playwright verifies the old `/src/shared/assets/assetPreviewHelpers.js` path is no longer available.
- The V8 coverage report shows `toolbox/asset-manager-v2/js/assetPreviewHelpers.js` covered at 100%.
