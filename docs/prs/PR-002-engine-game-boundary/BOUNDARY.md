PR-002 — engine/game boundary definition

### Intent
`engine/game` is the game-facing orchestration layer.

`engine/core` remains the runtime layer.

`GameBase` remains the preferred public entry point.

### Boundary Model
#### Public
Public modules are safe for direct use by game code.

Public modules should:
- expose stable orchestration contracts
- align with `GameBase`
- avoid leaking runtime-only plumbing

#### Internal
Internal modules support runtime behavior but are not direct game-facing APIs.

Internal modules should:
- stay hidden from normal game imports
- avoid becoming dependency roots for game code
- remain implementation detail, not long-term contract

#### Transitional
Transitional modules preserve compatibility while the repo moves toward clearer boundaries.

Transitional modules should:
- document why they still exist
- avoid scope growth
- be removable in later PRs

### Boundary Rule
Game code should prefer `GameBase` and other explicitly public surfaces.

Internal runtime helpers must not become accidental public API through convenience exports.
