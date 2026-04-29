MODEL: GPT-5.3-codex
REASONING: medium

TASK:
Apply PR 11.29.

Fix fullscreen chrome/title binding so entering fullscreen shows:

<tool name> - <description>

instead of:

Configuration error (open title for details)

Use the active tool's real manifest metadata. Do not hardcode individual tool names/descriptions.

Do NOT:
- change fullscreen enter/exit mechanics
- change Workspace Manager payload fan-out
- change button enablement
- change sample 1902 data/schema
- add hidden defaults or fallback sample data
- touch start_of_day folders

Implementation guidance:
1. Find the fullscreen title/header/chrome rendering path.
2. Find where the configuration-error fallback is selected.
3. Trace the active tool ID used when fullscreen is entered.
4. Resolve tool display name and description from the same manifest/tool metadata source used by normal shell rendering.
5. Only use configuration-error fallback when metadata is genuinely invalid/missing.
6. Keep the change surgical.

Validation:
node --check tools/shared/platformShell.js
node ./tests/runtime/LaunchSmokeAllEntries.test.mjs --samples --sample-range=1902-1902 --tools

Manual validation:
Open sample 1902.
Open Workspace Manager.
Open a tool.
Enter fullscreen.
Confirm title area shows:
<tool name> - <description>
and not:
Configuration error (open title for details)

REPORT:
Write docs/dev/reports/PR_11_29_validation.txt with:
- changed files
- root cause
- metadata source used
- validation commands/results
- manual validation notes
