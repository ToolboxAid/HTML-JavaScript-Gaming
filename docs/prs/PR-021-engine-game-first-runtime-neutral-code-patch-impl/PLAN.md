PR-021 — engine/game first runtime-neutral code patch implementation plan

### Title

PR-021 — Implement the First Runtime-Neutral Alignment Patch for `engine/game`

### Description

Docs-first planning PR for the first actual implementation PR in `engine/game`.

This PR follows PR-020 and narrows the next step to one purpose only:
implement the already-specified runtime-neutral alignment patch by adding comment-only or other
runtime-neutral markers to the documented `engine/game` export files, while preserving compatibility.

This is planning-only.
No runtime behavior changes are included.

### PR Plan

#### Objective

Create an implementation plan for the first runtime-neutral `engine/game` code patch that:
- builds on PR-018 refactor-readiness guardrails
- builds on PR-019 first-code-PR alignment scope
- builds on PR-020 file-level patch specification
- preserves compatibility
- keeps the implementation surgical, reversible, and easy to review

#### Verified Baseline

The following are already documented:
- first-code-PR guardrails
- first-code-PR file scope
- file-level patch matrix
- comment insertion spec
- review and acceptance criteria

#### In Scope

- implement comment-only or runtime-neutral marker insertions
- touch only the six documented `engine/game` export files
- reflect documented compatibility posture in comments only
- preserve imports, export names, file paths, and execution behavior
- prepare the next BUILD_PR under `/docs/prs`

#### Target Files

- `engine/game/gameCollision.js`
- `engine/game/gameObjectManager.js`
- `engine/game/gameObjectRegistry.js`
- `engine/game/gameObjectSystem.js`
- `engine/game/gameObjectUtils.js`
- `engine/game/gameUtils.js`

#### Out of Scope

- runtime behavior changes
- import rewrites
- file moves
- renames
- deletions
- export removal
- cleanup outside the intended insertions
- caller changes

#### Implementation Intent

This PR is the first non-docs alignment step.

It should:
- add only runtime-neutral comments or markers
- reinforce documented compatibility posture
- reinforce preferred `GameBase` direction in comments only where appropriate
- remain trivial to audit against PR-020
- avoid any ambiguity about caller safety

#### Implementation Rules

The implementation must:
- be comment-only or otherwise runtime-neutral
- avoid touching executable statements
- avoid changing import/export syntax
- avoid reformatting unrelated code
- keep each file diff minimal

Record:
- file path
- patch action
- intended comment family
- review note
- verification note

Do not:
- change logic
- alter imports
- rename anything
- move files
- expand scope

### Tasks

#### Task 1 — Patch Scope Confirmation
Confirm the six-file implementation scope from PR-020.

#### Task 2 — Per-File Patch Actions
Define the exact comment insertion action for each target file.

#### Task 3 — Verification Rules
Define how to verify that each file change is runtime-neutral.

#### Task 4 — Review Checklist
Define the implementation review checklist for the BUILD_PR.

#### Task 5 — BUILD_PR Preparation
Prepare the next BUILD_PR under `/docs/prs` to package the actual code patch implementation.
