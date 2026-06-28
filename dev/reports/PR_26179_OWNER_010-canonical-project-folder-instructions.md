# PR_26179_OWNER_010-canonical-project-folder-instructions

Updated: 2026-06-28T01:03:53Z
Team: OWNER
Branch: PR_26179_OWNER_010-canonical-project-folder-instructions
Scope: Documentation/governance only. No files moved. No runtime behavior or production page changes.

## Summary
- Updated canonical repository structure governance under dev/build/ProjectInstructions/.
- Added the valid top-level folder list and valid dev workspace folder list.
- Documented ownership rules for root, src/, dev/, deploy/, docs/, dev/build/, and dev/workspace/.
- Added invalid legacy path list and Codex HARD STOP rule for unclear new folders.
- Added team migration note for Team Alfa, Team Bravo, Team Charlie, and historical Team Gamma lanes.

## Changed Files
```
M	dev/build/ProjectInstructions/TEAM_START_COMMANDS.md
M	dev/build/ProjectInstructions/addendums/canonical_repository_structure.md
M	dev/build/ProjectInstructions/addendums/repository_directory_standard.md
```

## Intentional Old Path Mentions
The grep lane intentionally finds legacy paths in active Project Instructions where the content marks those paths invalid, deprecated, historical, generated-output locations, or non-active reference material. These are intentional documentation mentions, not active placement instructions.

```
dev/build/ProjectInstructions\TEAM_START_COMMANDS.md:22:Do not create or reuse legacy folders such as `docs_build/`, `tmp/`, `projects/`, `scripts/`, `tests/`, `archive/`, `project-instructions/`, `dev/docs_build/`, `dev/project-instructions/`, `dev/workspace/artifacts/`, or `dev/build/dev/`.
dev/build/ProjectInstructions\README.txt:7:Preserve historical Project Instructions material as deprecated reference only. Do not treat root-level copies in `dev/build/dev/`, `dev/archive/`, or archived snapshots as active instruction sources. When a conflict appears, `dev/build/ProjectInstructions/` wins unless OWNER explicitly approves a newer governance change.
dev/build/ProjectInstructions\PROJECT_INSTRUCTIONS.md:42:- Retained reference material belongs under the repository root `dev/archive/` tree, not under `dev/build/dev/`.
dev/build/ProjectInstructions\addendums\canonical_repository_structure.md:106:- Required ZIPs belong under `dev/workspace/zips/`; generated temporary artifacts belong under `dev/workspace/tmp/`.
dev/build/ProjectInstructions\addendums\canonical_repository_structure.md:112:- docs_build/
dev/build/ProjectInstructions\addendums\canonical_repository_structure.md:113:- tmp/
dev/build/ProjectInstructions\addendums\canonical_repository_structure.md:114:- projects/
dev/build/ProjectInstructions\addendums\canonical_repository_structure.md:115:- scripts/
dev/build/ProjectInstructions\addendums\canonical_repository_structure.md:116:- tests/
dev/build/ProjectInstructions\addendums\canonical_repository_structure.md:117:- archive/
dev/build/ProjectInstructions\addendums\canonical_repository_structure.md:118:- project-instructions/
dev/build/ProjectInstructions\addendums\canonical_repository_structure.md:119:- dev/docs_build/
dev/build/ProjectInstructions\addendums\canonical_repository_structure.md:120:- dev/project-instructions/
dev/build/ProjectInstructions\addendums\canonical_repository_structure.md:121:- dev/workspace/artifacts/
dev/build/ProjectInstructions\addendums\canonical_repository_structure.md:122:- dev/build/dev/
dev/build/ProjectInstructions\addendums\documentation_ownership.md:52:- `dev/workspace/tmp/` contains temporary generated files.
dev/build/ProjectInstructions\addendums\environment_governance_model.md:90:- Local project assets: `/local/projects/`
dev/build/ProjectInstructions\addendums\environment_governance_model.md:91:- DEV project assets: `/dev/projects/`
dev/build/ProjectInstructions\addendums\environment_governance_model.md:92:- IST project assets: `/ist/projects/`
dev/build/ProjectInstructions\addendums\environment_governance_model.md:93:- UAT project assets: `/uat/projects/`
dev/build/ProjectInstructions\addendums\environment_governance_model.md:94:- PROD project assets: `/prod/projects/`
dev/build/ProjectInstructions\addendums\koti_layout_contract.md:9:- `dev/workspace/tmp/uat_exports/king_of_the_iceberg_layout_snapshot.json`
dev/build/ProjectInstructions\addendums\koti_layout_contract.md:10:- `dev/workspace/tmp/uat_tool_layout_workflow_results.json`
dev/build/ProjectInstructions\addendums\project_instructions_single_source_eod_lock.md:11:- root-level copies in `dev/build/dev/`
dev/build/ProjectInstructions\standards\PROJECT_CONTRACT.md:28:- Fixture file: `dev/tests/fixtures/projects/project-scenarios.json`
dev/build/ProjectInstructions\addendums\repository_directory_standard.md:70:- Root `docs_build/`, root `tests/`, root `archive/`, root `tmp/`, root `projects/`, root `scripts/`, and root `project-instructions/` are not active workspace locations after the restructure.
dev/build/ProjectInstructions\addendums\repository_directory_standard.md:71:- Root `tmp/` may remain ignored as legacy local scratch only; required Codex ZIPs belong under `dev/workspace/zips/`, and generated temporary artifacts belong under `dev/workspace/tmp/`.
dev/build/ProjectInstructions\addendums\repository_directory_standard.md:77:- docs_build/
dev/build/ProjectInstructions\addendums\repository_directory_standard.md:78:- tmp/
dev/build/ProjectInstructions\addendums\repository_directory_standard.md:79:- projects/
dev/build/ProjectInstructions\addendums\repository_directory_standard.md:80:- scripts/
dev/build/ProjectInstructions\addendums\repository_directory_standard.md:81:- tests/
dev/build/ProjectInstructions\addendums\repository_directory_standard.md:82:- archive/
dev/build/ProjectInstructions\addendums\repository_directory_standard.md:83:- project-instructions/
dev/build/ProjectInstructions\addendums\repository_directory_standard.md:84:- dev/docs_build/
dev/build/ProjectInstructions\addendums\repository_directory_standard.md:85:- dev/project-instructions/
dev/build/ProjectInstructions\addendums\repository_directory_standard.md:86:- dev/workspace/artifacts/
dev/build/ProjectInstructions\addendums\repository_directory_standard.md:87:- dev/build/dev/
```

## Validation
- npm run validate:canonical-structure: PASS
- git diff --check: PASS
- node ./dev/scripts/run-platform-validation-suite.mjs: PASS, 8/8 scenarios
- Project Instructions invalid-path grep: PASS, intentional historical/invalid-path mentions documented above

## Blockers
None.
