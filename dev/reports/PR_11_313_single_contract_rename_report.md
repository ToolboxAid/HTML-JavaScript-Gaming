# PR_11_313 Single-Contract Rename Report

## Purpose
Enforce one repo-wide contract by renaming `legacy asset browser v2 id` to `asset-manager-v2` everywhere with no aliasing.

## Scope Completed
- Tool ID contract references
- Tool folder/file paths
- Workspace V2 launch/session wiring
- Fixture paths and payload tool IDs
- Tool/menu links
- Runtime tests/docs references

## Key Contract Changes
- Tool runtime contract ID:
  - `asset-manager-v2`
- Tool path:
  - `toolbox/asset-manager-v2/`
- Fixture path:
  - `tests/fixtures/v2-tools/asset-manager-v2.json`

## Behavior Integrity
- Asset Manager V2 still enforces strict `payloadJson.assetCatalog` validation.
- Empty and invalid states remain explicit.
- No fallback catalogs, no default injection, no guessed paths.
- Payload structure unchanged.

## Validation Run
- `rg -n "legacy asset browser v2 id" .` -> **PASS** (zero matches)
- `rg --files | rg "legacy asset browser v2 id"` -> **PASS** (zero matches)
- `node --check` on all changed `.js`/`.mjs` files -> **PASS** (`checked=62 failed=0`)
- `node tests/runtime/V2WorkspaceAssetManagerLaunch.test.mjs` -> **PASS**

## Notes
- No compatibility layer was added.
- Old contract name was fully removed from paths and references.
