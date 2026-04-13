MODEL: GPT-5.3-codex
REASONING: high

COMMAND:
Implement BUILD_PR_LEVEL_11_1_STATE_CONTRACT_FINALIZATION.

Modify ONLY:
src/advanced/state/transitions.js

Change:
- Enforce normalized structure for worldState mutations
- Reject malformed payloads early

Validation:
- No undefined state fields
- Tests pass

Output:
<project folder>/tmp/BUILD_PR_LEVEL_11_1_STATE_CONTRACT_FINALIZATION.zip
