# Codex Project Instructions Startup

## Purpose

Ensure Codex uses the current approved governance before making repository changes.

## Startup Requirement

Before performing work, Codex must request the latest Project Instructions through the single direct entry point:

```text
dev/build/ProjectInstructions/PROJECT_INSTRUCTIONS.md
```

All other Project Instructions documents are loaded indirectly through references from `PROJECT_INSTRUCTIONS.md`.

Codex must use this as the only active source of truth for:
- Governance rules
- Repository standards
- Ownership rules
- Workflow rules
- Addendums
- Execution modes
- Artifact requirements

The Codex Start-of-Day bootstrap architecture is defined in:

```text
dev/build/ProjectInstructions/addendums/codex_start_of_day_bootstrap.md
```

## Branch Lifecycle Start Gate

Codex must follow the canonical lifecycle in:

```text
dev/build/ProjectInstructions/addendums/project_instructions_single_source_eod_lock.md
```

This startup addendum only requires Codex to read and apply that canonical lifecycle; it must not define a competing lifecycle rule.

Deprecated Project Instructions material outside `dev/build/ProjectInstructions/` is reference-only and must not override active governance.

## Project Reference File Review

When present in `ProjectInstructions.zip`, the active project instruction directory, or `dev/archive/legacy-docs-build/admin-notes/`, Codex must include these recognized project instruction/reference files in the Project Instructions read set:

- `Installs required.txt`
- `Table layout.txt`

Archived reference files are historical reference only. They must not be treated as active Project Instructions.

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
