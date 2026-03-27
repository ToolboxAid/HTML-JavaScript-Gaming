Toolbox Aid
David Quesenberry
03/26/2026
BUILD_PR_TOOLS_SPRITE_EDITOR_V5_4_FINAL_UX_POLISH_INTERACTION_CONSISTENCY.md

# BUILD_PR — Sprite Editor v5.4 (Final UX Polish + Interaction Consistency)

## Objective
Perform a disciplined UX stabilization pass so the editor feels consistent, predictable, and production-ready across menus, popovers, timeline interactions, layer workflows, command palette behavior, and validation flows.

## Intent
This PR is not for major new features.
It is for:
- interaction consistency
- visual polish
- menu reliability
- state clarity
- validation friendliness

## Constraints
- Keep fixed 1600x900 logical space
- Keep SpriteEditorCanvasControlSurface as layout/control authority
- No DOM UI
- No architecture rewrite
- Reuse existing menu/popover/overflow, command, timeline, layer, playback, and history systems
- Do not add new major subsystems

## Requirements

### 1) Menu consistency
All top-level menus and existing popovers must behave consistently.

Verify and normalize:
- open behavior
- close behavior
- outside-click close
- Esc close
- switching from one menu to another
- submenu opening/closing behavior
- empty-state handling

There should be one consistent mental model across:
- File
- Edit
- Frame
- Layer
- existing palette/file/export popovers
- overflow-style panels

### 2) Visual consistency
Unify basic visual treatment across temporary surfaces:
- padding
- row height
- hover state
- active state
- selected state
- borders/backgrounds

Do not over-restyle the editor.
This is consistency polish, not a redesign.

### 3) Interaction-state cleanup
Prevent stale UI states.

Examples:
- opening command palette should close menus/popovers if appropriate
- opening one menu should close another
- playback hover preview should clear correctly
- rename overlay should not conflict with menu state
- replace-color workflow should not leave stale src/dst highlights unexpectedly
- flatten/replace guards should not leave stuck transient state

Codex should identify and normalize these interaction transitions.

### 4) Status/readout consistency
Bottom status/readout should be concise and consistent.

Requirements:
- show meaningful state
- avoid redundant noise
- keep order/format stable
- preserve important state indicators:
  - dirty/saved
  - undo/redo labels if present
  - playback/range state if relevant
  - active tool / brush state if relevant
  - palette/replace state if relevant

Codex may tighten wording, but must not remove essential debugging clarity.

### 5) Timeline interaction consistency
Timeline interactions should feel coherent:
- click select
- Shift+click range select
- Alt+Shift reorder path
- hover preview
- playback range highlighting
- active frame highlighting

Polish focus:
- no ambiguous visual states
- no stale hover state
- deterministic transition between hover, selection, playback, and reorder visuals

### 6) Layer interaction consistency
Layer panel / layer menu interactions should feel coherent:
- active layer highlight
- visibility/lock/solo markers
- layer menus / more-actions
- rename overlay
- layer reorder actions

Polish focus:
- no conflicting highlight states
- no visually ambiguous active vs hidden vs locked rows
- row click, action click, and more-menu behavior should be clear and consistent

### 7) Tool / brush / shape consistency
Tool-related contextual panels should:
- appear only when relevant
- use the same compact visual language
- not leave stale state when switching tools

Examples:
- brush controls when brush/erase active
- shape hint/options when shape tools active
- selection summary/actions when selection relevant
- no unrelated controls hanging around

### 8) Validation friendliness
The editor should become easier to manually validate.

That means:
- less clutter
- clearer temporary surfaces
- clearer status when an action is unavailable
- no invisible dead clicks
- safer fallback text on failed transient menus/panels where applicable

### 9) No-op / unavailable action messaging
When an action cannot run:
- provide lightweight, consistent status feedback
- avoid silent failure
- avoid history pollution

Use one consistent messaging style.

### 10) Keyboard + menu harmony
Keyboard shortcuts, command palette, and menus must feel aligned:
- menu action names should match command names closely enough
- command palette actions should not feel like a separate vocabulary
- Esc behavior should be predictable across all transient surfaces

### 11) Scope discipline
Do not use this PR to add:
- new tool families
- new export types
- new rendering systems
- plugin architecture
- collaboration features

This is a UX/polish/fix pass only.

## Validation
- menus/popovers behave consistently
- no stale transient states remain
- timeline interaction states are visually clear
- layer interaction states are visually clear
- contextual panels show only relevant controls
- status/readout is clearer and more stable
- unavailable actions give consistent feedback
- manual validation is easier in practice
- no layout regression
- no console errors

## Scope
tools/*
docs/*
