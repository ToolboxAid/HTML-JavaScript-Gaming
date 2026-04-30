# CODEX COMMANDS

Model: GPT-5.3-codex
Reasoning: medium

STRICT SCOPE MODE

ALLOWED FILES:
- tools/workspace-manager/main.js
- docs/dev/reports/workspace_tool_key_id_fix_11_148.txt

ALLOWED CHANGES:
- use workspace manifest `tools` object key as tool id
- remove requirement that direct payload entries contain `tool`
- create/update report

TASK:

1. Open:
   tools/workspace-manager/main.js

2. Find the logic that emits:
   tool-entry-missing-tool-id

3. Change Workspace Manager manifest parsing so:
   - the object key under `tools` is treated as the tool id
   - direct payload entries do NOT need `entry.tool`
   - direct payload entries do NOT need `entry.payload`

4. Keep:
   - registry lookup by tool id key
   - schema validation of the entry object against that tool schema
   - visible diagnostics for unavailable registry tools

5. Do NOT:
   - modify schemas
   - modify sample JSON
   - re-add wrappers
   - add compatibility fallback
   - transform payloads

6. Validate:
   - JS syntax for tools/workspace-manager/main.js
   - Sample 1902 direct manifest no longer causes `tool-entry-missing-tool-id`
   - git diff --name-only contains only ALLOWED FILES

7. Write:
   docs/dev/reports/workspace_tool_key_id_fix_11_148.txt

Report must include:
- changed file
- exact behavior changed
- validation command/result
- strict scope confirmation
- remaining blocker if any

8. Package Codex output ZIP at:
   tmp/PR_11_148_WORKSPACE_MANAGER_USE_TOOL_KEY_AS_ID.zip
