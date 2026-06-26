# Release Gate Governance

Status: Approved
Owner: OWNER

## Purpose

Define release gates for Project Instructions governance without making governance a blocker by default.

## Rule

Release gates are validation gates.
They do not block development unless OWNER says governance is blocking.

## Project Instructions Release Gate

Before a governance, documentation, or administrative PR is merged, validate:

- Project Instructions folder exists.
- Required source-of-truth files still exist.
- Governance Phase 1 completion guidance remains intact.
- PR workflow guidance remains intact.
- Documentation ownership guidance remains intact.
- Team assignment governance remains intact.
- Active team registry guidance remains compatible with temporary active teams.
- Canonical START / WORK / END branch lifecycle guidance remains intact.
- No protected Project Instructions guidance was deleted.
- No permanent team roster or permanent discipline ownership was restored.
- No direct-to-main commit rule was bypassed.
- No application code changed unless the PR explicitly scopes application code.

## Required Source Files

The release gate should confirm these files when relevant to the PR:

- `docs_build/dev/ProjectInstructions/README.txt`
- `docs_build/dev/ProjectInstructions/PROJECT_INSTRUCTIONS.md`
- `docs_build/dev/ProjectInstructions/backlog/BACKLOG_MASTER.md`
- `docs_build/dev/ProjectInstructions/addendums/governance_phase1_complete.md`
- `docs_build/dev/ProjectInstructions/addendums/pr_workflow.md`
- `docs_build/dev/ProjectInstructions/addendums/project_instructions_single_source_eod_lock.md`
- `docs_build/dev/ProjectInstructions/addendums/documentation_ownership.md`
- `docs_build/dev/ProjectInstructions/addendums/project_reference_files.md`
- `docs_build/dev/ProjectInstructions/addendums/environment_governance_model.md`
- `docs_build/dev/ProjectInstructions/addendums/environment_configuration_standards.md`
- `docs_build/dev/ProjectInstructions/addendums/workspace_v2_playwright_gate.md`
- `docs_build/dev/ProjectInstructions/addendums/samples2tools_adapter_guidance.md`
- `docs_build/dev/ProjectInstructions/addendums/koti_layout_contract.md`
- `docs_build/dev/ProjectInstructions/addendums/tool_mvp_stacked_pr_standard.md`
- `docs_build/dev/ProjectInstructions/addendums/no_mock_repository_runtime_source.md`
- `docs_build/dev/ProjectInstructions/team_assignments/team_ownership.md`
- `archive/docs_build/dev/admin-notes/Installs required.txt` when present
- `archive/docs_build/dev/admin-notes/Table layout.txt` when present

## Validation Result

If a gate fails, stop and report:

- failing check
- current branch
- current worktree status
- recommended OWNER action

If every relevant check passes, the PR may proceed through the standard PR workflow.
