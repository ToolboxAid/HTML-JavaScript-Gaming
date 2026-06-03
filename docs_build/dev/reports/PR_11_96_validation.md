# PR 11.96 Validation - Flatten Manifest Assets and Loader Contract

## Scope
Implemented targeted PR 11.96 contract updates to keep `tools["asset-browser"].assets` as the flat source of truth for asset kinds.

## Files Changed
- `tools/Asset Browser/main.js`
- `tools/shared/platformShell.js`
- `src/engine/runtime/gameImageConvention.js`
- `games/shared/workspaceGameAssetCatalog.js`
- `tools/schemas/tools/asset-browser.schema.json`
- `samples/phase-19/1902/sample.1902.workspace-all-tools.json`

## Contract Changes Applied
- Removed nested manifest asset traversal in Asset Browser (`assets.media`-style nested compatibility no longer consumed).
- Updated preset catalog extraction to prefer flat `assets` map from:
  - scoped tool preset root (`payload.assets` when scoped payload is the tool object)
  - `config.assets`
  - full manifest `tools["asset-browser"].assets`
- Updated runtime chrome image resolver to consume only `tools["asset-browser"].assets` for manifest image entries.
- Updated workspace game asset catalog manifest parsing to consume `tools["asset-browser"].assets` only.
- Updated workspace shell embedded status summary for Asset Browser to count flat `assets` entries.
- Updated sample 1902 Asset Browser tool payload from `payload.assetCatalog.entries` to flat root `assets` map.
- Updated `tools/schemas/tools/asset-browser.schema.json`:
  - added required root `assets`
  - removed `payload.assetCatalog`
  - enforced strict `assetEntry` shape (`path`, `kind`, optional `source`, optional `stretchOverride.uniformEdgeStretchPx`).

## Asteroids Preservation Check
- `games/Asteroids/game.manifest.json` still declares:
  - bezel: `/games/Asteroids/assets/images/bezel.png`
  - background: `/games/Asteroids/assets/images/deluxe.png`
  - font: `font.asteroids.vector-battle`
  - stretch override on `image.asteroids.bezel.stretchOverride.uniformEdgeStretchPx`

## Targeted Validation Commands
- `node --check "tools/Asset Browser/main.js"`
- `node --check tools/shared/platformShell.js`
- `node --check src/engine/runtime/gameImageConvention.js`
- `node --check games/shared/workspaceGameAssetCatalog.js`
- `node -e "import('./tests/tools/ToolSchemaStrictModeValidation.test.mjs').then(async (m)=>{await m.run(); console.log('ToolSchemaStrictModeValidation: PASS');})"`
- `npm run test:workspace-manager:games`
- `npm run test:manifest-payload:games`
- `node ./tests/runtime/LaunchSmokeAllEntries.test.mjs --samples --sample-range=1902-1902 --tools`

## Validation Results
- Syntax checks: PASS
- Workspace schema strict validation: PASS
- Workspace Manager games open test: PASS
- Game manifest payload expectations: PASS
- Sample 1902 + tools launch smoke: PASS (19/19)

## Legacy Contract Search Checks
- `asset-browser.assets.media`: no matches in `src games tools samples tests`
- `"media": {` under `games/**/game.manifest.json`: no matches

## Notes
- Full sample suite intentionally skipped; targeted validations were executed per PR scope.