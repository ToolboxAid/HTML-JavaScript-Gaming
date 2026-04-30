# CODEX COMMANDS

Model: GPT-5.3-codex
Reasoning: high

STRICT SCOPE MODE

ALLOWED FILES:
- tools/workspace-manager/main.js
- docs/dev/reports/svg_card_render_source_11_156.txt

TASK:

1. Open:
   tools/workspace-manager/main.js

2. Find the final DOM/render path that creates visible card text:
   Vector Assets
   SVG Asset Studio
   Asset: none

3. Add a temporary console diagnostic for ONLY:
   toolId === "svg-asset-studio"

   Log:
   - tool id
   - active tool data object
   - workspaceManifest.tools["svg-asset-studio"]
   - workspaceManifest.tools["svg-asset-studio"].vectorAssetDocument
   - computed/rendered asset label

4. Use the diagnostic/static trace to patch the exact active render branch so:
   if directEntry.vectorAssetDocument.sourceName exists:
      Asset: <sourceName>
   else if directEntry.vectorAssetDocument.svgText exists:
      Asset: Inline SVG

5. Remove diagnostic before final output ONLY if the fix is statically confirmed.

6. If the active render branch cannot be proven:
   - keep diagnostic in place for one run
   - report exactly what console output the user must send back

7. Do NOT:
   - modify schemas
   - modify samples
   - modify SVG Asset Studio
   - modify runtime
   - add fallback/default/demo data
   - transform/wrap/normalize payload
   - change unrelated tools

8. Validate:
   - node --check tools/workspace-manager/main.js
   - git diff --name-only contains only ALLOWED FILES
   - report is populated

9. Write:
   docs/dev/reports/svg_card_render_source_11_156.txt

Report must include:
- exact function/branch changed
- diagnostic removed or intentionally left
- expected rendered text
- validation result
- strict scope confirmation

10. Package Codex output ZIP at:
   tmp/PR_11_156_INSTRUMENT_SVG_CARD_RENDER_SOURCE.zip
