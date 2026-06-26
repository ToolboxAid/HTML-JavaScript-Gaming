# Codex Project Instructions Startup

## Purpose

Ensure Codex uses the current approved governance before making repository changes.

## Startup Requirement

Before performing work, Codex must review and use:

```text
docs_build/dev/ProjectInstructions/
```

Codex must use this as the only active source of truth for:
- Governance rules
- Repository standards
- Ownership rules
- Workflow rules
- Addendums
- Execution modes
- Artifact requirements

## Branch Lifecycle Start Gate

START RULE:
- Every team starts on `main`.
- `main` must be clean.
- `main...origin/main` must be `0 0`.
- `HEAD` SHA must match published EOD SHA.
- Only then create or switch to the PR branch.
- No commits are allowed on `main`.

WORK RULE:
- Codex must remain on the PR branch during implementation.
- Codex commits only to the PR branch.
- Codex pushes only the PR branch.
- HARD STOP if branch changes unexpectedly.
- HARD STOP before committing if current branch is `main`.

END RULE:
- After PR validation, push the PR branch.
- Merge PR into `main` only when approved.
- Checkout `main`.
- Run `git fetch origin`.
- Run `git pull --ff-only origin main`.
- Confirm current branch is `main`.
- Confirm worktree is clean.
- Confirm `main...origin/main` is `0 0`.
- Record `HEAD` SHA as new EOD baseline.

Deprecated Project Instructions material outside `docs_build/dev/ProjectInstructions/` is reference-only and must not override active governance.

## Project Reference File Review

When present in `ProjectInstructions.zip`, the active project instruction directory, or `docs_build/dev/admin-notes/`, Codex must include these recognized project instruction/reference files in the Project Instructions read set:

- `Installs required.txt`
- `Table layout.txt`

Chat instructions may supplement Project Instructions but must not override approved governance without explicit OWNER approval.

## Conflict Handling

If a chat instruction conflicts with Project Instructions:
- Stop
- Do not continue the PR
- Produce the required ZIP artifact
- Document the conflict in summary.md
- Ask for OWNER direction

## Execution Mode Validation

When a request contains:
- Build PR
- Continue
- Follow Project Instructions
- Next PR

Codex must treat the request as Execution Mode.

Execution Mode means:
- Execute the requested work order
- Do not redesign the process
- Do not provide alternatives unless a Stop Gate condition exists

## Validation

Before completing the PR:
- Verify this addendum appears in the Project Instructions index
- Verify markdown is valid
- Verify all indexed addendums exist
- Verify the required ZIP artifact is produced
