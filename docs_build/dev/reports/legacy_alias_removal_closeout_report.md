# PR_26154_050 Legacy Alias Removal Closeout

## Summary
- Removed active runtime/shared compatibility references to `old_games` and `old_samples`.
- Updated active reference-game/sample paths to `archive/v1-v2/games/` and `archive/v1-v2/samples/`.
- Confirmed retired root folders are absent.

## Runtime And Shared Path Adjustments
- `src/shared/state/getStateVariantClassification.js`
  - `old_samples/` -> `archive/v1-v2/samples/`
  - `old_games/` -> `archive/v1-v2/games/`
- `src/shared/toolbox/platformShell.js`
  - Forwarded launch params now allow archive game/sample roots only.
  - Game manifest candidate generation now uses `/archive/v1-v2/games/`.
  - Default game asset paths now use `archive/v1-v2/games/[game]/assets`.
- `src/shared/toolbox/toolSampleCatalog.js`
  - Sample paths now normalize to `./archive/v1-v2/samples/`.
- `src/shared/toolbox/toolLaunchSSoT.js`
  - Sample preset launch paths now allow archive game/sample roots only.
- `src/engine/runtime/gameImageConvention.js`
  - Game ID discovery and derived manifest paths now use `/archive/v1-v2/games/`.
- `src/engine/release/DistributionPackager.js`
  - Default sample package entry now uses `archive/v1-v2/samples/[sample]/index.html`.
- `src/shared/schemas/game.manifest.schema.json`
  - Description now documents `archive/v1-v2/games/**/game.manifest.json`.

## Asset Pipeline Path Adjustments
- `src/shared/toolbox/pipeline/assetPipelineTooling.js`
- `src/shared/toolbox/pipeline/assetManifestLoader.js`
- `src/shared/toolbox/pipeline/gameAssetManifestCoordinator.js`
- `src/shared/toolbox/pipeline/runtimeAssetLookup.js`

All generated reference-game asset manifest, runtime asset, and tool-data paths now use `archive/v1-v2/games/`.

## Test And Validation Updates
- Updated active tests and fixtures that asserted `old_games` or `old_samples` paths to assert archive paths instead.
- Updated `scripts/run-targeted-test-lanes.mjs` so archived games/samples remain excluded from active automated validation, without accepting old root aliases.
- Updated `scripts/audit-duplicate-file-content.mjs` and `scripts/validate-json-contracts.mjs` to remove old root compatibility checks.

## Root Alias Checks
- `tools/`: absent.
- `old_games/`: absent.
- `old_samples/`: absent.
- `old-tools/`: absent.
- `assets/theme/v2/`: absent.

## Remaining Non-Active Mentions
- `scripts/PS/find-duplicate-methods/*.txt` and root `dupes_called.txt` still contain generated historical output mentioning `tools/SpriteEditor_old_keep` and `tools/renderToolsIndex.js`.
- Historical reports under `docs_build/reports/` and old PR docs may mention prior paths.
- These are report artifacts, not active runtime/shared compatibility aliases.

## Validation
- PASS: active `src`, `scripts`, `tests`, and `toolbox` scan found no `old_games`, `old_samples`, `old-tools`, or `assets/theme/v2` references.
- PASS: active `toolbox`, `tests`, `docs_build/tools`, `docs_build/dev`, and `docs_build/reference` scan found no `renderToolsIndex` reference outside archive/history.
- PASS: root path existence checks confirmed retired roots are absent.
