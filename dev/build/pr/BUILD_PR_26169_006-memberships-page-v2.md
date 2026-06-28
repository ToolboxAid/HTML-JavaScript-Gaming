# BUILD_PR_26169_006-memberships-page-v2

## Objective
- Replace the static Memberships page with a Theme V2 page that renders approved membership plans, limits, active membership state, and disabled upgrade affordances from DB-backed membership service data.

## Source PLAN
- `docs_build/pr/PLAN_PR_26169_001-creator-platform-foundation.md`
- `docs_build/pr/PLAN_PR_26169_006-memberships-page-v2.md`

## Scope
- Add a Local API membership catalog/read endpoint backed by `membership_plans`, `membership_limits`, `user_memberships`, `founding_members`, and invitations.
- Add a browser API client for memberships page data.
- Update `memberships/index.html` to use external JavaScript and DB-backed placeholders.
- Add Theme V2 memberships page controller that renders plan cards and active membership state from service data.
- Update targeted membership page tests for service-backed display and shared chrome.

## Non-Scope
- No checkout provider integration.
- No successful purchase simulation.
- No Owner editing controls.
- No Admin invitation creation UI.
- No AI credit purchase flow.
- No marketplace/team/AI enforcement changes.

## Exact Target Files
- `docs_build/pr/BUILD_PR_26169_006-memberships-page-v2.md`
- `src/dev-runtime/memberships/membership-assignment-service.mjs`
- `src/dev-runtime/server/local-api-router.mjs`
- `src/engine/api/memberships-api-client.js`
- `assets/theme-v2/js/memberships-page.js`
- `memberships/index.html`
- `tests/dev-runtime/MembershipsPageData.test.mjs`
- `tests/playwright/tools/PublicMembershipsPage.spec.mjs`
- `docs_build/dev/codex_commands.md`
- `docs_build/dev/commit_comment.txt`
- `docs_build/dev/reports/PR_26169_006-memberships-page-v2.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Implementation Requirements
- Plan display data must be derived from `membership_plans` and `membership_limits`.
- Active membership display must be derived from `user_memberships` through membership resolution.
- Beta must display as invitation-only, not a public paid upgrade.
- Founding plans must show locked pricing only when active for the current user.
- Creator and Studio action buttons must be disabled and clearly marked as future checkout placeholders.
- The page must not store pricing, limits, percentages, credits, or plan arrays as source-of-truth constants.
- Missing membership resolution must produce a visible error state.

## UI Requirements
- Use existing Theme V2 page structure and shared partials.
- Show active plan, billing price, storage, monthly AI credits, team limit, publish limit, marketplace selling, revenue share, purchased credit bonus, and analytics tier.
- Show unavailable actions as disabled controls.
- Use external JavaScript only; no inline `<script>`, `<style>`, inline event handlers, or page-local CSS.

## Validation Plan
- Branch validation before implementation and before packaging: current branch must be `main`.
- Syntax checks:
  - `node --check src/dev-runtime/memberships/membership-assignment-service.mjs`
  - `node --check src/dev-runtime/server/local-api-router.mjs`
  - `node --check src/engine/api/memberships-api-client.js`
  - `node --check assets/theme-v2/js/memberships-page.js`
  - `node --check tests/dev-runtime/MembershipsPageData.test.mjs`
  - `node --check tests/playwright/tools/PublicMembershipsPage.spec.mjs`
- Targeted contract validation:
  - `node --test tests/dev-runtime/MembershipsPageData.test.mjs`
- Targeted Playwright validation:
  - `npx playwright test tests/playwright/tools/PublicMembershipsPage.spec.mjs`
- Static HTML validation:
  - verify `memberships/index.html` contains no inline `<script>`, `<style>`, inline event handlers, or `[style]` attributes.
- No full samples validation.

## Acceptance Criteria
- Memberships page displays the approved business model from DB-backed service data.
- Free, Creator, Studio, Beta, Founding Creator, and Founding Studio states render from service responses.
- No page-local pricing, percentages, limits, credits, or AI costs become source of truth.
- Active membership state is accurate for regular, Beta, and founding users.
- Upgrade/change controls do not claim success without checkout or assignment.

## Required Reports
- `docs_build/dev/reports/PR_26169_006-memberships-page-v2.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Required ZIP
- `tmp/PR_26169_006-memberships-page-v2_delta.zip`
