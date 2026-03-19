PR-008 — engine/game compatibility retention labels plan

### Title

PR-008 — Label Verified `engine/game` Exports as Compatibility-Retained or Intended Public-Facing

### Description

Docs-first planning PR for labeling the already-classified `engine/game` exports by retention intent.

This PR follows PR-007 and narrows the next step to one purpose only:
mark which verified internal and transitional exports are being retained for compatibility,
versus which surfaces are intended to remain public-facing under the current architecture direction.

This is planning-only.
No runtime behavior changes are included.

### PR Plan

#### Objective

Create a retention-label plan for the verified `engine/game` export set that:
- builds on the verified classifications from PR-007
- distinguishes compatibility-retained exports from intended public-facing exports
- preserves compatibility
- stays docs-first
- supports normalization toward the `GameBase` model

#### Verified Baseline

Current verified classification baseline from PR-007:
- public: `GameObject`, `GamePlayerSelectUi`
- internal: `GameCollision`, `GameObjectManager`, `GameObjectRegistry`, `GameObjectSystem`
- transitional: `GameObjectUtils`, `GameUtils`

This PR should label retention intent using that verified classification baseline.

#### In Scope

- label verified exports by retention intent
- distinguish compatibility-retained exports from intended public-facing exports
- record short rationale for each label
- note which surfaces are preferred future-facing versus compatibility-preserved only
- prepare the next docs-only BUILD_PR under `/docs/prs`

#### Out of Scope

- runtime behavior changes
- file moves
- import rewrites
- renames
- deletions
- export removal
- compatibility narrowing or enforcement changes

#### Labeling Intent

This PR is about retention intent, not code enforcement.

It should document:
- which exports are intentionally public-facing
- which exports remain exposed only to preserve compatibility
- which exports should not expand in scope while still remaining available

#### Label Categories

Intended public-facing:
- export is expected to remain part of the preferred direct game-facing surface

Compatibility-retained:
- export remains exposed for compatibility
- export is not preferred as a long-term direct public boundary
- export should not grow in scope without later review

#### Safety Rules

- use the PR-007 verified classification docs as the baseline
- preserve compatibility
- do not change runtime behavior
- do not remove or rename exports in this PR
- keep labels architecture-focused and concise

### Tasks

#### Task 1 — Baseline Review
Review the verified PR-007 classification set and confirm the exports to label.

#### Task 2 — Retention Label Matrix
Assign each verified export one of:
- intended public-facing
- compatibility-retained

#### Task 3 — Rationale Notes
Record a short reason for each retention label.

#### Task 4 — Boundary Notes
Note how each label supports current `GameBase`-centered boundary direction.

#### Task 5 — BUILD_PR Preparation
Prepare the next docs-only BUILD_PR under `/docs/prs` to record the retention labels.

### Acceptance Criteria

- a retention-label plan exists for the verified exports
- scope remains docs-only
- compatibility is preserved
- no runtime behavior changes are introduced
- BUILD_PR scope is ready and surgical
