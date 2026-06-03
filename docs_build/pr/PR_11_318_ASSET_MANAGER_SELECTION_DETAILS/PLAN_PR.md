# PLAN_PR_11_318

## Purpose
Add selection UX to Asset Manager V2 so users can select an asset row and inspect explicit details without mutating session payload data.

## Scope
- `toolbox/asset-manager-v2/index.html`
- `toolbox/asset-manager-v2/index.js`
- `docs_build/dev/reports/PR_11_318_report.md`
- `docs_build/dev/codex_commands.md`
- `docs_build/dev/commit_comment.txt`

## Steps
1. Add minimal details panel fields for id/label/kind/path.
2. Track selected asset id in UI-only runtime state.
3. Highlight selected asset row visually.
4. Show exact default message when nothing is selected.
5. Keep selection state non-persistent and payload/session unchanged by selection.
6. Run targeted syntax validation for changed JS.
