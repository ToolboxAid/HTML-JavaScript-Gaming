# BUILD_PR_LEVEL_10_23_RESTORE_MASTER_ROADMAP_STATUS_ONLY

## Purpose
Restore `docs/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md` to the correct full file, then apply status-only updates.

## Critical correction
The prior restore was wrong.
The restored file must be the real full roadmap version, which should be 600+ lines.

## Required restore rule
- Restore from git history using the last known good full version
- Do not reconstruct manually
- Do not summarize
- Do not shorten
- Do not rewrite
- Do not reformat
- Do not add or remove sections
- After restore, apply status-only updates only

## Hard acceptance guard
This PR is invalid unless the restored roadmap file is:
- the full correct version from git history
- 600+ lines
- structurally identical to the historical source except for status markers

## Validation requirements
Codex must verify and report:
- source commit/reference used for restore
- restored line count
- confirmation that only status markers changed after restore

## Packaging
Codex must package all changed files into:
`<project folder>/tmp/BUILD_PR_LEVEL_10_23_RESTORE_MASTER_ROADMAP_STATUS_ONLY.zip`

## Scope guard
- roadmap restore first
- status-only updates second
- no other roadmap text edits
- no unrelated repo changes
