# BUILD_PR_26169_002-auth-preview-signin-regression

## Objective
- Stabilize auth preview/session selection so selected users resolve from persisted `users`, `roles`, and `user_roles` records with visible diagnostics for invalid identity state.

## Source PLAN
- `docs_build/pr/PLAN_PR_26169_001-creator-platform-foundation.md`
- `docs_build/pr/PLAN_PR_26169_002-auth-preview-signin-regression.md`

## Scope
- Preserve the production-safe public sign-in page with no public Local DB controls.
- Keep preview/session role switching as API/dev-test behavior only.
- Ensure selected preview users expose stable `users.key` values and role slugs.
- Ensure invalid selected user keys, missing users, and missing role references return actionable diagnostics instead of silently becoming an indistinct Guest state.
- Add targeted regression coverage for Creator, Admin, and Owner role resolution.

## Non-Scope
- No membership tables.
- No beta invitation workflow.
- No Owner configuration UI.
- No marketplace, AI credit, legal, or team behavior.
- No production auth provider redesign.
- No public preview role picker UI.

## Exact Target Files
- `src/dev-runtime/server/local-api-router.mjs`
- `tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- `docs_build/pr/BUILD_PR_26169_002-auth-preview-signin-regression.md`
- `docs_build/dev/codex_commands.md`
- `docs_build/dev/commit_comment.txt`
- `docs_build/dev/reports/PR_26169_002-auth-preview-signin-regression.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Implementation Requirements
- In `sessionUserFromIdentityTables`, preserve empty user-key behavior as unauthenticated Guest.
- For a non-empty malformed selected user key, return Guest with a diagnostic that identifies the invalid `users.key` shape.
- Keep missing persisted user diagnostics unchanged.
- Keep missing `user_roles` diagnostics unchanged.
- Keep missing referenced role diagnostics unchanged.
- Preserve successful role resolution for Creator, Admin, and Owner.
- Do not store membership pricing, limits, credits, marketplace percentages, or other business-model data in auth session state.

## Validation Plan
- Branch validation:
  - Verify current branch is `main`.
- Static checks:
  - `node --check src/dev-runtime/server/local-api-router.mjs`
  - `node --check tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- Targeted contract tests:
  - Run only auth/session tests covering selected user resolution, invalid selected user, missing user, missing role, and Owner role state.
- Runtime validation:
  - No broad runtime validation.
- Playwright:
  - Not required unless the targeted contract change touches browser UI; this BUILD does not.

## Acceptance Criteria
- Creator preview/session selection resolves with stable `userKey` and `roleSlugs`.
- Admin preview/session selection resolves with stable `userKey`, `roleSlugs`, and `isAdmin`.
- Owner preview/session selection resolves with stable `userKey`, `roleSlugs`, `isAdmin`, and `isOwner`.
- Missing selected user returns an actionable diagnostic.
- Missing referenced role returns an actionable diagnostic.
- Malformed non-empty selected user key returns an actionable diagnostic.
- Sign-out/session clear behavior remains scoped to the selected session key and does not mutate product data.
- No membership, marketplace, AI credit, team, or legal implementation is introduced.

## Required Reports
- `docs_build/dev/reports/PR_26169_002-auth-preview-signin-regression.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Required ZIP
- `tmp/PR_26169_002-auth-preview-signin-regression_delta.zip`
