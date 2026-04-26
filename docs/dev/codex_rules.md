# Codex Rules (MANDATORY — HARD CONSTRAINTS)

These rules OVERRIDE all other instructions.

## This PR

Fix only:
- Workspace Manager host/mount size
- tool query resolution for pager/mount

Allowed:
- targeted Workspace Manager CSS/layout changes
- targeted Workspace Manager tool resolution changes
- validation report

Forbidden:
- broad cleanup
- unrelated refactoring
- samples changes
- game launch label changes
- legacy query fallback
- second SSoT
- new header/banner
- start_of_day changes

## Required Layout

Workspace Manager must fill the browser viewport/page area.

Do not leave:
- tiny upper-left box
- clipped mini pane
- constrained host shell
- blank mount container

## Required Tool Resolution

For valid:
`tool=palette-browser`

Pager must show resolved display name, not `No tool available`.

## User-Approved Behavior

If no explicit tool query exists:
- first available tool may be selected/mounted on load.

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
- vague names
- hidden query fallback
- duplicated launch paths
- silent redirects
- silent caught errors
- broad refactor
- scope expansion
