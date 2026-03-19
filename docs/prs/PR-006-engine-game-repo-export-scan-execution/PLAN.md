PR-006 — engine/game repo export scan execution plan

### Title

PR-006 — Execute Actual `engine/game` Repo Export Scan and Record Results

### Description

Docs-first planning PR for executing the real `engine/game` export scan against the repo and recording the results.

This PR follows PR-005 and narrows the next step to one purpose only:
run the actual repo-level export scan, capture the real exports exposed by `engine/game`,
and record those results in docs without changing runtime behavior.

This is planning-only.
No runtime behavior changes are included.

### PR Plan

#### Objective

Create an execution plan for a factual repo export scan that:
- scans the real `engine/game` export surface from the repo
- records actual results instead of placeholders
- preserves compatibility
- keeps the work docs-first
- prepares later classification PRs with evidence

#### In Scope

- execute the actual `engine/game` export scan against the repo
- capture export names exactly as exposed
- record defining files and re-export files where applicable
- record direct export versus re-export
- record factual compatibility notes only when explicitly visible
- prepare the next surgical BUILD_PR to store scan results under `/docs/prs`

#### Out of Scope

- runtime behavior changes
- file moves
- import rewrites
- renames
- deletions
- export removal
- public/internal/transitional classification decisions

#### Execution Intent

This PR is the transition from planning placeholders to factual repo-backed documentation.

It should produce a plan for scanning the actual repo surface and recording the results
exactly as found, so follow-up PRs can classify exports from evidence rather than assumptions.

#### Execution Rules

Record:
- export name exactly as exposed
- defining file
- re-export file when applicable
- surface type: direct export or re-export
- factual note only if compatibility structure is explicitly visible

Do not:
- change code
- alter import paths
- reinterpret behavior
- recommend removals
- change compatibility surfaces

### Tasks

#### Task 1 — Scan Entry Points
Identify the repo files that define the outward `engine/game` module surface.

#### Task 2 — Execute Export Scan
Scan those files and collect every actual export exposed through `engine/game`.

#### Task 3 — Source Attribution
Record the defining file and re-export file for each captured export.

#### Task 4 — Result Recording
Define how the actual scan results will be written into the factual capture docs.

#### Task 5 — BUILD_PR Preparation
Prepare the next docs-only BUILD_PR under `/docs/prs` to record the actual scan results.

### Acceptance Criteria

- a repo export scan execution plan exists
- scope remains docs-only
- compatibility is preserved
- no runtime behavior changes are introduced
- BUILD_PR scope is ready and surgical
