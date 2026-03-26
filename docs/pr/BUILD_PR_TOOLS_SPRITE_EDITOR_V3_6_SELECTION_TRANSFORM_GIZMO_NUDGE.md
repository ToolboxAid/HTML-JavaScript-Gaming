Toolbox Aid
David Quesenberry
03/26/2026
BUILD_PR_TOOLS_SPRITE_EDITOR_V3_6_SELECTION_TRANSFORM_GIZMO_NUDGE.md

# BUILD_PR — Sprite Editor v3.6 (Selection Transform Gizmo + Nudge Controls)

## Objective
Add a canvas-native selection transform workflow so users can move selections visually and precisely, with keyboard nudge support and safe history integration.

## Constraints
- Keep fixed 1600x900 logical space
- Keep SpriteEditorCanvasControlSurface as layout/control authority
- No DOM UI
- No architecture rewrite
- Reuse existing selection, history, keyboard, and command systems

## Requirements

### 1) Canvas-native selection transform gizmo
When a selection exists:
- draw a crisp bounding box
- draw visible move handles or corner handles
- optionally draw a center indicator if helpful

This should remain lightweight and readable under zoom.

### 2) Move interaction
Support moving an existing selection visually:
- click/drag selection body or handle to move it
- keep movement aligned to logical pixel coordinates
- preserve pixel-perfect behavior under zoom/pan

Codex may choose the simplest reliable move interaction, but it must be precise and deterministic.

### 3) Keyboard nudge
Add keyboard nudge support:
- Arrow keys -> move selection by 1 logical pixel
- Shift + Arrow -> move selection by a larger fixed step (for example 8 pixels)

Nudging must:
- remain aligned to logical grid
- respect selection bounds behavior chosen by the editor
- not interfere with text/editable targets

### 4) History integration
Selection movement must be undoable/redoable.

Preferred behavior:
- a drag move becomes one history entry
- nudges may be grouped sensibly or recorded per action, but behavior must be consistent

### 5) Command integration
Add command-palette actions for:
- Selection: Nudge Up
- Selection: Nudge Down
- Selection: Nudge Left
- Selection: Nudge Right

Optional:
- larger-step variants if simple and clean

These commands must:
- be searchable
- be alias-friendly
- be favorite-able
- be macro-compatible

### 6) Visual clarity
Selection visuals must remain:
- crisp under pixel-perfect mode
- stable under zoom/pan
- clearly distinct from ordinary hover/paint feedback

### 7) Safety / bounds
Movement behavior must be explicit and safe.
Codex should choose one clear model:
- clamp movement to canvas bounds
or
- allow partial movement with safe clipping

But the behavior must be deterministic and not corrupt pixel data.

### 8) No architecture drift
Do not:
- add DOM overlays
- bypass the history engine
- bypass centralized command dispatch
- rewrite the selection model unnecessarily

## Validation
- selection bounding box/gizmo renders clearly
- drag move works
- arrow-key nudging works
- shift+nudge works
- undo/redo works for selection movement
- command palette nudge actions work
- no pixel drift under zoom/pan
- no console errors

## Scope
tools/*
docs/*
