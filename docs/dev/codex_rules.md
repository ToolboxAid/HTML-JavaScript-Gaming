# Codex Rules (MANDATORY — HARD CONSTRAINTS)

These rules OVERRIDE all other instructions.

## This PR

Move `section.tool-host-pager` inside `[data-tool-host-mount-container]`.

Allowed:
- targeted Workspace Manager index/main/CSS changes required for pager relocation
- validation report

Forbidden:
- broad cleanup
- unrelated refactoring
- samples changes
- game label changes
- duplicate pager
- top-level pager before mount container
- pager appended to document.body
- second SSoT
- start_of_day changes

## Structural Requirement

`tools/Workspace Manager/index.html` must not keep:

```html
<section class="tool-host-pager">
```

as a sibling before:

```html
<div data-tool-host-mount-container>
```

The visible pager must be rendered as a descendant of `[data-tool-host-mount-container]`.

## User-Approved Behavior

For this PR:
- first available tool is selected on load
- selected tool is active/mounted on load

## Still Forbidden

Do not restore:
- `gameId || game`
- legacy `game` query fallback
- hidden fallback routing
- stale memory reuse

## Anti-Patterns Forbidden

- variable aliasing
- pass-through variables
- duplicate state
- stored derived state
- vague names
- hidden query fallback
- duplicated launch paths
- silent redirects
- silent caught errors
- duplicate event listeners
- globals
- broad refactor
- scope expansion
