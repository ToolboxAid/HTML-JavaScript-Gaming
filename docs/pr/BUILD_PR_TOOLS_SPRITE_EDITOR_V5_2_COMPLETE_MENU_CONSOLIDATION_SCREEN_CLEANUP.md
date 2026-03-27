Toolbox Aid
David Quesenberry
03/26/2026
BUILD_PR_TOOLS_SPRITE_EDITOR_V5_2_COMPLETE_MENU_CONSOLIDATION_SCREEN_CLEANUP.md

# BUILD_PR — Sprite Editor v5.2 (Complete Menu Consolidation + Screen Cleanup)

## Objective
Perform a true screen-space cleanup pass by consolidating lower-frequency controls into canvas-native menus and reducing always-visible clutter, while preserving fast access to the core workflow and keeping the current architecture intact.

## Important intent
This PR is explicitly about **actual decluttering**, not merely adding alternate command paths.
It must result in:
- fewer always-visible controls
- cleaner panels
- more usable validation space
- no loss of capability

## Constraints
- Keep fixed 1600x900 logical space
- Keep SpriteEditorCanvasControlSurface as layout/control authority
- No DOM UI
- No architecture rewrite
- Reuse existing menu/popover/overflow interaction patterns
- Preserve command palette and keyboard workflows
- Preserve direct access to high-frequency workflow controls

## Requirements

### 1) Complete menu consolidation pass
Move lower-frequency actions out of always-visible panels and into compact canvas-native menus.

This is the core purpose of the PR.

### 2) File menu
File should contain all file/export-related actions, including at least:
- Save Local
- Load Local
- Import JSON
- Export JSON
- PNG Sheet
- Sheet Meta
- Export Current Frame
- Export All Frames
- Export Selected Range
- Export Package JSON

Codex may group or label these compactly, but they must all live under File or a compact File->Export structure.

### 3) Edit menu
Create an Edit menu for lower-frequency editing actions, including at least:
- Undo
- Redo
- Cut
- Copy
- Paste
- Clear
- Delete Frame
- Duplicate Frame

Codex may refine exact membership if needed, but Edit must materially reduce clutter.

### 4) Layer menu
Create a Layer menu for lower-frequency layer actions, including at least:
- Rename
- Merge Down
- Flatten Frame
- Move Up
- Move Down
- Toggle Visibility
- Solo
- Lock

Core layer-state visibility in the layer list may remain visible; the point is to remove always-visible secondary buttons.

### 5) Frame menu
Create a Frame menu for frame-range and batch actions, including at least:
- Duplicate Range
- Delete Range
- Shift Range Left
- Shift Range Right
- Clear Range Selection

If some frame actions remain visible in the timeline because they are high-frequency, Codex may keep those, but the menu must absorb the lower-frequency batch commands.

### 6) Keep these visible
Do not hide the core workflow.

These should generally remain directly accessible:
- tool selection
- brush size / shape
- timeline
- playback transport
- FPS
- zoom
- fullscreen
- active layer indicator / essential layer workflow

The point is not to bury the editor, but to reclaim space by moving secondary actions.

### 7) Menu behavior
Menus must be:
- canvas-native
- rendered with the current popover/menu system
- closed by outside click
- closed by Esc
- wired through existing dispatch/action paths

Do not build a second menu framework.

### 8) Context-aware cleanup
If some panels still feel crowded after menu consolidation, Codex may also:
- hide secondary buttons that are now present in menus
- reduce duplicated action exposure
- keep only one direct access path for non-core actions

But this must stay disciplined and not turn into a broad redesign.

### 9) Stable layout
Keep panel zones stable.
Do not cause dramatic panel jumping or moving control groups around unnecessarily.
This PR is about decluttering, not rearranging the whole editor.

### 10) Command/keyboard preservation
No capability should be lost:
- command palette remains universal access
- keyboard shortcuts remain valid
- menus are additional organization, not the only path

### 11) Validation usability
The resulting UI should leave visibly more free space for:
- canvas work area
- preview visibility
- practical manual validation

This is one of the main reasons for the PR.

## Validation
- top-level visible clutter is materially reduced
- File/Edit/Layer/Frame menus open correctly
- menu actions execute correctly
- menus close on outside click
- menus close on Esc
- high-frequency controls remain visible
- command palette and shortcuts still work
- screen feels less crowded in practice
- no layout regression
- no console errors

## Scope
tools/*
docs/*
