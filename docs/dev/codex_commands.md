MODEL: GPT-5.3-codex
REASONING: medium

TASK:
Apply PR 11.30.

Move the Workspace Manager status/header fields into one shared render block/component so we can rearrange it later without hunting through scattered code.

Target visible content currently similar to:
Workspace
sample-0901-vector-map
shared workspace state synced
PREV
Parallax Scene Studio
NEXT
Workspace: Loaded
Shared Palette: Sample 1902 Workspace Palette
Shared Assets: No shared asset selected

Required behavior:
- Consolidate this into one render path/component/function.
- Preserve current working Workspace Manager behavior.
- Preserve full tool display.
- Preserve child tool launch/palette handoff behavior.
- Do not change payload schema.

Shared Assets rule:
- "Shared Assets: No shared asset selected" should not be shown as a permanent noisy status for sample 1902 if there is no shared selected asset concept.
- Show Shared Assets only when the workspace actually provides meaningful shared asset selection/data.
- Do not create fake shared assets.
- Do not use hidden defaults.
- Do not treat absent shared assets as an error.

Do NOT:
- change fullscreen title/description logic unless required by shared status rendering
- change workspace fan-out
- change button enablement
- change tool payload handoff
- touch start_of_day folders
- add broad refactors

Validation:
node --check tools/shared/platformShell.js
node ./tests/runtime/LaunchSmokeAllEntries.test.mjs --samples --sample-range=1902-1902 --tools

Manual validation:
Open sample 1902 -> Workspace Manager.
Confirm:
- workspace status/header content still appears
- Shared Palette shows Sample 1902 Workspace Palette
- Shared Assets does not show misleading permanent "No shared asset selected" unless the UI intentionally shows neutral optional status
- all expected tools still visible/openable

REPORT:
Write docs/dev/reports/PR_11_30_validation.txt with:
- changed files
- render block/function name
- Shared Assets display rule
- validation results
