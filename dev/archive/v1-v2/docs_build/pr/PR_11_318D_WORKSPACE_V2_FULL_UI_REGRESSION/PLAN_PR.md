# PLAN_PR_11_318D

## Purpose
Expand Workspace V2 Playwright coverage into a full Asset Manager V2 regression scenario including launch, add/remove, validation errors, selection details, export integrity, and import round-trip.

## Scope
- `tests/ui/workspace-v2.asset-manager.spec.js`
- `docs_build/dev/reports/PR_11_318D_report.md`
- `docs_build/dev/codex_commands.md`
- `docs_build/dev/commit_comment.txt`

## Steps
1. Extend the existing UI test to cover Workspace startup baseline state.
2. Validate session-aware producer launch into Asset Manager V2.
3. Cover valid add, duplicate rejection, and blank-field rejection.
4. Validate selection/details panel behavior.
5. Validate removal behavior and status messaging.
6. Validate exported workspace manifest contract shape and content.
7. Validate import round-trip and Asset Manager reopen behavior from imported manifest.
8. Run targeted syntax check and targeted Playwright spec only.
