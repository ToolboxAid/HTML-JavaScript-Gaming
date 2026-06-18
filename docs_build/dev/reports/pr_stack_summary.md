# PR Stack Summary: PR_26169 Creator Platform Foundation

## Scope
- This report summarizes the PLAN-only documentation stack for:
  - `PR_26169_001-creator-platform-foundation`
  - `PR_26169_002-auth-preview-signin-regression`
  - `PR_26169_003-beta-invitations-admin`
  - `PR_26169_004-membership-data-model`
  - `PR_26169_005-membership-assignment`
  - `PR_26169_006-memberships-page-v2`
  - `PR_26169_007-ai-credit-foundation`
  - `PR_26169_008-ai-credit-display`
  - `PR_26169_009-marketplace-membership-rules`
  - `PR_26169_010-marketplace-revenue-model`
  - `PR_26169_011-marketplace-categories`
  - `PR_26169_012-teams-foundation`
  - `PR_26169_013-team-enforcement`
  - `PR_26169_014-legal-foundation`
  - `PR_26169_015-terms-of-service`
  - `PR_26169_016-privacy-cookies-community-copyright-dmca`
  - `PR_26169_017-owner-memberships`
  - `PR_26169_018-owner-ai-credits`
  - `PR_26169_019-admin-health-operations`

## Approved Business Model Captured
- Free: $0/month, 250 MB storage, 0 AI credits/month, publish 1 experience, no collaboration, browse marketplace, download free assets, buy marketplace assets, cannot sell.
- Creator: $9/month, 1 GB storage, 100 AI credits/month, up to 3 team members, sell marketplace assets, Creator analytics, 80% Net Revenue.
- Studio: $19/month, 4 GB storage, 400 AI credits/month, up to 10 team members, advanced analytics, 80% Net Revenue, 10% bonus purchased AI credits.
- Beta: $0/month, 4 GB storage, 400 AI credits/month, up to 10 team members, invitation only, Studio-equivalent access.
- Founding Creator: first 100 paid memberships, $5/month, locked while active.
- Founding Studio: first 100 paid memberships, $10/month, locked while active.
- Marketplace: everyone can browse, buy, and download free assets; Creator and higher can sell.
- Marketplace categories: Games, Assets, Audio, Music, Worlds, Templates, Tutorials.
- Revenue: creator receives 80% of Net Revenue.
- Net Revenue: sale amount less processing fees, taxes, refunds, chargebacks, and required deductions.
- AI credit packs:
  - Small: 100 credits, $5.
  - Medium: 500 credits, $20.
  - Large: 3000 credits, $99.
- Roles:
  - Creator: platform user.
  - Admin: health, infrastructure, operations, invitations, AI monitoring, support.
  - Owner: membership pricing, marketplace percentages, AI pricing, AI action costs, founding programs, legal, revenue settings.

## Required Database Tables Captured
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

## Stack Dependency Order
- PR 001 is the shared foundation for every later PR.
- PR 002 stabilizes auth preview for Creator/Admin/Owner role context.
- PR 003 adds Admin Beta invitation planning.
- PR 004 defines membership tables and seed values.
- PR 005 defines assignment of active memberships.
- PR 006 renders Memberships page V2 from DB-backed data.
- PR 007 defines AI credit costs, packs, balances, and ledger.
- PR 008 displays AI credit balances and packs.
- PR 009 enforces marketplace membership rules.
- PR 010 defines Net Revenue and creator revenue share.
- PR 011 defines marketplace categories.
- PR 012 defines project team membership foundation.
- PR 013 enforces team limits.
- PR 014 defines legal content foundation.
- PR 015 implements Terms planning from legal foundation.
- PR 016 implements remaining legal page planning from legal foundation.
- PR 017 adds Owner membership, marketplace, founding, and revenue settings planning.
- PR 018 adds Owner AI pricing and action-cost planning.
- PR 019 adds Admin health and operations planning across the stack.

## Validation Report
- Current branch: `main`.
- Expected branch: `main`.
- Local branches found: `main`.
- Branch validation: PASS.
- Runtime validation: SKIP, docs-only PLAN request.
- Playwright validation: SKIP, no runtime or UI implementation.
- ZIP packaging: SKIP, this request explicitly required planning documentation only and did not request BUILD execution.

## Files Created
- `docs_build/pr/PLAN_PR_26169_001-creator-platform-foundation.md`
- `docs_build/pr/PLAN_PR_26169_002-auth-preview-signin-regression.md`
- `docs_build/pr/PLAN_PR_26169_003-beta-invitations-admin.md`
- `docs_build/pr/PLAN_PR_26169_004-membership-data-model.md`
- `docs_build/pr/PLAN_PR_26169_005-membership-assignment.md`
- `docs_build/pr/PLAN_PR_26169_006-memberships-page-v2.md`
- `docs_build/pr/PLAN_PR_26169_007-ai-credit-foundation.md`
- `docs_build/pr/PLAN_PR_26169_008-ai-credit-display.md`
- `docs_build/pr/PLAN_PR_26169_009-marketplace-membership-rules.md`
- `docs_build/pr/PLAN_PR_26169_010-marketplace-revenue-model.md`
- `docs_build/pr/PLAN_PR_26169_011-marketplace-categories.md`
- `docs_build/pr/PLAN_PR_26169_012-teams-foundation.md`
- `docs_build/pr/PLAN_PR_26169_013-team-enforcement.md`
- `docs_build/pr/PLAN_PR_26169_014-legal-foundation.md`
- `docs_build/pr/PLAN_PR_26169_015-terms-of-service.md`
- `docs_build/pr/PLAN_PR_26169_016-privacy-cookies-community-copyright-dmca.md`
- `docs_build/pr/PLAN_PR_26169_017-owner-memberships.md`
- `docs_build/pr/PLAN_PR_26169_018-owner-ai-credits.md`
- `docs_build/pr/PLAN_PR_26169_019-admin-health-operations.md`
- `docs_build/dev/reports/pr_stack_summary.md`
