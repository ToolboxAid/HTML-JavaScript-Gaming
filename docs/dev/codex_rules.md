# Codex Rules (MANDATORY — HARD CONSTRAINTS)

These rules OVERRIDE all other instructions.

## This PR

Fix only the Workspace Manager initial view for game-launched context.

Allowed:
- targeted Workspace Manager launch/view selection edits
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

## Required UI Labels

Samples:
- must remain `Open <tool>`

Games:
- must remain `Open with Workspace Manager`

## Required Game Launch Behavior

For:

```text
tools/Workspace Manager/index.html?gameId=<id>&mount=game
```

`mount=game` means the source/context is a game.

It must not force the initial primary view to be the hosted game surface.

Workspace Manager must show the tools/workspace surface for the explicit game context.

## Forbidden Restorations

Do not restore:

- `gameId || game`
- `toolIds[0]`
- first-item selection
- default tool
- default workspace
- fallback route
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
