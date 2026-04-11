MODEL: GPT-5.4
REASONING: high

COMMAND:
Create BUILD_PR_TOOL_HOST_STATE_HANDOFF

Scope:
- add shared context for tools
- allow optional state passing
- minimal changes

Validation:
- npm run test:launch-smoke -- --tools
- verify state handoff works

Output:
<project>/tmp/BUILD_PR_TOOL_HOST_STATE_HANDOFF_delta.zip
