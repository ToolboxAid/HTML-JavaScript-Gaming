# BUILD_PR_REPO_CLEANUP_AND_ROADMAP_UPDATE

## PR Purpose
Create one execution-ready, testable cleanup-evidence lane that:
1. updates `docs/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md` conservatively using bracket-only state changes
2. generates cleanup inventory/reference evidence for later exact-scope cleanup PRs
3. does **not** delete, move, rename, or rewrite repo structure in this lane

This PR is intentionally non-destructive. Its purpose is to make later cleanup exact and safe.

## Why This BUILD Exists
The prior PLAN established that cleanup must be staged and that `templates/` must be tracked now but left untouched. This BUILD converts that plan into exact work Codex can execute without guessing.

## Required Constraints
- Do **not** create, modify, rename, delete, replace, or add any file in:
  - `docs/dev/start_of_day/chatGPT/`
  - `docs/dev/start_of_day/codex/`
- Do **not** delete, rename, or move any repo file or folder.
- Do **not** change anything under `templates/`.
- Do **not** mix in unrelated implementation work.
- Do **not** rewrite roadmap wording, reorder roadmap items, collapse roadmap sections, or replace roadmap content.
- In `docs/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md`, only bracket-state updates are allowed: `[ ]`, `[.]`, `[x]`.

## Exact Target Files
### Must modify
- `docs/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md`

### Must create or overwrite
- `docs/reports/cleanup_live_reference_inventory.txt`
- `docs/reports/cleanup_keep_move_future_delete_matrix.md`
- `docs/reports/BUILD_PR_REPO_CLEANUP_AND_ROADMAP_UPDATE_report.md`
- `docs/reports/validation_checklist.txt`

### May update only if already present and only to align with this PR
- `docs/reports/repo_cleanup_targets.txt`
- `docs/reports/roadmap_status_delta.txt`

## Cleanup Evidence Scope
Codex must inspect and report on these cleanup targets only:
- `templates/`
- `SpriteEditor_old_keep` policy locations/references
- `legacy class-retention policy marker` policy locations/references
- archived notes policy locations/references
- imports/references pointing to legacy paths
- eventual legacy-retirement candidates already called out in repo cleanup planning

## Required Work

### 1) Roadmap bracket-only status update
Apply only conservative bracket-state updates in `docs/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md` for the already-planned status deltas below.

Allowed status intent:
- Advanced to in-progress:
  - StateInspectorTool
  - ReplayVisualizerTool
  - PerformanceProfilerTool
  - AssetPipelineTool
  - Tile/Model Converter Tool
  - content pipeline tools after asset complexity justifies them
  - debug tools align with engine/debug maturity
  - move/refactor validation strategy documented
  - legacy inventory completed
  - keep vs migrate vs future-delete decisions recorded
  - SpriteEditor_old_keep policy defined
  - roadmap for eventual legacy retirement defined
  - Normalize assets/data ownership
  - Expand testing/validation structure
  - re-baseline this roadmap after active execution lanes stabilize
- Advanced to complete:
  - smoke validation aligned to samples/tools/games
- New tracked cleanup item:
  - templates/ folder evaluated for keep vs move vs future-delete during cleanup phase

Important:
- If an item cannot be matched exactly in the roadmap text, do **not** invent or rewrite wording.
- Instead, leave the roadmap wording intact and record the unmatched item in the BUILD report under `Unapplied Planned Delta`.

### 2) Reference-safe cleanup inventory
Create `docs/reports/cleanup_live_reference_inventory.txt` with a precise inventory for each cleanup target.
For each target, capture:
- exact path
- whether it currently exists
- inbound references (imports, file references, docs references, config references)
- zero-reference or live-reference assessment
- notes on why it appears transitional / legacy / keep-only / active

Use exact repo searches. Do not guess.

### 3) Keep / move / future-delete matrix
Create `docs/reports/cleanup_keep_move_future_delete_matrix.md` as a decision-prep matrix.
For each cleanup target, include:
- target
- exists? (yes/no)
- live references? (yes/no/unknown)
- proposed classification: `keep`, `migrate-later`, `future-delete-candidate`, or `needs-manual-review`
- evidence summary
- action now: always `none in this PR`
- recommended future PR scope

Do not perform the future action. Only classify.

### 4) BUILD report
Create `docs/reports/BUILD_PR_REPO_CLEANUP_AND_ROADMAP_UPDATE_report.md` with:
- bundle type: execution-ready BUILD docs
- exact files changed
- exact files created
- summary of roadmap bracket changes actually applied
- summary of any planned deltas that could not be applied without rewriting wording
- summary of cleanup inventory findings
- explicit statement that no deletion/move/rename occurred
- explicit statement that `templates/` was not modified
- validation results

### 5) Validation checklist
Create `docs/reports/validation_checklist.txt` that records pass/fail for:
- roadmap wording preserved
- roadmap changes bracket-only
- no protected start_of_day directories touched
- no deletion/move/rename executed
- `templates/` untouched
- evidence reports created
- no unrelated repo files changed

## Validation Commands Codex Must Run
Codex must run and use the results in the report:
1. Search for all cleanup-target references.
2. Diff the roadmap file and verify only bracket-state changes occurred.
3. Confirm there were no file deletions, renames, or moves in this PR.
4. Confirm no file changes under protected start_of_day directories.

## Non-Goals
- no runtime feature work
- no engine refactor
- no sample/game/tool implementation
- no deletion lane
- no migration lane
- no path rewrites outside evidence capture
- no `templates/` edits

## Acceptance Criteria
- The roadmap file is updated conservatively with bracket-only state changes where exact matches exist.
- Unmatched planned deltas are documented instead of being forced into rewritten roadmap wording.
- Cleanup evidence reports exist and are grounded in actual repo searches.
- No deletion, rename, move, or `templates/` modification occurred.
- Protected start_of_day directories remain untouched.
- The result is suitable to drive a later exact-scope cleanup BUILD without another discovery pass.

## Expected Output
Codex should package its output ZIP under:
- `<project folder>/tmp/BUILD_PR_REPO_CLEANUP_AND_ROADMAP_UPDATE.zip`

The ZIP must preserve exact repo-relative structure and include only files relevant to this PR.


