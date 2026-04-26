# Codex Rules (MANDATORY — HARD CONSTRAINTS)

These rules OVERRIDE all other instructions.

## This PR

Fix only the Workspace Manager blank-page blocker for game-launched context.

Allowed:
- targeted Workspace Manager boot/render/view diagnostics repair
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

## Required URL

This URL must render visible Workspace Manager content:

```text
tools/Workspace Manager/index.html?gameId=Breakout&mount=game
```

## Diagnostic Requirement

Blank page is forbidden.

Any boot/context/view failure must render visible diagnostic text on the page.

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
