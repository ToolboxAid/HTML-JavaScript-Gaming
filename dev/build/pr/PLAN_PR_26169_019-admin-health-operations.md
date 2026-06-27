# PLAN_PR_26169_019-admin-health-operations

## Objective
- Plan Admin health and operations visibility for memberships, invitations, AI credits, marketplace, teams, and platform configuration.

## Scope
- Future BUILD must provide Admin read/operate surfaces for health, infrastructure, operations, invitations, AI monitoring, and support.
- Admin must not receive Owner-only pricing, percentage, legal, AI pricing, or founding program edit controls.
- Add no runtime behavior in this PLAN PR.

## Non-Scope
- No Owner settings editing.
- No payment settlement.
- No legal document editing.
- No broad infrastructure monitoring integration unless exact target contracts already exist.

## Implementation Requirements
- Admin dashboard must show operational health summaries for:
  - Membership assignment counts and failures.
  - Beta invitation counts by status.
  - AI credit balances, grants, debits, and insufficient-credit failures.
  - Marketplace seller eligibility and revenue calculation health.
  - Team membership limit violations or blocked invitations.
  - Missing required DB configuration.
- Admin can inspect and support invitation records.
- Admin can inspect AI usage and support user credit issues without editing Owner pricing.
- Admin can view membership state for support without changing Owner-controlled pricing or percentages.
- Admin diagnostics must identify missing plan, limit, invitation, AI action, credit pack, or user balance records.
- Admin operations must be audited when they mutate support data.

## Data Model Requirements
- Read from:
  - `membership_plans`
  - `membership_limits`
  - `user_memberships`
  - `founding_members`
  - `invitations`
  - `project_members`
  - `ai_actions`
  - `ai_credit_packs`
  - `user_ai_credits`
  - `ai_usage_log`
- Admin support actions must not edit Owner-controlled pricing, percentages, limits, AI action costs, or pack prices.
- Any support adjustment to user AI credits, if explicitly scoped in future BUILD, must write `ai_usage_log` with source type `admin_adjustment`.

## UI Requirements
- Admin Health/Operations page must be Admin-only.
- Show summary cards or tables for each operational area.
- Show clear PASS/WARN/FAIL/SKIP status per subsystem.
- Provide filters for invitation status, membership plan, and AI usage action when those tables are shown.
- Use read-only presentation for Owner-controlled business model fields.
- Provide support action controls only when exact BUILD scope authorizes them.
- Missing configuration must be surfaced as an actionable Admin health issue.

## Validation Requirements
- PLAN-phase validation for this docs-only PR: branch validation only.
- Future BUILD validation must include targeted Admin/service checks for:
  - Admin can view health dashboard.
  - Creator cannot view Admin dashboard.
  - Owner-only pricing controls are absent for Admin.
  - Missing `membership_limits` row produces health warning/failure.
  - Missing `ai_credit_packs` row produces health warning/failure.
  - Invitation status counts are accurate.
  - AI usage summaries match `ai_usage_log`.
- Playwright is required in future BUILD only if Admin UI behavior is implemented.
- No Playwright validation is required for this PLAN-only PR.

## Acceptance Criteria
- Admins can monitor platform operational health without Owner edit authority.
- Required table health is visible and actionable.
- Invitation and AI monitoring support the earlier stack PRs.
- Admin dashboard does not become a hidden source of business model configuration.

## Dependencies
- Upstream: PR 002, PR 003, PR 004, PR 005, PR 007, PR 008, PR 010, PR 012, PR 013, PR 017, PR 018.
- Downstream: future support, monitoring, billing operations, and incident response PRs.

