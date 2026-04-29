MODEL: GPT-5.3-codex
REASONING: medium

TASK:
Apply PR 11.35.

Update tool descriptions for:
- Vector Asset Studio
- Vector Map Editor

Ensure descriptions reflect:

Vector Asset Studio:
"Create and edit reusable vector (SVG) assets. Build shapes, icons, and asset components."

Vector Map Editor:
"Place and arrange vector assets in space. Build layouts, scenes, and maps."

Apply updates to:
- tool manifest metadata
- Workspace Manager tile description
- tool header description
- fullscreen description binding

Do NOT:
- rename tools
- change logic
- change payload behavior
- modify schema

Also produce report:
docs/dev/reports/PR_11_35_vector_tool_naming_recommendation.txt

Include:
- suggested improved names
- reasoning

Validation:
node --check tools/shared/platformShell.js

Manual:
Open Workspace Manager
Confirm descriptions clearly differentiate tools
