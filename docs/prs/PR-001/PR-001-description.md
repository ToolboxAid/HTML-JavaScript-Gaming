## What
Clarify `engine/core` as the runtime boundary and document which modules are public, internal, or transitional.

## Why
`engine/core` is the architectural center of the repo, but it currently mixes true runtime modules with canvas/sprite/tile helper modules. That makes the boundary unclear for games and samples and increases refactor risk.

## Scope
Documentation-only architecture pass for `engine/core`.

## Changes
- define `engine/core` as the runtime layer
- mark `GameBase` as the main public runtime entry
- mark `RuntimeContext` and runtime helpers as internal
- identify canvas/sprite/tile helpers as transitional modules that should move later
- record consumer import guidance for games and samples
- add follow-up notes for later refactor PRs

## Risk
Low

## API Impact
No runtime behavior change. Documentation and boundary guidance only.

## Testing
- verify docs are internally consistent
- verify planned public/internal/transitional classification matches current file layout
- verify later PRs can reference this boundary definition
