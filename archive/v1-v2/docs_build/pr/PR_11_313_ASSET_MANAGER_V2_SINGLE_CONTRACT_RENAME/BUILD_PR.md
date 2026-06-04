# BUILD_PR_11_313

## Implementation
- Renamed the contract ID repo-wide:
  - `legacy asset browser v2 id` -> `asset-manager-v2`
- Renamed tool path:
  - `toolbox/legacy asset browser v2 id/` -> `toolbox/asset-manager-v2/`
- Renamed fixture path:
  - `tests/fixtures/v2-tools/legacy asset browser v2 id.json` -> `tests/fixtures/v2-tools/asset-manager-v2.json`
- Updated Workspace V2 launcher/session wiring, tool links, runtime tests, and docs to the new contract ID.
- Removed old-ID references entirely (no dual-name compatibility path).
- Preserved strict Asset Manager V2 contract behavior:
  - Validates `payloadJson.assetCatalog`
  - Keeps invalid/empty handling
  - No fallback/default injection

## Validation
- Repo audit:
  - `rg -n "legacy asset browser v2 id" .` -> zero matches
  - `rg --files | rg "legacy asset browser v2 id"` -> zero matches
- Syntax checks:
  - `node --check` on all changed `.js`/`.mjs` files (62 files) -> PASS
- Targeted Workspace V2 launch test:
  - `node tests/runtime/V2WorkspaceAssetManagerLaunch.test.mjs` -> PASS
