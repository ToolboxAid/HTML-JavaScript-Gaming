# PR_26171_025 Codex Git Workflow Ownership

## Summary
- Added the `CODEX GIT WORKFLOW OWNERSHIP` governance section to `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Established that Codex owns Git execution for implementation PRs.
- Documented the required branch, pull, clean-status, PR branch, scoped staging, commit, push, automatic Pull Request creation, conflict resolution, validation rerun, merge, return-to-main, and continuation flow.

## Scope
- Docs-only governance update.
- No runtime implementation.
- No UI changes.
- No database changes.

## Governance Intent
- Codex should not ask the user whether to push a branch or create a Pull Request for implementation PRs.
- Branch push, Pull Request creation, and merge after passing validation are required implementation PR workflow steps.
- Merge conflicts must preserve latest `main`, preserve PR scope, avoid unrelated cleanup, and revalidate before merge.

## Required Git Workflow Report Fields
- current branch
- created branch
- push result
- PR URL
- merge result
- final main commit

## Current Execution Notes
- Current branch at validation time: `main`.
- This PR_025 task was docs-only and did not create runtime changes.
- The repository already contained unrelated staged changes and unresolved generated report conflicts before this PR_025 edit began; those unrelated files were preserved.
