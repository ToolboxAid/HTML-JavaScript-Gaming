PR-012 — engine/game transition-planning candidates plan

### Title

PR-012 — Identify Transition-Planning Candidates Among Compatibility-Retained `engine/game` Exports

### Description

Docs-first planning PR for identifying which compatibility-retained `engine/game` exports
should be treated as actively supported compatibility surfaces versus transition-planning candidates.

This PR follows PR-011 and narrows the next step to one purpose only:
use the documented retention labels and usage-risk tiers to separate compatibility-retained exports
into stronger keep-stable surfaces and exports that may require future transition planning.

This is planning-only.
No runtime behavior changes are included.

### PR Plan

#### Objective

Create a transition-planning candidate plan for compatibility-retained `engine/game` exports that:
- builds on PR-008 retention labels
- uses PR-011 usage-based risk tiers
- distinguishes actively supported compatibility surfaces from transition-planning candidates
- preserves compatibility
- stays docs-first

#### Verified Baseline

Compatibility-retained exports documented so far:
- `GameCollision`
- `GameObjectManager`
- `GameObjectRegistry`
- `GameObjectSystem`
- `GameObjectUtils`
- `GameUtils`

Usage-risk tiers documented in PR-011:
- high risk: `GameCollision`, `GameObjectSystem`, `GameUtils`
- medium risk: `GameObjectManager`, `GameObjectRegistry`, `GameObjectUtils`
- low risk: none

#### In Scope

- define transition-planning label categories
- identify which compatibility-retained exports should be considered actively supported compatibility surfaces
- identify which compatibility-retained exports should be considered transition-planning candidates
- record concise rationale grounded in documented risk and usage evidence
- prepare the next docs-only BUILD_PR under `/docs/prs`

#### Candidate Labels

- actively supported compatibility surface
- transition-planning candidate

#### Labeling Intent

This PR is about transition planning posture, not code enforcement.

It should document which exports:
- remain important enough to treat as supported compatibility surfaces for now
- should be watched more closely for future migration planning
- may be documented differently in later PRs without changing runtime behavior now

#### Labeling Rules

Consider:
- documented usage-risk tier
- caller breadth from verified evidence
- whether the export appears central to current compatibility patterns
- whether future narrowing would likely need a migration path

Record:
- export name
- label
- short rationale
- note for later planning

Do not:
- change code
- alter import paths
- recommend approved removals
- change runtime behavior
- narrow compatibility surfaces in this PR

### Tasks

#### Task 1 — Baseline Review
Review the compatibility-retained exports and their documented risk tiers.

#### Task 2 — Candidate Matrix
Assign each compatibility-retained export one of:
- actively supported compatibility surface
- transition-planning candidate

#### Task 3 — Rationale Notes
Record a short rationale tied to documented risk and usage evidence.

#### Task 4 — Planning Notes
Note what each label implies for future documentation or migration planning.

#### Task 5 — BUILD_PR Preparation
Prepare the next docs-only BUILD_PR under `/docs/prs` to record transition-planning candidates.

### Acceptance Criteria

- a transition-planning candidate plan exists for compatibility-retained exports
- scope remains docs-only
- compatibility is preserved
- no runtime behavior changes are introduced
- BUILD_PR scope is ready and surgical
