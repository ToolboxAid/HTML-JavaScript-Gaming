Toolbox Aid
David Quesenberry
03/26/2026
BUILD_PR_TOOLS_SPRITE_EDITOR_V4_9_CONTEXT_AWARE_PANELS_PROGRESSIVE_DISCLOSURE.md

# BUILD_PR — Sprite Editor v4.9 (Context-Aware Panels + Progressive Disclosure)

## Objective
Reduce panel clutter and improve day-to-day usability by making panel content context-aware and progressively disclosed, while preserving the current canvas-native architecture and fast-access workflow.

## Constraints
- Keep fixed 1600x900 logical space
- Keep SpriteEditorCanvasControlSurface as layout/control authority
- No DOM UI
- No architecture rewrite
- Reuse existing layer, timeline, playback, brush, selection, command, and popover systems
- Preserve direct access to high-frequency actions

## Requirements

### 1) Context-aware panel content
Show controls when they are relevant to the current tool/state instead of always showing everything.

Examples:
- Brush selected -> show brush size / shape
- Shape tool selected -> show shape-specific actions
- Selection active -> show transform/nudge actions
- Playback range active -> surface range actions more prominently
- No selection -> hide or de-emphasize selection-only controls

Codex should choose a clean, deterministic model and keep it reviewable.

### 2) Progressive disclosure
Introduce lightweight collapsed/expanded behavior for lower-frequency controls.

Acceptable approaches:
- section headers with expand/collapse
- compact summary row that opens details
- context-sensitive mini-menu / popover for secondary actions

Do not introduce a second UI framework.

### 3) Layer panel cleanup
Reduce constant layer-panel noise.

Preferred direction:
- keep always-visible:
  - active layer indicator
  - visibility
  - lock
  - solo if it is core enough
- move lower-frequency actions into progressive disclosure or a compact menu:
  - rename
  - merge down
  - flatten frame
  - move up/down if Codex judges this cleaner

Layer workflow must remain efficient; the goal is decluttering, not hiding the core.

### 4) Timeline / playback panel cleanup
Keep transport visible, but allow lower-frequency playback controls to be progressively disclosed if that improves readability.

Candidates for secondary treatment:
- loop segment/range helpers
- jump to range start/end
- advanced preview controls

Do not bury basic playback transport.

### 5) Tool panel cleanup
Keep core tool switching visible, but allow secondary brush/shape options to appear only when the relevant tool is active.

Examples:
- brush size/shape visible when brush or erase is active
- shape-specific options visible when line/rect tools are active

### 6) Menu / popover reuse
Where possible, reuse the existing canvas-native popover/overflow/menu interaction model instead of inventing new one-off panels.

### 7) Command palette preservation
Nothing should become inaccessible:
- command palette remains the universal backstop
- keyboard shortcuts remain valid
- context-aware hiding should not reduce actual capability

### 8) Visual clarity
The resulting UI should:
- show less at once
- still feel fast
- keep high-frequency controls obvious
- avoid sudden confusing jumps in layout

Codex should prefer stable panel zones with changing inner content rather than panel positions moving around dramatically.

### 9) Safety / behavior consistency
Context-aware hiding must not:
- break hit-testing
- leave stale open popovers
- hide critical state with no status/readout support

If a section is collapsed while relevant state exists, Codex should still leave lightweight state indication visible.

### 10) Scope discipline
Do not use this PR to add new editor features.
This is a workflow/UX decluttering pass only.

## Validation
- panel clutter is reduced
- brush controls appear when brush-related tools are active
- selection controls appear when selection is active
- lower-frequency actions remain accessible
- command palette/shortcuts still work
- no layout instability or confusing jumps
- no console errors

## Scope
tools/*
docs/*
