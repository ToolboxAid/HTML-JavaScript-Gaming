# Codex Rules (MANDATORY — HARD CONSTRAINTS)

These rules OVERRIDE all other instructions.

## This PR

Allowed:
- targeted Workspace Manager fallback removal
- restore missing docs/dev/specs/TOOL_LAUNCH_SSOT.md
- validation report

Forbidden:
- broad cleanup
- unrelated refactoring
- new route systems
- second SSoT
- fallback/default behavior
- start_of_day changes
- roadmap text rewrite outside status markers
- changing labels

## Exact Removals Required

Remove Workspace Manager launch residues:

- `toolIds[0]` first-item/default tool selection in the launch path
- `gameId || game` legacy query fallback in the launch path

## Required Failure Behavior

If `gameId` is missing or invalid:
- fail visibly
- report missing/invalid `gameId`
- do not fallback to `game`
- do not select first tool
- do not reuse memory
- do not silently redirect

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
- magic strings outside SSoT/config pattern
- duplicate event listeners
- globals
- new managers/factories/service layers
- public API changes outside this PR
- scope expansion
