# CODEX COMMANDS

Model: GPT-5.3-codex
Reasoning: medium

STRICT SCOPE MODE

ALLOWED FILES:
- tools/workspace-manager/main.js
- docs/dev/reports/workspace_svg_asset_status_label_11_153.txt

ALLOWED CHANGES:
- fix only SVG Asset Studio Workspace Manager card/status label
- create/update report

TASK:

1. Open:
   tools/workspace-manager/main.js

2. Find card/status label logic for:
   svg-asset-studio

3. Update it to read direct payload:
   workspaceManifest.tools["svg-asset-studio"].vectorAssetDocument.sourceName

4. Display a useful label:
   Asset: sample-0901-ship.svg

5. Do NOT:
   - modify schemas
   - modify samples
   - modify SVG Asset Studio
   - modify runtime
   - transform/wrap/normalize payload
   - broaden unrelated tool logic

6. Validate:
   - JS syntax for tools/workspace-manager/main.js
   - Sample 1902 Workspace Manager card for SVG Asset Studio does not show Asset: none
   - git diff --name-only contains only ALLOWED FILES

7. Write:
   docs/dev/reports/workspace_svg_asset_status_label_11_153.txt

Report must include:
- changed file
- old/new label behavior
- validation result
- strict scope confirmation

8. Package Codex output ZIP at:
   tmp/PR_11_153_FIX_WORKSPACE_SVG_ASSET_STATUS_LABEL.zip
