# PLAN_PR_26169_004-membership-data-model

## Objective
- Define the database-driven membership model for Free, Creator, Studio, Beta, Founding Creator, and Founding Studio plans.

## Scope
- Future BUILD must introduce or align membership tables and seed data.
- Membership model must store all pricing, limits, percentages, and plan capabilities in the database.
- Add no runtime behavior in this PLAN PR.

## Non-Scope
- No membership checkout.
- No assignment UI.
- No Owner editor UI.
- No AI credit ledger beyond membership monthly credit fields.

## Implementation Requirements
- Membership plans must be queryable by stable plan code.
- Free plan must be available to all users.
- Creator and Studio plans must be paid public plans.
- Beta must be invitation-only and $0/month.
- Founding Creator and Founding Studio must represent the first 100 paid memberships with locked pricing while active.
- Founding plans inherit Creator or Studio capabilities while storing their locked price separately.
- Creator receives 80% of Net Revenue.
- Studio receives 80% of Net Revenue and 10% bonus purchased AI credits.
- Free cannot sell marketplace assets.
- Creator, Studio, Beta, Founding Creator, and Founding Studio can sell marketplace assets.
- Creator, Studio, Beta, Founding Creator, and Founding Studio have collaboration enabled.

## Data Model Requirements
- `membership_plans` required fields:
  - `key`
  - `code`
  - `displayName`
  - `monthlyPriceCents`
  - `currency`
  - `billingInterval`
  - `isPublic`
  - `requiresInvitation`
  - `isFounding`
  - `basePlanCode`
  - `revenueShareBps`
  - `purchasedCreditBonusBps`
  - `active`
  - audit fields
- `membership_limits` required fields:
  - `key`
  - `planKey`
  - `storageMb`
  - `monthlyAiCredits`
  - `publishExperienceLimit`
  - `maxTeamMembers`
  - `collaborationEnabled`
  - `marketplaceBrowseEnabled`
  - `marketplaceBuyEnabled`
  - `marketplaceFreeDownloadEnabled`
  - `marketplaceSellEnabled`
  - audit fields
- Required plan values:
  - `FREE`: $0/month, 250 MB storage, 0 monthly AI credits, publish limit 1, max team members 1, collaboration disabled, cannot sell.
  - `CREATOR`: $9/month, 1 GB storage, 100 monthly AI credits, max team members 3, can sell, creator analytics, 80% Net Revenue.
  - `STUDIO`: $19/month, 4 GB storage, 400 monthly AI credits, max team members 10, can sell, advanced analytics, 80% Net Revenue, 10% purchased AI credit bonus.
  - `BETA`: $0/month, 4 GB storage, 400 monthly AI credits, max team members 10, invitation-only, Studio-equivalent access.
  - `FOUNDING_CREATOR`: $5/month locked while active, Creator-equivalent limits.
  - `FOUNDING_STUDIO`: $10/month locked while active, Studio-equivalent limits.
- `founding_members` required fields:
  - `key`
  - `userKey`
  - `planKey`
  - `sequenceNumber`
  - `lockedMonthlyPriceCents`
  - `active`
  - `assignedAt`
  - `endedAt`
  - audit fields
- Founding membership assignment must enforce first 100 paid memberships.

## UI Requirements
- No UI is implemented in this PR.
- Future UI must render plan data from service responses.
- Plan labels, prices, limits, marketplace permissions, team limits, and credit amounts must not be hardcoded in the page.

## Validation Requirements
- PLAN-phase validation for this docs-only PR: branch validation only.
- Future BUILD validation must include contract/data checks for seeded plans and limits.
- Future BUILD validation must assert that pricing, limits, revenue share, and bonus percentages are loaded from DB records.
- Future BUILD validation must verify no page-local plan arrays become source of truth.
- No Playwright validation is required for this PLAN-only PR.

## Acceptance Criteria
- All approved membership plans exist in DB-backed records.
- All approved limits and prices match the business model.
- Founding plan data supports locked active pricing and first-100 eligibility.
- Marketplace and AI downstream PRs can read membership capability fields from one source.

## Dependencies
- Upstream: PR 001.
- Downstream: PR 005, PR 006, PR 007, PR 009, PR 010, PR 012, PR 013, PR 017, PR 018.

