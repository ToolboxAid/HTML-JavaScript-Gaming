# PROJECT INSTRUCTIONS

You are working in a docs-first repo workflow.

Workflow:
PLAN_PR → BUILD_PR → APPLY_PR

Rules:
- One PR purpose only
- Smallest scoped valid change
- BUILD must be one-pass executable
- No vague wording
- No repo-wide scanning unless required

Responsibilities:
- ChatGPT: create plans, PR docs, and ZIP bundles
- Codex: writes implementation code
- User: runs Codex + validates

Output rules:
- Always produce repo-structured ZIPs
- Place ZIPs under <project folder>/tmp/
- Preserve exact repo structure inside ZIP

Do not:
- Write implementation code unless explicitly asked
- Expand scope beyond the PR
- Modify start_of_day folders unless requested

NEXT resolution rules:

If the user says "NEXT":
1. Look for the highest completed or referenced PLAN_PR in the session
2. Increment to the next logical PLAN_PR in sequence
3. If sequence is unclear, STOP and ask for clarification

Assume naming pattern:
PLAN_PR_LEVEL_<major>_<minor>_<name>

Example:
If last = PLAN_PR_LEVEL_11_1_...
NEXT = PLAN_PR_LEVEL_11_2_...

If no prior context exists:
STOP and ask: "What is the base PLAN_PR?"

One-shot execution rule:

If the user says:
"Run full workflow for <PLAN_PR_NAME>" or "NEXT"

Then:
1. Validate the PLAN
2. Generate a compact BUILD_PR
3. Generate Codex command
4. Package a repo-structured ZIP
5. Return all outputs

Do not ask for confirmation unless ambiguity exists.

OUTPUT FORMAT (STRICT)

When producing BUILD, PLAN, or APPLY results:

- ALWAYS return a downloadable ZIP
- DO NOT output full command text, PR docs, or reports inline
- Keep chat response minimal:
  - ZIP download
  - short summary (1–3 lines max)
  - NEXT step (if applicable)

All detailed content must be placed inside the ZIP, including:
- docs/pr/*
- docs/dev/codex_commands.md
- docs/dev/commit_comment.txt
- docs/dev/reports/*

If a ZIP cannot be produced:
- STOP and explain why
- DO NOT fall back to full inline output

ZIP STANDARD (ENFORCED)

- Exactly one ZIP per request
- ZIP name MUST match PR name
- ZIP path MUST be:
  <project folder>/tmp/<PR_NAME>.zip
- Internal structure MUST be repo-relative only
- No extra files outside defined structure


## 🔒 EXECUTION DEFAULTS (MANDATORY)

### ALWAYS CONTINUE
- Never pause for confirmation
- Never present optional branches
- Always proceed to the next logical step

### NO COMMIT-ONLY PRs
- PRs must include something testable
- If a PR is doc-only, bundle with next smallest executable/testable change

### ZIP IS ALWAYS REQUIRED
- Never ask if a ZIP is needed
- Always produce a ZIP

### DEFAULT EXECUTION MODE
- Assume approval
- Continue automatically
- Do not stop unless blocked

## Productization Rules
- Do not create standalone showcase tracks in future roadmaps
- Fold showcase importance into the main feature or sample title when needed

## Roadmap Instruction Move Guards
- If roadmap content is moved to `PROJECT_INSTRUCTIONS.md`, move it and do not delete it without relocation.
- Ensure destination text exists before removing the source text.
- Preserve wording unless the PR explicitly requires rewriting.
- Keep roadmap handling status-only unless explicitly requested otherwise.
- Do not delete roadmap content during cleanup work.
