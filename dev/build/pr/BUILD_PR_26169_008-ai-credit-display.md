# BUILD_PR_26169_008-ai-credit-display

## Objective
- Implement a read-only, service-backed AI credit display for signed-in creators.

## Source Documents
- PLAN: `docs_build/pr/PLAN_PR_26169_008-ai-credit-display.md`
- Business model foundation: `docs_build/pr/PLAN_PR_26169_001-creator-platform-foundation.md`
- Upstream implementation: `docs_build/pr/BUILD_PR_26169_007-ai-credit-foundation.md`

## Scope
- Add a user-facing account AI credits page.
- Add a read-only AI credit display service contract backed by the PR_007 AI credit tables.
- Add a browser API client and Theme V2 page module for displaying balances, monthly grants, packs, bonus credits, and recent usage.
- Add targeted dev-runtime and Playwright validation.

## Non-Scope
- No AI action execution UI.
- No payment checkout.
- No Owner AI pricing editor.
- No Admin AI monitoring dashboard.
- No AI provider integration.
- No mutation from the display route.

## Target Files
- `src/dev-runtime/ai/ai-credit-service.mjs`
- `src/dev-runtime/server/local-api-router.mjs`
- `src/engine/api/ai-credits-api-client.js`
- `assets/theme-v2/js/account-ai-credits.js`
- `assets/theme-v2/js/gamefoundry-partials.js`
- `assets/theme-v2/partials/account-side-nav.html`
- `account/ai-credits.html`
- `tests/dev-runtime/AiCreditDisplay.test.mjs`
- `tests/playwright/account/AiCreditsPage.spec.mjs`
- `tests/playwright/account/AchievementsPage.spec.mjs`
- `tests/playwright/tools/InputMappingV2Tool.spec.mjs`

## Implementation Requirements
- Add a read-only AI credit display service that:
  - Requires an explicit user key.
  - Resolves active membership through the membership assignment service.
  - Reads balances from `user_ai_credits`.
  - Reads recent usage from `ai_usage_log`.
  - Reads packs from `ai_credit_packs`.
  - Reads action names/costs from `ai_actions`.
  - Reads membership monthly credits and bonus percentages through `membership_limits` and `membership_plans`.
  - Does not create, update, or delete balance or usage records.
- Add `GET /api/ai-credits/display` for the selected signed-in session.
- Return actionable diagnostics when a balance row is missing, without inventing a fake zero balance.
- Sort packs by credit amount: Small, Medium, Large.
- Sort usage newest first and include action name, credit delta, date, and source.
- Keep all pricing, credits, bonuses, and costs database-driven.

## UI Requirements
- Add `account/ai-credits.html` using Theme V2 only.
- Add external JavaScript only; no inline `<script>`, `<style>`, event handlers, or `style` attributes.
- Display:
  - Total available credits.
  - Included, purchased, and bonus balance breakdown.
  - Active membership monthly AI credit grant.
  - Current credit period dates when present.
  - Available Small, Medium, and Large packs using service values.
  - Studio bonus messaging only when the active plan has a bonus.
  - Recent usage rows with action/source, credit delta, balance after, and date.
  - Visible diagnostics for missing balance data and service errors.
- Add an Account side-navigation link to AI Credits and update affected navigation expectations.

## Validation Requirements
- Verify branch is `main`.
- Run syntax checks for changed JavaScript and MJS files.
- Run static HTML restriction checks for `account/ai-credits.html`.
- Run targeted dev-runtime AI credit display tests:
  - `node --test tests/dev-runtime/AiCreditDisplay.test.mjs`
- Run targeted Playwright account page tests:
  - `npx playwright test tests/playwright/account/AiCreditsPage.spec.mjs`
- Run existing affected navigation expectations only where edited:
  - `npx playwright test tests/playwright/account/AchievementsPage.spec.mjs`
  - `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs -g "Account navigation exposes User Controls"`
- Generate Playwright V8 coverage reports through the targeted Playwright account spec.
- Do not run full samples validation.

## Acceptance Criteria
- Free, Creator, Studio, Beta, and Founding Studio monthly credit values display from membership data.
- Small, Medium, and Large pack display values come from `ai_credit_packs`.
- Studio bonus display is controlled by `membership_plans.purchasedCreditBonusBps`.
- Usage rows render from `ai_usage_log`.
- Missing balance records show a diagnostic and do not render fake zero balances.
- The display route does not mutate credit data.
- Required reports and repo-structured ZIP artifact are produced.
