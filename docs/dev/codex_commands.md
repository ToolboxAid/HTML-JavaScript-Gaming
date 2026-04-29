MODEL: GPT-5.3-codex
REASONING: high

TASK:
Apply PR 11.28.

Starting from the current `4dc2b0f`-based recovery state, fix the remaining launch dependency issue:
- Workspace Manager shows full sample 1902 workspace.
- Vector Map can be clicked.
- Vector Map opens but says palette is missing.
- Most other palette-dependent tools are still grayed out.

Do NOT restart the failed PR 11.23/11.25 approach.
Do NOT collapse the workspace to palette-only.
Do NOT add hardcoded or hidden fallback data.
Do NOT require selectedAssetId, assetRegistry, or external file references when embedded payload exists.

Required behavior:
- Workspace Manager child launches must include or resolve shared workspace palette payload from the same sample-owned JSON already loaded for sample 1902.
- `manifest.tools.palette` should satisfy the shared palette dependency for child tools.
- `manifest.tools[toolId]` should satisfy the tool's own embedded payload dependency.
- Palette-dependent tools should be enabled when both their own payload and the shared palette payload exist.
- True utilities can remain N/A or disabled only with documented reason.

Implementation guidance:
1. Find the child tool launch/context handoff code in tools/shared/platformShell.js or directly related Workspace Manager code.
2. Find where Vector Map reports palette missing.
3. Connect that missing dependency to the workspace manifest palette payload, not to a default or external asset.
4. Adjust disabled-state logic so palette-dependent payload tools are not blocked when `manifest.tools.palette` exists.
5. Keep palette fallback local to dependency satisfaction, not workspace tool-list selection.
6. Add no broad refactor.

Validation:
node --check tools/shared/platformShell.js
node ./tests/runtime/LaunchSmokeAllEntries.test.mjs --samples --sample-range=1902-1902 --tools

Manual validation:
Open sample 1902.
Open Workspace Manager.
Click Vector Map Editor.
Confirm:
- no missing palette message
- vector map opens with palette context
Return to Workspace Manager.
Confirm palette-dependent tools with embedded payload are enabled/openable.

REPORT:
Write docs/dev/reports/PR_11_28_validation.txt with:
- changed files
- root cause of missing palette message
- how shared palette handoff now works
- which buttons remain disabled and why, if any
- validation command results
