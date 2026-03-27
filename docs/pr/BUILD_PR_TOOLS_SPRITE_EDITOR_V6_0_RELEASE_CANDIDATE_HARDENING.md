Toolbox Aid
David Quesenberry
03/26/2026
BUILD_PR_TOOLS_SPRITE_EDITOR_V6_0_RELEASE_CANDIDATE_HARDENING.md

# BUILD_PR — Sprite Editor v6.0 (Release Candidate Hardening)

## Objective
Harden Sprite Editor for release-candidate quality by focusing on reliability, consistency, error handling, manual validation readiness, and workflow resilience without adding new major subsystems.

## Intent
This PR is for:
- bug resistance
- state consistency
- safe edge-case handling
- validation friendliness
- predictable UX under stress

It is NOT for major feature expansion.

## Constraints
- Keep fixed 1600x900 logical space
- Keep SpriteEditorCanvasControlSurface as layout/control authority
- No DOM UI
- No architecture rewrite
- Reuse existing command, menu, history, dirty-state, timeline, layer, playback, palette, and export systems
- Prefer surgical corrections over redesign

## Requirements

### 1) Edge-case hardening
Review and harden common failure paths:

Examples:
- empty / invalid menu state
- invalid range after frame deletions/reorders
- stale active layer index after layer delete/reorder
- stale active frame index after frame delete/range operations
- guard/rename/menu overlap edge cases
- palette source/target replace edge cases
- invalid export mode when no selection/range exists
- flatten/merge invalid/no-op behavior
- playback range clamps after frame batch ops

Codex should patch these paths defensively and consistently.

### 2) State normalization helpers
Where helpful, add centralized normalization helpers instead of scattered ad hoc fixes.

Examples:
- normalize active frame index
- normalize active layer index
- normalize selected range bounds
- normalize playback range bounds
- normalize solo state after layer deletion

These helpers should be small, explicit, and reusable.

### 3) Validation-friendly fallback behavior
When something invalid happens:
- fail safely
- show lightweight, consistent status feedback
- avoid silent broken states
- avoid console noise where possible

Examples:
- no-op actions
- missing menu items
- invalid target indices
- stale transient selections

### 4) Undo/redo resilience
Ensure history remains robust under edge cases:
- undo after batch frame ops
- undo after destructive layer ops
- redo after normalization
- undo/redo after guard-confirmed replace/load/flatten flows

If any history entry can become invalid, fail safely and preserve editor stability.

### 5) Dirty-state resilience
Dirty-state must remain accurate under:
- undo back to baseline
- redo away from baseline
- destructive state replacement
- export/save flows
- layer/frame batch operations
- palette replacement operations

### 6) Manual validation support
Improve practical manual validation readiness by ensuring:
- important state is visible in status/readout
- invalid states self-correct or message clearly
- menus/popovers never open blank silently
- transient surfaces close predictably
- timeline/layer state remains easy to inspect

Do not add debug spam UI, but improve operational clarity.

### 7) Export hardening
Export workflows must fail safely if context is incomplete.

Examples:
- selected-range export with no valid selected range
- current-frame export with invalid active frame
- package export with inconsistent state
- palette metadata unavailable

Do not corrupt editor state during failed export attempts.

### 8) Menu / popover reliability
Ensure menu/popover system remains stable under repeated use:
- open/close/open quickly
- switch menus repeatedly
- Esc close from nested/transient states
- outside click close
- menu actions during playback / hover preview / active overlays

### 9) Layer / frame safety
Ensure operations that mutate layers or frames always leave valid structure behind:
- editor must never end with zero frames if the model requires at least one
- frames must never end with zero layers if the model requires at least one
- active indices must always point at valid elements after destructive actions

### 10) Release-candidate discipline
Do not add new feature families.
This is a hardening pass only.

## Validation
- edge-case operations fail safely
- no stale indices remain after destructive actions
- menus/popovers remain reliable under repeated use
- undo/redo stays stable under batch/destructive flows
- dirty state remains correct
- exports fail safely when invalid
- manual validation feels easier because state is more self-correcting
- no console errors

## Scope
tools/*
docs/*
