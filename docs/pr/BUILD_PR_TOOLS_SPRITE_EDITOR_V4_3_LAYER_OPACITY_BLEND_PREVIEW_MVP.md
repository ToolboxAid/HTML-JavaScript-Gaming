Toolbox Aid
David Quesenberry
03/26/2026
BUILD_PR_TOOLS_SPRITE_EDITOR_V4_3_LAYER_OPACITY_BLEND_PREVIEW_MVP.md

# BUILD_PR — Sprite Editor v4.3 (Layer Opacity + Blend Preview MVP)

## Objective
Extend the new layer system with lightweight per-layer opacity control and a minimal blend preview capability, while preserving the current canvas-native architecture and keeping the implementation disciplined.

## Constraints
- Keep fixed 1600x900 logical space
- Keep SpriteEditorCanvasControlSurface as layout/control authority
- No DOM UI
- No architecture rewrite
- Reuse existing layer model, history engine, dirty-state system, save/load system, composited rendering path, and command system
- Keep this MVP intentionally small

## Requirements

### 1) Layer opacity
Add an `opacity` property to layers.

Requirements:
- range should be simple and explicit (Codex may choose 0.0–1.0 or 0–100, but it must be consistent)
- default must represent fully opaque
- opacity must persist through:
  - duplication
  - export/save
  - import/load
  - history undo/redo

### 2) Opacity-aware compositing
Composited rendering must now respect:
- visibility
- solo behavior
- opacity

This must affect:
- main canvas
- preview
- timeline thumbnails
- onion skin compositing
- sheet preview if it depends on composited rendering

Codex should keep the render path centralized and avoid duplicating compositing logic.

### 3) Lightweight opacity controls
Add canvas-native opacity controls for the active layer.

Acceptable approaches:
- `Opacity - / +`
- compact stepper
- small slider-like control if clean

Requirements:
- lightweight
- deterministic
- readable under current density modes
- no layout destabilization

### 4) Blend preview MVP
Add a minimal blend preview concept without turning this into a full blend-mode system.

Acceptable MVP options:
- normal compositing + one preview mode
- one or two lightweight preview modes only if clean
- or a “blend preview” toggle that changes how semi-transparent compositing is visualized

The important rule:
- keep this small
- keep it explicit
- do not introduce a large blend-mode matrix in v4.3

If Codex chooses an actual blend enum, keep it to a tiny set and make it obvious this is preview/MVP scope.

### 5) Active layer clarity
The active layer row should clearly surface opacity state.
Examples:
- compact percentage text
- opacity badge
- preview marker

Keep it readable and lightweight.

### 6) History integration
Opacity changes must be undoable.
Blend preview/layer blend changes (if persisted layer state) must also be undoable.

If a blend preview toggle is editor/view-state only, Codex should keep it out of history and be explicit about that.

### 7) Dirty-state integration
Opacity/blend-affecting saved layer state must participate in dirty-state tracking naturally.

### 8) Save/load compatibility
Save/export payloads must support the new opacity field and any minimal persisted blend property if implemented.

Load/import must remain backward compatible:
- missing opacity -> default opaque
- old files should continue loading safely

### 9) Command palette integration
Add first-class commands for at least:
- Layer: Opacity Up
- Layer: Opacity Down
- Layer: Opacity Reset

Optional if a persisted blend mode exists:
- Layer: Cycle Blend Preview
- Layer: Blend Normal
- Layer: Blend Preview

Commands must remain:
- searchable
- rankable
- alias-aware
- favorite-able
- macro-compatible

### 10) Editing safety
Locked-layer restrictions from v4.2 must remain correct.
Opacity or blend controls must not bypass lock expectations if Codex decides lock should cover them.
Codex should choose one consistent rule and keep it explicit.

Preferred simple rule:
- lock prevents pixel mutation
- visibility/solo/opacity remain allowed layer-state edits

But consistency matters more than the exact choice.

### 11) UI discipline
Do not let opacity/blend additions destabilize:
- right panel layout
- timeline
- overflow strategy
- playback controls
- command palette
- current selection workflows

Keep the MVP tight.

## Validation
- layer opacity can be adjusted
- composited render respects opacity
- preview/timeline/onion-skin reflect opacity correctly
- opacity changes are undoable
- save/load preserves opacity
- backward compatibility remains safe
- command palette opacity actions work
- no layout regression
- no console errors

## Scope
tools/*
docs/*
