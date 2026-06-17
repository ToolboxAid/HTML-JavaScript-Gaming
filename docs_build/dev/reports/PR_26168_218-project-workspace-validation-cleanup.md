# PR_26168_218-project-workspace-validation-cleanup

## Branch Validation

PASS: current branch is `main`.

- Expected branch: `main`
- Current branch: `main`
- Local branches found: `main`

## Scope Summary

PASS: PR218 stays scoped to validation cleanup for the Project Workspace lane.

- `src/dev-runtime/server/local-api-router.mjs`: treats `validate*` repository methods as read-only so `validateDesign` no longer enters the configured DB persistence gate during read-only page validation.
- `toolbox/controls/controls.js`: removes initial-render write cleanup/default persistence from Controls; explicit Save/Delete paths still use the existing repository write contract.
- `tests/playwright/tools/InputMappingV2Tool.spec.mjs`: updates the default Controls page assertion to match read-only default rendering.
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`: PR218-specific advisory V8 coverage report for changed runtime JavaScript.

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first | PASS | Instructions were read before edits and branch guard. |
| Hard stop unless current branch is `main` | PASS | `git branch --show-current` returned `main`; `git branch --list` showed only `* main`. |
| Keep PR215-217 behavior intact unless fixing validation blockers | PASS | Admin Infrastructure, Owner Operations promotion safety, and Project Workspace targeted lanes all passed after the cleanup. |
| Fix or isolate remaining `npm run test:workspace-v2` failures from `RootToolsFutureState.spec.mjs` | PASS | The two failing RootToolsFutureState checks passed directly, and the full workspace-contract lane passed 5/5. |
| Use Project Workspace for touched user-facing copy/test/report prose | PASS | Report prose uses Project Workspace; `npm run test:workspace-v2` is documented as a legacy command name only. |
| Reduce unrelated `docs_build/dev/reports` churn | PASS | Generated lane-report churn was restored; retained reports are the required PR report, review artifacts, and required V8 coverage report. |
| Keep Admin Infrastructure showing only `assets/GFS-Infrastructure v1-3.png` | PASS | Static check and Playwright Admin Infrastructure validation confirm v1-3 is present and v1-2 is absent. |
| Do not add new feature scope | PASS | Changes only adjust read-only validation boundaries and corresponding tests. |
| Do not run full samples smoke | PASS | Full samples smoke skipped by instruction; no sample or shared engine sample surface changed. |

## Validation Lane Report

PASS: `node --check src/dev-runtime/server/local-api-router.mjs`

PASS: `node --check toolbox/controls/controls.js`

PASS: `node --check tests/playwright/tools/InputMappingV2Tool.spec.mjs`

PASS: `npx playwright test tests/playwright/tools/RootToolsFutureState.spec.mjs -g "root tools surface links current tool pages without old_\* routes|representative active tool pages align center cleanup and registry group colors"`

- Result: 2 passed.
- Evidence: previously failing RootToolsFutureState validation blockers now pass.

PASS: `npx playwright test tests/playwright/tools/GameWorkspaceMockRepository.spec.mjs -g "Game Workspace creates, opens, and deletes mock games|Project Workspace preserves guest browsing and blocks guest saves|Game Workspace shows active-game API diagnostics without throwing|Game Workspace reports malformed active-game payloads without throwing|Game Workspace displays and edits game purpose and member role|Game Workspace progress panels update from mock game state"`

- Result: 6 passed.
- Evidence: Project Workspace Local API / Local DB project records and guest save blocking remain intact.

PASS: `npx playwright test tests/playwright/tools/AdminPlatformToolsWireframes.spec.mjs -g "Infrastructure Admin wireframe preserves template structure"`

- Result: 1 passed.
- Evidence: Admin Infrastructure still uses Theme V2 structure, displays `/dev/projects/`, `/ist/projects/`, `/uat/projects/`, `/prod/projects/`, and shows only `GFS-Infrastructure v1-3.png`.

PASS: `npx playwright test tests/playwright/tools/AdminPlatformToolsWireframes.spec.mjs -g "Owner Operations exposes owner-only connection validation and manual operation actions|Owner Operations blocks signed-in non-owner users"`

- Result: 2 passed.
- Evidence: Owner-only promotion safety reporting remains intact, with Import overwrite blocked visibly until explicit confirmation exists.

PASS: `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs -g "Toolbox Controls shows game controls only and keeps presets wireframe safe"`

- Result: 1 passed.
- Evidence: Controls default rows render without initial repository write cleanup.

PASS: `npm run test:workspace-v2`

- Result: 5 passed in `RootToolsFutureState.spec.mjs`.
- Note: `npm run test:workspace-v2` is a legacy command name that routes the `workspace-contract` lane. User-facing language remains Project Workspace.

PASS: Playwright V8 coverage report produced at `docs_build/dev/reports/playwright_v8_coverage_report.txt`.

- `(64%) toolbox/controls/controls.js` covered by browser V8 coverage.
- `(0%) src/dev-runtime/server/local-api-router.mjs` reported as WARN because server runtime modules are not collected by browser V8 coverage; behavior covered by syntax checks and RootToolsFutureState validation.

## Manual Validation Notes

PASS: Static Admin Infrastructure inspection confirmed:

- `assets/GFS-Infrastructure v1-3.png` appears in `admin/infrastructure.html`.
- `assets/GFS-Infrastructure v1-2.png` does not appear.
- `/dev/projects/`, `/ist/projects/`, `/uat/projects/`, and `/prod/projects/` remain visible.

PASS: RootToolsFutureState no longer reports configured DB 500s for `validateDesign` or Controls `replaceMappings` during read-only page traversal.

SKIP: Full samples smoke was not run because the PR is a targeted Project Workspace validation cleanup, sample JSON was untouched, and the user explicitly instructed not to run full samples smoke.
