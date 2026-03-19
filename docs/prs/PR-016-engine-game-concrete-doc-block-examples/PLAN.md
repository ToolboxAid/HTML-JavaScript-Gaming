PR-016 — engine/game concrete documentation block examples plan

### Title

PR-016 — Define Concrete Documentation Block Examples for Compatibility-Retained `engine/game` Exports

### Description

Docs-first planning PR for defining concrete documentation block examples for the compatibility-retained
`engine/game` exports.

This PR follows PR-015 and narrows the next step to one purpose only:
turn the reusable snippet templates and wording rules into concrete example documentation blocks for each
approved documentation posture, without changing runtime behavior.

This is planning-only.
No runtime behavior changes are included.

### PR Plan

#### Objective

Create a concrete documentation-block-example plan for compatibility-retained `engine/game` exports that:
- builds on the PR-013 documentation posture split
- uses the PR-014 wording-treatment rules
- uses the PR-015 reusable snippet templates
- defines example documentation blocks for each posture
- preserves compatibility confidence for current callers
- stays docs-first

#### Verified Baseline

Documentation postures currently in place:

Supported compatibility surfaces:
- `GameCollision`
- `GameObjectSystem`
- `GameUtils`

Compatibility surfaces with transition-planning note:
- `GameObjectManager`
- `GameObjectRegistry`
- `GameObjectUtils`

Reusable snippet guidance now exists for:
- short summary
- support-status
- caller reassurance
- transition-planning note
- placeholder structure
- usage rules

#### In Scope

- define example documentation block structure for each posture
- specify which snippet components combine into a full documentation block
- provide example block intent and ordering
- define when a shorter versus fuller block should be used
- prepare the next docs-only BUILD_PR under `/docs/prs`

#### Out of Scope

- runtime behavior changes
- file moves
- import rewrites
- renames
- deletions
- export removal
- compatibility narrowing or enforcement changes

#### Example Block Intent

This PR is about concrete docs examples, not code behavior.

It should define:
- how a supported compatibility surface block should read as a full doc example
- how a transition-planning-note block should read as a full doc example
- how example blocks preserve compatibility confidence while reflecting current documentation posture
- how to avoid example wording that implies immediate removal or breakage

#### Candidate Example Block Parts

- export heading line
- short summary
- support-status sentence
- caller reassurance sentence
- optional transition-planning sentence
- optional future-docs note

#### Example Block Rules

Supported compatibility surface blocks should:
- feel stable and compatibility-safe
- clearly affirm present support
- avoid wording that sounds temporary or unstable

Transition-planning-note blocks should:
- clearly affirm present compatibility support
- include a cautious forward-looking note
- avoid implying immediate migration pressure or approved deprecation

Record:
- posture group
- example block purpose
- recommended block parts
- ordering guidance
- key phrasing requirements
- key cautions

Do not:
- change code
- alter import paths
- imply approved removals
- change runtime behavior
- narrow compatibility surfaces in this PR

### Tasks

#### Task 1 — Snippet Review
Review the PR-015 snippet templates, placeholder structure, and usage rules.

#### Task 2 — Block Structure Matrix
Define concrete documentation block structure for:
- supported compatibility surfaces
- compatibility surfaces with transition-planning note

#### Task 3 — Ordering Rules
Define the recommended ordering of block parts for each posture.

#### Task 4 — Example Usage Notes
Record when shorter or fuller example blocks should be used.

#### Task 5 — BUILD_PR Preparation
Prepare the next docs-only BUILD_PR under `/docs/prs` to record the concrete documentation block examples.
