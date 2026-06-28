# PR_26179_OWNER_010-canonical-project-folder-instructions

Updated: 2026-06-28T01:09:47Z
Team: OWNER
Branch: PR_26179_OWNER_010-canonical-project-folder-instructions
Scope: Documentation/governance only. No files moved. No runtime behavior or production page changes.

## SSoT Decision
`dev/build/ProjectInstructions/addendums/canonical_repository_structure.md` is the single source of truth for repository folder placement.

`dev/build/ProjectInstructions/addendums/repository_directory_standard.md` is superseded and now points to the SSoT. It must not duplicate folder rules.

## Summary
- Moved remaining unique folder-placement rules from `repository_directory_standard.md` into `canonical_repository_structure.md`.
- Replaced `repository_directory_standard.md` with a short superseded pointer.
- Updated Project Instructions index/README references so folder placement points to the canonical SSoT.
- Shortened `TEAM_START_COMMANDS.md` to reference the SSoT and keep only the invalid-path warning.
- Searched Project Instructions for duplicate folder ownership lists/tables; active duplicates were replaced by pointers, and remaining old-path mentions are intentional historical, generated-output, fixture, or SSoT invalid-path mentions.

## Changed Files
```
M	dev/build/ProjectInstructions/PROJECT_INSTRUCTIONS.md
M	dev/build/ProjectInstructions/README.txt
M	dev/build/ProjectInstructions/TEAM_START_COMMANDS.md
M	dev/build/ProjectInstructions/addendums/canonical_repository_structure.md
M	dev/build/ProjectInstructions/addendums/repository_directory_standard.md
```

## Duplicate Folder Rule Search
```
dev/build/ProjectInstructions\PROJECT_INSTRUCTIONS.md:69:- Repository folder placement, directory ownership, final root standard, final `src/` layer standard, final `dev/` workspace standard, and restructure boundaries: `dev/build/ProjectInstructions/addendums/canonical_repository_structure.md`
dev/build/ProjectInstructions\TEAM_START_COMMANDS.md:22:`dev/build/ProjectInstructions/addendums/canonical_repository_structure.md`
dev/build/ProjectInstructions\README.txt:50:- Canonical Repository Structure: dev/build/ProjectInstructions/addendums/canonical_repository_structure.md
dev/build/ProjectInstructions\README.txt:51:- Repository Directory Standard (superseded pointer): dev/build/ProjectInstructions/addendums/repository_directory_standard.md
dev/build/ProjectInstructions\addendums\canonical_repository_structure.md:9:Valid top-level folders:
dev/build/ProjectInstructions\addendums\canonical_repository_structure.md:27:Root product and repo sections:
dev/build/ProjectInstructions\addendums\canonical_repository_structure.md:50:Valid dev workspace folders:
dev/build/ProjectInstructions\addendums\canonical_repository_structure.md:62:- dev/archive/ owns historical reference material only.
dev/build/ProjectInstructions\addendums\canonical_repository_structure.md:63:- dev/build/ owns active Project Instructions, architecture, database DDL/DML/seed docs, standards, backlog, PR planning, and governance.
dev/build/ProjectInstructions\addendums\repository_directory_standard.md:5:SSoT: `dev/build/ProjectInstructions/addendums/canonical_repository_structure.md`
```

## Intentional Old Path Mentions
```
dev/build/ProjectInstructions\PROJECT_INSTRUCTIONS.md:42:- Retained reference material belongs under the repository root `dev/archive/` tree, not under `dev/build/dev/`.
dev/build/ProjectInstructions\README.txt:7:Preserve historical Project Instructions material as deprecated reference only. Do not treat root-level copies in `dev/build/dev/`, `dev/archive/`, or archived snapshots as active instruction sources. When a conflict appears, `dev/build/ProjectInstructions/` wins unless OWNER explicitly approves a newer governance change.
dev/build/ProjectInstructions\addendums\canonical_repository_structure.md:114:- Required ZIPs belong under `dev/workspace/zips/`; generated temporary artifacts belong under `dev/workspace/tmp/`.
dev/build/ProjectInstructions\addendums\canonical_repository_structure.md:140:- docs_build/
dev/build/ProjectInstructions\addendums\canonical_repository_structure.md:141:- tmp/
dev/build/ProjectInstructions\addendums\canonical_repository_structure.md:142:- projects/
dev/build/ProjectInstructions\addendums\canonical_repository_structure.md:143:- scripts/
dev/build/ProjectInstructions\addendums\canonical_repository_structure.md:144:- tests/
dev/build/ProjectInstructions\addendums\canonical_repository_structure.md:145:- archive/
dev/build/ProjectInstructions\addendums\canonical_repository_structure.md:146:- project-instructions/
dev/build/ProjectInstructions\addendums\canonical_repository_structure.md:147:- dev/docs_build/
dev/build/ProjectInstructions\addendums\canonical_repository_structure.md:148:- dev/project-instructions/
dev/build/ProjectInstructions\addendums\canonical_repository_structure.md:149:- dev/workspace/artifacts/
dev/build/ProjectInstructions\addendums\canonical_repository_structure.md:150:- dev/build/dev/
dev/build/ProjectInstructions\addendums\documentation_ownership.md:52:- `dev/workspace/tmp/` contains temporary generated files.
dev/build/ProjectInstructions\addendums\environment_governance_model.md:90:- Local project assets: `/local/projects/`
dev/build/ProjectInstructions\addendums\environment_governance_model.md:91:- DEV project assets: `/dev/projects/`
dev/build/ProjectInstructions\addendums\environment_governance_model.md:92:- IST project assets: `/ist/projects/`
dev/build/ProjectInstructions\addendums\environment_governance_model.md:93:- UAT project assets: `/uat/projects/`
dev/build/ProjectInstructions\addendums\environment_governance_model.md:94:- PROD project assets: `/prod/projects/`
dev/build/ProjectInstructions\addendums\koti_layout_contract.md:9:- `dev/workspace/tmp/uat_exports/king_of_the_iceberg_layout_snapshot.json`
dev/build/ProjectInstructions\addendums\koti_layout_contract.md:10:- `dev/workspace/tmp/uat_tool_layout_workflow_results.json`
dev/build/ProjectInstructions\standards\PROJECT_CONTRACT.md:28:- Fixture file: `dev/tests/fixtures/projects/project-scenarios.json`
dev/build/ProjectInstructions\addendums\project_instructions_single_source_eod_lock.md:11:- root-level copies in `dev/build/dev/`
```

## Validation
- npm run validate:canonical-structure: PASS
- git diff --check: PASS
- node ./dev/scripts/run-platform-validation-suite.mjs: PASS, 8/8 scenarios

## Blockers
None.
