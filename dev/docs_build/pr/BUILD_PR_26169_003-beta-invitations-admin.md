# BUILD_PR_26169_003-beta-invitations-admin

## Objective
- Implement the Admin-managed Beta invitation workflow as a database-backed, auditable invitation lifecycle without introducing membership assignment behavior before PR_005.

## Source PLAN
- `docs_build/pr/PLAN_PR_26169_001-creator-platform-foundation.md`
- `docs_build/pr/PLAN_PR_26169_003-beta-invitations-admin.md`

## Scope
- Add an `invitations` table schema and empty seed surface.
- Add Local API routes for Admin listing, creating, expiring, and revoking Beta invitations.
- Add a non-admin acceptance route that validates invitation code, email match, status, expiration, and single-use acceptance.
- Add an Admin Invitations page/panel using Theme V2 and external JavaScript.
- Add targeted contract tests for invitation create/list/revoke/accept failure and success states.

## Non-Scope
- No public self-service Beta signup.
- No email delivery integration.
- No paid membership checkout.
- No Owner membership pricing editor.
- No `membership_plans`, `membership_limits`, or `user_memberships` implementation beyond a BETA plan reference string on invitation records.
- No membership assignment; accepted invitations expose a PR_005 handoff status only.

## Exact Target Files
- `docs_build/pr/BUILD_PR_26169_003-beta-invitations-admin.md`
- `src/dev-runtime/persistence/mock-db-store.js`
- `src/dev-runtime/seed/server-seed-loader.mjs`
- `src/dev-runtime/server/local-api-router.mjs`
- `src/engine/api/admin-invitations-api-client.js`
- `assets/theme-v2/js/admin-invitations.js`
- `admin/invitations.html`
- `tests/dev-runtime/BetaInvitationsAdmin.test.mjs`
- `docs_build/dev/codex_commands.md`
- `docs_build/dev/commit_comment.txt`
- `docs_build/dev/reports/PR_26169_003-beta-invitations-admin.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Implementation Requirements
- Invitation records must include `key`, `email`, `invitationCode`, `planKey`, `status`, `invitedBy`, `expiresAt`, `acceptedBy`, `acceptedAt`, and audit fields.
- Created invitations must use plan code `BETA`, status `pending`, normalized target email, an opaque code, and Admin audit ownership.
- Admin list/create/revoke routes must require an Admin session.
- Expiration and revocation must fail for accepted invitations and must not silently change missing records.
- Acceptance must be single-use and fail visibly for missing code, mismatched email, revoked, expired, or already accepted invitations.
- Acceptance must not write membership data in this PR; it must return a clear `membershipAssignmentStatus` handoff for PR_005.
- Invitation records must not duplicate Beta pricing or limits.

## UI Requirements
- Add an Admin Invitations page with existing Theme V2 shell structure.
- The page must list email, plan, status, expiration, invited by, and accepted by.
- The page must provide create and revoke controls.
- The page must show visible status/failure messages.
- The page must label Beta as invitation-only and Studio-equivalent without implying paid subscription.

## Validation Plan
- Branch validation before implementation and before packaging: current branch must be `main`.
- Syntax checks:
  - `node --check src/dev-runtime/server/local-api-router.mjs`
  - `node --check src/dev-runtime/persistence/mock-db-store.js`
  - `node --check src/dev-runtime/seed/server-seed-loader.mjs`
  - `node --check src/engine/api/admin-invitations-api-client.js`
  - `node --check assets/theme-v2/js/admin-invitations.js`
  - `node --check tests/dev-runtime/BetaInvitationsAdmin.test.mjs`
- Targeted contract validation:
  - `node --test tests/dev-runtime/BetaInvitationsAdmin.test.mjs`
- Static HTML validation:
  - verify `admin/invitations.html` contains no inline `<script>`, `<style>`, or inline event handlers.
- No full samples validation.
- No Playwright unless the targeted contract validation fails to cover behavior.

## Acceptance Criteria
- Admin can create a pending Beta invitation record.
- Admin can list invitations with required fields.
- Admin can expire a pending invitation.
- Admin can revoke a pending invitation.
- Valid invitation acceptance marks the invitation accepted once.
- Revoked, expired, duplicate, missing, and mismatched-email acceptance fail visibly.
- Accepted invitations do not mutate membership data before PR_005.
- Invitation records are auditable and do not store Beta pricing or limits.

## Required Reports
- `docs_build/dev/reports/PR_26169_003-beta-invitations-admin.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Required ZIP
- `tmp/PR_26169_003-beta-invitations-admin_delta.zip`
