Read this file first.

Folder purpose:
This folder is the only active Project Instructions source for Game Foundry Studio. It organizes active governance, backlog, team assignment, standards, deprecation, and history material under `dev/build/ProjectInstructions/`.

Preservation rules:
Preserve historical Project Instructions material as deprecated reference only. Do not treat root-level copies in `dev/build/dev/`, `dev/project-instructions/`, `dev/archive/`, or archived snapshots as active instruction sources. When a conflict appears, `dev/build/ProjectInstructions/` wins unless OWNER explicitly approves a newer governance change.

Backlog workflow:
Backlog work is tracked under backlog/. BACKLOG_MASTER.md is the planned source for backlog item status, notes, and references. Backlog item text is treated as immutable once created; status and notes may change under the governance addendums.

Team assignment workflow:
Team assignments are tracked under team_assignments/. A team pulls work from BACKLOG_MASTER.md, marks the item building when assigned, and records the active assignment under the owning team. Teams work only on assigned items unless an OWNER override explicitly changes the assignment.

No direct commits to main:
Do not commit directly to main. Normal work must use PR branches, draft PRs, validation evidence, and owner-controlled merge approval.

Branch lifecycle:
The canonical START / WORK / END lifecycle is `dev/build/ProjectInstructions/addendums/project_instructions_single_source_eod_lock.md`.

OWNER override rule:
An OWNER override must use this wording:
OWNER override approved: <reason>

The override must explain why normal team, branch, assignment, or backlog routing is being changed.

History snapshot rule:
When a governance or instruction state needs a history snapshot, add a new file under `dev/archive/legacy-docs-build/ProjectInstructions/history/` using:
CCYYMMDD_HHMMSS.md

Do not rewrite history snapshots after creation unless the owner explicitly approves.

READ THIS FIRST

1. Read `dev/build/ProjectInstructions/README.txt` before making changes.
2. Treat `dev/build/ProjectInstructions/` as the only active Project Instructions source.
3. Historical Project Instructions files outside this folder are deprecated references only and must not be used as active sources.
4. Team ownership must be respected.
5. BACKLOG_MASTER.md is the authoritative backlog.
6. Build Path status derives from backlog status.
7. Direct-to-main commits are prohibited.
8. Use approved PR workflow.
9. Follow OWNER governance decisions.
10. When guidance conflicts, newest OWNER-approved guidance wins.
11. Batch Governance Mode is the default for governance, documentation, and administrative work.
12. Follow the canonical START / WORK / END lifecycle.

Addendum index:
- Documentation Ownership: dev/build/ProjectInstructions/addendums/documentation_ownership.md
- Repository Directory Standard: dev/build/ProjectInstructions/addendums/repository_directory_standard.md
- Team Backlog, SOD, And EOD Standard: dev/build/ProjectInstructions/addendums/team_backlog_sod_eod_standard.md
- Single Source and EOD Main Lock: dev/build/ProjectInstructions/addendums/project_instructions_single_source_eod_lock.md
- Canonical Repository Structure: dev/build/ProjectInstructions/addendums/canonical_repository_structure.md
- Test Structure Standardization: dev/build/ProjectInstructions/addendums/test_structure_standardization.md
- Legacy Migration Policy: dev/build/ProjectInstructions/addendums/legacy_migration_policy.md
- Assistant Execution Modes: dev/build/ProjectInstructions/addendums/assistant_execution_modes.md
- Codex Artifact and Reporting Standard: dev/build/ProjectInstructions/addendums/codex_artifact_and_reporting_standard.md
- Codex Project Instructions Startup: dev/build/ProjectInstructions/addendums/codex_project_instructions_startup.md
- Project Reference Files Governance: dev/build/ProjectInstructions/addendums/project_reference_files.md
- Environment Governance Model: dev/build/ProjectInstructions/addendums/environment_governance_model.md
- Environment Configuration Standards: dev/build/ProjectInstructions/addendums/environment_configuration_standards.md
- Workspace V2 Playwright Gate: dev/build/ProjectInstructions/addendums/workspace_v2_playwright_gate.md
- Samples2Tools Adapter Guidance: dev/build/ProjectInstructions/addendums/samples2tools_adapter_guidance.md
- King of the Iceberg Layout Contract: dev/build/ProjectInstructions/addendums/koti_layout_contract.md
- Tool MVP Stacked PR Standard: dev/build/ProjectInstructions/addendums/tool_mvp_stacked_pr_standard.md
- No Mock Repository Runtime Source: dev/build/ProjectInstructions/addendums/no_mock_repository_runtime_source.md

Standards index:
- Active contract, model, and platform standards: dev/build/ProjectInstructions/standards/

PR documentation:
- Reusable PR templates: dev/build/pr/templates/
- Historical/reference PR documents: dev/build/pr/reference/
