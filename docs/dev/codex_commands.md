# CODEX COMMANDS

Model: GPT-5.3-codex
Reasoning: medium

STRICT SCOPE MODE

ALLOWED FILES:
- tools/workspace-manager/main.js
- docs/dev/reports/workspace_direct_payload_card_status_11_149.txt

ALLOWED CHANGES:
- update Workspace Manager card/status/presence detection for direct payload entries
- create/update report

TASK:

1. Open:
   tools/workspace-manager/main.js

2. Find card/status/presence logic that displays:
   - Asset: none
   - Asset: N/A
   - Palette: none
   for loaded workspace tools.

3. Update it so direct payload entries in:
   workspaceManifest.tools[toolId]
   populate the corresponding tool cards.

4. Use direct payload root fields only for labels.
   Do not mutate payloads.
   Do not wrap payloads.
   Do not infer missing data.

5. Ensure:
   - tools with valid direct payloads are active/available
   - missing/invalid payloads still show empty/error state
   - palette-browser displays direct palette `name`
   - launch still passes the same direct payload object

6. Do NOT modify:
   - schemas
   - samples
   - runtime host
   - routing outside Workspace Manager

7. Validate:
   - JS syntax for tools/workspace-manager/main.js
   - Sample 1902 Workspace Manager cards show populated labels for valid direct payload entries
   - no `tool/version/payload` wrapper restored
   - git diff --name-only contains only ALLOWED FILES

8. Write:
   docs/dev/reports/workspace_direct_payload_card_status_11_149.txt

Report must include:
- file changed
- card labels populated
- Sample 1902 verification
- validation result
- strict scope confirmation
- remaining blockers if any

9. Package Codex output ZIP at:
   tmp/PR_11_149_WORKSPACE_MANAGER_DIRECT_PAYLOAD_CARD_STATUS.zip
