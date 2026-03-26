Toolbox Aid
David Quesenberry
03/26/2026
BUILD_PR_TOOLS_SPRITE_EDITOR_V2_4_TOOLBAR_DENSITY_SCALING_PRO_MODE.md

# BUILD_PR — Sprite Editor v2.4 (Toolbar Density Scaling / Pro Mode)

## Objective
Implement toolbar density scaling with Standard and Pro modes.

## Requirements

### Density System
Introduce a centralized density configuration object:
- topButtonHeight
- sideButtonHeight
- spacing
- padding
- frameThumbHeight
- labelHeight

### Modes
- Standard (default)
- Pro (compact)

### Behavior

#### Standard Mode
- current layout preserved

#### Pro Mode
- reduced spacing
- smaller buttons
- shortened labels where needed
- no overlap or clipping

### Control
- Add toggle in top bar:
  Mode: Standard / Mode: Pro

### Layout Rules
- Right-aligned grouping must remain stable
- No overlap with Full Screen button
- No wrapping

### Persistence
- Save mode to local storage
- Restore on load

### Architecture Constraints
- Keep 1600x900 logical space
- Keep SpriteEditorCanvasControlSurface as layout authority
- No DOM UI additions

## Validation
- No overlap in either mode
- Controls readable
- Hit detection accurate
- Frame drag intact
- Zoom/pan unaffected
- Mode persists
- No console errors

## Scope
tools/*
docs/*
