Toolbox Aid
David Quesenberry
03/26/2026
BUILD_PR_TOOLS_SPRITE_EDITOR_V4_7_BRUSH_ENGINE_SHAPE_TOOLS_MVP.md

# BUILD_PR — Sprite Editor v4.7 (Brush Engine + Shape Tools MVP)

## Objective
Introduce a minimal but powerful brush engine and basic shape tools to improve drawing speed and precision, while preserving the canvas-native architecture and existing action/history systems.

## Constraints
- Keep fixed 1600x900 logical space
- Keep SpriteEditorCanvasControlSurface as layout/control authority
- No DOM UI
- No architecture rewrite
- Reuse existing pointer, selection, layer, history, command, and rendering systems
- Maintain pixel-grid alignment and deterministic behavior

## Requirements

### 1) Brush engine (MVP)
Add a centralized brush configuration:

Minimum:
- brush.size (integer, default 1)
- brush.shape (square | circle)
- brush.mode (draw | erase) using existing tool paths

Behavior:
- size > 1 paints a block centered on the cursor in grid-space
- always aligned to pixel grid (no subpixel rendering)
- deterministic coverage (same stroke = same result)

### 2) Stroke handling
- Integrate with existing pointer draw flow
- Ensure continuous strokes (no gaps when moving quickly)
- Reuse existing history stroke batching:
  - begin stroke
  - commit stroke as one history entry

### 3) Shape tools (MVP)
Add tools:
- Line
- Rectangle (outline)
- Rectangle (filled)
- Circle (outline, optional if clean)
- Circle (filled, optional if clean)

Behavior:
- click-drag defines shape bounds
- preview during drag (ghost render)
- commit on pointer up
- shapes write to active layer only

### 4) Shape preview
- non-destructive preview during drag
- rendered on top of composited view
- cleared on commit or cancel

### 5) Command palette integration
Add commands:
- Tool: Brush
- Tool: Erase
- Tool: Line
- Tool: Rectangle
- Tool: Fill Rectangle
- Tool: Circle (optional)
- Tool: Fill Circle (optional)
- Brush: Size Up
- Brush: Size Down
- Brush: Toggle Shape (Square/Circle)

Commands must integrate with:
- ranking
- aliases
- favorites
- macros

### 6) Keyboard integration (lightweight)
Optional but preferred:
- number keys (1–5) for brush sizes if clean
- shortcuts for tools if not conflicting

### 7) Status/readout
Bottom status should show:
- active tool
- brush size
- brush shape

### 8) History behavior
- strokes = single history entry
- shapes = single history entry
- no no-op entries

### 9) Safety behavior
- respect layer lock
- respect selection constraints if applicable
- fail safely with status message

### 10) Rendering integration
Brush + shapes must flow through:
- layer compositing
- onion skin (view only)
- timeline thumbnails
- preview panels

### 11) UI discipline
Do not break:
- control surface layout
- timeline panel
- layer panel
- playback system
- command palette
- overflow system

## Validation
- brush size works (1–N)
- strokes are continuous
- shapes preview correctly
- shapes commit correctly
- undo/redo works for strokes and shapes
- locked layers block edits
- commands appear in palette
- no console errors

## Scope
tools/*
docs/*
