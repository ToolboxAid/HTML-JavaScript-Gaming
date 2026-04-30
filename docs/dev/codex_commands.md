# CODEX COMMANDS

Model: GPT-5.3-codex
Reasoning: high

STRICT SCOPE MODE

ALLOWED FILES:
- tools/svg-asset-studio/main.js
- docs/dev/reports/svg_asset_studio_hosted_payload_boot_11_152.txt

ALLOWED CHANGES:
- fix SVG Asset Studio hosted direct payload boot
- create/update report only

TASK:

1. Open:
   tools/svg-asset-studio/main.js

2. Find hosted launch/shared context input path.

3. Ensure hosted Workspace Manager payload is read as:
   payloadJson.vectorAssetDocument

4. Ensure editor load/render source uses:
   - payloadJson.vectorAssetDocument.svgText
   - payloadJson.vectorAssetDocument.sourceName
   - payloadJson.vectorAssetDocument.editorOptions

5. For hosted direct payload flow:
   - do not require samplePresetPath
   - do not require import path
   - do not fallback to demo SVG
   - do not show old preset/import message when valid payload exists

6. Do NOT:
   - modify schemas
   - modify Sample 1902 JSON
   - modify Workspace Manager
   - modify tool host runtime
   - add fallback/demo/default SVG
   - transform/wrap/normalize payload

7. Validate:
   - JS syntax for tools/svg-asset-studio/main.js
   - direct hosted payload containing vectorAssetDocument.svgText loads into editor state
   - sourceName sample-0901-ship.svg is recognized
   - git diff --name-only contains only ALLOWED FILES

8. Write:
   docs/dev/reports/svg_asset_studio_hosted_payload_boot_11_152.txt

Report must include:
- old boot path found
- new direct hosted payload path
- sourceName/svgText verified
- validation result
- strict scope confirmation
- remaining blockers if any

9. Package Codex output ZIP at:
   tmp/PR_11_152_FIX_SVG_ASSET_STUDIO_HOSTED_PAYLOAD_BOOT.zip
