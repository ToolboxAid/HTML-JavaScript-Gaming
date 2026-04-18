# PLAN_PR_LEVEL_11_2_RECONCILIATION_LAYER_FOUNDATION

## Purpose
Establish the docs-first plan for Level 11.2 reconciliation-layer foundation work following the successful Sample C divergence/debug-surface implementation. This PR remains non-destructive and docs-only. Codex implementation work should stay outside engine-core APIs and build on the new Sample C structure without promoting sample-specific debug code into shared runtime behavior prematurely.

## Background
Sample C now provides:
- a dedicated game sample under `games/network_sample_c/`
- scene/model/debug separation
- divergence-oriented debug surfaces
- Level 11 hub card wiring only, with no extra hub showcase section
- updated Track P planning state and roadmap wording

That makes Level 11.2 the right point to define how predicted state, authoritative state, history buffering, and correction behavior will be layered in a reusable way.

## PR Intent
Define the reconciliation architecture before code is written so future implementation can:
- compare predicted vs authoritative state consistently
- inject authoritative updates safely
- preserve public boundaries
- avoid accidental engine coupling
- keep sample-specific visualization separate from shared contracts

## In Scope
- Reconciliation layer planning
- State timeline/history planning
- Debug surface contract planning
- Codex build guidance for a future implementation PR
- Validation checklist and acceptance criteria

## Out of Scope
- Engine-core API changes
- Server dashboard implementation
- Docker or multiplayer service implementation
- Full authoritative server runtime
- New shared engine abstractions unless already exposed by approved public boundaries
- Rewriting Sample C to production networking

## Architectural Goals
1. Keep reconciliation logic layered above existing src/engine/game runtime boundaries.
2. Preserve the Sample C teaching/debug value while making future shared behavior possible.
3. Standardize terminology so later tracks do not drift.
4. Allow future Sample D / hub work to reuse contracts without duplicating ad hoc wiring.

## Proposed Deliverables
- `docs/operations/dev/RECONCILIATION_LAYER_SPEC.md`
- `docs/operations/dev/STATE_TIMELINE_SPEC.md`
- `docs/operations/dev/DEBUG_SURFACE_CONTRACT.md`
- `docs/operations/dev/codex_commands.md`
- `docs/operations/dev/commit_comment.txt`
- supporting report files under `docs/dev/reports/`

## Recommended Future BUILD PR Name
`BUILD_PR_LEVEL_11_2_RECONCILIATION_LAYER_FOUNDATION`

## Implementation Direction for Codex
### A. Reconciliation Layer
Introduce a thin layer that:
- receives predicted state snapshots from the client-side simulation
- receives authoritative snapshots/events from an approved source boundary
- computes divergence
- selects a correction policy
- emits correction/debug data without mutating engine internals directly

### B. Timeline / History Buffer
Add a bounded history model for sample-level use that can:
- store recent predicted frames
- align authoritative data to frame/tick identifiers
- support later replay/resimulation concepts
- remain isolated from engine-core timing primitives

### C. Correction Policy
Start with clearly documented correction modes:
- snap
- lerp / smooth settle
- hold + annotate (debug-only)

### D. Debug Contract
Standardize a minimal contract so debug overlays can be attached and detached consistently rather than each sample inventing new ad hoc hooks.

## Acceptance Criteria
- Docs clearly define predicted, authoritative, divergence, correction, and timeline terms.
- Docs explicitly prohibit engine-core API changes for this track unless separately approved.
- Docs describe how Sample C can evolve without becoming the shared implementation itself.
- Codex command is ready to execute in VS Code.
- Bundle remains docs-only.

## Risks Addressed
- Sample-specific logic leaking into shared systems
- Debug surfaces becoming hard-wired runtime dependencies
- Reconciliation being implemented before terminology and data flow are normalized
- Hidden engine coupling introduced through convenience shortcuts

## Notes for Review
This PR should be reviewed as a planning checkpoint between:
- Track P: divergence/debug surfaces in Sample C
- Track T: reconciliation behavior
- Track U: observability/server-oriented surfaces

The goal is to lock the contract and shape of the next implementation before BUILD work begins.
