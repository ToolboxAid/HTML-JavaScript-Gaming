# REPORT_PR_10_20_TOOL_OWNED_JSON_ASSET_CATALOG_FIX

## Bundle Summary
This PR corrects asset catalog ownership for samples 0204, 1413, and 1505.

## Evidence Basis
Uploaded 0204 JSON already has `config.assetCatalog.entries`, while 0204 JS still routes through AssetRegistry scene code. The desired rule is tool-owned JSON, not sample-class-owned catalog state.

## Target Behavior
- Full JSON catalog remains visible after load.
- No flash-then-blank.
- No registry JS bridge owns tool data.
- Tools directly read/write JSON catalogs.
