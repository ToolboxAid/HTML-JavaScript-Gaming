MODEL: GPT-5.4
REASONING: high

COMMAND:
Create BUILD_PR_TOOL_HOST_FOUNDATION as the next follow-up to tool boot contract normalization.

Scope:
- add a minimal Tool Host foundation
- dynamic load path for normalized tools
- mount/unmount lifecycle handling
- lightweight registry/manifest
- preserve standalone tool pages
- no theme restyling
- no editor-state refactors
- no render-pipeline changes
- do not touch templates/ cleanup in this PR

Validation:
- npm run test:launch-smoke -- --tools
- verify host shell loads selected tool
- verify standalone tool pages still launch
- report exact files changed

Output:
<project folder>/tmp/BUILD_PR_TOOL_HOST_FOUNDATION_delta.zip
