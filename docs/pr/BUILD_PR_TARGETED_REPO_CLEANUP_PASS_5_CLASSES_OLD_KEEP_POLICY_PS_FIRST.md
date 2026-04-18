# BUILD_PR_TARGETED_REPO_CLEANUP_PASS_5_CLASSES_OLD_KEEP_POLICY_PS_FIRST

## PR Purpose
Create one execution-ready, testable docs-only cleanup lane for `legacy class-retention policy marker` using user-supplied PowerShell scan evidence instead of repeating repo-wide search in Codex.

This PR must:
1. convert the provided PowerShell evidence into formal inventory/policy/guard docs for `legacy class-retention policy marker`
2. classify `legacy class-retention policy marker` as docs-only planning/reference surface unless contradictory evidence is found in already-known repo docs
3. remain non-destructive and docs-only
4. avoid repeating broad repo scans already completed outside Codex

## Why This BUILD Exists
The user already executed Windows PowerShell searches and confirmed:
- `legacy class-retention policy marker` appears only in documentation/planning files
- no `legacy class-retention policy marker` directory exists on disk
- no runtime/code references were found in active code paths

This BUILD converts that evidence into durable cleanup-policy artifacts without spending additional Codex tokens on the same scan work.

## User-Supplied Evidence To Treat As Source Input
Codex should treat the following as already established input for this PR:
- text-file scan for `legacy class-retention policy marker` returned docs/planning/report files only
- unique matching paths are all under `docs/` or generated docs metadata
- on-disk directory check for `legacy class-retention policy marker` returned no results

Codex may quote/summarize these results in the reports, but should not rerun broad discovery searches unless needed only to validate a specific cited file.

## Required Constraints
- Do **not** create, modify, rename, delete, replace, or add any file in:
  - `docs/dev/start_of_day/chatGPT/`
  - `docs/dev/start_of_day/codex/`
- Do **not** create or move any `legacy class-retention marker path` directory.
- Do **not** modify `templates/`.
- Do **not** modify `docs/archive/`.
- Do **not** modify `tools/SpriteEditor_old_keep/` or its archived successor.
- Do **not** mix in runtime feature work or unrelated cleanup targets.
- Do **not** rewrite roadmap wording, reorder roadmap items, collapse roadmap sections, or replace roadmap content.
- If roadmap updates are applied, they must be bracket-only and only where exact text already exists.

## Exact Target Files

### Must create or overwrite
- `docs/dev/reports/legacy class-retention policy marker_policy_inventory.md`
- `docs/dev/reports/legacy class-retention policy marker_policy_decision.md`
- `docs/dev/reports/legacy class-retention policy marker_validation_guard.md`
- `docs/reports/BUILD_PR_TARGETED_REPO_CLEANUP_PASS_5_CLASSES_OLD_KEEP_POLICY_PS_FIRST_report.md`
- `docs/reports/validation_checklist.txt`

### May update only if already present and only to align with this PR
- `docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md`
- `docs/reports/repo_cleanup_targets.txt`

## Required Work

### 1) legacy class-retention policy marker policy inventory
Create `docs/dev/reports/legacy class-retention policy marker_policy_inventory.md`.

This report must:
- state that the user provided PowerShell scan evidence
- list the matching files as evidence inputs
- classify the matches by type:
  - cleanup report
  - cleanup matrix / normalization / enforcement report
  - roadmap
  - PR/build spec
  - generated command metadata
- state that no `legacy class-retention policy marker` directory exists on disk
- state that no active runtime/code location was found in the supplied scan evidence
- clearly separate:
  - docs/planning references
  - generated BUILD metadata references
  - on-disk existence result

Do not invent runtime usage.

### 2) legacy class-retention policy marker policy decision
Create `docs/dev/reports/legacy class-retention policy marker_policy_decision.md`.

This file must include:
- classification options considered: `keep-as-doc-placeholder`, `archive-doc-references-later`, `needs-manual-review`
- chosen classification for this PR
- explicit rationale from the user-supplied evidence
- what is allowed now
- what is forbidden now
- exact prerequisites for any future rename/removal/archive lane
- exact signals that would justify reclassification later

Expected outcome for this PR:
- because `legacy class-retention policy marker` has no on-disk path and appears only in docs/planning surfaces, this PR should classify it as a docs-only placeholder / manual-review target
- no structural move/delete action is allowed in this PR

### 3) legacy class-retention policy marker validation guard
Create `docs/dev/reports/legacy class-retention policy marker_validation_guard.md`.

This must define the exact checks future cleanup PRs must pass before removing or renaming the docs references.
At minimum include:
- Windows PowerShell-safe search commands limited to text-like files
- on-disk existence check
- roadmap/docs synchronization surfaces that must be updated together
- failure conditions that block cleanup execution

### 4) Optional roadmap alignment
Only if exact wording already exists, Codex may apply bracket-only state changes for the `legacy class-retention policy marker` policy tracking item in:
- `docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md`

Rules:
- no wording edits
- no reordered items
- if exact text match is not clean, record the issue in the BUILD report under `Unapplied Planned Delta`

### 5) BUILD report
Create `docs/reports/BUILD_PR_TARGETED_REPO_CLEANUP_PASS_5_CLASSES_OLD_KEEP_POLICY_PS_FIRST_report.md` with:
- bundle type: execution-ready BUILD docs
- exact files changed
- exact files created
- summary of the user-supplied scan evidence used
- chosen policy classification
- summary of any roadmap bracket changes actually applied
- summary of unapplied planned delta, if any
- explicit statement that no `legacy class-retention marker path` directory was created, moved, renamed, or deleted
- explicit statement that `templates/`, `docs/archive/`, and SpriteEditor archive surfaces were untouched
- validation results

### 6) Validation checklist
Create `docs/reports/validation_checklist.txt` that records pass/fail for:
- protected start_of_day directories untouched
- no `legacy class-retention marker path` directory created/moved/deleted
- `templates/` untouched
- `docs/archive/` untouched
- legacy class-retention policy marker evidence reports created
- no unrelated cleanup targets changed
- roadmap wording preserved if roadmap changed
- roadmap changes bracket-only if roadmap changed

## Validation Commands Codex Must Run
Codex must run only narrow validation commands needed for this PR:
1. Verify no `legacy class-retention policy marker` directory exists on disk.
2. Verify created report files exist.
3. Confirm no file changes under protected start_of_day directories.
4. If roadmap changed, diff the roadmap file and verify only bracket-state changes occurred.

Avoid repeating broad repo discovery scans already completed by the user unless needed to validate a specific contradiction.

## Non-Goals
- no creation of a `legacy class-retention marker path` path
- no archive move
- no deletion of docs references
- no changes to `templates/`
- no changes to `docs/archive/`
- no changes to SpriteEditor archive location
- no runtime/code implementation

## Acceptance Criteria
- `legacy class-retention policy marker` has an evidence-grounded docs-only inventory.
- `legacy class-retention policy marker` has an explicit policy decision suitable for later manual-review cleanup work.
- a Windows-safe validation guard is documented.
- no structural repo change occurs.
- protected start_of_day directories remain untouched.

## Expected Output
Codex should package its output ZIP under:
- `<project folder>/tmp/BUILD_PR_TARGETED_REPO_CLEANUP_PASS_5_CLASSES_OLD_KEEP_POLICY_PS_FIRST.zip`

The ZIP must preserve exact repo-relative structure and include only files relevant to this PR.


