# PLAN_PR_26169_008-ai-credit-display

## Objective
- Plan user-facing AI credit display for balances, monthly credits, purchased packs, bonus credits, and recent usage.

## Scope
- Future BUILD must add AI credit balance and usage UI backed by the AI credit foundation.
- Display must respect membership-specific monthly credits and Studio bonus behavior.
- Add no runtime behavior in this PLAN PR.

## Non-Scope
- No AI action execution UI.
- No payment checkout.
- No Owner AI pricing editor.
- No admin AI monitoring dashboard.

## Implementation Requirements
- Display current included, purchased, and bonus credit balances.
- Display current membership monthly AI credit grant:
  - Free: 0.
  - Creator and Founding Creator: 100.
  - Studio, Founding Studio, and Beta: 400.
- Display available packs:
  - Small: 100 credits, $5.
  - Medium: 500 credits, $20.
  - Large: 3000 credits, $99.
- Display Studio 10% bonus purchased credits when applicable.
- Display recent usage from `ai_usage_log`.
- Missing balance records must show actionable diagnostics and must not render fake zero balances unless the service explicitly created a zero record.

## Data Model Requirements
- Read from:
  - `user_ai_credits`
  - `ai_usage_log`
  - `ai_credit_packs`
  - `membership_plans`
  - `membership_limits`
  - `user_memberships`
- UI must not persist credit totals or pack definitions in browser storage as source of truth.
- Pack display must use `ai_credit_packs.priceCents` and `credits`.

## UI Requirements
- Show total available credits and a breakdown of included, purchased, and bonus credits.
- Show membership monthly grant and next period dates if available.
- Show pack list sorted by credit amount: Small, Medium, Large.
- Show Studio bonus messaging only when the active plan has a purchased credit bonus.
- Show recent AI usage with action name, credit delta, date, and source.
- Use status messaging for missing data, insufficient data, or service errors.

## Validation Requirements
- PLAN-phase validation for this docs-only PR: branch validation only.
- Future BUILD validation must include targeted UI/service checks for:
  - Free user balance.
  - Creator user balance and 100 monthly credits.
  - Studio user balance and 400 monthly credits.
  - Beta user balance and 400 monthly credits.
  - Studio 10% bonus pack display.
  - Usage log rendering.
  - Missing balance diagnostic.
- Playwright is required in future BUILD only if UI behavior is implemented.
- No Playwright validation is required for this PLAN-only PR.

## Acceptance Criteria
- Users can understand current credits, monthly grants, available packs, and recent usage.
- Display values are service-backed and database-driven.
- Studio bonus display is controlled by plan data.
- The UI does not invent balances when records are missing.

## Dependencies
- Upstream: PR 006, PR 007.
- Downstream: PR 018, PR 019.

