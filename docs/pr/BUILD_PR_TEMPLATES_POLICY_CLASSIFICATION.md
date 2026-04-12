# BUILD_PR_TEMPLATES_POLICY_CLASSIFICATION

## PR Purpose
Create one execution-ready, testable templates-classification lane that:
1. documents the live usage surface of `templates/`
2. defines a reference-safe keep/defer policy for `templates/`
3. adds validation guards so later cleanup lanes do not move or delete `templates/` without evidence
4. does **not** move, rename, delete, or rewrite template consumers in this lane

This PR is intentionally non-destructive. Its purpose is to convert the cleanup evidence from the prior lane into an exact policy baseline for `templates/` only.

## Why This BUILD Exists
The previous cleanup-evidence BUILD established that `templates/` exists, has live references, and must remain deferred until its active dependency surface is explicitly documented. This BUILD narrows the next cleanup step to a single target so Codex can execute without guessing.

## Required Constraints
- Do **not** create, modify, rename, delete, replace, or add any file in:
  - `docs/dev/start_of_day/chatGPT/`
  - `docs/dev/start_of_day/codex/`
- Do **not** move, rename, or delete `templates/` or any file under it.
- Do **not** rewrite runtime imports away from `templates/` in this PR.
- Do **not** change unrelated cleanup targets (`SpriteEditor_old_keep`, `classes_old_keep (docs-only placeholder, no on-disk path)`, archived notes policy) in this PR.
- Do **not** mix in feature work, engine refactors, or sample implementation.
- If roadmap edits are needed, they must be bracket-only and only where exact text already exists.

## Exact Target Files
### Must create or overwrite
- `docs/dev/reports/templates_live_usage_inventory.md`
- `docs/dev/reports/templates_policy_decision.md`
- `docs/dev/reports/templates_validation_guard.md`
- `docs/dev/reports/BUILD_PR_TEMPLATES_POLICY_CLASSIFICATION_report.md`
- `docs/dev/reports/validation_checklist.txt`

### May update only if already present and only to align with this PR
- `docs/dev/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md`
- `docs/dev/reports/repo_cleanup_targets.txt`
- `docs/dev/reports/roadmap_status_delta.txt`

## Required Work

### 1) Live usage inventory for `templates/`
Create `docs/dev/reports/templates_live_usage_inventory.md`.

Capture, using exact repo searches:
- exact files under `templates/`
- every active consumer of `templates/` in code, tests, and docs
- whether each consumer is runtime, test-only, docs-only, or mixed
- whether each consumer appears transitional, canonical, or legacy-facing
- any path assumptions or coupling that would block a future move

The report must separate:
- direct imports / requires
- string path references
- docs/planning references

Do not guess. Ground every section in repo evidence.

### 2) Templates policy decision
Create `docs/dev/reports/templates_policy_decision.md`.

This file must include:
- current classification: `keep-in-place-for-now`, `migrate-later`, or `needs-manual-review`
- chosen classification for this PR
- explicit rationale from the inventory
- what is allowed now
- what is forbidden now
- exact prerequisites for any future migration/removal lane
- exact signals that would justify reclassification later

Expected outcome for this PR:
- because `templates/` is live-referenced, the policy should remain conservative unless Codex finds contrary evidence
- no move/delete action is allowed in this PR

### 3) Validation guard document
Create `docs/dev/reports/templates_validation_guard.md`.

This must define the exact before/after checks future cleanup PRs must pass before `templates/` can move.
At minimum include:
- reference scan commands/patterns
- smoke validation surfaces to verify
- test surfaces to rerun
- docs/contracts that would need synchronized updates
- failure conditions that must block future cleanup execution

### 4) Optional roadmap alignment
Only if exact wording already exists, Codex may apply bracket-only state changes for the templates cleanup tracking item in:
- `docs/dev/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md`

Rules:
- no wording edits
- no reordered items
- if exact text match is not clean, record the issue in the BUILD report under `Unapplied Planned Delta`

### 5) BUILD report
Create `docs/dev/reports/BUILD_PR_TEMPLATES_POLICY_CLASSIFICATION_report.md` with:
- bundle type: execution-ready BUILD docs
- exact files changed
- exact files created
- summary of template inventory findings
- chosen policy classification
- summary of any roadmap bracket changes actually applied
- summary of unapplied planned delta, if any
- explicit statement that `templates/` was not moved, renamed, or modified
- validation results

### 6) Validation checklist
Create `docs/dev/reports/validation_checklist.txt` that records pass/fail for:
- protected start_of_day directories untouched
- `templates/` not moved/renamed/deleted
- no runtime import rewrites performed
- templates evidence reports created
- no unrelated cleanup targets changed
- roadmap wording preserved if roadmap changed
- roadmap changes bracket-only if roadmap changed

## Validation Commands Codex Must Run
Codex must run and use the results in the report:
1. Search for all references to `templates/` and list exact consumer files.
2. Confirm there are no file deletions, renames, or moves under `templates/` in this PR.
3. Confirm no file changes under protected start_of_day directories.
4. If roadmap changed, diff the roadmap file and verify only bracket-state changes occurred.

## Non-Goals
- no movement of `templates/`
- no import rewrites
- no migration of template consumers
- no work on `SpriteEditor_old_keep`
- no work on `classes_old_keep (docs-only placeholder, no on-disk path)`
- no archived-notes policy changes
- no engine/tool/sample runtime implementation

## Acceptance Criteria
- `templates/` has an evidence-grounded usage inventory.
- `templates/` has an explicit conservative policy decision suitable for later cleanup execution.
- future cleanup validation guards are documented.
- no `templates/` file or consumer path is moved, deleted, or rewritten.
- protected start_of_day directories remain untouched.
- the result is suitable to drive a later exact migration or retention PR for `templates/` without another discovery pass.

## Expected Output
Codex should package its output ZIP under:
- `<project folder>/tmp/BUILD_PR_TEMPLATES_POLICY_CLASSIFICATION.zip`

The ZIP must preserve exact repo-relative structure and include only files relevant to this PR.

