# PR_26179_OWNER_010-canonical-project-folder-instructions

Updated: 2026-06-28T01:49:46Z
Team: OWNER
Branch: PR_26179_OWNER_010-canonical-project-folder-instructions
Scope: Documentation/governance only. No files moved. No runtime behavior, wrapper script, or production page changes.

## SSoT Decision
`dev/build/ProjectInstructions/PROJECT_INSTRUCTIONS.md` is the only direct Codex bootstrap entry point.

Bootstrap loads supporting Project Instructions indirectly through references from `PROJECT_INSTRUCTIONS.md`.

Single source ownership:
- `PROJECT_INSTRUCTIONS.md`: active entry point, index, and referenced load graph.
- `PROJECT_STATE.md`: current project/repository/team state metadata for bootstrap summaries.
- `addendums/canonical_repository_structure.md`: repository folder placement and file-placement rules.

## Summary
- Added `PROJECT_STATE.md` as the project state SSoT document.
- Added `addendums/codex_start_of_day_bootstrap.md` to define bootstrap phrases, responsibilities, wrapper responsibilities, standard bootstrap report, loading rules, SSoT ownership, and future wrapper direction.
- Updated `PROJECT_INSTRUCTIONS.md`, `README.txt`, and `codex_project_instructions_startup.md` so wrappers request only `PROJECT_INSTRUCTIONS.md` directly.
- Did not implement or modify wrappers.

## Changed Files
```
M	dev/build/ProjectInstructions/PROJECT_INSTRUCTIONS.md
A	dev/build/ProjectInstructions/PROJECT_STATE.md
M	dev/build/ProjectInstructions/README.txt
M	dev/build/ProjectInstructions/addendums/codex_project_instructions_startup.md
A	dev/build/ProjectInstructions/addendums/codex_start_of_day_bootstrap.md
```

## Documentation Review Evidence
```
dev/build/ProjectInstructions\PROJECT_STATE.md:11:`PROJECT_STATE.md` is the single source of truth for current repository and team state metadata used by Codex Start-of-Day bootstrap summaries.
dev/build/ProjectInstructions\PROJECT_STATE.md:16:- `PROJECT_STATE.md` owns current project state metadata.
dev/build/ProjectInstructions\PROJECT_INSTRUCTIONS.md:22:- Project state: `dev/build/ProjectInstructions/PROJECT_STATE.md`
dev/build/ProjectInstructions\PROJECT_INSTRUCTIONS.md:64:- `PROJECT_STATE.md` owns current repository/team state metadata used by bootstrap summaries.
dev/build/ProjectInstructions\PROJECT_INSTRUCTIONS.md:121:`dev/build/ProjectInstructions/addendums/codex_start_of_day_bootstrap.md` defines Bootstrap Phrases, Bootstrap Responsibilities, Wrapper Responsibilities, Standard Bootstrap Report, loading rules, SSoT ownership, and the future wrapper direction for the phrase `Use Latest Project Instructions`.
dev/build/ProjectInstructions\addendums\codex_start_of_day_bootstrap.md:19:- Owner Start of Day
dev/build/ProjectInstructions\addendums\codex_start_of_day_bootstrap.md:20:- Team Alpha Start of Day
dev/build/ProjectInstructions\addendums\codex_start_of_day_bootstrap.md:21:- Team Bravo Start of Day
dev/build/ProjectInstructions\addendums\codex_start_of_day_bootstrap.md:22:- Team Charlie Start of Day
dev/build/ProjectInstructions\addendums\codex_start_of_day_bootstrap.md:23:- Team Gamma Start of Day
dev/build/ProjectInstructions\addendums\codex_start_of_day_bootstrap.md:26:- `Team Alpha Start of Day` is accepted as a user phrase alias for the canonical Team Alfa lane.
dev/build/ProjectInstructions\addendums\codex_start_of_day_bootstrap.md:29:## Bootstrap Responsibilities
dev/build/ProjectInstructions\addendums\codex_start_of_day_bootstrap.md:34:- `PROJECT_STATE.md`
dev/build/ProjectInstructions\addendums\codex_start_of_day_bootstrap.md:44:## Wrapper Responsibilities
dev/build/ProjectInstructions\addendums\codex_start_of_day_bootstrap.md:57:## Standard Bootstrap Report
dev/build/ProjectInstructions\addendums\codex_start_of_day_bootstrap.md:96:`PROJECT_STATE.md` owns:
dev/build/ProjectInstructions\addendums\codex_start_of_day_bootstrap.md:115:Use Latest Project Instructions
```

## Validation
- Documentation review: PASS
- git diff --check: PASS

## Blockers
None.
