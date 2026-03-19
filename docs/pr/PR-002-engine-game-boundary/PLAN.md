PR-002 — engine/game boundary plan

### Objective
Define public, internal, and transitional boundaries for `engine/game` before any behavior changes.

### Scope
This PR is docs-first and architecture-only.

In scope:
- `engine/game` module boundary definition
- public API surface proposal
- internal runtime ownership clarification
- transitional module classification for current callers
- migration task list for follow-up BUILD_PR

Out of scope:
- runtime behavior changes
- file moves
- import rewrites
- deletion of legacy modules
- changes to samples or games

### Architectural intent
`engine/game` should become the layer that exposes stable game-facing abstractions while avoiding direct leakage of lower-level runtime internals.

Target direction:
- `GameBase` remains the primary public entry point
- `engine/game` exposes game composition and orchestration contracts
- runtime-only wiring stays internal
- compatibility adapters remain transitional until call sites migrate

### Boundary model

#### Public
Files/classes/functions that game code may import directly.

Candidate public responsibilities:
- game bootstrapping through `GameBase`
- scene/game lifecycle contracts intended for game authors
- stable object registration / update participation API
- high-level game-facing helpers that do not expose runtime internals

Public boundary rules:
- may depend on stable runtime contracts
- must not expose `runtimeContext`, fullscreen internals, or performance internals
- should avoid leaking canvas/sprite/tile implementation details unless explicitly transitional

#### Internal
Files/classes/functions used by engine runtime plumbing only.

Candidate internal responsibilities:
- frame orchestration details
- runtime binding / environment setup
- hidden state coordination
- internal timing/performance hooks
- compatibility plumbing for older module paths

Internal boundary rules:
- not imported by games directly
- can change without public contract guarantees
- may depend on runtime-only utilities

#### Transitional
Files/classes/functions still bridging legacy and target architecture.

Candidate transitional responsibilities:
- wrappers around old game boot paths
- compatibility exports
- modules still exposing canvas/sprite/tile adjacent behavior while target ownership is being normalized

Transitional boundary rules:
- explicitly documented
- temporary by design
- no expansion of responsibility beyond compatibility needs

### Proposed decisions for PR-002
1. `engine/game` is the game-facing orchestration layer above runtime internals.
2. `GameBase` remains the preferred public entry point for new work.
3. `engine/game` should publish only stable contracts needed by game code.
4. any runtime-only setup hidden behind `engine/game` remains internal.
5. bridge modules required by existing callers are transitional, not permanent public API.
6. no behavior changes occur in this PR.

### Review questions to resolve in BUILD_PR
- which current `engine/game` exports are directly imported by samples/games?
- which exports expose runtime internals accidentally?
- which files are pure wrappers and should be marked transitional?
- which APIs belong on `GameBase` versus adjacent helper modules?

### Recommended file classifications

#### Likely public
- `engine/game/GameBase.*`
- game-facing lifecycle contracts
- stable registration/update contracts used by games

#### Likely internal
- runtime setup helpers
- hidden orchestration helpers
- performance/fullscreen/runtime-context pass-through plumbing

#### Likely transitional
- re-export shims
- wrapper modules preserving old paths
- canvas/sprite/tile-adjacent game boot adapters still needed during migration

### Task breakdown

#### Task 1 — Export inventory
Create a complete inventory of current `engine/game` exports and classify each as public, internal, or transitional.

#### Task 2 — Contract rules
Document allowed dependency directions:
- games → public `engine/game`
- public `engine/game` → stable runtime contracts
- internal runtime modules must not become public through pass-through exports

#### Task 3 — GameBase normalization
Identify which public responsibilities should consolidate onto `GameBase` and which should remain adjacent helpers.

#### Task 4 — Transitional freeze
Mark compatibility wrappers as transitional and prevent expansion of those surfaces.

#### Task 5 — Follow-up build prep
Prepare a surgical BUILD_PR that updates docs and boundaries first, with no runtime change.

### Acceptance criteria
- `engine/game` boundary intent is documented
- public/internal/transitional definitions are explicit
- no behavior changes are introduced
- follow-up BUILD_PR scope is narrowed and surgical
- migration path remains compatible with existing runtime behavior

### Risk notes
- accidental public exposure of runtime internals
- over-classifying unstable helpers as public
- expanding transitional modules instead of shrinking them
- mixing boundary definition with implementation changes

### Next step after this PR
Proceed to BUILD_PR for docs + boundary markers only, still with no runtime behavior changes.
