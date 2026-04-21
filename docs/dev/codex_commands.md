MODEL: GPT-5.3-codex
REASONING: medium

COMMAND:
Create BUILD_PR_TOOL_HOST_SEAMLESS_IFRAME_PARITY.

Refactor Tool Host so opening a tool in host feels visually equivalent to opening the tool directly, except for compact host controls/help inside the collapsible imported section.

Requirements:
- iframe-hosted tool should use the available workspace as if opened directly
- remove obvious host chrome/wrappers that make hosted mode visibly different
- keep Tool Host HTML minimal
- host-specific UI should live only in the collapsible imported section
- collapsing that section should make the hosted tool appear nearly identical to direct launch
- optional small fullscreen button is allowed, but do not depend on browser fullscreen as the main solution
- preserve Open In Host behavior
- preserve direct launch behavior
- no inline styles
- no embedded style blocks
- no JS style-string injection
- no color/token changes
- no unnecessary per-tool hacks

Outputs:
- repo-structured ZIP at <project folder>/tmp/BUILD_PR_TOOL_HOST_SEAMLESS_IFRAME_PARITY.zip
- docs/pr/BUILD_PR_TOOL_HOST_SEAMLESS_IFRAME_PARITY.md
- docs/dev/codex_commands.md
- docs/dev/commit_comment.txt
- docs/dev/reports/validation_checklist.txt

Roadmap:
- update status only if execution-backed
- status-only roadmap edits only
