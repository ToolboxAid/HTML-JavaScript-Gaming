Toolbox Aid
David Quesenberry
03/26/2026
BUILD_PR_TOOLS_SPRITE_EDITOR_V4_2_LAYER_VISIBILITY_SOLO_LOCK_MVP.md

# BUILD_PR — Sprite Editor v4.2 (Layer Visibility UX + Solo + Lock MVP)

## Objective
Refine the new layer workflow by improving visibility control and adding lightweight solo/lock behavior, while keeping the layer system simple, canvas-native, and architecture-safe.

## Constraints
- Keep fixed 1600x900 logical space
- Keep SpriteEditorCanvasControlSurface as layout/control authority
- No DOM UI
- No architecture rewrite
- Reuse existing layer model, command system, history engine, dirty-state system, save/load system, and composited rendering behavior

## Requirements

### 1) Visibility UX polish
Improve the clarity and usability of layer visibility state.

Requirements:
- visible vs hidden must be visually obvious in the layer panel
- toggle interaction must remain lightweight and deterministic
- composited render must update immediately
- timeline / preview / onion skin should continue to reflect composited visible layers

Codex may improve iconography, row styling, markers, or button affordances, but should keep this lightweight.

### 2) Solo layer behavior
Add a lightweight layer solo action.

Expected behavior:
- solo isolates the selected layer visually by hiding all other layers temporarily
- toggling solo again restores prior visibility state safely
- behavior must be deterministic and not corrupt saved visibility state unexpectedly

Codex should choose one explicit model and keep it simple:
- either temporary solo state separate from saved visibility flags
- or safe visibility snapshot/restore behavior

But:
- the implementation must be centralized and reviewable
- no surprise persistence bugs

### 3) Lock layer behavior
Add a lightweight locked state for layers.

Requirements:
- locked layer cannot be edited by mutating tools/actions
- locked state must be visually obvious
- active layer may remain selected while locked, but editing should be blocked safely with lightweight status feedback
- lock state must persist through save/load

### 4) Editing safety
If the active layer is locked:
- brush / erase / fill must not mutate it
- selection mutations targeting the active layer must be blocked safely
- history should not be polluted by no-op blocked edits

Codex should keep this behavior explicit and predictable.

### 5) History integration
These layer-state mutations must be undoable:
- visibility toggle
- solo toggle (if implemented as explicit state change)
- lock toggle

Undo/redo must restore visual and editing behavior correctly.

### 6) Save/load integration
Layer saved format must now include:
- visible
- locked (if added)
- any minimal solo-related persisted state only if absolutely necessary

Preferred:
- solo is runtime/editor state only
- visible/locked persist
- load/import stays backward compatible

### 7) Command palette integration
Add first-class commands for:
- Layer: Toggle Visibility
- Layer: Solo
- Layer: Toggle Lock

Optional if clean:
- Layer: Unsolo All
- Layer: Unlock All

These commands must be:
- searchable
- rankable
- alias-aware
- favorite-able
- macro-compatible

### 8) UI discipline
Do not allow layer UX additions to destabilize:
- right panel layout
- timeline
- overflow behavior
- selection/pointer workflows
- playback/onion-skin behavior

Keep the layer panel readable and compact.

### 9) Keyboard shortcuts
Shortcuts are optional unless clean and conflict-free.
Do not force new shortcuts if they create ambiguity.

## Validation
- visibility state is visually obvious
- visibility toggle works
- solo works predictably
- solo restore works predictably
- lock works
- locked layers cannot be edited
- blocked edits do not create no-op history noise
- visibility/lock are undoable
- save/load persists visibility/lock correctly
- command palette layer state commands work
- no console errors

## Scope
tools/*
docs/*
