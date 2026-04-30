# CODEX COMMANDS

Model: GPT-5.3-codex
Reasoning: high

STRICT SCOPE MODE

ALLOWED FILES:
- tools/workspace-manager/main.js
- docs/dev/reports/svg_asset_none_trace_11_155.txt

TASK:

1. Open:
   tools/workspace-manager/main.js

2. Trace the exact code path that renders:
   Asset: none

3. Search for:
   - "Asset: none"
   - "none"
   - assetLabel
   - assetSummary
   - svg-asset-studio
   - vectorAssetDocument
   - card render
   - row render
   - status render

4. Identify the active branch used by the Workspace Manager card.

5. Patch only that branch for `svg-asset-studio` so it reads:
   workspaceManifest.tools["svg-asset-studio"].vectorAssetDocument.sourceName

   If sourceName is missing but svgText exists, show:
   Inline SVG

6. Do NOT:
   - modify schemas
   - modify samples
   - modify SVG Asset Studio
   - modify runtime
   - add fallback/default/demo data
   - transform/wrap/normalize payload
   - change unrelated tools

7. Validate:
   - JS syntax for tools/workspace-manager/main.js
   - active render path uses vectorAssetDocument
   - expected visible label is not "Asset: none"
   - git diff --name-only contains only ALLOWED FILES

8. Write:
   docs/dev/reports/svg_asset_none_trace_11_155.txt

Report must include:
- exact old function/branch
- exact new function/branch
- why previous PRs missed it
- expected rendered text
- validation result
- strict scope confirmation

9. Package Codex output ZIP at:
   tmp/PR_11_155_TRACE_SVG_ASSET_NONE_SOURCE.zip
