PR-005 — engine/game factual export capture plan

### Title

PR-005 — Capture Actual `engine/game` Exports From the Repo

### Description

Docs-first planning PR for factual capture of the real `engine/game` export surface.

This PR follows PR-004 and narrows the next step to one purpose only:
capture the actual exports currently exposed by `engine/game` directly from the repo,
without interpretation or behavior changes.

This is planning-only.
No runtime behavior changes are included.

### PR Plan

#### Objective

Create a factual export capture plan for `engine/game` that:
- records the current export surface from the repo
- avoids guesswork and architectural reinterpretation
- prepares later classification work with real evidence
- preserves compatibility
- stays aligned with docs-first PR discipline

#### In Scope

- capture actual `engine/game` exports from the repo
- record export names exactly as exposed
- record defining files and re-export files where applicable
- note direct export versus re-export
- note obvious compatibility-oriented surfaces when factually visible
- prepare the next docs-only BUILD_PR

#### Out of Scope

- runtime behavior changes
- file moves
- import rewrites
- renames
- deletions
- export removal
- classification decisions beyond factual notes

#### Capture Intent

This PR is factual capture only.

It should document what `engine/game` actually exports today, using the repo as the source of truth,
so later PRs can classify public, internal, and transitional surfaces from evidence instead of assumptions.

#### Capture Rules

Record:
- export name
- source file
- re-export file when applicable
- surface type: direct export or re-export
- factual note if a compatibility bridge is explicitly visible

Do not:
- change code
- alter import paths
- reinterpret behavior
- recommend removals
- change compatibility surfaces

### Tasks

#### Task 1 — Repo Export Scan
Scan the actual `engine/game` module surface in the repo and collect every exposed export.

#### Task 2 — Source Attribution
Record the file that defines each export and the file that re-exports it, if applicable.

#### Task 3 — Surface Type Capture
Mark each export as direct export or re-export using factual repo evidence.

#### Task 4 — Compatibility Notes
Add brief factual notes only when compatibility-oriented structure is explicitly visible.

#### Task 5 — BUILD_PR Preparation
Prepare the next docs-only PR under `/docs/prs` to record the captured export list.

### Acceptance Criteria

- a factual export capture plan exists
- scope remains docs-only
- compatibility is preserved
- no runtime behavior changes are introduced
- BUILD_PR scope is ready and surgical
