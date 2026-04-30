# CODEX COMMANDS

Model: GPT-5.3-codex
Reasoning: high

STRICT SCOPE MODE

ALLOWED FILES:
- tools/workspace-manager/main.js
- docs/dev/reports/literal_asset_none_renderer_11_158.txt

TASK:

1. Open:
   tools/workspace-manager/main.js

2. Search for every occurrence of:
   - Asset:
   - none
   - textContent
   - innerHTML
   - appendChild
   - assetLabel
   - assetStatus
   - assetSummary
   - svg-asset-studio

3. Identify the exact active branch that creates the visible line:
   Asset: none

4. Patch that branch so when:
   workspaceManifest.tools["svg-asset-studio"].vectorAssetDocument.svgText
   exists, the visible output is:
   Asset: sample-0901-ship.svg
   or:
   Asset: Inline SVG

5. If the active branch cannot be proven statically, add a temporary diagnostic that fires ONLY when:
   svg-asset-studio renders Asset: none

6. DO NOT:
   - modify schemas
   - modify samples
   - modify SVG Asset Studio
   - modify runtime host
   - modify unrelated tools
   - add fallback/default/demo data
   - transform/wrap/normalize payload

7. Validate:
   - node --check tools/workspace-manager/main.js
   - git diff --name-only contains only ALLOWED FILES

8. Write:
   docs/dev/reports/literal_asset_none_renderer_11_158.txt

Report MUST include:
- exact occurrences searched
- exact old branch
- exact new branch
- expected visible output
- diagnostic status
- why prior PRs missed it
- validation result

9. Package Codex output ZIP at:
   tmp/PR_11_158_FORCE_FIX_LITERAL_ASSET_NONE_RENDERER.zip
