# CODEX COMMANDS

Model: GPT-5.3-codex
Reasoning: medium

STRICT SCOPE MODE

ALLOWED FILES:
- tools/vector-map-editor/main.js
- docs/dev/reports/vector_map_workspace_object_render_11_150.txt

ALLOWED CHANGES:
- fix Vector Map Editor to render direct `payloadJson.vectorMapDocument.objects`
- create/update report only

TASK:

1. Open:
   tools/vector-map-editor/main.js

2. Find the input ingestion/render source for hosted Workspace Manager launches.

3. Ensure Vector Map Editor uses direct payload shape:
   payloadJson.vectorMapDocument

4. Ensure render source is:
   payloadJson.vectorMapDocument.objects

5. Do NOT:
   - modify schemas
   - modify Sample 1902 JSON
   - modify Workspace Manager
   - modify runtime
   - add fallback/demo objects
   - transform/wrap/normalize payload

6. Validate:
   - JS syntax for tools/vector-map-editor/main.js
   - Sample 1902 Workspace Manager → Vector Map Editor renders:
     obj-player-path
     obj-hazard-zone
   - git diff --name-only contains only ALLOWED FILES

7. Write:
   docs/dev/reports/vector_map_workspace_object_render_11_150.txt

Report must include:
- file changed
- exact input path used
- objects verified
- validation result
- strict scope confirmation
- remaining blockers if any

8. Package Codex output ZIP at:
   tmp/PR_11_150_FIX_WORKSPACE_VECTOR_MAP_DIRECT_OBJECT_RENDER.zip
