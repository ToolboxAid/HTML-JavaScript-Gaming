# BUILD_PR_TARGETED_REPO_CLEANUP_PASS_3_ARCHIVED_NOTES_POLICY

## PR Purpose
Create one execution-ready, testable cleanup-policy lane for archived notes only.

This PR must:
1. document the live usage and policy surface for `docs/archive/`
2. define an evidence-grounded keep/defer policy for archived notes
3. add validation guards so future cleanup lanes do not move, delete, or rewrite archived notes without proof
4. remain non-destructive and docs-only

## Why This BUILD Exists
Prior cleanup evidence established that `docs/archive/` exists and is actively referenced in documentation structure and policy surfaces. This BUILD converts that evidence into an exact archived-notes policy lane so later cleanup work can stay surgical and non-guessing.

## Required Constraints
- Do **not** create, modify, rename, delete, replace, or add any file in:
  - `docs/dev/start_of_day/chatGPT/`
  - `docs/dev/start_of_day/codex/`
- Do **not** move, rename, delete, or rewrite any file under `docs/archive/`.
- Do **not** modify `templates/`.
- Do **not** mix in `SpriteEditor_old_keep`, `legacy class-retention policy marker`, legacy import guard work, or runtime feature work.
- Do **not** rewrite roadmap wording, reorder roadmap items, collapse roadmap sections, or replace roadmap content.
- If roadmap updates are applied, they must be bracket-only and only where exact text already exists.

## Exact Target Files

### Must create or overwrite
- `docs/dev/reports/archived_notes_policy_inventory.md`
- `docs/dev/reports/archived_notes_policy_decision.md`
- `docs/dev/reports/archived_notes_validation_guard.md`
- `docs/dev/reports/BUILD_PR_TARGETED_REPO_CLEANUP_PASS_3_ARCHIVED_NOTES_POLICY_report.md`
- `docs/dev/reports/validation_checklist.txt`

### May update only if already present and only to align with this PR
- `docs/dev/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md`
- `docs/dev/reports/repo_cleanup_targets.txt`

## Required Work

### 1) Archived notes policy inventory
Create `docs/dev/reports/archived_notes_policy_inventory.md`.

Capture, using exact repo searches:
- exact `docs/archive/` path existence
- files/folders under `docs/archive/` if present
- every active reference to `docs/archive/` in docs, configs, or tests
- whether each reference is policy, structure, navigation, or historical
- any path assumptions that would block future movement or deletion

The report must separate:
- direct path references
- documentation/policy references
- any test/config references if present

Do not guess. Ground every section in repo evidence.

### 2) Archived notes policy decision
Create `docs/dev/reports/archived_notes_policy_decision.md`.

This file must include:
- classification options considered: `keep-in-place-for-now`, `migrate-later`, `needs-manual-review`
- chosen classification for this PR
- explicit rationale from the inventory
- what is allowed now
- what is forbidden now
- exact prerequisites for any future migration/removal lane
- exact signals that would justify reclassification later

Expected outcome for this PR:
- because `docs/archive/` is actively referenced, the policy should remain conservative unless contrary evidence is found
- no move/delete action is allowed in this PR

### 3) Archived notes validation guard
Create `docs/dev/reports/archived_notes_validation_guard.md`.

This must define the exact before/after checks future cleanup PRs must pass before archived notes can move.
At minimum include:
- reference scan commands/patterns
- smoke/test/doc surfaces to verify if movement is ever attempted
- docs/contracts that would require synchronized updates
- failure conditions that must block future cleanup execution

### 4) Optional roadmap alignment
Only if exact wording already exists, Codex may apply bracket-only state changes for the archived notes policy tracking item in:
- `docs/dev/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md`

Rules:
- no wording edits
- no reordered items
- if exact text match is not clean, record the issue in the BUILD report under `Unapplied Planned Delta`

### 5) BUILD report
Create `docs/dev/reports/BUILD_PR_TARGETED_REPO_CLEANUP_PASS_3_ARCHIVED_NOTES_POLICY_report.md` with:
- bundle type: execution-ready BUILD docs
- exact files changed
- exact files created
- summary of archived-notes inventory findings
- chosen policy classification
- summary of any roadmap bracket changes actually applied
- summary of unapplied planned delta, if any
- explicit statement that `docs/archive/` was not moved, renamed, deleted, or modified
- explicit statement that `templates/` was untouched
- validation results

### 6) Validation checklist
Create `docs/dev/reports/validation_checklist.txt` that records pass/fail for:
- protected start_of_day directories untouched
- `docs/archive/` not moved/renamed/deleted
- `templates/` untouched
- archived notes evidence reports created
- no unrelated cleanup targets changed
- roadmap wording preserved if roadmap changed
- roadmap changes bracket-only if roadmap changed

## Validation Commands Codex Must Run
Codex must run and use the results in the report:
1. Search for all references to `docs/archive/` and list exact consumer files.
2. Confirm there are no file deletions, renames, or moves under `docs/archive/` in this PR.
3. Confirm no file changes under protected start_of_day directories.
4. If roadmap changed, diff the roadmap file and verify only bracket-state changes occurred.

## Non-Goals
- no movement of `docs/archive/`
- no deletion under `docs/archive/`
- no changes to `templates/`
- no work on `SpriteEditor_old_keep`
- no work on `legacy class-retention policy marker`
- no legacy import guard changes
- no engine/tool/sample runtime implementation

## Acceptance Criteria
- `docs/archive/` has an evidence-grounded usage inventory.
- archived notes have an explicit conservative policy decision suitable for later cleanup execution.
- future cleanup validation guards are documented.
- no archived-notes file or path is moved, deleted, or rewritten.
- protected start_of_day directories remain untouched.
- the result is suitable to drive a later exact migration or retention PR for archived notes without another discovery pass.

## Expected Output
Codex should package its output ZIP under:
- `<project folder>/tmp/BUILD_PR_TARGETED_REPO_CLEANUP_PASS_3_ARCHIVED_NOTES_POLICY.zip`

The ZIP must preserve exact repo-relative structure and include only files relevant to this PR.


