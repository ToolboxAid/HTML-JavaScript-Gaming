Toolbox Aid
David Quesenberry
03/26/2026
BUILD_PR_TOOLS_SPRITE_EDITOR_V3_7_ONION_SKIN_MULTI_FRAME.md

# BUILD_PR — Sprite Editor v3.7 (Onion Skin + Multi-Frame Editing)

## Objective
Add animation-aware onion skin rendering so users can see adjacent frames while editing the current frame, without rewriting the editor architecture.

## Constraints
- Keep fixed 1600x900 logical space
- Keep SpriteEditorCanvasControlSurface as layout/control authority
- No DOM UI
- No architecture rewrite
- Reuse existing multi-frame, command, keyboard, and rendering systems
- Keep frame edits history-safe

## Requirements

### 1) Onion skin rendering
Add optional onion skin overlays for adjacent frames.

Minimum:
- previous frame overlay

Preferred if still lightweight:
- previous frame
- next frame

### 2) Visual treatment
Onion skin overlays must be visually distinct from the active frame.

Acceptable treatments:
- tinted colors
- reduced alpha
- dimmed overlay
- different treatment for previous vs next frame

Codex may choose the cleanest readable approach, but the active frame must remain visually dominant.

### 3) Toggle controls
Add command/keyboard integration.

Required:
- `O` -> toggle onion skin

Optional if simple:
- `Shift+O` -> toggle next-frame overlay separately

These toggles must integrate with:
- command palette
- aliases
- favorites
- ranking

### 4) Editing model
For v3.7, onion skin is visual reference only.

Meaning:
- drawing/editing still affects the current frame only
- no simultaneous multi-frame painting
- no architecture expansion into full layered animation editing

### 5) Rendering integration
Reuse the current render pipeline.
Do not duplicate heavy frame rendering paths unnecessarily.

Only render onion skins when enabled.

### 6) Performance and clarity
Onion skin must:
- remain readable under zoom/pan
- not obscure current-frame pixels
- not break pixel-perfect mode expectations
- avoid obvious performance regressions

### 7) History behavior
Onion skin toggles are view/editor-state toggles and do not need to be history actions.
Normal frame edits remain handled through the existing history engine.

### 8) Visual state feedback
Surface current onion-skin status somewhere lightweight, such as:
- status bar
- command palette labels
- compact toggle text

No UI clutter.

## Validation
- onion skin toggles on/off
- previous frame renders correctly
- next frame renders correctly if implemented
- current frame remains dominant
- edits still affect current frame only
- no obvious performance regressions
- no console errors

## Scope
tools/*
docs/*
