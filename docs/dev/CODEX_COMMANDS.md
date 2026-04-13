MODEL: GPT-5.3-codex
REASONING: high

COMMAND:
Implement BUILD_PR_LEVEL_11_1_HANDOFF_VALIDATION_TIGHTEN.

Modify ONLY:
src/advanced/state/transitions.js

Apply EXACT replacements:

1. validateApplyScoreDelta:
- Introduce normalizedDelta = Number(payload.delta)
- Enforce Number.isFinite(normalizedDelta)
- Update reason to: applyScoreDelta requires finite numeric payload.delta.

2. validateAdvanceWave:
- Keep validation logic
- Update reason to: advanceWave requires finite amount > 0.

3. validateUpdateObjectiveProgress:
- Replace inline Number(...) checks with:
  normalizedCurrent
  normalizedTarget
- Enforce Number.isFinite on both
- Update reasons to finite numeric wording

Do NOT:
- change APIs
- modify apply functions
- refactor unrelated code
- scan unrelated files

Validation:
- All existing tests pass
- Handoff test rejects invalid numeric values

Output:
Return exactly one repo-structured ZIP at:
<project folder>/tmp/BUILD_PR_LEVEL_11_1_HANDOFF_VALIDATION_TIGHTEN.zip
