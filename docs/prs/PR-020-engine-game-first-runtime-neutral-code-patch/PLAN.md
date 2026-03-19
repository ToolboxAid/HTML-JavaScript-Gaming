PR-020 — engine/game first runtime-neutral code patch plan

### Title

PR-020 — Define the First Runtime-Neutral `engine/game` Code Patch

### Description

Docs-first planning PR for defining the actual contents of the first runtime-neutral code patch
for `engine/game`.

This PR follows PR-019 and narrows the next step to one purpose only:
define the exact code-patch contents for the first non-breaking alignment PR, while preserving
runtime behavior, imports, file locations, export names, and compatibility surfaces.

This is planning-only.
No runtime behavior changes are included.

### PR Plan

#### Objective

Create a first-runtime-neutral-code-patch plan for `engine/game` that:
- builds on the guardrails documented in PR-018
- builds on the first-code-PR shape documented in PR-019
- defines the exact patch contents to apply
- preserves compatibility
- keeps the first code step surgical, reviewable, and reversible

#### Verified Baseline

The following are already documented:
- engine/game boundary direction
- verified export inventory
- verified caller evidence
- compatibility retention labels
- usage-based risk tiers
- transition-planning candidate split
- documentation posture and wording rules
- reusable snippets and per-export documentation drafts
- first-code-PR guardrails
- first runtime-neutral alignment PR shape

#### In Scope

- define the exact patch contents for the first code PR
- identify the specific files to touch
- identify the exact kinds of runtime-neutral comments or markers to add
- define per-file patch intent
- define patch-review rules and acceptance criteria
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

#### Patch Intent

This PR is about specifying the first actual code patch before implementation.

It should define a patch that:
- adds only runtime-neutral alignment content
- reflects documented compatibility posture near relevant exports
- reinforces preferred public direction in comments only
- leaves all execution behavior unchanged

#### Candidate Patch Contents

Allowed patch content may include:
- compatibility-retained intent comments near documented exports
- supported compatibility surface comments where applicable
- transition-planning-note comments where applicable
- preferred `GameBase` direction comments where appropriate
- runtime-neutral comment headers for grouped exports

#### Candidate File Scope

Preferred initial patch scope:
- `engine/game/gameCollision.js`
- `engine/game/gameObjectManager.js`
- `engine/game/gameObjectRegistry.js`
- `engine/game/gameObjectSystem.js`
- `engine/game/gameObjectUtils.js`
- `engine/game/gameUtils.js`

#### Planning Rules

The first code patch should:
- touch only documented compatibility-retained export files
- add comments or markers only
- be removable without changing behavior
- avoid stylistic churn outside the intended insertions
- remain easy to review against PR-018 and PR-019

Record:
- file path
- intended patch type
- comment or marker purpose
- review note
- success note

Do not:
- change code in this PR
- alter imports
- imply approved removals
- change runtime behavior
- expand scope beyond first-step alignment

### Tasks

#### Task 1 — Guardrail and Shape Review
Review PR-018 guardrails and PR-019 first-code-PR alignment docs.

#### Task 2 — File-Level Patch Matrix
Define the exact intended patch type for each target `engine/game` file.

#### Task 3 — Comment Purpose Definitions
Define what each runtime-neutral comment or marker should communicate.

#### Task 4 — Review and Acceptance Criteria
Define how to verify that the code patch remains runtime-neutral and compatibility-safe.

#### Task 5 — BUILD_PR Preparation
Prepare the next BUILD_PR under `/docs/prs` to record the first runtime-neutral code patch plan.
