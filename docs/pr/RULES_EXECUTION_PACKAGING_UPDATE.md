# RULES UPDATE — EXECUTION PACKAGING

## New Rule: Execution Deliverables Must Be Zipped

When any response requires user execution (including APPLY_PR, BUILD_PR, validation runs, or Codex commands):

- ALWAYS provide a downloadable ZIP
- ZIP must mirror repo structure expectations
- ZIP must include:
  - docs/dev/CODEX_COMMANDS.md
  - docs/dev/COMMIT_COMMENT.txt

## CODEX_COMMANDS.md Requirements
- Must include:
  - MODEL
  - REASONING
  - COMMAND
  - VALIDATIONS (if applicable)
- Must be concise and token-light
- Must reflect exactly what Codex should execute and verify

## COMMIT_COMMENT.txt Requirements
- Single-line or short descriptive commit message
- Must match the intent of the change
- No extra formatting

## Prohibited
- Do NOT provide execution instructions only in chat
- Do NOT require user to manually reconstruct commands
- Do NOT omit ZIP when execution is expected

## Clarification
- PLAN_PR may be provided without ZIP
- BUILD_PR and APPLY_PR MUST include ZIP

## Goal
Ensure all executable steps are:
- consistent
- reproducible
- copy/paste-free
- aligned with repo workflow expectations
