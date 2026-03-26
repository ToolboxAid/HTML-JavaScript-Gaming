Toolbox Aid
David Quesenberry
03/26/2026
BUILD_PR_TOOLS_SPRITE_EDITOR_V4_8_TOP_BAR_MENU_CONSOLIDATION_MVP.md

# BUILD_PR — Sprite Editor v4.8 (Top Bar Menu Consolidation MVP)

## Objective
Reduce top-bar clutter by consolidating lower-frequency actions into compact canvas-native menus, while preserving fast access to high-frequency workflow controls and keeping the current architecture intact.

## Constraints
- Keep fixed 1600x900 logical space
- Keep SpriteEditorCanvasControlSurface as layout/control authority
- No DOM UI
- No architecture rewrite
- Reuse existing canvas-native popover/overflow interaction patterns where practical
- Preserve the existing command palette and keyboard workflows

## Requirements

### 1) Consolidate top-left action cluster
Replace the current top-left file/export button cluster with a compact menu-based approach.

Minimum required menu:
- `File`

Preferred if still clean:
- `File`
- `Edit`

Codex should keep the first pass disciplined and avoid over-menuing the whole editor at once.

### 2) File menu contents
Move these actions into a canvas-native File menu:
- Save Local
- Load Local
- Import JSON
- Export JSON
- PNG Sheet
- Sheet Meta

The exact final labels may be shortened if needed, but they must remain clear.

### 3) Optional Edit menu
If Codex judges it clean and space-effective, add an Edit menu containing:
- Undo
- Redo
- Cut
- Copy
- Paste

If Edit is not added in this MVP, File-only consolidation is still acceptable.
But top-bar clutter must be meaningfully reduced.

### 4) Keep high-frequency controls visible
Do NOT over-consolidate.
These should generally remain directly accessible:
- tool selection
- brush controls
- playback controls
- FPS controls
- zoom controls
- fullscreen
- timeline
- active layer workflow controls

The goal is decluttering, not hiding the core workflow.

### 5) Canvas-native menu behavior
Menus must:
- open as canvas-native popovers
- use current control rendering/hit-testing patterns
- close on outside click
- close on Esc
- execute actions through existing command/action paths

Do not build a second UI system.

### 6) Control surface centralization
Menu definitions, layout, and interaction should remain centralized under the existing control surface / layout model.
Do not scatter menu logic across unrelated systems.

### 7) Visual clarity
Menus should:
- feel consistent with the existing overflow panel language
- remain compact
- avoid covering critical controls unnecessarily
- stay on screen

### 8) Command / keyboard preservation
This menu pass must not reduce access to actions:
- command palette still works
- shortcuts still works
- menu actions should route through existing dispatch logic

### 9) No-op / safety behavior
If a menu action is invalid in context, it should fail the same safe way the direct action would fail.
No duplicate safety handling should be invented unless necessary.

### 10) UI discipline
Do not destabilize:
- title area
- right-side playback/view controls
- timeline strip
- layer panel
- overflow behavior
- command palette

Keep this MVP focused on top-bar decluttering only.

## Validation
- Top-left clutter is reduced
- File menu opens correctly
- Menu actions execute correctly
- Menu closes on outside click
- Menu closes on Esc
- Existing command palette and shortcuts still work
- High-frequency controls remain visible
- No layout regression
- No console errors

## Scope
tools/*
docs/*
