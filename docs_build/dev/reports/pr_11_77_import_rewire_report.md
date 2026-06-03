# PR 11.77 Import Rewire Report

## Purpose
Rewire imports only after PR 11.76 utility moves so no runtime source still targets `src/engine/utils` for moved utilities.

## Files Changed
- `src/engine/core/FixedTicker.js`
- `src/engine/core/FrameClock.js`
- `src/engine/scene/SceneManager.js`
- `docs_build/dev/reports/pr_11_77_import_rewire_report.md`

## Import Rewires Applied
- `../utils/invariant.js` -> `../../shared/utils/invariantUtils.js`
  - `src/engine/core/FixedTicker.js`
  - `src/engine/core/FrameClock.js`
  - `src/engine/scene/SceneManager.js`

## Required Checks
1. Search for `src/engine/utils` and `engine/utils` after changes:
   - Command: `rg -n "src/engine/utils|engine/utils" src samples games tools tests`
   - After count: `79` matches
   - Remaining matches are metadata/report references (not active source imports), primarily:
     - `samples/metadata/samples.index.metadata.json`
     - `games/metadata/games.index.metadata.json`
     - `tests/validation/samples.shared.boundaries.report.json`

2. Confirm `FixedTicker.js` no longer imports invariant from engine utils:
   - `src/engine/core/FixedTicker.js` now imports:
     - `../../shared/utils/invariantUtils.js`

3. Confirm no source reference can request `/src/shared/utils/invariant.js`:
   - Command: `rg -n --fixed-strings "/src/shared/utils/invariant.js" src samples games tools tests`
   - Result: no matches

## Before / After Counts
- Legacy invariant import pattern in engine source files (`../utils/invariant.js`):
  - Before: `3` files (HEAD baseline)
  - After: `0` files
- Non-metadata `engine/utils` text matches in `src/samples/games/tools/tests`:
  - After: `0`

## Intentional Remaining engine-utils References
- Kept unchanged in this PR because they are metadata/report strings, not runtime imports:
  - `samples/metadata/samples.index.metadata.json`
  - `games/metadata/games.index.metadata.json`
  - `tests/validation/samples.shared.boundaries.report.json`

## Targeted Validation
- `node --check src/engine/core/FixedTicker.js` (pass)
- `node --check src/engine/core/FrameClock.js` (pass)
- `node --check src/engine/scene/SceneManager.js` (pass)
- `node tests/core/FixedTicker.test.mjs` (pass)

## Notes
- No files moved in this PR.
- No wrappers, aliases, or bridge files added.
- `src/shared/utils/invariant.js` was not recreated.
