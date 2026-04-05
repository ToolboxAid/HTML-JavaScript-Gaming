# RULES OF ENGAGEMENT

## 1. Workflow (MANDATORY)
Always follow:

PLAN_PR → BUILD_PR → APPLY_PR

- Do not skip steps
- One PR per purpose
- Docs-first unless explicitly BUILD/APPLY

---

## 2. Responsibilities

### ChatGPT
- Designs, plans, and produces PR bundles (ZIP)
- NEVER writes implementation code unless explicitly asked
- Focuses on architecture, structure, and correctness

### Codex
- Writes ALL implementation code
- Executes BUILD_PR and APPLY_PR
- Modifies repo files

---

## 3. Repo Constraints

- No engine core changes unless explicitly approved
- Prefer sample-level integration
- Avoid tight coupling between engine and tools
- Normalize toward GameBase-style architecture

---

## 4. File & Output Rules

- All PR outputs must be packaged as ZIP
- Output path:
  <project>/tmp/<ZIP_NAME>.zip

- ZIP must:
  - Preserve repo-relative structure
  - Include ONLY files relevant to the PR
  - Contain NO build artifacts or unrelated files

---

## 5. Documentation Rules

- PR docs → docs/pr/
- Dev commands → docs/dev/codex_commands.md
- Commit comment → docs/dev/commit_comment.txt (NO HEADER)
- Reports → docs/dev/reports/

---

## 6. Architecture Principles

- Tools → Contracts → Runtime → Debug → Visual
- Clear separation of concerns
- No duplication of runtime logic
- Reuse existing systems before creating new ones

---

## 7. Debug System Rules

- Debug features must be:
  - isolated
  - toggleable
  - non-invasive

- Input must not conflict with browser or gameplay
- Debug UI must render AFTER gameplay

---

## 8. Codex Execution Rules

All Codex commands must include:

MODEL: GPT-5.x-codex  
REASONING: high  

Must specify:
- files to create/update
- constraints
- packaging path

---

## 9. Quality Bar

Every PR must:
- be minimal and surgical
- avoid breaking runtime
- avoid duplication
- be easy to validate

---

## 10. Session Continuity

Always use:
- SESSION_CONTEXT.md
- CURRENT_STATE.md
- NEXT_STEPS.md
- RULES_OF_ENGAGEMENT.md

to resume work