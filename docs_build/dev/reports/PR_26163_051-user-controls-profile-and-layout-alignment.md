# PR_26163_051-user-controls-profile-and-layout-alignment

## Branch Validation

- PASS: Current branch is `main`.
- Expected branch: `main`.

## Impacted Lane

- Account/User Controls runtime lane.
- Toolbox Controls launch/render lane.
- Theme V2 account side-nav/layout lane.
- Workspace contract lane through legacy command `npm run test:workspace-v2`.

## Requirement Checklist

- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before changes.
- PASS: Verified current branch is `main` before changes.
- PASS: `Create my profile` creates a brand-new profile and opens that new profile in edit mode.
  - Evidence: Playwright creates `Keyboard Profile`, verifies the edit row opens immediately, saves it, then creates `Keyboard 2 Profile` and verifies the controller name input is `Keyboard 2`.
- PASS: `Create my profile` does not open an existing profile.
  - Evidence: Playwright verifies the first saved Keyboard row returns, then the second Create action opens the new `Keyboard 2` profile instead of the existing `Keyboard Profile`.
- PASS: Selected Device is simplified and no longer lists duplicated raw devices plus saved profiles.
  - Evidence: Playwright verifies saved `Keyboard`, `Mouse`, and gamepad profiles replace their raw device choices, while an unprofiled detected controller remains selectable.
- PASS: `toolbox/controls` is aligned with the updated side accordion pattern where applicable.
  - Evidence: Toolbox Controls keeps its left/right accordion columns and now exposes `data-controls-side-accordion="left"` and `data-controls-side-accordion="right"`; Playwright verifies both render.
- PASS: `assets/theme-v2/partials/account-side-nav.html` has left/right accordion structure.
  - Evidence: Account side nav now exposes `data-account-side-nav-accordion-layout="left-right"` plus independently toggled left and right `details.vertical-accordion` sections; Playwright verifies both open/close.
- PASS: `account/user-controls.html` Account/User Controls card and body use 100% available space.
  - Evidence: Reusable Theme V2 fill classes are applied and verified by Playwright on `.account-panel--fill`, `.card--fill`, and `.card-body--fill`.
- PASS: Scope remained limited to account controls, toolbox controls alignment, Theme V2 partial/layout files, tests, and reports.

## Changed Files

- `account/user-controls-page.js`
- `account/user-controls.html`
- `assets/theme-v2/css/layout.css`
- `assets/theme-v2/css/panels.css`
- `assets/theme-v2/partials/account-side-nav.html`
- `toolbox/controls/index.html`
- `tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- `tests/playwright/account/AchievementsPage.spec.mjs`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/coverage_changed_js_guardrail.txt`
- `docs_build/dev/reports/dependency_gating_report.md`
- `docs_build/dev/reports/dependency_hydration_reuse_report.md`
- `docs_build/dev/reports/execution_graph_reuse_report.md`
- `docs_build/dev/reports/failure_fingerprint_report.md`
- `docs_build/dev/reports/filesystem_scan_reduction_report.md`
- `docs_build/dev/reports/incremental_validation_report.md`
- `docs_build/dev/reports/lane_compilation_report.md`
- `docs_build/dev/reports/lane_deduplication_report.md`
- `docs_build/dev/reports/lane_input_validation_report.md`
- `docs_build/dev/reports/lane_manifests/workspace-contract.json`
- `docs_build/dev/reports/lane_runtime_optimization_report.md`
- `docs_build/dev/reports/lane_snapshot_report.md`
- `docs_build/dev/reports/lane_snapshots/workspace-contract.json`
- `docs_build/dev/reports/lane_warm_start_report.md`
- `docs_build/dev/reports/lane_warm_starts/workspace-contract.json`
- `docs_build/dev/reports/monolith_trigger_removal_report.md`
- `docs_build/dev/reports/persistent_lane_manifest_report.md`
- `docs_build/dev/reports/playwright_discovery_ownership_report.md`
- `docs_build/dev/reports/playwright_discovery_scope_report.md`
- `docs_build/dev/reports/playwright_structure_audit.md`
- `docs_build/dev/reports/retry_suppression_report.md`
- `docs_build/dev/reports/slow_path_pruning_report.md`
- `docs_build/dev/reports/static_validation_report.md`
- `docs_build/dev/reports/targeted_file_manifest_report.md`
- `docs_build/dev/reports/test_cleanup_performance_report.md`
- `docs_build/dev/reports/test_cleanup_routing_report.md`
- `docs_build/dev/reports/testing_lane_execution_report.md`
- `docs_build/dev/reports/validation_cache_report.md`
- `docs_build/dev/reports/zero_browser_preflight_report.md`
- Required review artifacts are generated separately:
  - `docs_build/dev/reports/codex_review.diff`
  - `docs_build/dev/reports/codex_changed_files.txt`

## Validation Performed

- PASS: `node --check account/user-controls-page.js`
- PASS: `node --check tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- PASS: `node --check tests/playwright/account/AchievementsPage.spec.mjs`
- PASS: HTML restriction scan:
  - `rg --pcre2 -n "<script(?![^>]+src=)|<style|\son[a-z]+\s*=|style\s*=" account/user-controls.html toolbox/controls/index.html assets/theme-v2/partials/account-side-nav.html`
  - Result: no inline script/style/handler matches.
- PASS: Targeted Playwright:
  - `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs tests/playwright/account/AchievementsPage.spec.mjs`
  - Result: 9 passed.
- PASS: Requested workspace command:
  - `npm run test:workspace-v2`
  - Result: 5 passed.
  - Note: command name is legacy; this routes the current workspace-contract validation lane.

## Playwright Result

- PASS: Targeted Controls/User Controls and shared Account side-nav coverage passed.
- PASS: `npm run test:workspace-v2` passed.

## Coverage

- PASS: `docs_build/dev/reports/playwright_v8_coverage_report.txt` produced.
- PASS: Changed runtime JS was exercised:
  - `(93%) account/user-controls-page.js`
  - `(94%) toolbox/controls/controls.js`
- PASS: Coverage report states no low-coverage changed runtime JS warnings.
- WARN: Changed Playwright spec files are not browser runtime JavaScript and are not collected as V8 runtime coverage; this is expected.

## Skipped Lanes

- SKIP: Full samples smoke test.
  - Reason: explicitly requested not to run full samples smoke; no sample JSON or sample runtime files changed.
- SKIP: Engine input lane.
  - Reason: no `src/engine/input` implementation changed in this PR.
- SKIP: Full repo Playwright suite.
  - Reason: targeted Account/User Controls, Toolbox Controls, shared account side-nav, and requested workspace-contract lane covered the affected surfaces.

## Manual Validation Steps

1. Open `/account/user-controls.html` as a user session.
2. Click Keyboard `Create my profile`; verify the newly created profile opens in edit mode.
3. Save it, then click Keyboard `Create my profile` again; verify the new edit row is `Keyboard 2`, not the existing Keyboard profile.
4. Create Mouse and detected game controller profiles; verify Selected Device shows saved profile choices without duplicate raw device entries for those same devices.
5. Open and close the Account side-nav left and right accordion sections.
6. Open `/toolbox/controls/index.html`; verify Game Controls renders with left and right side accordions and expected default rows.

## Samples Decision

- SKIP: Full samples smoke test was intentionally not run because the PR does not touch samples and the user explicitly requested not to run it.
