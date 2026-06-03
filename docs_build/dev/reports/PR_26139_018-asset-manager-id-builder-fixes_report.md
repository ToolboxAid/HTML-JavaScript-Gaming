# PR_26139_018 Asset Manager ID Builder Fixes Report

## Summary
- Updated Asset Manager V2 color ID generation to use `assets.color.<role>.<usage-or-game>` and never append the color name.
- Allowed color assets to validate and save without Usage; blank Usage now generates the `game` segment.
- Preserved `assets.color.background.game` background color behavior.
- Kept selected file state through Type changes so Asset ID regenerates immediately; incompatible file/type combinations now remain visibly blocked by validation.

## Files Changed
- `toolbox/asset-manager-v2/js/assetManagerMetadata.js`
- `toolbox/asset-manager-v2/js/controls/AssetFormControl.js`
- `toolbox/asset-manager-v2/js/services/AssetSchemaValidator.js`
- `tests/playwright/tools/AssetManagerV2.spec.mjs`
- `tests/playwright/tools/WorkspaceManagerV2.spec.mjs`

## Targeted Validation Covered
- Type change updates generated Asset ID.
- Role change updates generated Asset ID.
- Color save succeeds without Usage.
- Color ID excludes color name.
- Background color remains `assets.color.background.game`.
- Workspace-launched Asset Manager uses the same role-based color ID contract.

## Validation Commands
- PASS: `node --check toolbox/asset-manager-v2/js/assetManagerMetadata.js`
- PASS: `node --check toolbox/asset-manager-v2/js/controls/AssetFormControl.js`
- PASS: `node --check toolbox/asset-manager-v2/js/services/AssetSchemaValidator.js`
- PASS: `node --check tests/playwright/tools/AssetManagerV2.spec.mjs`
- PASS: `node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- PASS: `npx playwright test tests/playwright/tools/AssetManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list --grep "launches Asset Manager V2 with temporary UAT context and schema-complete asset controls|launches Asset Manager V2 from Workspace Manager V2 with schema-valid context and workspace return nav"`
- PASS: `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list --grep "uses header lifecycle controls and launches tools from fixed Workspace Manager V2 tiles"`
- PASS: `npm run build:manifest`
- PASS: `git diff --check`

## Notes
- The first targeted Asset Manager Playwright run found stale test expectations for source path preservation and current Workspace Manager tile count. The assertions were corrected and the targeted validation was rerun successfully.
- Full samples smoke test was not run because this PR is limited to Asset Manager V2 ID builder and validation behavior.
- Playwright V8 coverage artifacts were refreshed by the targeted Playwright runs; coverage remains advisory.
