# PLAN_PR_11_10_ALL_SAMPLES_STANDALONE_TOOL_JSON_SSOT_ENFORCEMENT

## Purpose
Enforce JSON source-of-truth across all samples that have standalone tool ties.

## Scope
- All samples under `samples/`
- Standalone tool launch/use only
- All sample-owned tool payload JSON files
- All duplicate JS mirror data modules related to tool-visible data
- Tool-visible data includes:
  - assets
  - tilemaps
  - sprites
  - vector assets/maps
  - palettes
  - colors
  - fill/stroke/style values
  - preview/render config
  - import/export state and destinations
- Do not modify start_of_day folders.

## Acceptance
- Every sample tied to a standalone tool loads tool-visible data directly from JSON.
- No sample has JS-owned canonical tool data when JSON exists.
- JS mirror modules are removed, replaced, or demoted to non-canonical helpers.
- Colors/palettes/styles are JSON-owned.
- Empty state remains valid when explicit JSON is absent.
- Report lists every checked sample and final status.
