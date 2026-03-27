# Sprite Editor RULES (Codex-Enforced)

Updated: 2026-03-26

## Core workflow
1. ChatGPT creates the plan.
2. Codex writes the code.
3. Do not skip the plan step for code changes.
4. Prefer surgical fixes over rewrites.
5. Reuse existing systems before adding new ones.

## Architecture rules
- Do **not** rewrite architecture.
- Keep the editor canvas-native. No DOM UI additions.
- `SpriteEditorCanvasControlSurface` remains the layout and interaction authority.
- Keep fixed `1600x900` logical space.
- Reuse existing systems:
  - menus / popovers
  - command palette
  - history / undo-redo
  - timeline / playback
  - layers
  - palette workflow
- Prefer centralized helpers over scattered one-off fixes.

## Current phase rule
Current phase is:
- fix visibility
- fix interaction
- fix consistency
- fix feedback
- harden edge cases

Do **not** add new major systems unless explicitly requested.

## ESC priority (mandatory)
ESC must resolve in this order:
1. Close confirm / rename overlays
2. Close menus / popovers
3. Close command palette
4. Cancel active interaction (drag, selection move, etc.)
5. Only then allow fullscreen exit

ESC must never exit fullscreen first when an editor interaction is active.

## No invisible UI
If the user cannot see it, it is broken.

Required:
- Timeline must always be visible
- Playback controls must always be visible
- Layer panel must not overlap the timeline
- Menus/popovers must stay on-screen
- No critical control may render under another panel

## Menu rules
- Only one menu open at a time
- Opening one menu closes others
- Opening command palette closes menus
- Opening overlays closes menus
- Outside click closes menus
- ESC closes menus according to priority rules
- Menus must never open blank silently
- If a menu has zero items, show a visible fallback error row

## No silent actions
Every action must either:
- visibly change state, or
- emit a status message

## Status system
Bottom status should stay stable and concise.

It should surface:
- tool / brush state
- frame / range state
- layer state
- playback state
- dirty / saved state
- current action feedback

## Safe failure rule
When something cannot execute:
- do not crash
- do not silently fail
- do show status feedback
- do not add a history entry for a no-op

## Layer / frame safety
- Editor must always have at least 1 frame
- Each frame must always have at least 1 layer
- Active frame index must always be valid
- Active layer index must always be valid
- Normalize indices after deletes/reorders
- Normalize playback and selection ranges after frame changes

## Validation-first rule
If a feature cannot be clearly validated, the problem is UX/visibility first.

Before adding more features:
- make it visible
- make it understandable
- make it testable

## Codex execution rules
Codex should:
- implement code only after the plan exists
- follow the plan filename exactly
- preserve architecture
- prefer small, reviewable changes
- keep changes inside requested scope
- avoid adding speculative features
- avoid new permanent UI clutter unless explicitly requested
