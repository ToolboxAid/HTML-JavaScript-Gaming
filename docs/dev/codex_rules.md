# Codex Rules (MANDATORY — HARD CONSTRAINTS)

These rules OVERRIDE all other instructions.

## This PR

Fix only the initial Workspace Manager tool-banner visibility.

Allowed:
- targeted Workspace Manager render/visibility/CSS changes
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

## Required Initial State

On game-launched Workspace Manager open:
- show Workspace Manager shell/status
- show Game Source and workspace status
- do not show detached Tool banner
- do not mount a tool
- do not auto-select a tool

## Tool Controls Visibility Rule

Tool controls may appear only after explicit tool selection or explicit valid tool context.

## Forbidden Restorations

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
- silent caught errors
- broad truthy/falsy behavior changes
- magic strings outside existing SSoT/config pattern
- duplicate event listeners
- globals
- new managers/factories/service layers
- public API changes outside this PR
- scope expansion
