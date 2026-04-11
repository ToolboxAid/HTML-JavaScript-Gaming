MODEL: GPT-5.4
REASONING: high

COMMAND:
Create BUILD_PR_TOOLS_BOOT_CONTRACT_NORMALIZATION

Scope:
- normalize tool boot/init contract
- minimal adapters only
- no UI/styling changes
- no editor state refactor

Validation:
- npm run test:launch-smoke -- --tools
- verify all tools launch

Output:
<project>/tmp/BUILD_PR_TOOLS_BOOT_CONTRACT_delta.zip
