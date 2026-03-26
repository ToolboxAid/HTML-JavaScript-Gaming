Toolbox Aid
David Quesenberry
03/26/2026
BUILD_PR_TOOLS_SPRITE_EDITOR_V4_0_LAYER_SYSTEM_MVP.md

# BUILD_PR — Sprite Editor v4.0 (Layer System MVP)

## Objective
Add a minimal but real layer system so each frame supports composited editing through an active layer, while preserving the existing canvas-native architecture and keeping the first pass intentionally tight.

## Constraints
- Keep fixed 1600x900 logical space
- Keep SpriteEditorCanvasControlSurface as layout/control authority
- No DOM UI
- No architecture rewrite
- Reuse existing command, history, dirty-state, timeline, onion-skin, and save/load systems

## Requirements

### 1) Per-frame layer stack
Each frame must support a list of layers instead of a single flat pixel grid.

Minimum layer shape:
- id
- name
- visible
- pixels

Optional only if trivial:
- locked

Do not add:
- blend modes
- opacity sliders
- masks
- folders/groups

### 2) Backward compatibility
Existing single-grid frame data must load safely by being migrated into a one-layer frame:
- default layer name such as `Layer 1`
- no data loss

New saves/exports should use the layered format.

### 3) Active layer editing
At any time one layer is active.

Requirements:
- brush / erase / fill apply to active layer only
- selection mutations apply to active layer only for v4.0
- active layer is clearly indicated in the UI

For MVP, this simple rule is preferred over trying to support multi-layer selection editing.

### 4) Composited rendering
Frame rendering must composite all visible layers in stack order.

Requirements:
- main canvas uses composited result
- preview uses composited result
- timeline thumbnails use composited result
- onion skin uses composited result of adjacent frames

Top-down compositing with transparency is sufficient.

### 5) Layer controls (canvas-native)
Add a lightweight layer control surface inside the existing canvas UI.

Minimum actions:
- select layer
- add layer
- duplicate layer
- delete layer
- toggle visibility

Optional if clean:
- move layer up
- move layer down

Do not build a large complex layer editor UI in v4.0.

### 6) Safe layer defaults
When:
- creating a new frame
- duplicating a frame
- importing old data

ensure each frame ends up with at least one valid layer.

### 7) Timeline / onion skin consistency
Timeline thumbnails and onion skin should use composited visible layers, not raw active-layer pixels.

Keep this simple and consistent.

### 8) History integration
Layer mutations must be undoable through the existing history engine:
- add layer
- duplicate layer
- delete layer
- toggle visibility
- move layer if implemented
- edits to the active layer

Do not bypass the existing history architecture.

### 9) Dirty-state integration
Layer mutations must participate in the existing dirty-state system naturally.

### 10) Save/load integration
Save/export payloads must include layers.

Load/import must support:
- new layered format
- safe migration from old single-grid format

### 11) Command palette integration
Add first-class commands for at least:
- Layer: Add
- Layer: Duplicate
- Layer: Delete
- Layer: Toggle Visibility
- Layer: Select Next
- Layer: Select Previous

Optional if clean:
- Layer: Move Up
- Layer: Move Down

These commands must be:
- searchable
- rankable
- alias-aware
- favorite-able
- macro-compatible

### 12) UI fit
The layer system must fit within the current canvas-native layout without destabilizing:
- top bar
- timeline
- overflow strategy
- status/readout

Codex should keep this disciplined and lightweight.

## Validation
- Frames support layered structure
- Old single-grid data loads safely
- Active layer editing works
- Visible layers composite correctly
- Hidden layers do not render
- Layer add/duplicate/delete works
- Visibility toggle works
- Timeline/previews use composited frame result
- Onion skin uses composited frame result
- Layer mutations are undoable
- Dirty state updates correctly
- Save/load works with layers
- Layer commands appear in command palette
- No console errors

## Scope
tools/*
docs/*
