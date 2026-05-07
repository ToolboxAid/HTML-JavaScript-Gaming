# PR_26127_008 Asset Role Preview And Background Stretch

## Scope
- Restored `bezel` as its own Asset Manager V2 image role and kept `preview` as a separate image role.
- Added image background stretch handling with default `uniformEdgeStretchPx: 0`.
- Kept bezel stretch handling with default `uniformEdgeStretchPx: 10`.
- Kept deprecated `tools/workspace-v2` and sample JSON untouched.

## Implementation Notes
- `tools/asset-manager-v2/js/assetManagerMetadata.js`
  - Image roles now include `sprite`, `background`, `bezel`, `preview`, and `ui`.
  - Filename role suggestion now resolves `bezel` before `preview`, so bezel files are not collapsed into preview.
- `tools/asset-manager-v2/js/controls/AssetFormControl.js`
  - Stretch Override is shown only for image `background` and image `bezel`.
  - Background stretch defaults to `0`; bezel stretch defaults to `10`.
  - Color role `background` does not receive image stretch behavior.
- `tools/asset-manager-v2/js/services/AssetSchemaValidator.js`
  - Generated entries add `stretchOverride` only for image `background` and image `bezel`.
  - Schema validation rejects `stretchOverride` outside `assets.image.background.*` and `assets.image.bezel.*`.
- `tools/schemas/tools/asset-manager-v2.schema.json`
  - Added `bezel` to image role declarations.
  - Allows stretch only on background and bezel image asset IDs.
- `games/Asteroids/game.manifest.json`
  - Keeps `assets.image.preview.bezel` as the Preview Generator V2 preview selection.
  - Adds `assets.image.bezel.bezel` for bezel stretch ownership.
  - Adds `stretchOverride.uniformEdgeStretchPx: 0` to the background image asset.

## Validation
- PASS: `node --check tools/asset-manager-v2/js/assetManagerMetadata.js`
- PASS: `node --check tools/asset-manager-v2/js/controls/AssetFormControl.js`
- PASS: `node --check tools/asset-manager-v2/js/services/AssetSchemaValidator.js`
- PASS: JSON parse for `tools/schemas/tools/asset-manager-v2.schema.json` and `games/Asteroids/game.manifest.json`
- PASS: Asset Manager V2 payload validation for `games/Asteroids/game.manifest.json`
- PASS: Workspace Manager V2 manifest validation for `games/Asteroids/game.manifest.json`
- PASS: Workspace Manager V2 manifest validation for `games/_template/workspace-manager-v2-UAT.manifest.json`
- PASS: `npm run test:workspace-v2` completed with 24 passed.
- SKIPPED: full samples smoke test. This PR is scoped to Asset Manager V2 metadata/settings and Workspace V2 tool validation.

## Manual Validation Notes
- Image file `chrome-bezel.png` auto-selects role `bezel`, generates `assets.image.bezel.chrome-bezel`, and shows Bezel Stretch PX with value `10`.
- Image file `preview.png` auto-selects role `preview`, generates `assets.image.preview.preview`, and does not show Stretch Override.
- Image file `nebula-background.png` auto-selects role `background`, generates `assets.image.background.nebula-background`, and shows Background Stretch PX with value `0`.
- Color role `background` remains a palette color usage role and does not show or persist image stretch.

## Coverage
- Playwright/V8 coverage report: `docs/dev/reports/playwright_v8_coverage_report.txt`
- Changed Asset Manager V2 runtime files were collected by browser V8 coverage during `npm run test:workspace-v2`.
