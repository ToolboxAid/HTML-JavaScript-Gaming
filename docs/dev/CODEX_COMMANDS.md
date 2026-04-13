MODEL: GPT-5.3-codex
REASONING: high

COMMAND:
Implement BUILD_PR_LEVEL_11_1_PASSIVE_MODE_GUARD.

Modify ONLY:
src/advanced/state/transitions.js

Change:
- Add guard to prevent authoritativeApply execution when in passive mode

Do NOT:
- change APIs
- refactor unrelated logic

Validation:
- Passive mode does not mutate state
- Existing tests pass

Output:
<project folder>/tmp/BUILD_PR_LEVEL_11_1_PASSIVE_MODE_GUARD.zip
