Toolbox Aid
David Quesenberry
03/26/2026
BUILD_PR_TOOLS_SPRITE_EDITOR_V2_7_OVERFLOW_INTERACTION_DISCOVERABILITY.md

# BUILD_PR — Sprite Editor v2.7 (Overflow Interaction + Discoverability)

## Objective
Upgrade the existing overflow system from status-only feedback to a true canvas-native interactive overflow panel.

## Constraints
- Keep fixed 1600x900 logical space
- Keep SpriteEditorCanvasControlSurface as layout/control authority
- No DOM control additions
- No architecture rewrite
- Preserve v2.6 control priority + overflow policy

## Required Behavior

### 1) Overflow affordance remains canvas-native
The existing:
- `More (N)`

button remains the entry point.

### 2) Interactive overflow panel
When `More (N)` is activated:
- open a temporary canvas-native overflow panel
- render hidden controls as actual buttons inside the panel
- use the same visual language as the existing control system

### 3) Interaction behavior
- clicking a control inside the overflow panel executes it normally
- clicking outside the panel closes it
- pressing ESC closes it
- reopening should rebuild from current hidden controls

### 4) Reuse control system
Do not duplicate logic.
Reuse:
- control definitions where practical
- drawing style
- hit-testing model
- action dispatch model

### 5) Panel positioning
Panel must:
- anchor to the `More (N)` control region
- prefer opening below the top bar
- fall back safely if space is constrained
- remain on screen
- avoid covering critical controls unnecessarily

### 6) Visual clarity
Overflow panel should:
- have a distinct background
- have a clear border
- feel like a temporary surfaced layer
- keep adequate spacing between controls

### 7) Minimal state
Add only the minimum needed state for overflow interaction, such as:
- overflow open/closed
- current overflow controls
- overflow panel bounds

Do not expand architecture beyond this.

## Validation
- Clicking `More (N)` opens overflow panel
- Hidden controls render correctly in panel
- Panel controls execute correctly
- Clicking outside closes panel
- ESC closes panel
- Panel stays on screen
- Hit-testing remains correct
- No console errors

## Scope
tools/*
docs/*
