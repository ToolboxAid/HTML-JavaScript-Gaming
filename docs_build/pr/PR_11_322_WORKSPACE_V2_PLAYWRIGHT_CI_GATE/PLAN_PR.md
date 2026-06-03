# PLAN_PR_11_322

## Purpose
Run Workspace V2 Playwright tests automatically in CI for `main` pushes and pull requests targeting `main`.

## Scope
- `.github/workflows/workspace-v2-playwright.yml`
- `docs_build/pr/PR_11_322_WORKSPACE_V2_PLAYWRIGHT_CI_GATE/BUILD_PR.md`
- `docs_build/pr/PR_11_322_WORKSPACE_V2_PLAYWRIGHT_CI_GATE/PLAN_PR.md`
- `docs_build/dev/reports/PR_11_322_report.md`
- `docs_build/dev/codex_commands.md`
- `docs_build/dev/commit_comment.txt`

## Steps
1. Add a dedicated GitHub Actions workflow for Workspace V2 Playwright gate.
2. Configure triggers on `push` and `pull_request` for `main`.
3. Run checkout, Node LTS setup, `npm ci`, and `npm run test:workspace-v2`.
4. Upload `tests/results` as an artifact for pass/fail inspection.
5. Run targeted workflow YAML validation locally.
