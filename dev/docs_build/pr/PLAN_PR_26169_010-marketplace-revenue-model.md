# PLAN_PR_26169_010-marketplace-revenue-model

## Objective
- Define the marketplace revenue model where creators receive 80% of Net Revenue.

## Scope
- Future BUILD must calculate creator revenue share from DB-backed percentage fields.
- Net Revenue must be sale amount less processing fees, taxes, refunds, chargebacks, and required deductions.
- Add no runtime behavior in this PLAN PR.

## Non-Scope
- No payment provider integration.
- No payout execution.
- No tax filing workflow.
- No marketplace category UI.

## Implementation Requirements
- Creator revenue share must default to 80% of Net Revenue for Creator, Studio, Beta, Founding Creator, and Founding Studio sellers.
- Revenue share must be Owner-editable through DB-backed settings in PR 017.
- Net Revenue calculation must define explicit inputs:
  - sale amount.
  - processing fees.
  - taxes.
  - refunds.
  - chargebacks.
  - required deductions.
- Revenue calculations must not use gross sale amount as creator payout basis.
- Negative Net Revenue must not create a positive creator payout.
- Refunds and chargebacks must create auditable adjustments.
- Revenue model must not hardcode 80% in marketplace UI or runtime logic; it must read from membership/revenue configuration.

## Data Model Requirements
- `membership_plans.revenueShareBps` must hold the creator revenue share percentage.
- Required value for Creator, Studio, Beta, Founding Creator, and Founding Studio: `8000` basis points.
- Free users cannot sell and therefore must not receive marketplace seller revenue.
- Marketplace transaction records, if present or introduced in a later marketplace PR, must store sale amount, processing fees, taxes, refunds, chargebacks, required deductions, net revenue, creator revenue, platform revenue, and calculation timestamp.
- This PR must not introduce transaction tables unless the future BUILD scope includes an existing marketplace sale record path that needs revenue fields.

## UI Requirements
- Marketplace seller-facing UI must display "80% of Net Revenue" using service-backed percentage data.
- Revenue previews must show the deduction categories included in Net Revenue.
- UI must avoid presenting payout estimates when required fee/tax/refund data is incomplete.
- Owner-facing editing belongs to PR 017.

## Validation Requirements
- PLAN-phase validation for this docs-only PR: branch validation only.
- Future BUILD validation must include targeted contract tests for:
  - 80% creator share from DB field.
  - Net Revenue excludes processing fees and taxes.
  - Refund reduces Net Revenue.
  - Chargeback reduces Net Revenue.
  - Negative Net Revenue payout floors at zero or produces an explicit negative adjustment according to the selected accounting contract.
  - Free users cannot create seller revenue.
- No Playwright validation is required for this PLAN-only PR.

## Acceptance Criteria
- Revenue calculations use Net Revenue and DB-backed percentages.
- Creator share is 80% for approved selling memberships.
- Deduction inputs are explicit and auditable.
- UI and service paths use the same revenue configuration.

## Dependencies
- Upstream: PR 004, PR 009.
- Downstream: PR 017, PR 019.

