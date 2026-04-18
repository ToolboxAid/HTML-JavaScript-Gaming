# BUILD_PR_LEVEL_23_4_SAMPLE_SYSTEM_VALIDATION_AND_FIXES

## Purpose
Execute the next combined engine/runtime lane by validating the sample system end-to-end and fixing the real issues found in the same pass.

This PR is intended to do real work:
- validate sample launch and sample/runtime integration
- identify broken sample paths, contract drift, and execution failures
- fix the validated issues
- re-run validation to confirm recovery

## Scope
Included:
- validate the active sample system
- validate sample index / discovery / launch paths
- validate sample-to-engine and sample-to-runtime contracts
- fix real sample issues found in the sweep
- re-run validation after fixes
- produce explicit failure/fix/validation reports

Excluded:
- no unrelated feature expansion
- no broad redesign
- no start_of_day changes
- no roadmap rewrites
- no speculative refactors outside validated fixes

## Inputs
Use existing validation context where available, including:
- prior engine/runtime validation sweep outputs
- sample index / sample discovery surfaces
- current sample runtime contracts

## Required outputs
- `docs/dev/reports/BUILD_PR_LEVEL_23_4_SAMPLE_SYSTEM_VALIDATION_AND_FIXES_SAMPLE_INVENTORY.md`
- `docs/dev/reports/BUILD_PR_LEVEL_23_4_SAMPLE_SYSTEM_VALIDATION_AND_FIXES_FAILURES.md`
- `docs/dev/reports/BUILD_PR_LEVEL_23_4_SAMPLE_SYSTEM_VALIDATION_AND_FIXES_FIXES_APPLIED.md`
- `docs/dev/reports/BUILD_PR_LEVEL_23_4_SAMPLE_SYSTEM_VALIDATION_AND_FIXES_VALIDATION.md`

## Required work

### 1. Sample validation sweep
Validate at minimum:
- sample discovery/index surfaces
- launch/boot of active samples or representative coverage set
- sample contract alignment with engine/runtime
- missing asset / broken import / wrong-path failures
- sample numbering or routing issues that block execution

### 2. Fixes
Apply only validated, execution-backed fixes:
- broken imports
- bad launch wiring
- sample routing/index mismatches
- sample/runtime contract mismatches
- obvious sample asset/path issues

### 3. Revalidation
After fixes:
- re-run sample validation
- record remaining failures separately from fixed items
- preserve unrelated working-tree changes

## Acceptance
- sample inventory exists
- failures are explicitly documented
- validated fixes are applied
- sample system is revalidated after fixes
- no unrelated churn
- roadmap updates are status-only and execution-backed

## Validation requirements
Validation must confirm:
- sample inventory completed
- representative sample coverage executed
- fixes applied only to real failures
- revalidation performed after fixes
- no start_of_day changes
- unrelated working-tree changes preserved

## Roadmap advancement
This PR may advance only if fully executed and validated:
- sample system validation / repair work tied directly to this lane
- any directly related sample stability item only if actually completed here

Do not advance unrelated roadmap items in this PR.
