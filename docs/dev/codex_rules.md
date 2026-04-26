# Codex Rules (MANDATORY — HARD CONSTRAINTS)

These rules OVERRIDE all other instructions.

## This PR

Fix only Workspace Manager pager button event behavior.

Allowed:
- targeted pager event binding repair
- targeted state update/remount repair
- validation report

Forbidden:
- broad cleanup
- unrelated refactoring
- samples changes
- game route label changes
- requiring `tool=` for game launch
- restoring `gameId || game`
- duplicate pager
- top-shell pager restoration
- new header/banner
- start_of_day changes

## Required Behavior

Pager buttons must bind to rendered buttons inside mounted content.

`?gameId=<id>&mount=game` must work without `tool=`.

Prev/Next must:
- update selected tool
- update label
- remount/activate selected tool

## Still Forbidden

Do not restore:
- `gameId || game`
- legacy `game` query fallback
- hidden fallback routing
- stale memory reuse

## Anti-Patterns Forbidden

- stale DOM references
- duplicate event listeners on repeated render
- variable aliasing
- pass-through variables
- duplicate state
- silent caught errors
- broad refactor
- scope expansion
