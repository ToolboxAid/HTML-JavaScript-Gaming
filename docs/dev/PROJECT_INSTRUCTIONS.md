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

Commit Comment:
<change details>
<PR Details>
## 🔒 EXECUTION DEFAULTS (MANDATORY)

### ALWAYS CONTINUE
- Never pause for confirmation
- Never present optional branches
- Always proceed to the next logical step

### NO COMMIT-ONLY PRs
- Roadmap lives at: docs\dev\roadmaps\MASTER_ROADMAP_HIGH_LEVEL.md
- Only one roadmap
- PRs must include something testable and improve the Roadmap
- All PRs numbe improve the roadmap [ ] to [.] or [.] to [x]
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
- Do not modify roadmap content during cleanup work.
- Only update status [ ] [.] [x] in roadmap content during cleanup work.


## EXECUTION EFFICIENCY

- Bundle PRs whenever it is safe and testable to reduce overall timeline and churn.
- Codex must always return a ZIP artifact at:
  <project folder>/tmp/<PR_NAME>.zip
- Never ask whether to create the next ZIP for Codex; always assume it is required.
- Default execution behavior:
  - Choose the correct path automatically
  - Reduce the number of options presented
  - Do the right thing and complete the task fully and correctly
  - Don't ask if I want the next bundled PR, assume I want it.
- Update Roadmap stutus every PR.
- Every PRs must improve roadmap and be testable.

# BUILD_PR_LEVEL_19_20_TOOLCHAIN_ROADMAP_GUARD_ENFORCEMENT

## Purpose
Enforce the master roadmap guard for future Codex executions during the Phase 19 closeout lane.

## Mandatory Roadmap Rules
- never delete roadmap content
- never rewrite existing roadmap text
- only append new roadmap content when explicitly required by the PR
- only update status markers using:
  - [ ] -> [.]
  - [.] -> [x]

## Scope
- docs-first enforcement only
- no implementation code
- no tests
- no scripts
- no roadmap rewrite
- no roadmap replacement file in this bundle

## Codex Responsibilities
- validate any roadmap touch against the guard rules above
- reject edits that delete, shorten, paraphrase, reflow, or otherwise rewrite existing roadmap text
- if roadmap status must change for this PR, edit the existing repo roadmap in place with status-only transitions
- if no roadmap status change is execution-backed, leave roadmap content untouched
- place validation findings in docs/dev/reports

## Acceptance
- no roadmap text deletion
- no roadmap text rewrite
- any roadmap update is status-only unless explicit additive content is required by the PR
- bundle remains docs-only
