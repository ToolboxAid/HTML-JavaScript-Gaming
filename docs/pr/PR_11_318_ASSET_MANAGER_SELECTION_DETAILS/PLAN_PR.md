# PLAN_PR_11_318

## Purpose
Add selection UX to Asset Manager V2 so users can select an asset row and inspect explicit details without mutating session payload data.

## Scope
- `tools/asset-manager-v2/index.html`
- `tools/asset-manager-v2/index.js`
- `docs/dev/reports/PR_11_318_report.md`
- `docs/dev/codex_commands.md`
- `docs/dev/commit_comment.txt`

## Steps
1. Add minimal details panel fields for id/label/kind/path.
2. Track selected asset id in UI-only runtime state.
3. Highlight selected asset row visually.
4. Show exact default message when nothing is selected.
5. Keep selection state non-persistent and payload/session unchanged by selection.
6. Run targeted syntax validation for changed JS.
