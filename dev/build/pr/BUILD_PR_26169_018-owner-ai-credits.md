# BUILD_PR_26169_018-owner-ai-credits

## Objective
- Implement Owner-only controls for AI credit packs, AI action costs, monthly membership credit grants, and purchased credit bonus percentages.

## Source Documents
- PLAN: `docs_build/pr/PLAN_PR_26169_018-owner-ai-credits.md`
- AI credit foundation dependency: `docs_build/pr/BUILD_PR_26169_007-ai-credit-foundation.md`
- AI credit display dependency: `docs_build/pr/BUILD_PR_26169_008-ai-credit-display.md`
- Owner memberships dependency: `docs_build/pr/BUILD_PR_26169_017-owner-memberships.md`

## Scope
- Add an Owner AI credit settings service that reads and updates existing DB-backed AI and membership records.
- Add Owner Local API routes and browser API client for AI credit settings.
- Add an Owner-only AI Credits page.
- Add Owner navigation/route mapping to reach the page.
- Add targeted unit and Playwright validation.

## Non-Scope
- No AI provider integration.
- No checkout provider integration.
- No user-facing AI credit display changes.
- No Admin monitoring dashboard.
- No usage-log editing or replay.
- No schema/table additions.

## Target Files
- `src/dev-runtime/ai/owner-ai-credit-settings-service.mjs`
- `src/dev-runtime/server/local-api-router.mjs`
- `src/engine/api/owner-ai-credits-api-client.js`
- `assets/theme-v2/js/owner-ai-credits.js`
- `assets/theme-v2/js/gamefoundry-partials.js`
- `owner/ai-credits.html`
- `tests/dev-runtime/OwnerAiCredits.test.mjs`
- `tests/playwright/tools/OwnerAiCreditsPage.spec.mjs`

## Implementation Requirements
- Owner can view and edit AI credit packs:
  - code.
  - display name.
  - credits.
  - price cents.
  - active state.
- Owner can view and edit AI actions:
  - code.
  - display name.
  - credit cost.
  - active state.
- Owner can view and edit monthly included AI credits by membership plan.
- Owner can view and edit purchased credit bonus percentages in basis points.
- Changes must update audit fields.
- Invalid edits must be rejected before save with visible diagnostics:
  - negative credit amount.
  - negative price.
  - negative action cost.
  - bonus percentage below 0 or above 100%.
  - duplicate pack code.
  - duplicate AI action code.
- Existing `ai_usage_log` rows must not be edited.
- Existing `ai_actions`, `ai_credit_packs`, `membership_limits`, and `membership_plans` tables remain the source of truth.

## Validation Requirements
- Verify branch is `main`.
- Run syntax checks for changed JavaScript and MJS files.
- Run static HTML restriction checks for `owner/ai-credits.html`.
- Run targeted Owner AI credit service validation:
  - `node --test tests/dev-runtime/OwnerAiCredits.test.mjs`
- Run targeted Owner AI credit page Playwright validation:
  - `npx playwright test tests/playwright/tools/OwnerAiCreditsPage.spec.mjs`
- Generate Playwright V8 coverage reports through the targeted Playwright spec.
- Run scoped `git diff --check`.
- Do not run full samples validation.

## Acceptance Criteria
- AI credit packs, prices, action costs, monthly grants, and bonus percentages are Owner-editable from DB-backed records.
- Edits are validated and audited.
- Non-Owners cannot access AI credit business model controls.
- Usage history remains immutable.
- User AI credit display reflects updated data through service reads.
