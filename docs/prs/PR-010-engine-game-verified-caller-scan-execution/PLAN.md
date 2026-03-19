PR-010 — engine/game verified caller scan execution plan

### Title

PR-010 — Execute Verified Caller Scan for Compatibility-Retained `engine/game` Exports

### Description

Docs-first planning PR for executing the real caller scan for the verified compatibility-retained
`engine/game` exports.

This PR follows PR-009 and narrows the next step to one purpose only:
run the actual repo-level caller scan for compatibility-retained `engine/game` exports and record
verified caller references without changing runtime behavior.

This is planning-only.
No runtime behavior changes are included.

### PR Plan

#### Objective

Create an execution plan for a verified caller scan that:
- scans the real repo for callers of compatibility-retained `engine/game` exports
- records verified caller evidence instead of placeholders
- preserves compatibility
- keeps the work docs-first
- prepares later evidence-based narrowing decisions

#### Verified Baseline

Compatibility-retained export baseline from PR-008:
- `GameCollision`
- `GameObjectManager`
- `GameObjectRegistry`
- `GameObjectSystem`
- `GameObjectUtils`
- `GameUtils`

#### In Scope

- execute the actual caller scan against the repo
- capture verified references to compatibility-retained exports
- record caller file, caller category, and reference type
- distinguish direct verified references from broader architecture notes
- prepare the next surgical BUILD_PR to store verified caller results under `/docs/prs`

#### Caller Categories

- games
- samples
- engine modules
- other repo callers

#### Out of Scope

- runtime behavior changes
- file moves
- import rewrites
- renames
- deletions
- export removal
- compatibility narrowing or enforcement changes

#### Execution Intent

This PR moves from evidence framework to verified repo-backed caller evidence.

It should produce a plan for scanning the actual repo and recording caller references exactly as found,
so follow-up PRs can make narrowing decisions from evidence instead of assumptions.

#### Execution Rules

Record:
- export name
- caller file
- caller category
- reference type
- short factual note

Do not:
- change code
- alter import paths
- reinterpret behavior
- recommend removals
- change compatibility surfaces

#### Reference Types

- direct import
- namespace import usage
- indirect visible reference

### Tasks

#### Task 1 — Search Entry Definition
Define the repo paths and caller categories to scan.

#### Task 2 — Execute Caller Scan
Scan the repo for verified references to each compatibility-retained export.

#### Task 3 — Evidence Attribution
Record caller file, category, and reference type for each verified reference.

#### Task 4 — Result Recording
Define how actual caller results will be written into the evidence matrix.

#### Task 5 — BUILD_PR Preparation
Prepare the next docs-only BUILD_PR under `/docs/prs` to record the verified caller results.

### Acceptance Criteria

- a verified caller scan execution plan exists
- scope remains docs-only
- compatibility is preserved
- no runtime behavior changes are introduced
- BUILD_PR scope is ready and surgical
