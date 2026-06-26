Read this file first.

Folder purpose:
This folder is the only active Project Instructions source for Game Foundry Studio. It organizes active governance, backlog, team assignment, deprecation, and history material under `docs_build/dev/ProjectInstructions/`.

Preservation rules:
Preserve historical Project Instructions material as deprecated reference only. Do not treat root-level copies in `docs_build/dev/`, `project-instructions/`, or archived snapshots as active instruction sources. When a conflict appears, `docs_build/dev/ProjectInstructions/` wins unless OWNER explicitly approves a newer governance change.

Backlog workflow:
Backlog work is tracked under backlog/. BACKLOG_MASTER.md is the planned source for backlog item status, notes, and references. Backlog item text is treated as immutable once created; status and notes may change under the governance addendums.

Team assignment workflow:
Team assignments are tracked under team_assignments/. A team pulls work from BACKLOG_MASTER.md, marks the item building when assigned, and records the active assignment under the owning team. Teams work only on assigned items unless an OWNER override explicitly changes the assignment.

No direct commits to main:
Do not commit directly to main. Normal work must use PR branches, draft PRs, validation evidence, and owner-controlled merge approval.

Branch lifecycle:
Every PR follows exactly three phases: START, WORK, END. The canonical lifecycle is `docs_build/dev/ProjectInstructions/addendums/project_instructions_single_source_eod_lock.md`.

OWNER override rule:
An OWNER override must use this wording:
OWNER override approved: <reason>

The override must explain why normal team, branch, assignment, or backlog routing is being changed.

History snapshot rule:
When a governance or instruction state needs a history snapshot, add a new file under archive/history/ using:
CCYYMMDD_HHMMSS.md

Do not rewrite history snapshots after creation unless the owner explicitly approves.

READ THIS FIRST

1. Read `docs_build/dev/ProjectInstructions/README.txt` before making changes.
2. Treat `docs_build/dev/ProjectInstructions/` as the only active Project Instructions source.
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
- Single Source and EOD Main Lock: docs_build/dev/ProjectInstructions/addendums/project_instructions_single_source_eod_lock.md
- Canonical Repository Structure: docs_build/dev/ProjectInstructions/addendums/canonical_repository_structure.md
- Test Structure Standardization: docs_build/dev/ProjectInstructions/addendums/test_structure_standardization.md
- Legacy Migration Policy: docs_build/dev/ProjectInstructions/addendums/legacy_migration_policy.md
- Assistant Execution Modes: docs_build/dev/ProjectInstructions/addendums/assistant_execution_modes.md
- Codex Artifact and Reporting Standard: docs_build/dev/ProjectInstructions/addendums/codex_artifact_and_reporting_standard.md
- Codex Project Instructions Startup: docs_build/dev/ProjectInstructions/addendums/codex_project_instructions_startup.md
- Project Reference Files Governance: docs_build/dev/ProjectInstructions/addendums/project_reference_files.md
- Environment Governance Model: docs_build/dev/ProjectInstructions/addendums/environment_governance_model.md
- Environment Configuration Standards: docs_build/dev/ProjectInstructions/addendums/environment_configuration_standards.md
- Workspace V2 Playwright Gate: docs_build/dev/ProjectInstructions/addendums/workspace_v2_playwright_gate.md
- Samples2Tools Adapter Guidance: docs_build/dev/ProjectInstructions/addendums/samples2tools_adapter_guidance.md
- King of the Iceberg Layout Contract: docs_build/dev/ProjectInstructions/addendums/koti_layout_contract.md
- Tool MVP Stacked PR Standard: docs_build/dev/ProjectInstructions/addendums/tool_mvp_stacked_pr_standard.md
