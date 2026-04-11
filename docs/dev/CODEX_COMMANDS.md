MODEL: GPT-5.4
REASONING: high

COMMAND:
Create BUILD_PR_TOOL_HOST_MULTI_SWITCH

Scope:
- add multi-tool switching to host
- enforce lifecycle correctness
- minimal UI

Validation:
- npm run test:launch-smoke -- --tools
- verify switching works

Output:
<project>/tmp/BUILD_PR_TOOL_HOST_MULTI_SWITCH_delta.zip
