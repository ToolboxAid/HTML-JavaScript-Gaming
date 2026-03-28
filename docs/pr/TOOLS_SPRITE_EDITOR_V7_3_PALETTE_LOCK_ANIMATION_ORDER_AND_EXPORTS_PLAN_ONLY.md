# TOOLS_SPRITE_EDITOR_V7_3_PALETTE_LOCK_ANIMATION_ORDER_AND_EXPORTS_PLAN_ONLY

## Purpose
Plan the next Sprite Editor pass before QC so the editor supports:
- optional custom animation playback/export order
- GIF export/save
- clearer Open/Save labels
- stronger palette selection/locking rules
- custom palette clone workflow
- palette persistence in project JSON
- removal of redundant Palette menu sorting
- better documentation/testing guidance for palette workflow actions

## Plan Only
This is a PLAN_PR only.
ChatGPT defines the plan.
Codex writes code later.
No engine changes.
Sprite Editor only.

## Non-Negotiable Constraints
- Modify Sprite Editor only
- Do NOT touch /engine
- Do NOT rewrite architecture
- Keep canvas-native UI
- Reuse existing menu / palette / export / command systems where possible
- Preserve current working load/open behavior

## Design Decisions

### 1. Animation order override
Current behavior is linear playback order:
- [1 ... n]

Add an optional per-document playback/export order override.
Examples:
- [1,2,3,2,3,2]
- [1,1,2,3,3,2,1]

Rules:
- Default remains linear if no override exists
- Override is document-owned data
- Playback and GIF export should both use the override when enabled
- Normal frame storage order does NOT change
- Timeline frame strip still shows actual frame order
- Override order should reference frame indices safely
- Invalid indices must fail safely and visibly

Recommended UI:
- Keep basic playback controls simple
- Add animation-order editing in a dedicated editor-facing action, not inline clutter
- If current phase needs to stay surgical, expose it through:
  - Frame menu item: `Edit Playback Order`
  - or command palette item
- Show current mode/status clearly:
  - `Playback Order: Linear`
  - `Playback Order: Custom`

### 2. GIF export/save
Add/export GIF generation as a Sprite Editor-local feature.

Rules:
- GIF export should use:
  - current frame set
  - current FPS/timing
  - current playback order override if present
- Keep existing export paths intact
- Add clear Files/Export labeling so user knows what is being exported

Recommended labels:
- `Open Project (Local)`
- `Save Project (Local)`
- `Export PNG`
- `Export Sprite Sheet`
- `Export GIF`

### 3. Open/Save naming clarity
Current Open/Save labels are too generic.

Plan:
- Rename UI labels to indicate storage/path clearly
- Keep current underlying behavior unchanged unless needed

Preferred labels:
- `New Project`
- `Open Project (Local)`
- `Save Project (Local)`

If cookie/memory/local-storage distinctions exist later, label explicitly then.
Do not invent new storage backends in this pass unless already present.

### 4. Selected palette indicator
Improve selected palette color visibility.

Plan:
- Add moving dashed/dotted marquee around the selected palette swatch
- Keep current swatch rendering intact
- Must remain readable for light and dark colors
- Must not break scroll performance

### 5. Palette in JSON (decision)
Yes: store the palette in project JSON and reload it from project JSON.

Reason:
- project should remain stable even if `paletteList` changes later
- a sprite/project should be reproducible from its saved data
- custom palettes/clones require project-owned persistence anyway

Recommended JSON ownership:
- store:
  - palette id/name if known
  - full palette colors actually used by the project
  - selected/locked palette metadata
  - custom clone name if applicable
- on import/load:
  - prefer palette data from JSON
  - only use global paletteList as a fallback/source reference, not as the sole truth

### 6. Palette usage model
Plan to make palette behavior stricter and project-owned.

Required behavior:
- On New/Start, palette state = `NONE - Must be selected first`
- Before any first grid edit/draw command:
  - palette must be selected
- If user clicks grid before palette is selected:
  - show popup/message:
    - `Palette must be selected first`
  - do not allow edit
- Once a palette is selected for the sprite/project:
  - lock the sprite/project to that palette family until explicitly changed through palette workflow
- Normal accidental palette switching should not mutate a sprite unexpectedly

Refined rule:
- A project has an active project palette
- That palette is persisted with the project
- Drawing/editing requires an active project palette

### 7. Custom palette clones
Need the ability to create named custom clones from the selected palette.

Use case examples:
- sun blocks = red clone
- basement blocks = gray clone
- underwater blocks = blue clone

Plan:
- Add action:
  - `Create Custom Palette Clone`
- It should:
  - copy current selected palette
  - require a name
  - save as project-owned custom palette
- Custom clones can:
  - be renamed
  - be modified color-by-color
  - coexist as multiple project-local clones
- These clones must be stored in project JSON
- These clones should appear in palette selection workflow under a clear custom/project area

### 8. Remove duplicate sort options from Palette menu
Since sorting already exists in the palette sidebar:
- remove `Sort By: Name / Hue / Sat / Lightness` from the Palette menu
- sorting remains sidebar-owned only

### 9. Explain/test palette utility actions
Document and surface expected behavior for these actions:
- `Set Src From Current`
- `Set Dst From Current`
- `Scope Active Layer`
- `Scope Current Frame`
- `Scope Selected Range`

Recommended behavior intent:
- `Set Src From Current`
  - source color for replace/remap workflow becomes current selected color
- `Set Dst From Current`
  - destination color for replace/remap workflow becomes current selected color
- `Scope Active Layer`
  - apply palette operation only to current layer
- `Scope Current Frame`
  - apply palette operation only to current frame
- `Scope Selected Range`
  - apply palette operation only to selected frame range

Plan requirement:
- Add Help/Palette documentation for each
- Ensure visible feedback/status after each action
- If these actions are incomplete/confusing, prefer clarifying help and labels before deeper feature expansion

### 10. Guardrail on first edit
Prevent the first grid click/edit when no palette is selected.

Plan:
- on startup/new:
  - current palette label shows `NONE - Must be selected first`
- first draw/grid interaction without palette:
  - block action
  - show popup/status
  - route user to palette selection
- once selected:
  - allow normal editing

## Suggested Execution Order for Codex Later
1. Palette JSON ownership + load safety
2. Palette required-before-edit guard
3. Selected swatch marquee
4. Remove duplicate sort items from Palette menu
5. Custom palette clone model + naming
6. Open/Save/Export label cleanup
7. GIF export
8. Playback order override
9. Help text / utility action clarification

## Acceptance Criteria
A successful build from this plan means:
- project palette is required before first grid edit
- palette state starts at `NONE - Must be selected first`
- project palette is saved in JSON and reloaded from JSON
- custom palette clones can exist and be named
- selected palette swatch is visibly highlighted with animated marquee
- Palette menu no longer duplicates sidebar sort controls
- GIF export exists and is clearly labeled
- optional playback order override exists and affects playback/export
- Open/Save labels clearly indicate local/project behavior
- palette utility actions are documented and testable
- no engine files changed
- no load/open regression introduced

## Out of Scope
- engine changes
- broad serialization redesign beyond Sprite Editor project JSON needs
- new global palette system outside Sprite Editor
- replacing the existing timeline/frame storage model
