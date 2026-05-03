# PLAN_PR_11_318B

## Purpose
Add the first Playwright browser UI test that validates Workspace V2 launching Asset Manager V2 and performing add/remove asset behavior with export verification.

## Scope
- `tests/ui/workspace-v2.asset-manager.spec.js`
- `docs/dev/reports/PR_11_318B_report.md`
- `docs/dev/codex_commands.md`
- `docs/dev/commit_comment.txt`

## Steps
1. Add a single Playwright spec for Workspace V2 → Asset Manager V2 flow.
2. Use accessible selectors and existing ids.
3. Perform add/remove asset assertions in Asset Manager V2.
4. Return to Workspace V2 and assert exported manifest contains `asset-001` and excludes `asset-002`.
5. Run targeted syntax check + targeted Playwright spec only.
