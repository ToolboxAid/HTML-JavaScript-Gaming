# PLAN_PR_26169_002-auth-preview-signin-regression

## Objective
- Stabilize preview sign-in so creator, admin, and owner role previews use real user and role data instead of fallback auth state.

## Scope
- Future BUILD must inspect existing auth preview, account, admin, and local session surfaces.
- Preserve current sign-in preview workflows while removing regressions that hide missing users, roles, or membership context.
- Add no runtime behavior in this PLAN PR.

## Non-Scope
- No new membership assignment workflow.
- No beta invitation acceptance.
- No Owner configuration UI.
- No production auth provider change unless existing target files require an adapter correction.

## Implementation Requirements
- Preview sign-in must resolve selected users from persisted user records.
- Role previews must resolve through persisted roles and user-role assignments.
- Creator, Admin, and Owner role states must be distinguishable and testable.
- Missing preview users or roles must show actionable diagnostics and must not silently create fallback sessions.
- The selected preview user must expose a stable platform user key to downstream membership and entitlement services.
- Sign-out must clear only preview auth state and must not mutate membership, AI credit, marketplace, or project data.

## Data Model Requirements
- Use existing user, role, and user-role tables if present.
- Do not add membership tables in this PR.
- Do not persist pricing, limits, credits, or marketplace percentages in auth state.
- Auth preview session state may reference user and role keys only; it must not duplicate membership plan data.

## UI Requirements
- Preview sign-in UI must clearly show the selected user and active roles.
- Admin-only and Owner-only preview choices must not appear as Creator actions.
- Error states must identify missing user, missing role, or missing user-role assignment.
- Any role switcher must remain a preview/dev affordance and must not imply production role escalation.

## Validation Requirements
- PLAN-phase validation for this docs-only PR: branch validation only.
- Future BUILD validation must include targeted auth/account checks for:
  - Creator preview sign-in.
  - Admin preview sign-in.
  - Owner preview sign-in.
  - Missing user rejection.
  - Missing role rejection.
  - Sign-out state cleanup.
- No Playwright validation is required for this PLAN-only PR.

## Acceptance Criteria
- Preview sign-in no longer masks invalid users or roles.
- Downstream services receive a stable user key and role set.
- No membership, marketplace, or AI business rules are hardcoded into auth preview state.
- Diagnostics are visible and actionable.

## Dependencies
- Upstream: PR 001.
- Downstream: PR 003, PR 005, PR 006, PR 017, PR 018, PR 019.

