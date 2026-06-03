# BUILD_PR_LEVEL_11_157_FIX_WORKSPACE_TILE_SUMMARY_DISPLAY_MODEL

## Purpose
Fix the Workspace Manager tile summary display model so SVG Asset Studio shows the loaded direct payload label instead of `Asset: none`.

## Current State
- SVG Asset Studio data is loaded.
- Workspace Manager tile still displays:

Vector Assets
SVG Asset Studio
Asset: none

This confirms the problem is not data loading. It is the tile/card summary display model.

## STRICT SCOPE

### ALLOWED FILES
- tools/workspace-manager/main.js
- docs_build/dev/reports/workspace_tile_summary_display_model_11_157.txt

### ALLOWED CHANGES
- update only the Workspace Manager tile/card summary display model
- ensure SVG Asset Studio summary reads from already-loaded direct data
- create/update report

## FORBIDDEN

Codex MUST NOT:
- modify schemas
- modify Sample 1902 JSON
- modify SVG Asset Studio
- modify tool host runtime
- modify routing outside Workspace Manager
- modify other tools unless the same display model function requires a generic field
- add fallback/default/demo data
- transform/wrap/normalize payload
- change launch behavior

## Required Fix

Find the exact display model used by the tile/card UI that renders:

```text
Asset: none
```

For `toolId === "svg-asset-studio"`:

- read the already-loaded direct tool entry:
  `workspaceManifest.tools["svg-asset-studio"].vectorAssetDocument`

- set display asset summary to:
  `vectorAssetDocument.sourceName`

- if `sourceName` is missing but `svgText` exists, set:
  `Inline SVG`

The visible tile must become something like:

```text
Vector Assets
SVG Asset Studio
Asset: sample-0901-ship.svg
```

## Important

Do not change the loading path. The user confirmed the data is loaded.

Only fix the tile/card display model that still says `Asset: none`.

## Required Investigation

Codex must identify:
- the final tile/card data object
- the property used for the visible `Asset:` line
- why loaded SVG data is not mapped to that property

## Validation

Run targeted validation only.

Required:
- `node --check tools/workspace-manager/main.js`
- static verification that SVG tile summary maps loaded `vectorAssetDocument.sourceName` to the visible `Asset:` field
- no sample/schema/runtime files changed
- `git diff --name-only` contains only ALLOWED FILES

## Report

Write:

- `docs_build/dev/reports/workspace_tile_summary_display_model_11_157.txt`

Report must include:
- exact display model function/branch changed
- old source for `Asset: none`
- new source for SVG asset label
- expected visible text
- validation command/result
- strict scope confirmation

## Full Samples Smoke Test

Skipped.

Reason:
- targeted Workspace Manager tile summary display-model fix only
- full samples smoke test takes approximately 20 minutes

## Acceptance

- SVG Asset Studio tile no longer shows `Asset: none` when data is loaded.
- The tile label is derived from direct loaded `vectorAssetDocument`.
- No loading/routing/schema/sample changes are made.
