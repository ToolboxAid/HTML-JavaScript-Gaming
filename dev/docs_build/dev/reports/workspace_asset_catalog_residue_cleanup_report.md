# PR_26140_084 Workspace Asset Catalog Residue Cleanup Report

## Summary
- Removed active `workspace.asset-catalog.json` fallback path construction from `toolbox/shared/platformShell.js`.
- Changed shared tool hydration to read Asset Manager V2 entries from `game.manifest.json`.
- Renamed `games/shared/workspaceGameAssetCatalog.js` to `games/shared/gameManifestAssets.js`.
- Replaced workspace-oriented helper exports with manifest-oriented exports:
  - `primeGameManifestAssets`
  - `preloadGameManifestAssets`
  - `resolveGameManifestAssetPath`
  - `getGameManifestAssetSourcePath`
- Updated game and test imports to the renamed manifest asset helper.
- Updated the metadata sync script to derive asset hints from `game.manifest.json` Asset Manager V2 entries instead of the old workspace asset catalog file.

## Behavior Preservation
- Runtime asset path resolution still resolves Asteroids audio IDs from `games/Asteroids/game.manifest.json`.
- Workspace-launched game runtime hydration still primes in-memory asset entries when a hosted game context provides them.
- No compatibility shim or alias pass-through file was left at the old helper path.

## Scope Boundaries
- No schema files were changed.
- No sample JSON files were changed.
- Historical `docs_build/pr` references to `workspace.asset-catalog.json` were intentionally left untouched.
- Existing generated scanner output such as `dupes_called.txt` was not edited.

## Validation
- Ran targeted syntax/import validation for:
  - `toolbox/shared/platformShell.js`
  - `games/shared/gameManifestAssets.js`
  - `games/shared/workspaceGameRuntimeHydrator.js`
  - changed game audio/index files
  - changed Workspace Manager Playwright test
  - changed runtime tests
  - `scripts/sync-tool-hints-from-workspace-manager.mjs`
- Ran targeted manifest asset resolver validation for Asteroids audio paths.
- Ran `npm run test:workspace-v2`; all 59 tests passed.
- Ran `git diff --check`.
- Confirmed no schema or sample JSON files changed.
- Confirmed no active JS/MJS references remain to `workspace.asset-catalog.json`.
- Confirmed no active references remain to:
  - `workspaceGameAssetCatalog`
  - `preloadWorkspaceGameAssetCatalog`
  - `primeWorkspaceGameAssetCatalog`
  - `resolveWorkspaceGameAssetPath`
  - `getWorkspaceGameAssetCatalogPath`

## Full Samples Smoke Test
- Not run. This PR is scoped to manifest asset naming/resolution cleanup and Workspace V2 validation passed.
