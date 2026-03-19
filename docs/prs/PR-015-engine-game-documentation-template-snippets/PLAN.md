PR-015 — engine/game documentation template snippets plan

### Title

PR-015 — Define Reusable Documentation Template Snippets for Compatibility-Retained `engine/game` Exports

### Description

Docs-first planning PR for defining reusable documentation template snippets for the compatibility-retained `engine/game` exports.

This PR follows PR-014 and narrows the next step to one purpose only:
turn the approved documentation posture and wording rules into reusable snippet patterns for future docs, without changing runtime behavior.

This is planning-only.
No runtime behavior changes are included.

### PR Plan

#### Objective

Create a documentation-template-snippet plan for compatibility-retained `engine/game` exports that:
- builds on the PR-013 documentation posture split
- uses the PR-014 wording-treatment rules
- defines reusable snippet templates for each posture
- preserves compatibility confidence for current callers
- stays docs-first
- supports future documentation consistency

#### Verified Baseline

Documentation posture groups from PR-013 and PR-014:

Supported compatibility surfaces:
- `GameCollision`
- `GameObjectSystem`
- `GameUtils`

Compatibility surfaces with transition-planning note:
- `GameObjectManager`
- `GameObjectRegistry`
- `GameObjectUtils`

These now have:
- posture guidance
- preferred wording
- avoided wording
- example direction

#### In Scope

- define reusable snippet template categories for each posture
- specify snippet structure and tone
- record placeholder slots for export name and support wording
- define rules for when each snippet type should be used
- prepare the next docs-only BUILD_PR under `/docs/prs`

#### Out of Scope

- runtime behavior changes
- file moves
- import rewrites
- renames
- deletions
- export removal
- compatibility narrowing or enforcement changes

#### Template Intent

This PR is about reusable docs patterns, not code behavior.

It should define:
- a standard snippet shape for supported compatibility surfaces
- a standard snippet shape for compatibility surfaces with transition-planning note
- how snippet wording should preserve compatibility confidence
- how snippet wording should avoid implying unapproved removal or breakage

#### Candidate Template Areas

- short summary snippet
- support-status snippet
- transition-planning note snippet
- current-caller reassurance snippet
- “future docs may evolve” note
- phrases to include or exclude

#### Template Rules

Supported compatibility surface snippets should:
- clearly state current support for compatibility needs
- reassure current callers
- avoid suggesting instability or near-term removal

Transition-planning-note snippets should:
- clearly state current support for compatibility use
- acknowledge that future docs treatment may evolve
- avoid implying immediate migration pressure or approved deprecation

Record:
- posture group
- snippet purpose
- suggested template shape
- key phrasing requirements
- key phrasing cautions

Do not:
- change code
- alter import paths
- imply approved removals
- change runtime behavior
- narrow compatibility surfaces in this PR

### Tasks

#### Task 1 — Posture and Wording Review
Review the PR-013 posture split and PR-014 wording-treatment rules.

#### Task 2 — Template Matrix
Define reusable snippet types for:
- supported compatibility surfaces
- compatibility surfaces with transition-planning note

#### Task 3 — Placeholder Structure
Define reusable placeholders such as:
- export name
- current support statement
- transition-planning wording
- caller reassurance wording

#### Task 4 — Usage Rules
Record when each snippet type should be used in future docs.

#### Task 5 — BUILD_PR Preparation
Prepare the next docs-only BUILD_PR under `/docs/prs` to record the documentation template snippets.
