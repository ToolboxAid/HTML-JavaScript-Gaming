# CODEX COMMANDS

Model: GPT-5.3-codex
Reasoning: high

STRICT SCOPE MODE

ALLOWED FILES:
- tools/workspace-manager/main.js

TASK:

1. Find detection logic for svg-asset-studio

2. Replace detection with:

if (tools["svg-asset-studio"]?.vectorAssetDocument?.svgText)

3. Use sourceName for label

4. DO NOT change other tools

5. VERIFY:
- detection works
- no "none"

REPORT:
docs/dev/reports/svg_payload_detection_fix_11_154.txt

FAIL if still not detected
