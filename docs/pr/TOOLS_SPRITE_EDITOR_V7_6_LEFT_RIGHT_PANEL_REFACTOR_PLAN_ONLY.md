# TOOLS_SPRITE_EDITOR_V7_6_LEFT_RIGHT_PANEL_REFACTOR_PLAN_ONLY

## Purpose
Plan the next Sprite Editor-only pass to cleanly separate left-panel actions from right-panel palette/state ownership.

This pass introduces:
- left-panel accordion sections with correct ownership
- right-panel palette/state ownership
- removal of overlapping concerns from the left panel
- cleaner spacing and clipping so panel content no longer bleeds into unrelated areas

## Plan Only
This is PLAN_PR only.
ChatGPT defines the plan.
Codex writes code later.
No engine changes.

## Non-Negotiable Constraints
- Sprite Editor only
- Do NOT touch /engine
- Do NOT rewrite architecture
- Preserve current load/open behavior
- Keep canvas-native UI
- Keep changes surgical and local to Sprite Editor modules
- Reuse existing menu/panel/control-surface systems where possible

## Design Goal
The left panel should become a workflow/action area.
The right panel should become a palette/state area.

Core split:
- Left = actions the user performs
- Right = palette/clones/current color/swatches/sort

## Required Panel Ownership

### LEFT PANEL
Left panel becomes an accordion with one section open at a time.

#### 0. Persistent header
Always visible:
- Active Tool
- short one-line tool description/state summary

This header must remain compact and stable.

#### 1. Brush section
Owns:
- brush size
- brush options that directly affect brush behavior

Minimum required:
- Size `[-] N [+]`

#### 2. Select section
Owns:
- Clear Selection
- Copy
- Paste
- Move guidance/actions

Behavior expectation:
- copy/paste/select workflow should feel coherent
- if temporary selection mode is needed, the editor may enter it automatically and return to prior tool when appropriate

#### 3. Grid section
Owns:
- Add Row
- Remove Row
- Add Column
- Remove Column

Optional:
- grid size/status readout if already available cheaply

#### 4. Layer section
Owns quick layer actions only:
- Opacity control in row form:
  - `[-] xxx% [+]`
- Rename
- Visibility quick action
- active layer quick status

Do NOT keep heavy/rare layer commands here if they are better in the Layer menu.

Accordion rule:
- only one section open at a time
- changing tools may auto-open the matching section (Brush / Select)
- user may manually open Grid or Layer at any time

### RIGHT PANEL
Right panel owns palette/state only.

#### 1. Palette header
Show:
- `Palette: <name>`
- clone/palette dropdown directly in the right panel

The clone dropdown should live between:
- palette label
- current color readout

#### 2. Current color readout
Keep on one line:
- `Current: #AABBCC [■] Named: Sky Blue`

Must remain compact and readable.

#### 3. Swatches
Right panel owns:
- all palette swatches
- selected swatch animated marquee/highlight
- scrollable full palette list/grid
- no artificial cap

#### 4. Sort
Right panel owns sort controls only:
- Name
- Hue
- Saturation
- Lightness

These should remain sidebar-owned and should not be duplicated in the Palette menu.

## Removal / Relocation Rules

### Move OUT of left panel
These should not remain in the left panel:
- palette controls
- clone selection
- current color readout
- swatches
- sort controls
- export actions
- reference image actions
- heavy/destructive layer operations like merge/flatten if menu-owned already

### Keep OUT of right panel
These should not move into the right panel:
- tool options
- grid controls
- selection operations
- layer quick editing controls

## Accordion Behavior Rules
- Single-open accordion only
- Sections must have clear headers
- Open section content must clip to its bounds
- Closed sections must not consume full content height
- No content bleed into previews or neighboring sections
- No overlap between section title and section content

## Layout / Rendering Rules
- Each left-panel section gets explicit vertical spacing
- Each section must have bounded content height
- Long content must clip or scroll safely rather than overlap
- Right panel palette area must keep full palette scrolling to bottom
- Panel drawing and hit-testing must match the same layout bounds

## Interaction Rules
- Tool changes may auto-open matching accordion section
- Opening a different accordion section must close the previous one
- Layer rename should continue to use a safe popup/input flow
- Opacity control in the layer section must be visibly clickable and easy to understand
- Copy/Paste/Clear Selection must not depend on ESC
- No Ctrl+W usage

## Keep Existing Good Behavior
Do not regress:
- palette lock behavior
- custom palette clone workflow
- palette swatch animated highlight
- large palette scrolling
- menu structure
- timeline / preview visibility
- GIF export
- playback order support
- reference image work already added unless specifically moved out of a panel

## Suggested Implementation Order for Codex Later
1. define left-panel accordion structure and section ownership
2. move Brush controls into Brush section
3. move Select actions into Select section
4. move Grid controls into Grid section
5. move Layer quick actions into Layer section
6. remove palette/state ownership from left panel
7. make right panel own palette header + clone dropdown + current color + swatches + sort
8. tighten spacing/clipping/hit areas for both panels
9. final smoke pass for overlap, clipping, and workflow clarity

## Acceptance Criteria
A successful build from this plan means:
- left panel is accordion-based
- only one left-panel section is open at a time
- Brush section owns brush size/options
- Select section owns clear/copy/paste/move actions
- Grid section owns add/remove row/column
- Layer section owns opacity/rename/visibility quick actions
- right panel owns palette label
- right panel owns clone/palette dropdown
- right panel owns current color readout
- right panel owns swatches
- right panel owns sort controls
- no overlapping panel concerns remain
- no section content bleeds into previews or adjacent panel regions
- no engine files changed
- no console errors

## Out of Scope
- engine changes
- major architecture rewrite
- unrelated feature additions
- moving timeline/preview ownership
- moving menu ownership away from top menus
