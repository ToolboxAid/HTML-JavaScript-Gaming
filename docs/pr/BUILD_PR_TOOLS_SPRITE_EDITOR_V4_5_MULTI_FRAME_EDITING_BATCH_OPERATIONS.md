Toolbox Aid
David Quesenberry
03/26/2026
BUILD_PR_TOOLS_SPRITE_EDITOR_V4_5_MULTI_FRAME_EDITING_BATCH_OPERATIONS.md

# BUILD_PR — Sprite Editor v4.5 (Multi-Frame Editing + Batch Operations)

## Objective
Add lightweight multi-frame editing and batch operations so users can work across frame ranges efficiently, while preserving the current canvas-native architecture, layer system, history safety, and command workflow.

## Constraints
- Keep fixed 1600x900 logical space
- Keep SpriteEditorCanvasControlSurface as layout/control authority
- No DOM UI
- No architecture rewrite
- Reuse existing frame model, layer model, history engine, dirty-state system, command palette, timeline, selection, and playback systems
- Keep batch actions atomic and undo-safe

## Requirements

### 1) Frame range selection
Add a lightweight frame-range selection model.

Requirements:
- support selecting a contiguous range of frames
- integrate naturally with the existing timeline strip
- current single active frame behavior must still work
- selected range must be visually obvious in the timeline

Acceptable interaction:
- Shift+click range selection
- click-drag range selection
- or another lightweight canvas-native interaction if consistent and deterministic

Codex should choose the simplest reliable approach.

### 2) Multi-frame editing scope
For v4.5, batch editing should apply to the selected frame range only.

Keep the MVP explicit:
- if no range is selected, operations apply to current frame as before
- if a range is selected, certain batch commands operate across all selected frames

Do not attempt freeform simultaneous painting across frames in this PR.

### 3) Batch operations
Add a small, high-value set of batch operations.

Required candidates:
- Duplicate selected frame range
- Delete selected frame range
- Shift selected frame range left
- Shift selected frame range right

Optional only if clean and safe:
- apply current fill across selected frames on the active layer
- clear active layer across selected frames

Codex should keep this tight and prioritize operations that are simple, predictable, and history-safe.

### 4) History behavior
Batch operations must be atomic and undoable.

Requirements:
- one batch operation -> one history entry
- undo restores the full prior frame ordering/content/range state
- redo reapplies the full batch cleanly
- no partial corruption

This is critical.

### 5) Layer safety
Batch operations must remain consistent with the layer system.

Examples:
- duplicating frames duplicates their full layer stacks
- deleting frames removes full layered frames safely
- range operations must preserve per-frame layered data

No flattening or layer loss.

### 6) Timeline integration
Timeline must clearly show:
- current active frame
- selected range
- reordered/shifted result after batch ops

Timeline interaction must remain deterministic and should not break scrubbing/playback unnecessarily.

### 7) Command palette integration
Add first-class commands for at least:
- Frame: Duplicate Range
- Frame: Delete Range
- Frame: Shift Range Left
- Frame: Shift Range Right

Optional if a clear selection command is introduced:
- Frame: Clear Range Selection

Commands must be:
- searchable
- rankable
- alias-aware
- favorite-able
- macro-compatible

### 8) Safety behavior
Invalid/no-op batch actions must fail safely.

Examples:
- shifting left when already at start
- shifting right when already at end
- deleting all frames if editor requires at least one frame
- duplicate/delete with no meaningful range selected

Codex should provide lightweight status feedback and avoid no-op history pollution.

### 9) Dirty-state integration
Batch operations must participate in dirty-state tracking naturally.

### 10) Playback/scrubbing consistency
Batch frame operations must not corrupt:
- playback order
- active frame selection
- timeline scrubbing behavior
- onion skin adjacency

Codex should keep playback/timeline state coherent after batch operations.

### 11) UI discipline
Do not destabilize:
- layer panel
- timeline layout
- command palette
- overflow logic
- selection gizmo
- playback controls

Keep the batch model simple and explicit.

## Validation
- frame range selection works
- selected range is visually clear
- duplicate range works
- delete range works
- shift range left/right works
- batch operations are undoable as single actions
- layer data survives batch ops correctly
- active frame/timeline/playback remain coherent
- invalid batch ops fail safely
- command palette frame-range actions work
- no console errors

## Scope
tools/*
docs/*
