# BUILD_PR_LEVEL_18_1_ENGINE_USAGE_ENFORCEMENT_AUDIT_SLICE

## PR Purpose
Create the first executable Level 18 hardening slice by auditing a bounded runtime surface for engine-usage compliance, removing local reimplementation only where clearly duplicated inside the targeted slice, and adding validation-backed enforcement for that same slice.

## Why This PR
Level 18 is deferred execution for engine finalization and hardening. The roadmap explicitly requires additive-only, validation-backed changes with no blind refactors and no structural churn without move-map PRs. This PR starts that lane with the smallest scoped valid change: one bounded audit slice with enforcement and tests, rather than a repo-wide sweep.

## Scope
Bound this PR to the overlay/runtime hardening lane that was active at the end of Level 17 / Level 22 work.

Included scope:
- audit the Phase 17 / Phase 19 shared overlay runtime surfaces and any directly-coupled helper files they use
- identify any local reimplementation of behavior that already exists in `src/engine/` or `src/shared/`
- migrate only clearly duplicated logic inside this bounded slice to the correct engine/shared surface
- add or update validation that proves the bounded slice now relies on engine/shared surfaces instead of local copies
- update roadmap status markers only for items directly advanced by this PR

Excluded scope:
- no repo-wide sample/game scan
- no folder moves
- no start_of_day changes
- no CSS normalization
- no docs bucket cleanup outside this PR's own docs
- no broad naming cleanup
- no new features
- no gameplay behavior changes unless required to remove duplicated local logic in the audited slice

## Required File Targets
Primary bounded targets:
- `samples/phase-17/shared/overlayGameplayRuntime.js`
- any directly imported overlay-runtime helper modules used by that file
- any matching test files already covering the overlay runtime slice
- roadmap status file(s) only for status marker updates tied to this PR

Allowed engine/shared targets only if the audited slice already duplicates their logic:
- `src/engine/**`
- `src/shared/**`

Do not touch unrelated games, tools, or samples.

## Execution Steps
1. Inspect the bounded overlay runtime slice and list local helper logic that appears duplicated.
2. Compare each duplicate only against existing `src/engine/` and `src/shared/` public or stable helper surfaces.
3. Migrate only exact-match or near-exact-match duplicate logic where the destination is already stable and appropriate.
4. Replace local usage with the engine/shared import.
5. Remove only the local duplicated helper code made unnecessary by the migration.
6. Add or update targeted tests proving the audited slice still passes and uses the shared/engine surface.
7. Update the roadmap status markers for the directly-advanced Level 18 items.
8. Package the complete repo-structured ZIP to `<project folder>/tmp/BUILD_PR_LEVEL_18_1_ENGINE_USAGE_ENFORCEMENT_AUDIT_SLICE.zip`.

## Required Deliverables
- bounded audit + remediation implementation for the overlay runtime slice
- validation updates for that slice
- roadmap status updates only
- repo-structured ZIP artifact

## Validation Requirements
Must run and record results for the smallest relevant set first, then the broader overlay suite if unchanged dependencies require it.

Minimum required validation:
- targeted overlay runtime tests that cover the edited files
- any existing Phase 17 / Phase 19 / overlay integration tests that exercise the edited slice

If the bounded changes touch shared helpers used outside the slice, also run the smallest additional dependent test set needed to prove no regression.

## Acceptance Criteria
- the audited overlay runtime slice no longer contains clearly duplicated logic when an existing stable engine/shared surface already covers it
- no unrelated files are changed
- no new feature behavior is introduced
- all targeted validation passes
- roadmap status markers reflect only the work actually completed
- ZIP is produced at the required `<project folder>/tmp/` location

## Roadmap Status Update Rules
Update only status markers that are directly advanced by this PR. Preserve wording.

Expected likely marker progression if implementation succeeds:
- `18. Engine Finalization & Hardening (Deferred Execution)` remains active but may move from fully planned toward partial progress
- `Track A — Engine Usage Enforcement`
  - `[.] verify all samples/ use engine systems (bounded slice only; if roadmap wording must remain unchanged, update only if execution meaningfully advances the item)`
  - `[.] migrate any local logic into engine/shared where appropriate` if the bounded slice migration is completed

Do not mark broader Track A complete from this PR.

## Guardrails
- additive only
- smallest scoped valid change
- one PR purpose only
- no repo-wide scanning unless required by direct imports in the bounded slice
- no structural churn
- no move-map work in this PR
- no implementation in this doc bundle beyond instructions for Codex
