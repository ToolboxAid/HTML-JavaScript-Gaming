# PLAN_PR_26169_007-ai-credit-foundation

## Objective
- Define the AI credit foundation for monthly membership grants, purchased credit packs, Studio bonuses, action costs, and usage logging.

## Scope
- Future BUILD must introduce AI credit data contracts and service behavior using `ai_actions`, `ai_credit_packs`, `user_ai_credits`, and `ai_usage_log`.
- All AI costs, pack prices, and credits must be database-driven and Owner-editable.
- Add no runtime behavior in this PLAN PR.

## Non-Scope
- No AI provider integration.
- No checkout flow for purchasing packs.
- No AI generation UI.
- No Owner AI editor UI until PR 018.

## Implementation Requirements
- Membership monthly credits must derive from `membership_limits.monthlyAiCredits`.
- AI action costs must derive from `ai_actions.creditCost`.
- Credit pack definitions must derive from `ai_credit_packs`.
- Studio and Founding Studio users must receive 10% bonus purchased credits.
- Beta users receive Studio-equivalent included monthly credits but do not imply paid Studio billing.
- Free users receive 0 monthly AI credits.
- Credit debits must be atomic at service level and must write `ai_usage_log`.
- Credit grants and purchases must write `ai_usage_log`.
- Insufficient credits must reject before invoking any AI action.
- Usage logs must identify user, action, delta, source, and resulting balance.

## Data Model Requirements
- `ai_actions` required fields:
  - `key`
  - `code`
  - `displayName`
  - `creditCost`
  - `active`
  - audit fields
- `ai_credit_packs` required rows:
  - Small: 100 credits, $5.
  - Medium: 500 credits, $20.
  - Large: 3000 credits, $99.
- `ai_credit_packs` required fields:
  - `key`
  - `code`
  - `displayName`
  - `credits`
  - `priceCents`
  - `currency`
  - `active`
  - audit fields
- `user_ai_credits` required fields:
  - `key`
  - `userKey`
  - `includedBalance`
  - `purchasedBalance`
  - `bonusBalance`
  - `periodStart`
  - `periodEnd`
  - audit fields
- `ai_usage_log` required fields:
  - `key`
  - `userKey`
  - `actionKey`
  - `creditDelta`
  - `sourceType`
  - `sourceKey`
  - `balanceAfter`
  - `createdAt`
  - `createdBy`
- Studio bonus must use `membership_plans.purchasedCreditBonusBps`.

## UI Requirements
- No UI is implemented in this PR.
- Future UI must display balances and pack definitions from service data.
- Any AI action button must disclose credit cost before execution when future UI consumes this service.

## Validation Requirements
- PLAN-phase validation for this docs-only PR: branch validation only.
- Future BUILD validation must include targeted contract tests for:
  - Monthly grant by plan.
  - Small, Medium, and Large pack definitions.
  - Studio 10% purchased credit bonus.
  - Free 0 monthly credits.
  - AI action debit.
  - Insufficient credit rejection.
  - Usage log writes for grants, purchases, bonuses, and debits.
- No Playwright validation is required for this PLAN-only PR.

## Acceptance Criteria
- AI credit costs, pack prices, pack credits, monthly credits, and bonus percentages are DB-driven.
- Credit balance changes are auditable through `ai_usage_log`.
- Studio bonus behavior is tied to membership data.
- AI actions cannot run when credits are insufficient.

## Dependencies
- Upstream: PR 004, PR 005.
- Downstream: PR 008, PR 018, PR 019.

