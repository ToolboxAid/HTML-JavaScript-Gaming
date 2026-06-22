# Codex Project Instructions Startup

## Purpose

Ensure Codex uses the current approved governance before making repository changes.

## Startup Requirement

Before performing work, Codex must review and use:

```text
docs_build/dev/ProjectInstructions/
```

Codex must use this as the primary source of truth for:
- Governance rules
- Repository standards
- Ownership rules
- Workflow rules
- Addendums
- Execution modes
- Artifact requirements

Chat instructions may supplement Project Instructions but must not override approved governance without explicit Owner approval.

## Conflict Handling

If a chat instruction conflicts with Project Instructions:
- Stop
- Do not continue the PR
- Produce the required ZIP artifact
- Document the conflict in summary.md
- Ask for Owner direction

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
