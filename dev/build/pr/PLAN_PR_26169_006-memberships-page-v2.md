# PLAN_PR_26169_006-memberships-page-v2

## Objective
- Plan a database-backed Memberships page V2 that displays approved plans, active membership, capabilities, and upgrade/downgrade affordances.

## Scope
- Future BUILD must replace hardcoded membership presentation with service-backed plan data.
- Page must show Free, Creator, Studio, Beta, Founding Creator, and Founding Studio states correctly.
- Add no runtime behavior in this PLAN PR.

## Non-Scope
- No payment checkout implementation.
- No Owner editing controls.
- No Admin invitation creation.
- No AI credit purchase flow.

## Implementation Requirements
- Membership plan cards or rows must be rendered from `membership_plans` and `membership_limits`.
- Active membership must come from `user_memberships`.
- Beta must show as invitation-only and not as a public paid upgrade.
- Founding Creator and Founding Studio must show locked active pricing only for eligible active founding members.
- Upgrade actions for Creator and Studio may be disabled or routed to a future checkout placeholder, but must not fake a successful purchase.
- Free plan must show:
  - $0/month.
  - 250 MB storage.
  - 0 AI credits/month.
  - Publish 1 experience.
  - No collaboration.
  - Browse, buy, and download marketplace assets.
  - Cannot sell.
- Creator plan must show:
  - $9/month.
  - 1 GB storage.
  - 100 AI credits/month.
  - Up to 3 team members.
  - Sell marketplace assets.
  - Creator analytics.
  - 80% Net Revenue.
- Studio plan must show:
  - $19/month.
  - 4 GB storage.
  - 400 AI credits/month.
  - Up to 10 team members.
  - Advanced analytics.
  - 80% Net Revenue.
  - 10% bonus purchased AI credits.

## Data Model Requirements
- Page data must come from membership service reads over:
  - `membership_plans`
  - `membership_limits`
  - `user_memberships`
  - `founding_members`
  - `invitations` for pending Beta invitation state when relevant.
- UI must not duplicate plan constants in JavaScript.
- Membership capability labels must be derived from limit/capability fields.

## UI Requirements
- Show active plan, billing price, storage limit, monthly AI credits, team limit, publish limit, marketplace sell eligibility, revenue share, and purchased credit bonus.
- Show clear disabled states for unavailable actions.
- Show Beta as invitation-only.
- Show founding status only to active founding members or eligible Owner/Admin contexts.
- Use existing Theme V2 patterns if this is a public/root page.
- No page-local CSS, inline styles, or inline scripts in future BUILD.

## Validation Requirements
- PLAN-phase validation for this docs-only PR: branch validation only.
- Future BUILD validation must include targeted page/service checks for:
  - Free user display.
  - Creator user display.
  - Studio user display.
  - Beta user display.
  - Founding Creator and Founding Studio active states.
  - Missing membership error state.
- Playwright is required in future BUILD only if UI behavior is implemented.
- No Playwright validation is required for this PLAN-only PR.

## Acceptance Criteria
- Memberships page displays the approved business model from DB-backed data.
- No pricing, percentages, limits, credits, or AI costs are page-local source of truth.
- Active membership state is accurate for regular, Beta, and founding users.
- Upgrade or change actions do not claim success without a real assignment or checkout path.

## Dependencies
- Upstream: PR 004, PR 005.
- Downstream: PR 008, PR 017.

