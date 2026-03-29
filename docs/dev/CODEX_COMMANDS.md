MODEL: GPT-5.3-codex
REASONING: high

codex.run:
- Create modules/integration/systemIntegration.js
- Create modules/integration/integrationContracts.js
- Create modules/integration/integrationRegistry.js

- Ensure no direct system-to-system imports
- Use only event pipeline and public APIs
- No behavior changes

FINAL STEP:
- Package all changes into a delta ZIP
- Output: /tmp/BUILD_PR_LEVEL_10_5_SYSTEM_INTEGRATION_LAYER_delta.zip
- Preserve repo-relative structure
- Include only relevant files
