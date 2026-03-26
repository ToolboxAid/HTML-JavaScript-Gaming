Toolbox Aid
David Quesenberry
03/26/2026
BUILD_PR_TOOLS_SPRITE_EDITOR_V2_5_ADAPTIVE_DENSITY_LAYOUT_RESILIENCE.md

# BUILD_PR — Sprite Editor v2.5 (Adaptive Density + Layout Resilience)

## Objective
Implement adaptive toolbar/control density selection while preserving the existing canvas-native architecture.

## Required Modes
- Auto
- Standard
- Pro

## Requirements

### Density Model
Introduce a single centralized density decision path that determines:
- selected density mode
- effective density mode
- derived spacing/button/padding/thumb sizing

Do not scatter density branching across the codebase.

### Auto Mode
When density mode is Auto:
- inspect usable control/layout space
- choose Standard when comfortable
- choose Pro when tighter
- prevent overlap and clipping

### Manual Modes
When user explicitly selects:
- Standard
- Pro

that selection must override Auto until changed again.

### Persistence
Persist:
- chosen density mode
- restore on load

### Layout Resilience
Adaptive density must preserve:
- right-aligned top-bar grouping
- Full Screen visibility
- readable frame strip
- readable left-side action groups
- status bar readability
- exact hit-testing

### Architecture Constraints
- Keep 1600x900 logical space
- Keep SpriteEditorCanvasControlSurface as layout authority
- No DOM control additions
- No architecture rewrite
- No feature expansion beyond density/layout resilience

## Validation
- Auto mode works
- Standard works
- Pro works
- No overlap in any mode
- No clipped text in any mode
- Full Screen remains visible
- Hit-testing remains correct
- Mode persists after reload
- No console errors

## Scope
tools/*
docs/*
