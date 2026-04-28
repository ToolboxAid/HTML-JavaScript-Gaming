# PLAN_PR_10_20_TOOL_OWNED_JSON_ASSET_CATALOG_FIX

## Purpose
Make Asset Browser / Import Hub the sole reader/writer of sample asset catalog JSON for samples 0204, 1413, and 1505.

## Problem
The three samples flash asset entries and then go blank/partial:
- 0204 ends at `No assets loaded`
- 1413 and 1505 end with one asset
This indicates a second pass or bridge layer is overwriting the tool-owned JSON state. 0204 also still has `assetRegistry.js` and `AssetRegistryScene.js` involved, but the tool should own 100% of reading/writing the JSON.

## Scope
- Samples 0204, 1413, 1505 asset-browser/import-hub JSON only.
- Remove sample-specific AssetRegistry JS bridge/dependency where it competes with tool-owned JSON.
- Normalize each sample JSON so the tool can read/write the full asset list directly.
- Fix flash-then-blank state overwrite.
- Preserve explicit empty state when JSON has no entries.
- Do not modify start_of_day folders.

## Acceptance
- 0204, 1413, and 1505 do not flash data and then clear it.
- 0204 shows the full JSON asset catalog and does not show `No assets loaded` when entries exist.
- 1413 and 1505 show their full JSON asset catalog, not a single leftover asset.
- Asset Browser / Import Hub reads/writes JSON directly.
- No sample-specific registry class owns or rewrites the tool catalog.
- No hidden fallback/default data is introduced.
