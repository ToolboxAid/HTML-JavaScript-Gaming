Toolbox Aid
David Quesenberry
03/26/2026
BUILD_PR_TOOLS_SPRITE_EDITOR_V3_5_HISTORY_UX_DIRTY_STATE_SAVE_SAFETY.md

# BUILD_PR — Sprite Editor v3.5 (History UX + Dirty State + Save Safety)

## Objective
Improve trust and usability around the new undo/redo system by adding dirty-state tracking, clearer history-aware feedback, and lightweight save/load safety behavior.

## Constraints
- Keep fixed 1600x900 logical space
- Keep SpriteEditorCanvasControlSurface as layout/control authority
- No DOM UI
- No architecture rewrite
- Reuse existing history, command, palette, and dispatch systems

## Requirements

### 1) Dirty state tracking
Add a lightweight dirty-state model that tracks whether the current editor state differs from the last saved / accepted baseline.

Acceptable forms:
- `isDirty`
- `revision`
- `savedRevision`
- equivalent lightweight marker

Codex should choose the smallest reliable implementation.

### 2) Baseline updates
Dirty state must update correctly when:
- mutating actions occur
- undo/redo occurs
- save/export establishes a clean baseline
- load/import replaces state and becomes the new accepted baseline

### 3) History-aware UX
Improve status/readout so users can understand:
- whether the document is modified
- the next undo label
- the next redo label
- when a save/load/import has reset the dirty state

Examples:
- `Modified`
- `Saved`
- `Undo: Duplicate Frame`
- `Redo: Flip Selection`

Codex may choose exact wording, but the information should be clear and lightweight.

### 4) Save safety for destructive replacement
Before destructive replacement actions such as:
- load local
- import JSON
- any other full-state replacement currently in the editor

If dirty state is true:
- show a lightweight canvas-native confirm/cancel prompt
- do not silently replace state

This should remain simple and consistent with the current canvas-native UI.
Do not add DOM dialogs.

### 5) Command palette integration
Ensure core save/load actions remain accessible through the command system.
If practical, include:
- Save
- Load
- Import
- optionally a revert/reset command if already supported safely

Do not add unnecessary new features beyond history/save safety.

### 6) Undo/redo + dirty consistency
Undo/redo must correctly influence dirty state.
Examples:
- If the user undoes back to the last saved state, dirty should clear
- If they redo into a modified state, dirty should return

### 7) Failure safety
If a guarded destructive action is cancelled:
- no state should change
- dirty state should remain correct
- history should remain intact

## Validation
- Dirty state changes correctly after edits
- Save/export clears dirty state correctly
- Undo/redo updates dirty state correctly
- Load/import is guarded when dirty
- Canceling guarded action preserves state
- Status/readout clearly reflects undo/redo + dirty state
- No console errors

## Scope
tools/*
docs/*
