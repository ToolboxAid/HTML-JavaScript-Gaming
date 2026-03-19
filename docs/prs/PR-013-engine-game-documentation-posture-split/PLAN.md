PR-013 — engine/game documentation posture split plan

### Title

PR-013 — Define Documentation Posture for Compatibility-Retained `engine/game` Export Groups

### Description

Docs-first planning PR for defining documentation posture for the two compatibility-retained
`engine/game` groups identified in PR-012.

This PR follows PR-012 and narrows the next step to one purpose only:
define how actively supported compatibility surfaces and transition-planning candidates
should be presented in docs without changing runtime behavior.

This is planning-only.
No runtime behavior changes are included.

### PR Plan

#### Objective

Create a documentation-posture plan for compatibility-retained `engine/game` exports that:
- builds on the PR-012 split between actively supported compatibility surfaces and transition-planning candidates
- defines how each group should be described in docs
- preserves compatibility
- stays docs-first
- supports future migration planning without implying immediate code changes

#### Verified Baseline

Compatibility-retained exports are currently split into:

Actively supported compatibility surfaces:
- `GameCollision`
- `GameObjectSystem`
- `GameUtils`

Transition-planning candidates:
- `GameObjectManager`
- `GameObjectRegistry`
- `GameObjectUtils`

#### In Scope

- define documentation posture categories for each group
- specify how actively supported compatibility surfaces should be documented
- specify how transition-planning candidates should be documented
- record concise rationale for each posture
- prepare the next docs-only BUILD_PR under `/docs/prs`

#### Out of Scope

- runtime behavior changes
- file moves
- import rewrites
- renames
- deletions
- export removal
- compatibility narrowing or enforcement changes

#### Documentation Posture Intent

This PR is about how exports are described, not how code behaves.

It should document:
- which exports remain visible as still-supported compatibility surfaces
- which exports should be documented more cautiously as planning-watch surfaces
- how to avoid implying immediate deprecation or runtime changes

#### Candidate Posture Labels

- supported compatibility surface
- compatibility surface with transition-planning note

#### Posture Rules

Consider:
- PR-012 transition-planning split
- documented risk and usage evidence
- whether callers still depend on the export broadly
- whether future narrowing would likely need migration guidance

Record:
- export name
- documentation posture
- short rationale
- note for future docs treatment

Do not:
- change code
- alter import paths
- imply approved removals
- change runtime behavior
- narrow compatibility surfaces in this PR

### Tasks

#### Task 1 — Baseline Review
Review the PR-012 split between actively supported compatibility surfaces and transition-planning candidates.

#### Task 2 — Posture Matrix
Assign each compatibility-retained export a documentation posture.

#### Task 3 — Rationale Notes
Record a short rationale for each posture.

#### Task 4 — Future Docs Notes
Note what each posture implies for later documentation updates.

#### Task 5 — BUILD_PR Preparation
Prepare the next docs-only BUILD_PR under `/docs/prs` to record the documentation posture split.

### Acceptance Criteria

- a documentation-posture plan exists for compatibility-retained exports
- scope remains docs-only
- compatibility is preserved
- no runtime behavior changes are introduced
- BUILD_PR scope is ready and surgical
