# PR_26127_006-preview-image-manifest-selection-and-launch-hydration

## Scope
- Added a schema-valid manifest repo root context through `repoRoot`.
- Added `tools.asset-manager-v2.previewImagePath` as the explicit manifest preview image source of truth.
- Added `preview-image` as an Asset Manager V2 image role.
- Moved Preview Generator V2 to the Workspace Manager V2 Utilities grouping.
- Kept deprecated `toolbox/workspace-v2` and sample JSON unchanged.

## Asset Manager V2 Notes
- Image role options now include `preview-image`.
- Adding or updating an image asset with role `preview-image` writes that asset path into `tools.asset-manager-v2.previewImagePath`.
- If multiple preview-image assets exist, the later sorted asset ID is used as the current preview image override.
- `previewImagePath` must match an image asset with role `preview-image` when present.

## Workspace Manifest Notes
- `games/Asteroids/game.manifest.json` now declares `repoRoot: HTML-JavaScript-Gaming`.
- The Asteroids manifest now includes `tools.asset-manager-v2.previewImagePath: assets/images/bezel.png`.
- The Asteroids manifest includes `assets.image.preview-image.bezel` so the preview image path is schema-backed by an Asset Manager V2 asset record.
- Temporary UAT manifest now includes the same repo root context.

## Preview Generator V2 Hydration Notes
- Workspace Manager launch reads repo display from `manifest.repoRoot`; it no longer shows the game label or asset folder as the repo root.
- Preview image path reads from `tools.asset-manager-v2.previewImagePath`; there is no bezel-derived hidden default.
- Generate Image stays disabled until the manifest preview image validates and the picked repo root matches the manifest repo root.
- Workspace launch displays hydrated context text and logs the manifest preview path.

## Validation
- `npm run test:workspace-v2` passed: 24/24.
- Changed runtime JavaScript passed `node --check`.
- Playwright V8 coverage report was regenerated at `docs_build/dev/reports/playwright_v8_coverage_report.txt`.

## Manual Validation
- Open Workspace Manager V2, load Asteroids, confirm Preview Generator V2 appears under Utilities.
- Launch Asset Manager V2 from Workspace Manager V2, choose Image, pick an image, select role `preview-image`, add the asset, return to Workspace Manager V2, and export the manifest.
- Confirm the exported manifest includes `tools.asset-manager-v2.previewImagePath` matching the selected preview-image asset path.
- Launch Preview Generator V2 from Workspace Manager V2 and confirm Repo selected shows `HTML-JavaScript-Gaming`, workspace context shows hydrated, preview target uses the manifest preview image path, and Generate Image enables only after picking the matching repo root.

## Out Of Scope
- Full samples smoke test skipped; this PR is Workspace/Asset/Preview V2 scoped.
- No deprecated `toolbox/workspace-v2` changes.
- No sample JSON changes.
