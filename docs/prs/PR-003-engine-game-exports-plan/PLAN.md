PR-003 — engine/game export classification plan

### Title

PR-003 — Classify `engine/game` Exports as Public, Internal, or Transitional

### Description

Docs-first planning PR for `engine/game` concrete export classification.

This PR follows PR-002 boundary documentation and narrows the next step to a single purpose:
classify actual `engine/game` exports into public, internal, and transitional groups before any code changes.

This PR is planning-only and does not change runtime behavior.

### PR Plan

#### Objective

Produce a concrete export classification plan for `engine/game` that reduces engine/game coupling,
preserves compatibility, and continues normalization toward the `GameBase` model.

#### In Scope

- inventory `engine/game` exports
- define concrete public/internal/transitional classification rules
- identify candidate public entry points
- identify candidate internal-only exports
- identify compatibility/transitional exports
- prepare a surgical BUILD_PR for docs-only export mapping

#### Out of Scope

- runtime behavior changes
- file moves
- import rewrites
- renames
- deletions
- compatibility removal

#### Planning Constraints

- docs-first before code changes
- one PR = one purpose
- keep PR small and surgical
- preserve compatibility
- no destructive changes
- no breaking runtime behavior unless approved

#### Export Classification Intent

Public:
game-facing exports that callers may rely on directly and that align with the GameBase-centered model.

Internal:
runtime plumbing or implementation details that should not be exposed as stable game-facing API.

Transitional:
temporary exports that keep older callers working while the architecture converges on the new boundary model.

#### Candidate Decision Rules

Public if:
- directly supports game composition or orchestration
- aligns with `GameBase` as the preferred public entry point
- does not expose runtime-only plumbing
- is safe to document as stable

Internal if:
- primarily coordinates runtime details
- leaks implementation details
- exists for hidden setup, wiring, or pass-through behavior
- should remain behind the public boundary

Transitional if:
- exists mainly for compatibility
- bridges old imports to newer structure
- should not grow in scope
- may be retired in a later PR after usage review

### Tasks

#### Task 1 — Export Inventory
Create a concrete list of current `engine/game` exports and their source files.

#### Task 2 — Classification Matrix
Assign each export one of:
- public
- internal
- transitional

#### Task 3 — Stability Notes
Add a brief reason for each classification so later PRs do not reinterpret intent.

#### Task 4 — GameBase Alignment
Confirm whether each public export supports or distracts from the `GameBase` public model.

#### Task 5 — BUILD_PR Preparation
Prepare the next docs-only PR to record the concrete export map under `/docs/prs`.

### Acceptance Criteria

- concrete export classification plan exists
- scope remains docs-only
- compatibility is preserved
- no runtime behavior changes are introduced
- BUILD_PR scope is ready and surgical
