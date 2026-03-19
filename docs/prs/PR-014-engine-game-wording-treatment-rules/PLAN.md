PR-014 — engine/game wording treatment rules plan

### Title

PR-014 — Define Wording Treatment Rules for Compatibility-Retained `engine/game` Documentation Postures

### Description

Docs-first planning PR for defining wording treatment rules for the compatibility-retained
`engine/game` exports now that documentation posture has been established.

This PR follows PR-013 and narrows the next step to one purpose only:
define how docs language should differ between supported compatibility surfaces and
compatibility surfaces with transition-planning notes, without changing runtime behavior.

This is planning-only.
No runtime behavior changes are included.

### PR Plan

#### Objective

Create a wording-treatment plan for compatibility-retained `engine/game` exports that:
- builds on the PR-013 documentation posture split
- defines wording rules for each documentation posture
- preserves compatibility confidence for current callers
- stays docs-first
- supports future migration planning without implying immediate breakage

#### Verified Baseline

Documentation postures from PR-013:

Supported compatibility surfaces:
- `GameCollision`
- `GameObjectSystem`
- `GameUtils`

Compatibility surfaces with transition-planning note:
- `GameObjectManager`
- `GameObjectRegistry`
- `GameObjectUtils`

#### In Scope

- define wording treatment rules for each documentation posture
- define approved wording goals and wording cautions
- specify how to describe current support without implying future guarantees beyond the evidence
- specify how to mention transition-planning posture without implying immediate deprecation
- prepare the next docs-only BUILD_PR under `/docs/prs`

#### Out of Scope

- runtime behavior changes
- file moves
- import rewrites
- renames
- deletions
- export removal
- compatibility narrowing or enforcement changes

#### Wording Intent

This PR is about documentation language, not code behavior.

It should define:
- how supported compatibility surfaces are described in a confidence-preserving way
- how transition-planning-note surfaces are described in a cautious but still compatibility-safe way
- how to avoid language that over-promises, undercuts current support, or implies unapproved removals

#### Candidate Wording Rule Areas

- support framing
- caution framing
- migration wording
- recommendation wording for new usage
- phrases to prefer
- phrases to avoid

#### Wording Rules

Supported compatibility surface language should:
- clearly state that the surface remains supported for current compatibility needs
- avoid implying instability or hidden deprecation
- avoid promising permanent long-term public preference if not established

Transition-planning-note language should:
- clearly preserve compatibility confidence for current callers
- signal that future migration planning may affect how the surface is presented in docs
- avoid implying immediate deprecation, breakage, or approved removal

Record:
- posture group
- wording goal
- preferred wording style
- wording cautions
- short example direction

Do not:
- change code
- alter import paths
- imply approved removals
- change runtime behavior
- narrow compatibility surfaces in this PR

### Tasks

#### Task 1 — Posture Review
Review the PR-013 documentation posture split and confirm the two wording groups.

#### Task 2 — Wording Rule Matrix
Define wording treatment rules for:
- supported compatibility surfaces
- compatibility surfaces with transition-planning note

#### Task 3 — Preferred and Avoided Language
Record language patterns to prefer and patterns to avoid for each group.

#### Task 4 — Example Direction
Provide concise example direction for future docs wording.

#### Task 5 — BUILD_PR Preparation
Prepare the next docs-only BUILD_PR under `/docs/prs` to record the wording treatment rules.

### Acceptance Criteria

- a wording-treatment plan exists for the documentation posture groups
- scope remains docs-only
- compatibility is preserved
- no runtime behavior changes are introduced
- BUILD_PR scope is ready and surgical
