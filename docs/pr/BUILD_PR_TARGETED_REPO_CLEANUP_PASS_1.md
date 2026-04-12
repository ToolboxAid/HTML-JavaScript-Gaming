# BUILD_PR_TARGETED_REPO_CLEANUP_PASS_1

## PR Purpose
Create one execution-ready, testable targeted cleanup pass that converts the existing cleanup evidence into enforceable guard artifacts and normalized tracking for the already-approved cleanup targets.

This PR is intentionally non-destructive.

## Why This BUILD Exists
The prior cleanup-evidence lane and templates-policy lane already established:
- the exact cleanup target set
- which targets are live-referenced
- that `templates/` must remain retained in place for now
- that future cleanup lanes need stronger guardrails before any structural action

This BUILD narrows the next step to one purpose only:
- formalize cleanup-target enforcement and normalization without changing repo structure or runtime code

## Required Constraints
- Do **not** create, modify, rename, delete, replace, or add any file in:
  - `docs/dev/start_of_day/chatGPT/`
  - `docs/dev/start_of_day/codex/`
- Do **not** delete, move, or rename any repo file or folder.
- Do **not** modify `templates/` or any file under it.
- Do **not** rewrite runtime imports, paths, or test logic.
- Do **not** change engine, tools, samples, games, tests, or config/runtime files.
- Do **not** introduce new cleanup targets.
- Do **not** mix structural cleanup with this enforcement/normalization pass.
- If roadmap edits occur, they must be bracket-only and only where exact text already exists.

## Exact Target Files
### Must create or overwrite
- `docs/dev/reports/cleanup_target_enforcement_map.md`
- `docs/dev/reports/cleanup_execution_guard.md`
- `docs/dev/reports/cleanup_target_normalization_report.md`
- `docs/dev/reports/BUILD_PR_TARGETED_REPO_CLEANUP_PASS_1_report.md`
- `docs/dev/reports/validation_checklist.txt`

### May update only if already present and only to align with this PR
- `docs/dev/reports/repo_cleanup_targets.txt`
- `docs/dev/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md`

## Approved Source Of Truth
Use only these existing artifacts as source evidence for this BUILD:
- `docs/dev/reports/cleanup_live_reference_inventory.txt`
- `docs/dev/reports/cleanup_keep_move_future_delete_matrix.md`
- `docs/dev/reports/BUILD_PR_REPO_CLEANUP_AND_ROADMAP_UPDATE_report.md`
- `docs/dev/reports/templates_live_usage_inventory.md`
- `docs/dev/reports/templates_policy_decision.md`
- `docs/dev/reports/templates_validation_guard.md`
- `docs/dev/reports/BUILD_PR_TEMPLATES_POLICY_CLASSIFICATION_report.md`
- `docs/dev/reports/repo_cleanup_targets.txt`
- `docs/dev/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md`

Do not guess beyond those files.

## Required Work

### 1) Cleanup target enforcement map
Create `docs/dev/reports/cleanup_target_enforcement_map.md`.

For each approved cleanup target, capture:
- exact target name/path
- current classification from the matrix
- current reference state from the inventory
- allowed actions now
- forbidden actions now
- required validation before any future change
- dependency surfaces / coupled files called out by evidence
- risk level: `low`, `medium`, or `high`
- recommended future PR type: `policy-only`, `guard-only`, `migration-later`, `manual-review`, or `future-delete`

The target list is limited to:
- `templates/`
- `docs/archive/tools/SpriteEditor_old_keep/` policy target
- `classes_old_keep (docs-only placeholder, no on-disk path)` policy target
- `docs/archive/` archived-notes policy target
- legacy import path patterns
- eventual legacy-retirement planning target

The enforcement map must remain evidence-grounded and must not invent new targets or actions.

### 2) Cleanup execution guard
Create `docs/dev/reports/cleanup_execution_guard.md`.

This file must define the global rules all future cleanup PRs must satisfy.

At minimum include:

#### A. Required pre-checks
- reference scan requirement
- existence/path verification
- target classification confirmation
- target-specific guard selection requirement

#### B. Required validation surfaces
- before/after smoke validation expectations
- docs sync surfaces
- target-specific tests if a path change is ever attempted

