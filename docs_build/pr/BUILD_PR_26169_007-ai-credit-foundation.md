# BUILD_PR_26169_007-ai-credit-foundation

## Objective
- Implement database-driven AI credit data contracts and service behavior for monthly grants, purchased packs, Studio bonuses, action debits, insufficient-credit rejection, and usage logging.

## Source PLAN
- `docs_build/pr/PLAN_PR_26169_001-creator-platform-foundation.md`
- `docs_build/pr/PLAN_PR_26169_007-ai-credit-foundation.md`

## Scope
- Add `ai_actions`, `ai_credit_packs`, `user_ai_credits`, and `ai_usage_log` schemas.
- Seed AI action costs and Small/Medium/Large pack definitions from database rows.
- Register AI credit tables as provider product tables.
- Add an AI credit service that derives monthly grants from membership limits, pack bonuses from membership plans, and action costs from `ai_actions`.
- Add focused contract tests for grants, packs, Studio bonus, Beta monthly credits, action debits, insufficient-credit rejection, and usage logs.

## Non-Scope
- No AI provider integration.
- No checkout flow for purchasing packs.
- No AI generation UI.
- No Owner AI editor UI.
- No public AI credit display UI.

## Exact Target Files
- `docs_build/pr/BUILD_PR_26169_007-ai-credit-foundation.md`
- `src/dev-runtime/persistence/mock-db-store.js`
- `src/dev-runtime/seed/seed-db-keys.mjs`
- `src/dev-runtime/seed/server-seed-loader.mjs`
- `src/dev-runtime/auth/provider-contract-stubs.mjs`
- `src/dev-runtime/ai/ai-credit-service.mjs`
- `tests/dev-runtime/AiCreditFoundation.test.mjs`
- `docs_build/dev/codex_commands.md`
- `docs_build/dev/commit_comment.txt`
- `docs_build/dev/reports/PR_26169_007-ai-credit-foundation.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Implementation Requirements
- Monthly credits must derive from `membership_limits.monthlyAiCredits`.
- AI action costs must derive from `ai_actions.creditCost`.
- Credit pack credits and prices must derive from `ai_credit_packs`.
- Studio and Founding Studio bonus purchased credits must derive from `membership_plans.purchasedCreditBonusBps`.
- Beta users must receive Studio-equivalent monthly included credits without paid Studio billing.
- Free users must receive 0 monthly AI credits.
- Credit debits must check balance before mutation and write `ai_usage_log` only after a successful debit.
- Grants and purchases must write `ai_usage_log`.
- Usage logs must identify user, action, delta, source, source key, and resulting balance.

## Validation Plan
- Branch validation before implementation and before packaging: current branch must be `main`.
- Syntax checks:
  - `node --check src/dev-runtime/persistence/mock-db-store.js`
  - `node --check src/dev-runtime/seed/seed-db-keys.mjs`
  - `node --check src/dev-runtime/seed/server-seed-loader.mjs`
  - `node --check src/dev-runtime/auth/provider-contract-stubs.mjs`
  - `node --check src/dev-runtime/ai/ai-credit-service.mjs`
  - `node --check tests/dev-runtime/AiCreditFoundation.test.mjs`
- Targeted contract validation:
  - `node --test tests/dev-runtime/AiCreditFoundation.test.mjs`
- Static scope validation:
  - verify no AI provider integration, checkout UI, generation UI, Owner editor UI, or public display UI is added.
- No Playwright validation.
- No full samples validation.

## Acceptance Criteria
- AI credit costs, pack prices, pack credits, monthly credits, and bonus percentages are DB-driven.
- Monthly grants match Free, Creator, Studio, Beta, and Founding Studio membership data.
- Small, Medium, and Large packs match approved credits and prices.
- Studio bonus behavior is tied to membership plan data.
- Credit balance changes are auditable through `ai_usage_log`.
- AI actions cannot debit when credits are insufficient.

## Required Reports
- `docs_build/dev/reports/PR_26169_007-ai-credit-foundation.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Required ZIP
- `tmp/PR_26169_007-ai-credit-foundation_delta.zip`
