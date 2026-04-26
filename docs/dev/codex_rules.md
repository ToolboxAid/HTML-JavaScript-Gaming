# Codex Rules (MANDATORY — HARD CONSTRAINTS)

These rules OVERRIDE all other instructions.

## This PR

Fix only Workspace Manager tool selector placement.

Allowed:
- targeted Workspace Manager render/markup/CSS placement changes
- validation report

Forbidden:
- broad cleanup
- unrelated refactoring
- changes to samples behavior
- changes to required labels
- new route systems
- second SSoT
- fallback/default behavior
- start_of_day changes
- roadmap text rewrite outside status markers

## Required UI Placement

The tool selector controls must render inside the Workspace Manager first-class tools surface.

They must not render as a detached top banner above the Workspace Manager shell/title.

## Required Behavior

Explicit selection is required.

Do not restore:
- `gameId || game`
- `toolIds[0]`
- first-item selection
- default tool
- default workspace
- fallback route
- fallback view
- stale memory reuse

## Anti-Patterns Forbidden

- variable aliasing
- pass-through variables
- duplicate state
- stored derived state
- vague names
- hidden fallback behavior
- duplicated launch paths
- silent redirects
- broad truthy/falsy behavior changes
- magic strings outside existing SSoT/config pattern
- duplicate event listeners
- globals
- new managers/factories/service layers
- public API changes outside this PR
- scope expansion
