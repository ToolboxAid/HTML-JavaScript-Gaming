MODEL: GPT-5.3-codex
REASONING: high

COMMAND:
Implement BUILD_PR_LEVEL_11_1_AUTHORITATIVE_APPLY_GUARD.

Modify ONLY:
src/advanced/state/transitions.js

Change:
- Wrap authoritativeApply calls with:
  if (context && context.authoritative === true)

Do NOT:
- change APIs
- refactor unrelated logic

Validation:
- Passive mode does not invoke authoritativeApply
- Existing tests pass

Output:
<project folder>/tmp/BUILD_PR_LEVEL_11_1_AUTHORITATIVE_APPLY_GUARD.zip
