Toolbox Aid
David Quesenberry
03/26/2026
BUILD_PR_TOOLS_SPRITE_EDITOR_V4_4_LAYER_MERGE_FLATTEN_EXPORT_SAFETY.md

# BUILD_PR — Sprite Editor v4.4 (Layer Merge + Flatten + Export Safety)

## Objective
Add safe destructive-output layer operations so users can merge and flatten layers confidently, while preserving the current canvas-native architecture, history safety, and save/load discipline.

## Constraints
- Keep fixed 1600x900 logical space
- Keep SpriteEditorCanvasControlSurface as layout/control authority
- No DOM UI
- No architecture rewrite
- Reuse existing layer model, history engine, dirty-state system, save/load system, command system, and composited rendering pipeline
- Keep destructive actions explicit and safe

## Requirements

### 1) Merge Down
Add a lightweight `Layer: Merge Down` action.

Expected behavior:
- merges the active layer into the next lower layer in stack order
- result should preserve visible composited pixel outcome for those two layers as simply and safely as practical
- removes the source layer after merge
- chooses a deterministic resulting active layer

Codex should choose one explicit rule for how merged metadata behaves:
- keep lower-layer name
- or keep upper-layer name
- or generate a clear merged name

But it must be consistent and lightweight.

### 2) Flatten Frame
Add a lightweight `Layer: Flatten Frame` action.

Expected behavior:
- collapses all visible/composited layer content for the active frame into a single layer
- resulting layer should preserve the visible composited frame result as closely as practical
- hidden layers handling must be explicit:
  - either excluded from flatten result
  - or optionally included if Codex chooses a clear consistent rule

Preferred MVP:
- flatten visible result into one layer
- hidden layers are not included in the flattened output

Codex should keep this simple and document the rule in code/comments.

### 3) Export safety / destructive safety
Flatten is destructive and should be guarded.

Requirements:
- canvas-native confirm/cancel prompt before flatten
- no DOM dialogs
- cancel must leave state/history untouched

Merge Down may be considered light enough to skip confirm if Codex judges it reasonable, but flatten must be guarded.

### 4) History integration
Merge and flatten must be undoable as single history actions.

Requirements:
- one undo step restores full prior layered structure
- redo reapplies the destructive action cleanly
- no history corruption

### 5) Dirty-state integration
Merge/flatten must participate in dirty-state tracking naturally.

### 6) Save/load compatibility
Layered save/load must continue to work.
After merge/flatten:
- saved format remains valid
- layer counts/order/names remain consistent
- no backward-compat breakage

### 7) Command palette integration
Add first-class commands for:
- Layer: Merge Down
- Layer: Flatten Frame

These commands must be:
- searchable
- rankable
- alias-aware
- favorite-able
- macro-compatible

### 8) UI discipline
Do not let merge/flatten safety additions destabilize:
- right panel layout
- timeline
- overflow logic
- command palette
- playback/onion skin behavior

Use current canvas-native guard/confirm patterns where practical.

### 9) Safety rules
Blocked or invalid operations must fail safely.
Examples:
- Merge Down when no lower layer exists
- Flatten when only one layer exists and action is effectively a no-op

Codex should provide lightweight status feedback and avoid no-op history pollution.

### 10) Rendering consistency
After merge/flatten:
- main canvas
- preview
- timeline thumbnails
- onion skin
- sheet preview

must all remain correct through the existing composited render path.

## Validation
- Merge Down works
- Merge Down is undoable
- Flatten Frame works
- Flatten confirm/cancel works
- Flatten is undoable
- No-op destructive actions fail safely
- Dirty state updates correctly
- Save/load remains valid
- Command palette merge/flatten actions work
- No console errors

## Scope
tools/*
docs/*
