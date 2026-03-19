PR-009 — engine/game compatibility usage evidence plan

### Title

PR-009 — Gather Usage Evidence for Compatibility-Retained `engine/game` Exports

### Description

Docs-first planning PR for gathering usage evidence for the verified compatibility-retained
`engine/game` exports.

This PR follows PR-008 and narrows the next step to one purpose only:
gather factual evidence showing which compatibility-retained `engine/game` exports are still
referenced by samples, games, or other callers before any future narrowing decisions.

This is planning-only.
No runtime behavior changes are included.

### PR Plan

#### Objective

Create a usage-evidence plan for the compatibility-retained `engine/game` export set that:
- builds on the verified classifications and retention labels from PR-007 and PR-008
- gathers factual caller evidence for still-exposed compatibility surfaces
- preserves compatibility
- stays docs-first
- supports later evidence-based narrowing decisions

#### Verified Baseline

Current compatibility-retained export baseline from PR-008:
- `GameCollision`
- `GameObjectManager`
- `GameObjectRegistry`
- `GameObjectSystem`
- `GameObjectUtils`
- `GameUtils`

This PR should plan evidence gathering for those verified compatibility-retained exports.

#### In Scope

- plan usage-evidence gathering for compatibility-retained exports
- identify the caller categories to inspect
- define the evidence format to record references
- distinguish direct caller evidence from inferred architecture notes
- prepare the next docs-only BUILD_PR under `/docs/prs`

#### Caller Categories To Inspect

- games
- samples
- engine callers
- other repo modules that import or reference `engine/game` exports

#### Out of Scope

- runtime behavior changes
- file moves
- import rewrites
- renames
- deletions
- export removal
- compatibility narrowing or enforcement changes

#### Evidence Intent

This PR is about factual usage evidence, not policy changes.

It should document how to determine:
- which compatibility-retained exports are still actively referenced
- where those references live
- whether a surface appears preserved mainly for active callers versus legacy safety

#### Evidence Rules

Record:
- verified export name
- caller file
- caller category
- reference type
- short factual note

Do not:
- change code
- alter import paths
- reinterpret behavior as removal guidance
- make narrowing decisions in this PR

#### Reference Types

- direct import
- namespace import usage
- indirect/reference usage when explicitly visible in repo structure

### Tasks

#### Task 1 — Baseline Review
Review the verified compatibility-retained export set from PR-008.

#### Task 2 — Caller Search Plan
Define how to search repo callers for each compatibility-retained export.

#### Task 3 — Evidence Matrix Format
Define the markdown structure for recording verified caller evidence.

#### Task 4 — Evidence Quality Rules
Separate direct verified references from broader architectural notes.

#### Task 5 — BUILD_PR Preparation
Prepare the next docs-only BUILD_PR under `/docs/prs` to record compatibility-usage evidence.

### Acceptance Criteria

- a usage-evidence plan exists for the compatibility-retained exports
- scope remains docs-only
- compatibility is preserved
- no runtime behavior changes are introduced
- BUILD_PR scope is ready and surgical
