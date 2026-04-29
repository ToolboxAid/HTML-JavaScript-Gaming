MODEL: GPT-5.3-codex
REASONING: high

TASK:
Apply PR 11.27.

Reset the working recovery baseline to:

4dc2b0f: Show Workspace Manager asset status from embedded tool payloads - PR 11.22

Use that as the source of truth because it loaded the JSON and displayed the correct full Workspace Manager workspace.

Then fix ONLY the remaining issue:
- many Workspace Manager tool buttons are grayed out/disabled even though embedded payload data exists.

Do NOT carry forward today's failed changes unless independently required and verified:
- do not reapply PR 11.23 binding/cache behavior that caused palette-only
- do not reapply PR 11.25 forward-fix behavior that still failed
- do not remove payload fan-out
- do not collapse visible tools to palette-only

Do NOT restore or change PR 11.24 page cleanup unless it already exists after resetting. The priority is Workspace Manager correctness from 4dc2b0f.

Implementation guidance:
1. Inspect Workspace Manager/tool launch button disabled logic.
2. Compare status-display rules from 4dc2b0f with button-enable rules.
3. Make enablement consider embedded payload presence as valid launch data.
4. Keep utility tools handled separately as N/A where appropriate.
5. Avoid selectedAssetId/assetRegistry/external-file requirements for embedded-payload tools.
6. Keep the fix surgical and localized.

Validation:
node --check tools/shared/platformShell.js
node ./tests/runtime/LaunchSmokeAllEntries.test.mjs --samples --sample-range=1902-1902 --tools

Manual validation:
Open sample 1902.
Open Workspace Manager.
Confirm:
- full workspace is visible
- not palette-only
- payload-backed editor buttons are enabled/openable
- asset/status labels are still visible

REPORT:
Write docs/dev/reports/PR_11_27_validation.txt with:
- baseline commit used
- files changed
- root cause of grayed-out buttons
- why payload presence now enables launch
- validation commands/results
- manual validation notes
