# BUILD_PR_LEVEL_20_5_RECOVERY_AUDIT_FROM_20_1_BASELINE

## Purpose

Recover control after direct Codex updates by auditing all repository changes made after the last known assistant-produced baseline:

- Baseline commit: `3f7e9df`
- Baseline PR: `BUILD_PR_LEVEL_20_1_PHASE20_TOOL_PRESET_INTEGRATION`
- Baseline commit comment: `Add Phase 20 numbered tool presets and sample-to-tool launch integration`

## Scope

This is a recovery audit and reset-decision PR only.

Codex must document what changed after `3f7e9df`, identify junk/anti-pattern code, and recommend whether to:

1. keep current state and clean surgically
2. reset to `3f7e9df` and re-apply only approved changes
3. create a recovery branch from `3f7e9df` and cherry-pick selected files

## Current Product Goal Context

The intended current lane is:

- All samples launch tools through `tools/<tool>/index.html`
- All games launch through `tools/Workspace Manager/index.html`
- External launches from samples or games must clear launch memory before loading tool/workspace
- Launch data must move into a single source of truth
- No default/fallback launch behavior may remain
- No anti-patterns may be introduced or preserved

## Hard Constraints

Codex must NOT:

- run `git reset --hard`
- delete files
- modify implementation files
- rewrite roadmap text
- modify `start_of_day` folders
- perform cleanup directly
- preserve anti-pattern code without listing it
- introduce defaults or fallback behavior

## Required Git Inspection

Codex must inspect and report:

- current branch
- current HEAD
- dirty working tree status
- all commits after `3f7e9df`
- changed files after `3f7e9df`
- diff stat after `3f7e9df`
- diff check result
- untracked files
- files most likely touched by uncontrolled Codex work

## Required Reports

Codex must create or update:

- `docs/dev/reports/recovery_change_audit_from_20_1.md`
- `docs/dev/reports/recovery_antipattern_audit_from_20_1.md`
- `docs/dev/reports/recovery_reset_decision_from_20_1.md`
- `docs/dev/reports/recovery_file_risk_list_from_20_1.md`

## Required Decision Output

`recovery_reset_decision_from_20_1.md` must include:

- recommended path
- whether reset to `3f7e9df` is safer than surgical cleanup
- files to preserve
- files to discard
- files requiring manual review
- exact next APPLY_PR name
- exact reason the recommendation was chosen

## Acceptance

- Reports exist.
- No implementation files changed.
- No destructive git command run.
- All post-`3f7e9df` changes are documented.
- Anti-patterns are listed with file paths.
- Reset/keep recommendation is explicit.
