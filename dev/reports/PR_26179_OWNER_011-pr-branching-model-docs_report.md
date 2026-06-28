# PR_26179_OWNER_011-pr-branching-model-docs Report

## Purpose

Define Independent PRs and Stacked PRs in active Project Instructions.

## Scope

Documentation/governance only. No implementation code, runtime files, API files, database files, or product pages changed.

## Governance Outcome

- `pr_workflow.md` now owns the canonical Independent PR vs Stacked PR model.
- Independent PRs must start from synchronized `main`.
- Stacked PRs may start from the documented previous PR branch only when there is a direct dependency.
- Stacked PRs must document stack order, previous dependency, next dependency when known, starting branch, and merge order.
- Stacked PRs must be reviewed and merged in dependency order.
- Codex must HARD STOP when the requested PR model does not match the current/start branch.

## Updated Documents

- `dev/build/ProjectInstructions/addendums/pr_workflow.md`
- `dev/build/ProjectInstructions/addendums/project_instructions_single_source_eod_lock.md`
- `dev/build/ProjectInstructions/addendums/branch_lock_governance.md`
- `dev/build/ProjectInstructions/addendums/branch_context_governance.md`
- `dev/build/ProjectInstructions/standards/CODEX_WORKFLOW_COMMANDS.md`
- `dev/build/ProjectInstructions/TEAM_START_COMMANDS.md`

## ZIP

- `dev/workspace/zips/PR_26179_OWNER_011-pr-branching-model-docs_delta.zip`
