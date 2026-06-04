# PLAN_PR_10_23_SAMPLE_IMPORT_DESTINATION_PRESET_FIX

## Purpose
Remove misleading `games/<project>/...` import destinations from sample-owned Asset Browser / Import Hub preset JSON.

## Problem
Sample JSON presets currently use game-project destination templates such as:
`games/<project>/config/`

When opened from `samples/`, this is misleading. Sample presets must describe sample-local import/export destinations, while game workflows may keep game-project destinations.

## Scope
- Sample-owned JSON files only.
- Asset Browser / Import Hub preset fields only.
- Replace `games/<project>/...` destinations in samples with sample-local destination patterns.
- Preserve actual asset catalog entries and source paths.
- Do not change game-owned presets.
- Do not modify start_of_day folders.

## Acceptance
- No sample-owned tool JSON contains `games/<project>/` in `importDestination`.
- Sample import destinations are sample-local and clearly scoped to the sample.
- Game workflows are not changed.
- Asset Browser / Import Hub still loads sample asset catalogs.
