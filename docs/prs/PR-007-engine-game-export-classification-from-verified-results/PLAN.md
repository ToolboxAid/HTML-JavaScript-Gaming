PR-007 — engine/game export classification from verified results plan

### Title

PR-007 — Classify Verified `engine/game` Exports as Public, Internal, or Transitional

### Description

Docs-first planning PR for classifying the verified `engine/game` exports captured in PR-006.

This PR follows the verified repo scan and narrows the next step to one purpose only:
classify the recorded `engine/game` exports as public, internal, or transitional without
changing runtime behavior.

This is planning-only.
No runtime behavior changes are included.

### PR Plan

#### Objective

Create a classification plan for the verified `engine/game` export surface that:
- uses the verified PR-006 export results as the source of truth
- assigns each verified export a public, internal, or transitional status
- preserves compatibility
- stays docs-first
- supports normalization toward the GameBase model

#### Verified Input Baseline

The current verified baseline is:
- 8 direct default exports under `engine/game`
- no re-export statements found in the scanned entry files

This plan must stay grounded in that verified baseline.

#### In Scope

- classify the verified `engine/game` exports
- define classification criteria using the verified export list
- record per-export classification rationale
- identify any export whose role appears public, internal, or transitional
- prepare the next docs-only BUILD_PR under `/docs/prs`

#### Out of Scope

- runtime behavior changes
- file moves
- import rewrites
- renames
- deletions
- export removal
- compatibility removal

#### Classification Intent

This PR is about interpreting the verified export list into boundary categories.

It should use the actual repo-backed export inventory from PR-006 and produce a careful
classification plan that keeps compatibility intact while documenting intended boundary roles.

#### Classification Rules

Public:
- appropriate for direct game-facing import
- aligned with stable orchestration or GameBase-facing usage
- does not expose runtime-only plumbing unnecessarily

Internal:
- implementation detail or engine/runtime plumbing
- not intended as stable game-facing API
- better kept behind a narrower public boundary

Transitional:
- currently exposed but likely retained mainly for compatibility
- bridge surface that should not grow
- candidate for later narrowing only in a future approved PR

#### Safety Rules

- use only verified export scan results as input
- preserve compatibility
- do not change runtime behavior
- do not remove or rename exports in this PR
- keep rationale factual and architecture-focused

### Tasks

#### Task 1 — Verified Export List Review
Review the PR-006 verified export list and confirm the exact set to classify.

#### Task 2 — Classification Matrix
Assign each verified export one of:
- public
- internal
- transitional

#### Task 3 — Rationale Notes
Record a short reason for each classification.

#### Task 4 — Boundary Alignment
Note how each classification supports or conflicts with the GameBase-centered direction.

#### Task 5 — BUILD_PR Preparation
Prepare the next docs-only BUILD_PR under `/docs/prs` to record the verified classifications.

### Acceptance Criteria

- a classification plan exists for the verified exports
- scope remains docs-only
- compatibility is preserved
- no runtime behavior changes are introduced
- BUILD_PR scope is ready and surgical
