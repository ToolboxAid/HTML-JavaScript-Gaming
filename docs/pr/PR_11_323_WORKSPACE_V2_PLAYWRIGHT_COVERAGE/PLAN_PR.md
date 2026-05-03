# PLAN_PR_11_323

## Purpose
Add broader Workspace V2 Playwright coverage beyond Asset Manager-focused flow, using tests-only changes.

## Scope
- `tests/playwright/workspace-v2.validation.spec.js`
- `docs/pr/PR_11_323_WORKSPACE_V2_PLAYWRIGHT_COVERAGE/PLAN_PR.md`
- `docs/pr/PR_11_323_WORKSPACE_V2_PLAYWRIGHT_COVERAGE/BUILD_PR.md`
- `docs/dev/reports/PR_11_323_report.md`
- `docs/dev/codex_commands.md`
- `docs/dev/commit_comment.txt`

## Steps
1. Add a deterministic Playwright spec under `tests/playwright/*`.
2. Cover:
   - workspace lifecycle
   - palette contract
   - invalid JSON / invalid payload rejection
   - load/export/import roundtrip integrity
   - tool switching active session consistency
3. Keep runtime/schemas unchanged.
4. Run targeted validation:
   - `node --check` on changed test file
   - `npm run test:workspace-v2`
