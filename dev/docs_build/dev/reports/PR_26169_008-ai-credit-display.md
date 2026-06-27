# PR_26169_008-ai-credit-display Report

## Scope
- PR: `PR_26169_008-ai-credit-display`
- Source PLAN: `docs_build/pr/PLAN_PR_26169_008-ai-credit-display.md`
- Approved business model dependency: `docs_build/pr/PLAN_PR_26169_001-creator-platform-foundation.md`
- BUILD doc: `docs_build/pr/BUILD_PR_26169_008-ai-credit-display.md`

## Branch Validation
- Current branch before implementation: `main`
- Current branch before packaging: `main`
- Expected branch: `main`
- Result: PASS

## Requirement Checklist
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`: PASS
- Read matching PLAN_PR before implementation: PASS
- Create BUILD_PR before implementation: PASS
- Implement only PR_26169_008 purpose: PASS
- Add read-only AI credit display service: PASS
- Add `GET /api/ai-credits/display` for the selected signed-in session: PASS
- Display included, purchased, bonus, and total credit balances when a balance row exists: PASS
- Show actionable missing-balance diagnostics without fake zero balances: PASS
- Display membership monthly AI credit grants from membership data: PASS
- Display Small, Medium, and Large packs from `ai_credit_packs`: PASS
- Display Studio bonus messaging only from plan bonus data: PASS
- Display recent usage from `ai_usage_log`: PASS
- Add Theme V2 Account AI Credits page with external JS only: PASS
- Add Account side-navigation access and update affected navigation expectations: PASS
- Do not add AI action execution UI, checkout, Owner AI editor, Admin monitoring, AI provider, or payment behavior: PASS

## Implementation Summary
- Added `readAiCreditDisplay()` to the AI credit service.
- Added a signed-in session Local API route at `/api/ai-credits/display`.
- Added `src/engine/api/ai-credits-api-client.js`.
- Added `account/ai-credits.html` and `assets/theme-v2/js/account-ai-credits.js`.
- Added AI Credits to the Account side navigation and route map.
- Updated affected Account navigation Playwright expectations.
- Added focused dev-runtime and Playwright tests.

## Validation
- `git branch --show-current`: PASS (`main`)
- `node --check src/dev-runtime/ai/ai-credit-service.mjs`: PASS
- `node --check src/dev-runtime/server/local-api-router.mjs`: PASS
- `node --check src/engine/api/ai-credits-api-client.js`: PASS
- `node --check assets/theme-v2/js/account-ai-credits.js`: PASS
- `node --check assets/theme-v2/js/gamefoundry-partials.js`: PASS
- `node --check tests/dev-runtime/AiCreditDisplay.test.mjs`: PASS
- `node --check tests/playwright/account/AiCreditsPage.spec.mjs`: PASS
- `node --check tests/playwright/account/AchievementsPage.spec.mjs`: PASS
- `node --check tests/playwright/tools/InputMappingV2Tool.spec.mjs`: PASS
- Static HTML restriction check for `account/ai-credits.html`: PASS
- `node --test tests/dev-runtime/AiCreditDisplay.test.mjs`: PASS, 5 tests passed
- `npx playwright test tests/playwright/account/AiCreditsPage.spec.mjs`: PASS, 2 tests passed
- `npx playwright test tests/playwright/account/AiCreditsPage.spec.mjs tests/playwright/account/AchievementsPage.spec.mjs`: PASS, 4 tests passed
- `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs -g "Account navigation exposes User Controls"`: PASS, 1 test passed
- `git diff --check` scoped to PR_008 files: PASS

## Validation Notes
- An initial overbroad file-level command against the full `tests/playwright/tools/InputMappingV2Tool.spec.mjs` file produced unrelated Input Mapping runtime failures outside the Account side-navigation expectation touched by this PR.
- The impacted Account navigation test in that file passed after rerunning the targeted grep.
- The stale Achievements selector for the existing Account side-nav accordion was updated from `left` to the current `pages` accordion and passed in the targeted Account page run.

## Playwright And Coverage
- Playwright impacted: Yes.
- Validated behavior:
  - Account AI Credits page renders through shared header/footer/account side navigation.
  - Page reads the service-backed AI credit display API.
  - Missing balance row renders a visible diagnostic and no fake numeric zero balance.
  - Membership monthly grant, pack credits, and pack prices render from API data.
  - HTML keeps scripts/styles/event wiring external.
- V8 coverage artifacts:
  - `docs_build/dev/reports/playwright_v8_coverage_report.txt`
  - `docs_build/dev/reports/coverage_changed_js_guardrail.txt`
- Coverage evidence:
  - `(86%) assets/theme-v2/js/account-ai-credits.js`
  - `(100%) src/engine/api/ai-credits-api-client.js`
  - `(60%) assets/theme-v2/js/gamefoundry-partials.js`

## Lanes
- Impacted lanes: runtime and Account page UI.
- Skipped lanes: AI provider integration, checkout/payment, Owner editor UI, Admin AI monitoring, full samples.
- Skip rationale: PLAN_PR_26169_008 is scoped to read-only user-facing AI credit display.
- Full samples decision: SKIP. No samples, sample loader, or shared sample runtime changed.
- Full suite requirement: Not triggered by this PR scope.

## Acceptance Criteria Evidence
- Free user display shows 0 monthly credits from membership data and missing-balance diagnostic when no row exists: PASS
- Creator display derives 100 monthly credits from membership data: PASS via targeted service test
- Studio display derives 400 monthly credits and 10% purchased-credit bonus from plan data: PASS via targeted service test
- Beta display derives 400 monthly credits without paid Studio billing: PASS via targeted service test
- Founding Studio display derives 400 monthly credits and 10% purchased-credit bonus from plan data: PASS via targeted service test
- Small, Medium, and Large pack credits and prices come from `ai_credit_packs`: PASS
- Usage rows render from `ai_usage_log` with action name, delta, date, and source: PASS
- Display route does not mutate balance, usage, or membership tables: PASS

## Artifacts
- Changed files list: `docs_build/dev/reports/codex_changed_files.txt`
- Review diff: `docs_build/dev/reports/codex_review.diff`
- ZIP artifact: `tmp/PR_26169_008-ai-credit-display_delta.zip`
- ZIP validation: PASS, repo-structured artifact exists with 19 expected entries and size > 0.
