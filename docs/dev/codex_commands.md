MODEL: GPT-5.3-codex
REASONING: low

TASK:
Apply PR 11.31.

Locate the PREV/NEXT navigation label rendering in Workspace Manager.

Update styling for the tool name text:
- increase font size (e.g., 1.2x–1.4x current or equivalent px/em bump)
- set color to #3600af

Do NOT:
- change navigation logic
- change payload logic
- change layout containers
- add new components

Validation:
node --check tools/shared/platformShell.js

Manual:
Open Workspace Manager
Verify PREV/NEXT tool name:
- larger font
- color #3600af
