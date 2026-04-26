
# Codex Rules (MANDATORY — HARD CONSTRAINTS)

These rules OVERRIDE all other instructions.
If any rule is violated, the output is incorrect.

Codex must prefer the existing repo pattern over any new pattern, unless the PR explicitly says otherwise.

---

## CORE PRINCIPLES
- Follow the requested task EXACTLY. Do not expand scope.
- Produce the smallest valid change required.
- Prefer clarity, simplicity, and determinism.
- Do not introduce behavior that was not explicitly requested.

---

## NAMING
- One concept = one name
- Do NOT create alias variables
- Do NOT copy variables without transformation
- Do NOT rename variables unless required and consistent

---

## VARIABLES
- No temporary pass-through variables
- No a → b → c chains
- Only create variables for transformation, clarity, or control flow

---

## FUNCTION DESIGN
- Keep functions small and single-purpose
- Do NOT create helper functions unless reused or required
- No unnecessary abstraction

---

## REFACTORING
- Do NOT refactor unrelated code
- Do NOT restructure files unless instructed
- Do NOT rename files/folders unless required

---

## CONSISTENCY
- Use existing naming patterns
- Do NOT introduce new conventions
- Do NOT mix styles

---

## SCOPE CONTROL
- Do exactly what is requested — nothing more
- No feature creep, optimizations, or extras

---

## COMMENTS
- Only add when necessary or requested

---

## FILE CHANGES
- Modify ONLY specified files
- Do NOT create new files unless required

---

## OUTPUT
- Clean, usable code only
- No explanations unless requested

---

## ADDITIONAL ANTI-PATTERNS (STRICTLY FORBIDDEN)

### Naming / Data Flow
- No vague names (data, temp, obj, item, thing, value)
- No renaming same concept across files
- No adapter names unless required
- No duplicate state
- No stored derived state

### Scope Creep
- Do not fix unrelated bugs
- Do not clean unrelated files
- Do not modernize code unless asked
- Do not change APIs
- Do not change folder structure

### Control Flow
- No hidden fallbacks
- No silent error swallowing
- No broad truthy/falsy replacements
- No global flags for local behavior
- No magic strings/numbers

### Architecture
- No new frameworks/libraries
- No service layers/managers/factories unless asked
- No future-proofing abstractions
- No splitting files for style only

### UI / Navigation
- Do not change tile behavior unless requested
- Do not change routes/labels/IDs
- No duplicate launch paths
- Do not bypass navigation conventions

### Testing / Validation
- Must have concrete test path
- No fake validation claims
- Do not remove tests
- Do not weaken tests

### Repo Safety
- Do not modify start_of_day
- Do not delete legacy folders
- Do not change roadmap except status markers

### JavaScript
- No var
- No globals
- No mutation of shared config
- No implicit coercion
- No == or !=
- No unnecessary async
- No mixing DOM/business logic if separated
- No duplicate event listeners
- No attaching handlers in loops

---

## VALIDATION
- No alias variables
- No unnecessary variables
- No scope expansion
- Matches repo patterns
- Only requested changes made

Fix violations before output.

---

## PRIORITY
1. Correctness
2. These rules
3. Task instructions
4. Style

---

## FAILURE
If task requires breaking rules:
STOP and explain minimally
