PR-004 — engine/game concrete export inventory plan

### Title

PR-004 — Inventory Actual `engine/game` Exports for Classification

### Description

Docs-first planning PR for a concrete inventory of actual `engine/game` exports.

This PR follows PR-003 and narrows the next step to one purpose only:
record the real export surface currently exposed by `engine/game`, so later PRs can
classify and reduce it without guesswork.

This is planning-only.
No runtime behavior changes are included.

### PR Plan

#### Objective

Create a concrete inventory plan for actual `engine/game` exports that:
- documents what is currently exported
- records source files for each export
- prepares later classification and cleanup PRs
- preserves compatibility
- stays aligned with the `GameBase` model

#### In Scope

- inventory actual `engine/game` exports
- record export names and source files
- note re-exports versus direct exports
- define the documentation shape for the inventory
- prepare the next docs-only BUILD_PR

#### Out of Scope

- runtime behavior changes
- file moves
- import rewrites
- renames
- deletions
- export removal
- compatibility removal

#### Inventory Intent

This PR is about facts, not decisions.
It should capture the current `engine/game` export surface as-is so later PRs can
classify each export as public, internal, or transitional with full context.

#### Inventory Rules

Record:
- export name
- defining file
- whether the export is direct or re-exported
- notes if the export appears compatibility-related

Do not:
- change any code
- alter import paths
- reinterpret behavior
- remove any existing compatibility surface

### Tasks

#### Task 1 — Export Discovery
Identify every actual export currently exposed through `engine/game`.

#### Task 2 — Source Mapping
Record the file that defines or re-exports each export.

#### Task 3 — Surface Notes
Mark whether each item appears to be direct, re-exported, or compatibility-oriented.

#### Task 4 — Inventory Format
Define the markdown structure for the inventory document to be added in BUILD_PR.

#### Task 5 — BUILD_PR Preparation
Prepare the next docs-only PR under `/docs/prs` to record the concrete export inventory.

### Acceptance Criteria

- a concrete export inventory plan exists
- scope remains docs-only
- compatibility is preserved
- no runtime behavior changes are introduced
- BUILD_PR scope is ready and surgical
