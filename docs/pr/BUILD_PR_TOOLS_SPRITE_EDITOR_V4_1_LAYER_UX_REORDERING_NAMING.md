Toolbox Aid
David Quesenberry
03/26/2026
BUILD_PR_TOOLS_SPRITE_EDITOR_V4_1_LAYER_UX_REORDERING_NAMING.md

# BUILD_PR — Sprite Editor v4.1 (Layer UX + Reordering + Naming)

## Objective
Refine the new layer system so it becomes more usable in daily work by adding lightweight layer reordering, naming, and stronger active-layer clarity, without changing the current architecture.

## Constraints
- Keep fixed 1600x900 logical space
- Keep SpriteEditorCanvasControlSurface as layout/control authority
- No DOM UI
- No architecture rewrite
- Reuse existing layer model, command system, history engine, dirty-state system, and canvas-native interaction patterns

## Requirements

### 1) Layer reordering
Add a lightweight way to reorder layers.

Acceptable approaches:
- drag-to-reorder in the layer list
- move up / move down controls
- or both if clean

Requirements:
- visual feedback while reordering
- deterministic final order
- resulting reorder must be undoable as a single history action
- composited render updates correctly after reorder

Codex should choose the simplest reliable approach that fits the current control surface cleanly.

### 2) Layer naming
Add lightweight layer rename support.

Acceptable approaches:
- command-palette action that renames selected layer
- compact inline rename state if it remains canvas-native and simple
- small prompt-style canvas-native rename overlay if needed

Requirements:
- no DOM input fields
- no architecture drift
- renamed layer persists in saved format
- undo/redo behavior should remain safe and predictable

If direct history integration for rename is easy, include it.
If not, Codex should still keep it safe and explicit.

### 3) Active layer clarity
Improve visual clarity of the currently active layer.

Examples:
- stronger highlight
- prefix marker
- clearer contrast
- more obvious active indicator

This should remain readable under current density modes.

### 4) Optional simple solo behavior
If Codex finds it clean and low-risk, a temporary solo-layer action is acceptable.
But this is optional and should not delay the main goals.

### 5) Command palette integration
Add first-class commands for at least:
- Layer: Move Up
- Layer: Move Down
- Layer: Rename

Optional if implemented:
- Layer: Solo

These commands must be:
- searchable
- rankable
- alias-aware
- favorite-able
- macro-compatible

### 6) Save/load consistency
Layer order and names must persist correctly through:
- save/export
- load/import
- undo/redo transitions

### 7) History/dirty integration
Layer reorder must be undoable.
Rename should be history-safe if practical and must always participate in dirty-state correctly.

### 8) UI discipline
Do not let layer UX changes destabilize:
- right panel layout
- timeline
- overflow handling
- command palette
- playback/onion-skin behavior

Keep the implementation disciplined and lightweight.

## Validation
- layers can be reordered
- reorder updates compositing correctly
- reorder is undoable
- layers can be renamed
- names persist through save/load
- active layer is clearly indicated
- command palette layer actions work
- no layout regression
- no console errors

## Scope
tools/*
docs/*
