# CODEX COMMANDS

Model: GPT-5.3-codex
Reasoning: high

STRICT SCOPE MODE

ALLOWED FILES:
- tools/workspace-manager/main.js
- docs/dev/reports/workspace_tile_summary_display_model_11_157.txt

ALLOWED CHANGES:
- fix Workspace Manager tile/card summary display model for svg-asset-studio only
- create/update report only

TASK:

1. Open:
   tools/workspace-manager/main.js

2. Find the final tile/card display model that renders the visible line:
   Asset: none

3. Do NOT change loading. The data is already loaded.

4. Patch the display model for:
   toolId === "svg-asset-studio"

   It must use:
   workspaceManifest.tools["svg-asset-studio"].vectorAssetDocument.sourceName

   If sourceName is missing but svgText exists:
   Inline SVG

5. Ensure visible expected output:
   Asset: sample-0901-ship.svg

6. Do NOT:
   - modify schemas
   - modify Sample 1902 JSON
   - modify SVG Asset Studio
   - modify tool host runtime
   - modify launch/routing behavior
   - add fallback/default/demo data
   - transform/wrap/normalize payload

7. Validate:
   - node --check tools/workspace-manager/main.js
   - static trace shows display model maps vectorAssetDocument.sourceName to Asset line
   - git diff --name-only contains only ALLOWED FILES

8. Write:
   docs/dev/reports/workspace_tile_summary_display_model_11_157.txt

Report must include:
- exact function/branch changed
- old source for Asset: none
- new source for SVG label
- expected rendered text
- validation result
- strict scope confirmation

9. Package Codex output ZIP at:
   tmp/PR_11_157_FIX_WORKSPACE_TILE_SUMMARY_DISPLAY_MODEL.zip