#### C. Required command patterns
Reuse and generalize the command style already established in the templates validation guard where applicable.
Include exact command examples for:
- reference scans
- git diff checks for structural changes
- protected-directory checks
- roadmap diff checks when roadmap is modified

#### D. Global forbidden actions
At minimum block:
- repo-wide cleanup scans as execution scope
- mixed-purpose cleanup PRs
- delete/move/rename of live-reference targets without synchronized validation
- touching `templates/` contrary to the active policy/guard files
- structural cleanup in docs-only evidence lanes

#### E. Blocking failure conditions
Define exact blocker conditions that must stop a future cleanup PR.

### 3) Cleanup target normalization report
Create `docs/dev/reports/cleanup_target_normalization_report.md`.

For each approved cleanup target, compare consistency across:
- `docs/dev/reports/repo_cleanup_targets.txt`
- `docs/dev/reports/cleanup_live_reference_inventory.txt`
- `docs/dev/reports/cleanup_keep_move_future_delete_matrix.md`
- `docs/dev/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md`
- templates-policy reports where relevant

For each target, record:
- name consistency check
- path consistency check
- classification consistency check
- tracking presence check
- mismatch found? (`yes` / `no`)
- exact mismatch details if any
- correction recommendation

Important:
- report mismatches only
- do **not** apply wording rewrites to fix them in this PR
- if alignment is already acceptable, say so explicitly

### 4) Optional roadmap alignment
Only if an exact existing roadmap line cleanly supports a bracket-only progression for this enforcement/normalization lane, Codex may apply a bracket-only change.

Rules:
- no wording edits
- no reordered items
- no new roadmap lines
- if exact text match is not clean, leave roadmap untouched and record the issue under `Unapplied Planned Delta`

### 5) BUILD report
Create `docs/dev/reports/BUILD_PR_TARGETED_REPO_CLEANUP_PASS_1_report.md` with:
- bundle type: execution-ready BUILD docs
- exact files created
- exact files changed
- enforcement-map summary
- execution-guard summary
- normalization findings summary
- roadmap changes actually applied, if any
- unapplied planned delta, if any
- explicit statement that no deletion/move/rename occurred
- explicit statement that `templates/` was untouched
- explicit statement that runtime code/tests were untouched
- validation results

### 6) Validation checklist
Create `docs/dev/reports/validation_checklist.txt` that records pass/fail for:
- no deletion/move/rename executed
- `templates/` untouched
- no runtime code changes
- no test logic changes
- enforcement map created
- cleanup execution guard created
- normalization report created
- no new cleanup targets introduced
- roadmap unchanged or bracket-only if changed
- protected start_of_day directories untouched

## Validation Commands Codex Must Run
Codex must run and use the results in the BUILD report:

1. Confirm no structural changes beyond allowed docs files:
   - `git diff --name-status`

2. Confirm `templates/` untouched:
   - `git diff --name-status -- templates`

3. Confirm protected start_of_day directories unchanged:
   - `git status --short -- docs/dev/start_of_day/chatGPT docs/dev/start_of_day/codex`

4. If roadmap changed, verify bracket-only diff:
   - `git diff --unified=0 -- docs/dev/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md`

5. Confirm no runtime/test files changed:
   - `git diff --name-only -- tools src games samples tests`

## Non-Goals
- no deletion lane
- no movement lane
- no rename lane
- no `templates/` migration
- no import rewrites
- no runtime feature work
- no engine/tool/sample/game implementation
- no repo-wide cleanup execution
- no policy decisions beyond the already-approved targets/evidence

## Acceptance Criteria
- all approved cleanup targets are formalized into an evidence-grounded enforcement map
- a reusable global cleanup execution guard exists
- target naming/path/classification consistency is checked and reported
- no structural repo change occurred
- `templates/` remains untouched and policy-compliant
- protected start_of_day directories remain untouched
- the result is sufficient to drive the next exact-scope cleanup lane without rediscovery

## Expected Output
Codex should package its output ZIP under:
- `<project folder>/tmp/BUILD_PR_TARGETED_REPO_CLEANUP_PASS_1.zip`

The ZIP must preserve exact repo-relative structure and include only files relevant to this PR.


