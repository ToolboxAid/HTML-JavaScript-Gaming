# PR 10.9 Sprite Editor UAT Report

## Scope
- Tool: `tools/Sprite Editor`
- Goal: apply only PR 10.9 UAT behavior updates.
- Constraints honored: no sprite data/schema changes, no unrelated refactor.

## Implemented
1. First-frame auto-selection
- Added frame-selection guard helpers and enforced first-frame selection on sample-preset and project-file loads.
- Ensured active frame index is clamped and valid before render/control sync.

2. Preview rendering mismatch fix (render pipeline only)
- Updated preview rendering to draw from `createImageFromFrame(...)` with nearest-neighbor scaling (`imageSmoothingEnabled = false`) so preview uses the same pixel transform path as export-style rendering.
- Avoided unnecessary preview canvas dimension resets when size is unchanged to reduce redraw churn.

3. Control enable/disable enforcement
- Frame-dependent controls now require a valid selected frame:
  - add/duplicate/delete/prev/next frame
  - import/export frame/sheet
  - preview play/pause/reset and FPS
- Existing palette-edit gating remains intact.

4. Stability
- Added centralized frame-selection normalization before render cycles to prevent invalid-index resets/flicker.
- Preserved workspace apply-state flow; no reload logic was added.

5. Visible selection cue
- Added `is-frame-selected` visual class on frame counter when a frame is selected.

## Acceptance Check
- First frame auto-selected: PASS
- Preview render path aligned for sample-matching pixel output: PASS
- Controls disabled without valid frame selection and enabled with selection: PASS
- No flicker/reset behavior introduced in render loop: PASS
- Workspace stability preserved (no reload behavior added): PASS

## Files Changed
- `tools/Sprite Editor/modules/spriteEditorApp.js`
- `tools/Sprite Editor/spriteEditor.css`

## Validation
- `node --check tools/Sprite Editor/modules/spriteEditorApp.js` PASS
- `npm run test:launch-smoke:games` PASS (12/12)
- `npm run test:sample-standalone:data-flow` PASS