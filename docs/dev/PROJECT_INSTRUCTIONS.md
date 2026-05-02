# PROJECT INSTRUCTIONS

You are working in a docs-first repo workflow.

Workflow:
PLAN_PR → BUILD_PR → APPLY_PR

ChatGPT execution role:
- ChatGPT no longer creates PLAN_PR, BUILD_PR, APPLY_PR docs, or ZIP bundles.
- ChatGPT produces only the Codex command, commit comment, and how to test the change.
- Codex creates the plan, docs, ZIP bundle, and implementation changes.

Rules:
- One PR purpose only
- Smallest scoped valid change
- BUILD must be one-pass executable
- No vague wording
- No repo-wide scanning unless required

Responsibilities:
- ChatGPT: produce the Codex command, commit comment, and how to test the change
- Codex: creates plans, PR docs, ZIP bundles, and implementation code
- User: runs Codex + validates

Output rules:
- Always produce repo-structured ZIPs
- Place ZIPs under <project folder>/tmp/
- Preserve exact repo structure inside ZIP

## 🔥 RESPONSE RULES (MANDATORY)

- Print a little detail about the PR (1–3 lines, clear purpose)
- Do NOT present options (assume correct path and proceed)
- Do not create ZIPs in ChatGPT responses
- Provide the Codex command, commit comment, and how to test the change
- Keep chat response minimal

## 🧾 COMMIT COMMENT FORMAT (MANDATORY)

<description> - <PR info>

Example:
Normalize palette contract to manifest SSoT and remove tool-level schema drift - PR 10.6B

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
4. Have Codex package a repo-structured ZIP
5. Return only the Codex command, commit comment, and how to test

Do not ask for confirmation unless ambiguity exists.

OUTPUT FORMAT (STRICT)

When producing repo workflow guidance:

- DO NOT create a downloadable ZIP
- DO output only:
  - Codex command
  - commit comment
  - how to test the change
- Keep chat response minimal

Codex must place detailed content in the ZIP, including:
- docs/pr/*
- docs/dev/codex_commands.md
- docs/dev/commit_comment.txt
- docs/dev/reports/*

ZIP STANDARD (ENFORCED)

- Exactly one ZIP per request
- ZIP name MUST match PR name
- ZIP path MUST be:
  <project folder>/tmp/<PR_NAME>.zip
- Internal structure MUST be repo-relative only
- No extra files outside defined structure

Commit Comment:
<description> - <PR info>

---

## 🔧 ZIP DELIVERY VALIDATION (MANDATORY)

Before Codex returns any ZIP, Codex MUST:

1. Physically create the ZIP file  
2. Verify the file exists on disk  
3. Verify file size > 0  
4. List contents to confirm correct repo structure  
5. Use a NEW filename for every attempt (no reuse)  
6. Place ZIP under <project folder>/tmp/  
7. Never reuse a previous file handle or path  

---

## 📦 ZIP NAMING PATTERN (ENFORCED)

All ZIP files MUST follow:

PR_<major>_<minor>_<timestamp>.zip

Example:
PR_10_6X_20260427_01.zip

---

## 🚫 DELIVERY CONSTRAINTS

- Use shortest possible valid filename  
- Avoid nested paths  
- Avoid large payloads when possible  
- Exactly one ZIP per response  

---

## 🛑 FAILURE HANDLING (MANDATORY)

If ZIP delivery fails more than once:

- Do NOT retry with same name  
- Generate a new filename with timestamp  
- Rebuild ZIP from scratch  
- If still failing, STOP and provide inline content for manual application  

---

## 🔒 EXECUTION DEFAULTS (MANDATORY)

### ALWAYS CONTINUE
- Never pause for confirmation
- Never present optional branches
- Always proceed to the next logical step

### NO COMMIT-ONLY PRs
- Roadmap lives at: docs\dev\roadmaps\MASTER_ROADMAP_ENGINE.md
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

---

## Productization Rules
- Do not create standalone showcase tracks in future roadmaps
- Fold showcase importance into the main feature or sample title when needed

---

## Roadmap Instruction Move Guards
- If roadmap content is moved to `PROJECT_INSTRUCTIONS.md`, move it and do not delete it without relocation.
- Ensure destination text exists before removing the source text.
- Preserve wording unless the PR explicitly requires rewriting.
- Keep roadmap handling status-only unless explicitly requested otherwise.
- Do not delete roadmap content during cleanup work.
- Do not modify roadmap content during cleanup work.
- Only update status [ ] [.] [x] in roadmap content during cleanup work.

---

## EXECUTION EFFICIENCY

- Bundle PRs whenever it is safe and testable to reduce overall timeline and churn.
- Prefer fewer, higher-quality PR bundles over many small retries
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


- Full samples smoke test takes ~20 minutes.
- DO NOT run full samples test by default.

- Run full samples test ONLY when:
  - shared sample loader/framework is modified
  - change impacts multiple samples broadly
  - correctness cannot be verified with targeted tests

- Prefer targeted validation:
  - syntax checks for changed files
  - run only affected samples
  - run tool-specific tests when available

- Every PR must document:
  - whether full samples test was skipped or run
  - reason for decision
---

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

---

## Codex Anti-Pattern Guard

These rules are mandatory for every Codex BUILD execution:

- One concept = one name.
- Do not introduce alias variables or remapping chains such as `name1` -> `nameA`.
- Do not create pass-through variables that only copy another variable.
- Do not create `a` -> `b` -> `c` assignment chains.
- Only introduce a variable when it transforms data, improves a complex expression, or is required for control flow.
- Preserve existing meaningful names unless a rename is required for correctness and is applied consistently.
- Do not add abstraction layers, helper functions, or broad refactors unless the BUILD explicitly requires them.
- Do not change unrelated files.
- Before finishing, review the diff and remove unused, redundant, pass-through, or alias variables.

---

## Current Recovery Lane

The active UAT lane is opening Workspace Manager from a `games/index.html` game tile.
Treat this as a recovery/stabilization PR only. Do not expand into a broader games hub, tool registry, template, or roadmap rewrite.

---

## ARRAY FORMATTING RULE

- Primitive-only arrays in JSON must use compact grouped formatting.
- Primitive values are: string, number, boolean, and null.
- Valid compact form example:
  `[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]`
- Do not compact arrays of objects, nested arrays, or complex structures.
- Do not change JSON contracts or semantics while applying array formatting.
