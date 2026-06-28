# PR_26179_OWNER_011-team-stacked-pr-policy Report

## Purpose

Update active Project Instructions so OWNER may create independent PRs from `main`, while non-Owner teams use stacked PR workstreams by default.

## Branching Model

- Model: Stacked PR
- Previous PR dependency: `PR_26179_OWNER_011-pr-branching-model-docs` / PR #255
- Starting branch: `PR_26179_OWNER_011-pr-branching-model-docs`
- Merge order: PR #255 first, then this PR

## Governance Outcome

- OWNER PRs may start from synchronized `main` when independent and no direct dependency exists.
- Non-Owner team PRs use Stacked PR workstreams by default.
- Non-Owner team PRs may start from `main` only when OWNER explicitly marks the PR as `standalone/no-dependency`.
- Stacked PRs still must document dependency order, review order, and merge order.
- Codex must hard-stop when a branch/model mismatch is detected.
- Missing ZIP output is clarified as an incomplete Codex run.

## Updated Documents

- `dev/build/ProjectInstructions/addendums/pr_workflow.md`
- `dev/build/ProjectInstructions/addendums/project_instructions_single_source_eod_lock.md`
- `dev/build/ProjectInstructions/addendums/branch_lock_governance.md`
- `dev/build/ProjectInstructions/addendums/branch_context_governance.md`
- `dev/build/ProjectInstructions/standards/CODEX_WORKFLOW_COMMANDS.md`
- `dev/build/ProjectInstructions/TEAM_START_COMMANDS.md`
- `dev/build/ProjectInstructions/addendums/codex_artifact_and_reporting_standard.md`

## Runtime Impact

None. This PR changes documentation/governance only.

## ZIP

- `dev/workspace/zips/PR_26179_OWNER_011-team-stacked-pr-policy_delta.zip`
