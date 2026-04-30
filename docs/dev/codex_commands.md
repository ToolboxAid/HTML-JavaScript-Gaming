# CODEX COMMANDS

Model: GPT-5.3-codex
Reasoning: high

STRICT SCOPE MODE

ALLOWED FILES:
- tools/vector-map-editor/main.js
- docs/dev/reports/vector_map_hosted_payload_boot_11_151.txt

ALLOWED CHANGES:
- fix Vector Map Editor hosted direct payload boot
- create/update report only

TASK:

1. Open:
   tools/vector-map-editor/main.js

2. Find boot/init logic that shows:
   `No map objects loaded. Import a map JSON file or launch with a sample preset path.`

3. Find hosted launch/shared context input path.

4. Ensure hosted Workspace Manager payload is read as:
   payloadJson.vectorMapDocument

5. Ensure editor state/render source uses:
   payloadJson.vectorMapDocument.objects

6. For hosted direct payload flow:
   - do not require samplePresetPath
   - do not require import path
   - do not fallback to empty map
   - do not show old preset-path message when valid payload exists

7. Do NOT:
   - modify schemas
   - modify Sample 1902 JSON
   - modify Workspace Manager
   - modify tool host runtime
   - add fallback/demo/default objects
   - transform/wrap/normalize payload

8. Validate:
   - JS syntax for tools/vector-map-editor/main.js
   - direct hosted payload containing obj-player-path and obj-hazard-zone loads into editor state
   - old no-map message is not shown for valid hosted payload
   - git diff --name-only contains only ALLOWED FILES

9. Write:
   docs/dev/reports/vector_map_hosted_payload_boot_11_151.txt

Report must include:
- old boot path found
- new direct hosted payload path
- objects verified
- validation result
- strict scope confirmation
- remaining blockers if any

10. Package Codex output ZIP at:
   tmp/PR_11_151_FIX_VECTOR_MAP_HOSTED_PAYLOAD_BOOT.zip
