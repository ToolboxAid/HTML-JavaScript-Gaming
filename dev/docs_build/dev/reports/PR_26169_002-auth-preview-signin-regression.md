# PR_26169_002-auth-preview-signin-regression Report

## Scope
- PR: `PR_26169_002-auth-preview-signin-regression`
- Source PLAN: `docs_build/pr/PLAN_PR_26169_002-auth-preview-signin-regression.md`
- Approved business model dependency: `docs_build/pr/PLAN_PR_26169_001-creator-platform-foundation.md`
- BUILD doc: `docs_build/pr/BUILD_PR_26169_002-auth-preview-signin-regression.md`

## Branch Validation
- Current branch: `main`
- Expected branch: `main`
- Local branches found: `main`
- Result: PASS

## Requirement Checklist
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`: PASS
- Read source PLAN docs before implementation: PASS
- Create BUILD_PR before implementation: PASS
- Implement only PR_26169_002 purpose: PASS
- Preserve public sign-in page and avoid public Local DB controls: PASS
- Resolve preview users through persisted `users`, `roles`, and `user_roles` records: PASS
- Keep Creator, Admin, and Owner role states distinguishable/testable: PASS
- Return actionable diagnostics for malformed selected user keys: PASS
- Preserve existing missing user and missing role diagnostics: PASS
- Keep sign-out cleanup scoped to selected session state: PASS
- Do not add membership, marketplace, AI credit, team, or legal behavior: PASS
- No Playwright/runtime broad validation: PASS, not required for this API/dev-runtime scoped PR

## Implementation Summary
- Exported `sessionUserFromIdentityTables` for targeted contract coverage.
- Trimmed selected preview user keys before persisting session state.
- Rejected malformed non-empty selected user keys before database lookup, returning an actionable diagnostic instead of a silent Guest fallback or database-read diagnostic.
- Preserved valid selected-user resolution through persisted identity tables.
- Added targeted tests for malformed selected keys, logout cleanup after invalid preview state, Creator/Admin/Owner role resolution, missing users, and missing referenced roles.

## Validation
- `node --check src/dev-runtime/server/local-api-router.mjs`: PASS
- `node --check tests/dev-runtime/SupabaseProviderContractStub.test.mjs`: PASS
- `node --test --test-name-pattern "malformed|Creator Admin and Owner|missing user and missing role" tests/dev-runtime/SupabaseProviderContractStub.test.mjs`: PASS
- `git diff --check -- src/dev-runtime/server/local-api-router.mjs tests/dev-runtime/SupabaseProviderContractStub.test.mjs docs_build/pr/BUILD_PR_26169_002-auth-preview-signin-regression.md`: PASS
  - Note: Git reported Windows line-ending warnings for touched tracked JS files; no whitespace errors were reported.

## Lanes
- Impacted lane: contract/runtime auth preview session lane under `src/dev-runtime/`.
- Skipped lanes: Playwright, full runtime server suite, integration, engine, samples.
- Skip rationale: PR touches server-side dev-runtime auth/session resolution and targeted contract coverage only; no browser UI, engine, sample, or broad product-data behavior was changed.
- Full suite requirement: Not triggered by this PR scope.

## Acceptance Criteria Evidence
- Creator preview/session role state: PASS via targeted resolver test.
- Admin preview/session role state: PASS via targeted resolver test.
- Owner preview/session role state: PASS via targeted resolver test.
- Missing selected user diagnostic: PASS via targeted resolver test preserving existing message family.
- Missing referenced role diagnostic: PASS via targeted resolver test preserving existing message family.
- Malformed selected user key diagnostic: PASS via route-level test.
- Sign-out/session clear behavior: PASS via route-level logout assertion after malformed selected state.
- No business-model data in auth session state: PASS, no pricing/limits/credits/marketplace data added.

## Artifacts
- Changed files list: `docs_build/dev/reports/codex_changed_files.txt`
- Review diff: `docs_build/dev/reports/codex_review.diff`
- ZIP artifact: `tmp/PR_26169_002-auth-preview-signin-regression_delta.zip`
- ZIP validation: PASS, size > 0, contains repo-relative changed files and reports.
