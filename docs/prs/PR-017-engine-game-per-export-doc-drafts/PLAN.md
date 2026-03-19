PR-017 — engine/game per-export documentation drafts plan

### Title

PR-017 — Draft Per-Export Documentation Blocks for Compatibility-Retained `engine/game` Exports

### Description

Docs-first planning PR for drafting per-export documentation blocks for the compatibility-retained
`engine/game` exports.

This PR follows PR-016 and narrows the next step to one purpose only:
turn the approved concrete documentation block examples into per-export draft documentation blocks for each
compatibility-retained export, without changing runtime behavior.

This is planning-only.
No runtime behavior changes are included.

### PR Plan

#### Objective

Create a per-export documentation-draft plan for compatibility-retained `engine/game` exports that:
- builds on the PR-013 documentation posture split
- uses the PR-014 wording-treatment rules
- uses the PR-015 reusable snippet templates
- uses the PR-016 concrete documentation block examples
- defines per-export draft blocks for each compatibility-retained export
- preserves compatibility confidence for current callers
- stays docs-first

#### Verified Baseline

Compatibility-retained exports currently grouped as:

Supported compatibility surfaces:
- `GameCollision`
- `GameObjectSystem`
- `GameUtils`

Compatibility surfaces with transition-planning note:
- `GameObjectManager`
- `GameObjectRegistry`
- `GameObjectUtils`

Approved documentation assets now exist for:
- wording rules
- preferred and avoided language
- reusable snippet templates
- concrete fuller and shorter block examples

#### In Scope

- define the per-export draft plan for each compatibility-retained export
- specify which approved block family each export should use
- define which exports should receive fuller versus shorter draft blocks
- record export-by-export draft intent and structure
- prepare the next docs-only BUILD_PR under `/docs/prs`

#### Out of Scope

- runtime behavior changes
- file moves
- import rewrites
- renames
- deletions
- export removal
- compatibility narrowing or enforcement changes

#### Draft Intent

This PR is about per-export docs drafting, not code behavior.

It should define:
- how each compatibility-retained export should be documented using the approved examples
- which posture-specific wording should be used for each export
- which exports need fuller blocks versus shorter blocks
- how to preserve compatibility confidence while reflecting the approved posture

#### Candidate Draft Decisions

- supported compatibility surface → fuller block or shorter block
- compatibility surface with transition-planning note → fuller block or shorter block
- export-specific wording emphasis
- export-specific caller reassurance emphasis

#### Draft Rules

Supported compatibility surface drafts should:
- feel stable and compatibility-safe
- affirm present support
- avoid temporary or warning-style language

Transition-planning-note drafts should:
- affirm present compatibility support
- include a cautious future-docs note
- avoid sounding like an approved deprecation notice

Record:
- export name
- posture group
- recommended block family
- draft emphasis note
- draft caution note

Do not:
- change code
- alter import paths
- imply approved removals
- change runtime behavior
- narrow compatibility surfaces in this PR

### Tasks

#### Task 1 — Example Review
Review the PR-016 concrete documentation block examples and usage notes.

#### Task 2 — Per-Export Draft Matrix
Define draft direction for:
- `GameCollision`
- `GameObjectSystem`
- `GameUtils`
- `GameObjectManager`
- `GameObjectRegistry`
- `GameObjectUtils`

#### Task 3 — Block Family Assignment
Assign each export a fuller or shorter block family based on approved posture and usage context.

#### Task 4 — Draft Emphasis Notes
Record export-specific support emphasis and caution notes.

#### Task 5 — BUILD_PR Preparation
Prepare the next docs-only BUILD_PR under `/docs/prs` to record the per-export documentation drafts.
