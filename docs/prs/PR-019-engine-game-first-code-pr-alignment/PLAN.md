PR-019 — engine/game first code PR alignment plan

### Title

PR-019 — Define the First Runtime-Neutral Alignment Code PR for `engine/game`

### Description

Docs-first planning PR for defining the first non-docs, runtime-neutral alignment PR for `engine/game`.

This PR follows PR-018 and narrows the next step to one purpose only:
define the first code PR as a small, non-breaking alignment step that reflects the completed
docs-first architecture work without changing runtime behavior.

This is planning-only.
No runtime behavior changes are included.

### PR Plan

#### Objective

Create a first-code-PR alignment plan for `engine/game` that:
- builds on the guardrails documented in PR-018
- defines a tiny, reversible, runtime-neutral code change set
- reinforces documented public versus compatibility-retained direction
- preserves compatibility
- keeps the first code PR highly reviewable

#### Verified Baseline

The following are already documented:
- engine/game boundary direction
- verified export inventory
- verified caller evidence
- compatibility retention labels
- risk tiers
- transition-planning candidate split
- documentation posture and wording rules
- per-export documentation drafts
- first-code-PR guardrails

#### In Scope

- define the exact purpose of the first code PR
- define the allowed runtime-neutral code changes
- define the target files or file categories for the first code PR
- define the review checklist for the first code PR
- define the success criteria for the first code PR
- prepare the next BUILD_PR under `/docs/prs`

#### Out of Scope

- runtime behavior changes
- file moves
- import rewrites
- renames
- deletions
- export removal
- compatibility narrowing
- multi-purpose cleanup

#### Alignment Intent

This PR is about selecting the safest first code move.

It should define a first code PR that:
- aligns code comments or markers to documented intent
- leaves all exports, imports, and runtime behavior intact
- avoids mixing cleanup with structural change
- creates a safe bridge from docs-only work to later code refactoring

#### Candidate First-Code-PR Shape

Acceptable first code PR themes:
- add non-breaking intent comments near compatibility-retained exports
- add runtime-neutral posture markers near documented surfaces
- add preferred-path comments that reinforce `GameBase` direction without changing flow
- add tiny documentation-adjacent annotations that do not affect execution

#### Planning Rules

The first code PR should:
- stay surgical
- touch as few files as possible
- be reversible
- be easy to review against PR-018 guardrails
- avoid any behavior ambiguity

Record:
- first code PR purpose
- candidate file scope
- allowed change types
- review criteria
- success criteria

Do not:
- change code in this PR
- alter imports
- imply approved removals
- change runtime behavior
- expand scope beyond first-step alignment

### Tasks

#### Task 1 — Guardrail Review
Review PR-018 first-code-PR guardrails.

#### Task 2 — First PR Shape
Define the single purpose of the first runtime-neutral alignment PR.

#### Task 3 — File Scope
Define the smallest practical file scope for the first code PR.

#### Task 4 — Review and Success Criteria
Define review checklist items and completion criteria for the first code PR.

#### Task 5 — BUILD_PR Preparation
Prepare the next BUILD_PR under `/docs/prs` to record the first code PR alignment plan.
