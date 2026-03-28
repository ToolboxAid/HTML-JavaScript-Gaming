# TOOLS_SPRITE_EDITOR_V7_4_PALETTE_LOCK_REFERENCE_IMAGE_AND_FPT_PLAN_ONLY

## Purpose
Plan the next Sprite Editor-only pass for:
- strict palette lock after first palette selection
- reference image loading behind the grid
- auto-align assist for image-to-grid fit
- alignment lock so zoom keeps image and grid aligned
- GIF export timing based on FPS
- moving FPS under Frame X/Y in Animation Preview

## Plan Only
This is a PLAN_PR only.
ChatGPT defines the plan.
Codex writes code later.
No engine changes.

## Non-Negotiable Constraints
- Sprite Editor only
- Do NOT touch /engine
- Do NOT rewrite architecture
- Preserve current load/open behavior
- Keep canvas-native UI
- Reuse existing preview / menu / export / document systems where possible

## Requested Work Buckets

### 1. Strict palette lock after selection
Current direction:
- project starts with no palette selected
- user must select a palette before first edit

New rule:
- once a palette is selected for the project/sprite, it cannot be changed through the normal palette preset list

Required behavior:
- do NOT show/change to another palette from paletteList after lock
- if user clicks palette preset selection after lock:
  - show popup message
  - show visible red status/error message
  - do not change palette
- keep current project palette active
- custom clone workflows may still be allowed if explicitly part of the project-owned palette path, but normal preset switching must be blocked once locked

Recommended messaging:
- popup: `Palette is locked for this sprite/project`
- red status: `Palette cannot be changed after selection`

Guardrails:
- do not silently ignore
- do not unlock palette accidentally on Open/New unless intended by project state
- preserve JSON ownership/persistence of palette lock state

### 2. Reference image behind grid
Add the ability to load a reference image behind the grid.

Required behavior:
- load an image into the editor as a non-destructive reference layer/background guide
- image appears behind the editable sprite/grid content
- user can control alignment/fit relative to the grid
- image is for tracing/alignment/reference, not treated as sprite pixels automatically

Recommended UI:
- add a dedicated action such as:
  - `Load Reference Image`
- keep the loaded image editor-local/project-local
- make visibility/state understandable

### 3. Reference image fit/alignment to grid
Need an alignment scale option to fit the image to the grid.

Required behavior:
- allow fitting/scaling the reference image to the grid bounds
- keep image aligned behind grid cells
- use simple, understandable controls first

Recommended options:
- `Fit to Grid`
- `Reset Reference Alignment`
- optional offset nudging only if needed later

### 4. Attempt auto-align to grid after image load
Once an image is loaded:
- automatically attempt an initial alignment to the grid
- use a best-effort local heuristic only
- if auto-align is imperfect, user can still refine via fit/alignment controls

Guardrails:
- do not block if auto-align cannot determine a perfect fit
- fail safely and visibly
- keep this local to Sprite Editor; no engine/image-processing expansion

### 5. Lock alignment after completion
Once image alignment is completed/accepted:
- lock the image-to-grid relationship so zooming keeps image and grid aligned
- zoom must not cause drift between grid and reference image
- panning/zooming should transform both consistently within the same viewport math

This is primarily a view-transform consistency requirement.

### 6. GIF export should use FPT
Current request:
- GIF should use FPS for animation

Required behavior:
- GIF export timing should derive from FPS
- playback/export timing should stay consistent with editor animation timing
- if playback order override exists, GIF export should continue to respect it

Clarification target:
- FPS = frames-per-tick / frame-time-per-step as already represented in the editor
- use the editor’s current effective timing source, not a disconnected GIF-only timing path

### 7. Move FPS under Frame X/Y in Animation Preview
UI change:
- move FPS display/control under Frame X/Y in Animation Preview
- keep it visible and readable
- keep alignment clean
- do not leave duplicate FPS controls elsewhere

## Acceptance Criteria
A successful build from this plan means:
- palette starts unset and must be selected before edit
- once selected, normal palette preset switching is blocked
- blocked palette change attempt shows popup + red message
- reference image can be loaded behind the grid
- reference image can be fit/aligned to the grid
- auto-align attempt runs after image load
- accepted alignment stays locked during zoom
- GIF export uses FPS timing
- FPS appears under Frame X/Y in Animation Preview
- no engine files changed
- no load/open regression introduced
- no console errors

## Out of Scope
- engine changes
- global image-processing system
- automatic sprite extraction from the reference image
- broad serialization redesign outside Sprite Editor project data
- major new UI systems beyond what Sprite Editor already uses

## Suggested Execution Order for Codex Later
1. palette lock hardening and blocked-change messaging
2. reference image load and behind-grid rendering
3. fit/alignment controls
4. auto-align attempt
5. zoom alignment lock
6. GIF timing uses FPS
7. move FPS UI under Frame X/Y
8. final smoke pass for palette lock + reference image + GIF timing
