MODEL: GPT-5.4
REASONING: high

COMMAND:
Create BUILD_PR_PROJECT_TOOL_INTEGRATION

Scope:
- unify project model across tools
- normalize asset references
- minimal adapters

Validation:
- npm run test:launch-smoke -- --tools
- verify project works across tools

Output:
<project>/tmp/BUILD_PR_PROJECT_TOOL_INTEGRATION_delta.zip
