# PLAN_PR_10_24_SAMPLE_JSON_DESTINATION_NORMALIZATION

## Purpose
Normalize all sample-owned JSON import/export destination hints so they point to real sample-local locations.

## Problem
Some sample JSON files still contain misleading destination hints such as:
- `games/<project>/config/`
- sample-local workflows suggesting a `config/` folder that does not exist
- Asset Browser / Import Hub rows like:
  `Workflow JSON | /samples/phase-14/1413/sample.1413.asset-browser.json | Suggested destination: games/<project>/config/`

When the user is inside `samples/`, destination hints must not refer to `games/`, and must not suggest nonexistent folders.

## Scope
- Check all JSON files under `samples/`.
- Fix sample-owned destination fields only.
- Normalize sample import/export destinations to real sample-local paths.
- Preserve source asset paths, schema, IDs, and catalog entries.
- Do not modify game-owned JSON.
- Do not modify start_of_day folders.

## Acceptance
- No JSON under `samples/` contains `games/<project>/` as a destination hint.
- No JSON under `samples/` suggests `config/` unless that sample folder actually has/uses a config folder.
- Sample 1413 Asset Browser preset shows a sample-local destination, not `games/<project>/config/`.
- Asset Browser / Import Hub still loads the full catalog.
- Validation report lists every changed JSON file and before/after destination.
