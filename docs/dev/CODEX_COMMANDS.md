MODEL: GPT-5.4
REASONING: high

COMMAND:
Create BUILD_PR_TOOLS_SHARED_EXTRACTION_PHASE_2

Scope:
- extract shared event + command helpers
- extract safe UI utilities
- reuse tools/shared first
- minimal changes
- no theme work
- no editor-state extraction

Validation:
- npm run test:launch-smoke -- --tools
- report files changed

Output:
<project>/tmp/BUILD_PR_TOOLS_SHARED_EXTRACTION_PHASE_2_delta.zip
