# Codex Rules (MANDATORY — HARD CONSTRAINTS)

These rules OVERRIDE all other instructions.

## This PR

Rollback failed Workspace Manager header/banner attempts, then add only the requested pager.

Allowed:
- targeted rollback of Workspace Manager files affected by 20_14 through 20_19
- add centered [PREV] <toolname> [NEXT] above tools/editors
- validation report

Forbidden:
- broad cleanup
- unrelated refactoring
- changes to samples behavior
- changes to required labels
- new header
- new banner
- keeping failed top Workspace Manager control/header area
- second SSoT
- start_of_day changes
- roadmap text rewrite outside status markers

## Rollback Anchor

Find the commit with comment:

Remove Workspace Manager default and query fallbacks

Use it as the Workspace Manager restore anchor before applying pager.

## Required UI

Restore normal Workspace Manager content first.

Then add only:

[PREV] <toolname> [NEXT]

above the existing tools/editors section.

## User-Approved Behavior

For this PR:
- first available tool is selected on page load
- selected tool is active/mounted on page load

## Still Forbidden

Do not restore:
- `gameId || game`
- legacy `game` query fallback
- hidden fallback routing
- stale memory reuse
- broken header/banner/control area

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
- broad truthy/falsy behavior changes
- magic strings outside existing registry/config pattern
- duplicate event listeners
- globals
- new managers/factories/service layers
- public API changes outside this PR
- scope expansion
