PR-018 — engine/game refactor readiness guardrails plan

### Title

PR-018 — Define First-Code-PR Guardrails for `engine/game` Refactoring

### Description

Docs-first planning PR for defining the guardrails that must constrain the first non-docs refactor PR
for `engine/game`.

This PR follows PR-017 and narrows the next step to one purpose only:
convert the completed architecture, compatibility, risk, wording, and per-export documentation work
into explicit first-code-PR guardrails before refactoring begins.

This is planning-only.
No runtime behavior changes are included.

### PR Plan

#### Objective

Create a refactor-readiness guardrail plan for `engine/game` that:
- builds on the completed docs-first groundwork from PR-002 through PR-017
- defines what the first code PR may change
- defines what the first code PR must not change
- preserves compatibility
- keeps initial code scope surgical
- reduces the chance of runtime or import breakage

#### Verified Baseline

The following are already documented:
- engine/game boundary direction
- verified export inventory
- verified caller evidence
- compatibility retention labels
- usage-based risk tiers
- transition-planning candidate split
- documentation posture rules
- wording treatment rules
- reusable snippet templates
- concrete documentation block examples
- per-export documentation drafts

#### In Scope

- define first-code-PR guardrail categories
- define allowed change types for the first code PR
- define forbidden change types for the first code PR
- define compatibility-preservation requirements
- define acceptance criteria for the first code PR
- prepare the next docs-only BUILD_PR under `/docs/prs`

#### Out of Scope

- runtime behavior changes
- actual code refactoring
- file moves
- import rewrites
- renames
- deletions
- export removal
- compatibility narrowing or enforcement changes

#### Guardrail Intent

This PR is about safe refactor entry conditions, not implementation.

It should document:
- what kinds of code annotations or alignments are acceptable first steps
- what kinds of structural changes are explicitly off-limits
- which compatibility-retained exports must remain untouched initially
- how to keep the first code PR non-breaking and reversible

#### Candidate Guardrail Areas

- allowed changes
- forbidden changes
- compatibility invariants
- export safety rules
- change-size rules
- review checklist rules

#### Guardrail Rules

The first code PR may:
- add non-breaking comments or internal annotations
- reinforce preferred public direction without removing compatibility surfaces
- add docs-adjacent clarifying metadata or markers if runtime-neutral
- align naming comments or intent markers without changing imports or execution

The first code PR must not:
- remove exports
- rename exports
- move files
- rewrite import paths
- change runtime behavior
- hide compatibility-retained surfaces
- collapse public/internal/transitional boundaries through code changes

Record:
- guardrail category
- allowed or forbidden status
- short rationale
- note for first-code-PR review

Do not:
- change code
- alter import paths
- imply approved removals
- change runtime behavior
- narrow compatibility surfaces in this PR

### Tasks

#### Task 1 — Baseline Review
Review the completed docs-first work from PR-002 through PR-017.

#### Task 2 — Allowed Change Matrix
Define the small set of changes that are acceptable in the first code PR.

#### Task 3 — Forbidden Change Matrix
Define the changes that must remain off-limits in the first code PR.

#### Task 4 — Compatibility Invariants
Record the compatibility guarantees that the first code PR must preserve.

#### Task 5 — BUILD_PR Preparation
Prepare the next docs-only BUILD_PR under `/docs/prs` to record first-code-PR guardrails.
