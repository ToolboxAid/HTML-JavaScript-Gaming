# Start Session

## Objective
Start a focused work session using the standard PR flow:
PLAN_PR → BUILD_PR → APPLY_PR

---

## Steps

### 1. Confirm scope
- What feature/system are we working on?

### 2. Create PLAN_PR
Include:
- Title
- Goal
- Scope (what is included)
- Non-goals (what is excluded)

### 3. Build
- Implement only what is defined in PLAN_PR
- Keep changes small and surgical
- Do not mix multiple concerns

### 4. Apply
- Review using checklist
- Commit with clear message
- Move to next PR

---

## Rules

- Never edit OLD folders (read-only reference)
- Build in NEW structure only
- Delete OLD only after full replacement
- Always return zip with only changed files
- Always provide codex command for me to exicute
- When zip or codex command is provided, provide commit comment
- Use website colors: #7a00df and #ed9700 (make the colors as part of a theme)

---

## Typical first PR

**Title:** Bootstrap structure and engine core boundaries

**Goal:**
Establish clean folder structure and minimal engine foundation.

**Include:**
- engine/core, input, render, utils
- samples/ categories
- docs index updates
- minimal engine entry

**Exclude:**
- game migrations
- assets
- complex systems
