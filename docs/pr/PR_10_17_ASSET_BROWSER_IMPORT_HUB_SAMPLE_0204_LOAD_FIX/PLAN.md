# PLAN_PR_10_17_ASSET_BROWSER_IMPORT_HUB_SAMPLE_0204_LOAD_FIX

## Purpose
Fix Asset Browser / Import Hub so existing sample asset data from `sample.0204.3d-asset-viewer.json` populates the visible asset list instead of showing `No assets loaded`.

## Problem
`sample.0204.3d-asset-viewer.json` contains asset data visible in the sample, but Asset Browser / Import Hub reports `No assets loaded`. This indicates a tool ingestion, mapping, or manifest/input handoff issue, not missing data.

## Scope
- Asset Browser / Import Hub loading path only.
- Identify how sample 0204 exposes its asset JSON to tools.
- Ensure the tool consumes the explicit sample/input data already present.
- Preserve no-hidden-fallback rule.
- No data fabrication.
- No schema rewrite.
- No broad registry/tool refactor.
- Do not modify start_of_day folders.

## Acceptance
- Opening Asset Browser / Import Hub for sample 0204 shows assets from `sample.0204.3d-asset-viewer.json`.
- It no longer shows `No assets loaded` when valid explicit data exists.
- Empty state still appears when no explicit data is provided.
- First loaded asset auto-selects.
- Controls follow selection state.
- Sample preview and tool-visible asset list reference the same source data.
