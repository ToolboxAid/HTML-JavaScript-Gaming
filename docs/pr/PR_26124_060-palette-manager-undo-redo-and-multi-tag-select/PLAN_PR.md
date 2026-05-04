# PLAN_PR - PR_26124_060-palette-manager-undo-redo-and-multi-tag-select

## Goal
Add Palette Manager V2 undo/redo history for user palette mutations, add User Palette multi-select checkboxes, and support batch tag application from the Tags accordion.

## Scope
- `tools/palette-manager-v2/*`
- Existing `src/` undo/history class consumption only if a suitable class exists.
- PR workflow docs and required review artifacts only.

## Existing History Search
- Search under `src/` for undo/history/command stack classes before implementation.
- If a reusable undo/history stack is not found, implement the smallest local Palette Manager V2 history stack.

## Boundaries
- Do not touch workspace/toolState/session behavior.
- Do not touch sample JSON.
- Do not modify `tools/shared`.
- Do not add dependencies.
- Preserve accordionV2 behavior.
- Preserve import/export, sort, search, size, pin/unpin, and Pin All behavior.
- Avoid broad refactor.

## Implementation Plan
1. Add Undo and Redo buttons to the existing `menuSample` nav.
2. Track user palette mutation snapshots for add, update, remove/unpin, pin, Pin All, tag add/remove, batch tag changes, and unused tag deletion.
3. Restore user palette state, selected swatch state, and available unused tag state safely during undo/redo.
4. Add a checkbox to each User Palette tile without changing tile selection behavior.
5. Add selected-count status near User Palette controls.
6. When User Palette checkboxes are selected, make Tags accordion tag clicks and Add Tag apply to the checked swatches.
7. When no checkboxes are selected, preserve the current selected-swatch tag behavior.
8. Preserve lowercase tag normalization and duplicate tag avoidance.

## Playwright
- Command: `npm run test:workspace-v2`
- What Playwright validates: Workspace V2/tool lifecycle coverage remains unchanged by this Palette Manager V2-only UI/history update.
- Expected pass behavior: Workspace V2 validation remains green.
- Expected fail behavior: missing script or Workspace V2 regression is reported.
- Full samples smoke test: skipped by instruction.

## Manual Validation
1. Open Palette Manager V2.
2. Add a user swatch, click Undo, and confirm the swatch is removed and Redo becomes available.
3. Click Redo and confirm the swatch returns and selection is restored safely.
4. Pin a source swatch and confirm Undo removes the pinned swatch.
5. Select multiple User Palette checkboxes and confirm the selected count updates.
6. Add a tag from the Tags accordion and confirm the tag is applied to all checked swatches in lowercase without duplicates.
7. Click an existing tag while multiple swatches are checked and confirm the tag toggles across the checked swatches.
