MODEL: GPT-5.3-codex
REASONING: high

COMMAND:
Implement BUILD_PR_LEVEL_11_1_EVENT_WHITELIST_GUARD.

Modify ONLY:
src/advanced/state/transitions.js

Change:
- Before emitting eventType, validate it exists in WORLD_GAME_STATE_EVENT_TYPES
- Reject if not present

Do NOT:
- change APIs
- refactor unrelated logic

Validation:
- Unknown event types rejected
- Existing tests pass

Output:
<project folder>/tmp/BUILD_PR_LEVEL_11_1_EVENT_WHITELIST_GUARD.zip
