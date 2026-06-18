# PLAN_PR_26169_018-owner-ai-credits

## Objective
- Plan Owner controls for AI credit packs, monthly credit grants, purchased credit bonuses, and AI action costs.

## Scope
- Future BUILD must expose Owner-editable AI pricing and credit configuration.
- Owner controls must edit `ai_actions`, `ai_credit_packs`, `membership_limits.monthlyAiCredits`, and `membership_plans.purchasedCreditBonusBps`.
- Add no runtime behavior in this PLAN PR.

## Non-Scope
- No AI provider integration.
- No checkout provider integration.
- No user-facing AI credit display changes.
- No Admin monitoring dashboard beyond data needed by PR 019.

## Implementation Requirements
- Owner can view and edit AI credit pack definitions:
  - Small: 100 credits, $5.
  - Medium: 500 credits, $20.
  - Large: 3000 credits, $99.
- Owner can view and edit active AI actions and their credit costs.
- Owner can view and edit monthly included AI credits by membership plan.
- Owner can view and edit Studio purchased credit bonus percentage.
- Changes must be audited.
- Invalid edits must reject before save:
  - negative credit amount.
  - negative price.
  - negative action cost.
  - bonus percentage below 0 or above 100%.
  - duplicate pack code.
  - duplicate AI action code.
- Existing balances and usage logs must not be retroactively rewritten by pricing edits.

## Data Model Requirements
- Edit existing DB-backed records:
  - `ai_actions`
  - `ai_credit_packs`
  - `membership_limits.monthlyAiCredits`
  - `membership_plans.purchasedCreditBonusBps`
- `ai_credit_packs.priceCents` must store integer cents.
- `ai_credit_packs.credits` must store integer credits.
- `ai_actions.creditCost` must store integer credit cost.
- `ai_usage_log` remains immutable and must not be edited by Owner pricing screens.
- Current required initial values:
  - Small: 100 credits, 500 cents.
  - Medium: 500 credits, 2000 cents.
  - Large: 3000 credits, 9900 cents.
  - Studio purchased credit bonus: 1000 basis points.

## UI Requirements
- Owner AI Credits page must be Owner-only.
- Pack editor must show pack code, display name, credits, price, active state.
- AI action editor must show action code, display name, credit cost, active state.
- Monthly credit editor must show plan name and included monthly credits.
- Bonus editor must show eligible plan and purchased credit bonus percentage.
- Use numeric inputs for credits, prices, and costs.
- Use toggles for active state.
- Show validation errors inline and in status/log output.

## Validation Requirements
- PLAN-phase validation for this docs-only PR: branch validation only.
- Future BUILD validation must include targeted Owner/service checks for:
  - Owner can update Small pack price.
  - Owner can update Large pack credits.
  - Owner can update AI action cost.
  - Owner can update Studio bonus percentage.
  - Non-Owner cannot access editor.
  - Invalid negative price rejected.
  - Existing `ai_usage_log` rows are not mutated by edits.
- Playwright is required in future BUILD only if Owner UI behavior is implemented.
- No Playwright validation is required for this PLAN-only PR.

## Acceptance Criteria
- AI credit packs, prices, action costs, monthly grants, and bonus percentages are Owner-editable from DB-backed records.
- Edits are validated and audited.
- Usage history remains immutable.
- User AI credit display reflects updated data through service reads.

## Dependencies
- Upstream: PR 007, PR 008, PR 017.
- Downstream: PR 019.

