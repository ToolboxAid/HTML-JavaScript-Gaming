# Codex Rules (MANDATORY — HARD CONSTRAINTS)

These rules OVERRIDE all other instructions.

## This PR

Fix only Workspace Manager pager button events using delegated click handling.

Allowed:
- targeted event handling changes
- targeted diagnostics for pager clicks/state failures
- validation report

Forbidden:
- moving pager location
- duplicate pager
- new header/banner
- dropdown + Select Tool + Mount flow
- requiring `tool=`
- restoring `gameId || game`
- samples changes
- broad refactor
- start_of_day changes

## Required Event Pattern

Use delegated click handling from a stable parent.

Do not rely only on direct button listeners on nodes that are recreated.

## Required Selectors

Use:
- `[data-tool-host-prev]`
- `[data-tool-host-next]`

Do not use button text as logic.

## Required Diagnostics

Silent no-op is forbidden.

If click handler cannot proceed:
- console diagnostic
- visible diagnostic if state/tool list is missing

## Anti-Patterns Forbidden

- stale DOM references
- duplicate event listeners on repeated render
- DOM text as state source
- variable aliasing
- pass-through variables
- duplicate state
- silent caught errors
- broad refactor
- scope expansion
