MODEL: GPT-5.4
REASONING: high

COMMAND:
Create BUILD_PR_DEBUG_INSPECTOR_TOOLS

Scope:
- add state inspector tool
- add replay visualizer tool
- add basic performance profiler
- integrate with tool host

Validation:
- npm run test:launch-smoke -- --tools
- verify tools launch and inspect data

Output:
<project>/tmp/BUILD_PR_DEBUG_INSPECTOR_TOOLS_delta.zip
