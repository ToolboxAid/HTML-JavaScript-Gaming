# BUILD PR — Repo Structure Move Map (sanitizeText to shared string utils)

## Purpose
Continue the shared ↔ tools boundary cleanup by moving the reusable `sanitizeText` helper out of engine debug inspector internals and into the canonical shared string utility layer, then updating the exact tool consumers touched in the current boundary lane.

## Exact Target Files
- `src/engine/debug/inspectors/shared/inspectorUtils.js`
- `src/shared/utils/stringUtils.js`
- `tools/dev/commandPacks/groupCommandPack.js`
- `tools/dev/commandPacks/overlayCommandPack.js`
- `tools/dev/commandPacks/inspectorCommandPack.js`
- `tools/dev/presets/debugPresetApplier.js`

## Required Code Changes
1. In `src/shared/utils/stringUtils.js`
   - add/export `sanitizeText(...)` using the existing engine helper behavior exactly

2. In `src/engine/debug/inspectors/shared/inspectorUtils.js`
   - stop owning the canonical `sanitizeText` logic
   - preserve current engine-facing behavior by importing/re-exporting or delegating to the shared string utility
   - do not change unrelated helpers in this file

3. In the exact tool consumer files listed above
   - replace imports of `sanitizeText` from engine debug inspector internals with imports from `src/shared/utils/stringUtils.js`
   - do not modify any unrelated logic

## Hard Constraints
- exact files only
- do not widen to other consumers outside the exact list
- do not refactor non-string helpers
- do not change runtime behavior
- do not move any other utilities in this PR
- do not scan the repo broadly

## Validation Steps
- confirm only the exact target files changed
- confirm the listed tool files no longer import `sanitizeText` from engine debug inspector internals
- confirm engine-facing behavior remains intact
- confirm imports/exports resolve
- confirm no unrelated refactor or formatting churn was introduced

## Acceptance Criteria
- `sanitizeText` has a canonical shared home in `src/shared/utils/stringUtils.js`
- the exact listed tool consumers use the shared string utility import
- engine debug inspector utils no longer own the canonical implementation
- no behavior change
