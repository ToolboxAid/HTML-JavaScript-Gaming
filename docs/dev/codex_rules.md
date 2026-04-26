# Codex Rules (MANDATORY — HARD CONSTRAINTS)

These rules OVERRIDE all other instructions.

## This PR

Force the Workspace Manager tool pager UI above Editors.

Allowed:
- targeted Workspace Manager UI/render behavior changes
- remove newly created top header/banner/control area
- validation report

Forbidden:
- broad cleanup
- unrelated refactoring
- changes to samples behavior
- changes to required labels
- new header/banner replacement
- second SSoT
- start_of_day changes
- roadmap text rewrite outside status markers

## User-Approved Exception

For this PR only:
- the first available tool in the game tool list MUST be selected on page load
- the selected first tool MUST be displayed between PREV and NEXT
- the selected first tool MAY be activated/mounted on page load

This approved behavior is not considered an anti-pattern in this PR.

## Still Forbidden

Do not restore:
- `gameId || game`
- legacy `game` query fallback
- hidden fallback routing
- stale memory reuse
- label-text route guessing
- DOM-order route guessing

## Required UI

Create centered control directly above Editors:

[PREV] <toolname> [NEXT]

Do not use:
- detached top banner
- new header
- dropdown workflow
- Select Tool button
- Mount button for initial flow

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
