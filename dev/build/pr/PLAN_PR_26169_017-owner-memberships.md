# PLAN_PR_26169_017-owner-memberships

## Objective
- Plan Owner controls for membership pricing, limits, marketplace percentages, founding programs, and revenue settings.

## Scope
- Future BUILD must expose Owner-editable configuration for membership and marketplace business rules.
- Owner controls must edit DB-backed data, not static files or page-local constants.
- Add no runtime behavior in this PLAN PR.

## Non-Scope
- No payment provider checkout.
- No Admin invitation workflow changes.
- No AI action cost or pack pricing editor; that is PR 018.
- No legal document editor unless exact future BUILD combines with PR 014.

## Implementation Requirements
- Owner can view and edit membership plan fields:
  - monthly price.
  - active status.
  - public/invitation/founding flags.
  - revenue share percentage.
  - purchased credit bonus percentage.
- Owner can view and edit membership limit fields:
  - storage.
  - monthly AI credits.
  - publish limit.
  - team limit.
  - collaboration enabled.
  - marketplace permissions.
- Owner can view founding program state:
  - first 100 paid membership capacity.
  - assigned founding sequence count.
  - locked pricing for active founding members.
- Owner can edit marketplace revenue percentage from 80% to another value only through DB-backed records.
- Owner changes must be audited.
- Invalid edits must be rejected before save with visible diagnostics.

## Data Model Requirements
- Edit existing DB-backed records:
  - `membership_plans`
  - `membership_limits`
  - `founding_members` for program state visibility and locked active prices.
- All price fields must use integer cents.
- Percent fields must use basis points.
- Storage must use MB.
- Publish limit may be nullable for unlimited plans; Free must be `1`.
- Purchased credit bonus must be `1000` basis points for Studio and Founding Studio unless Owner changes it.
- Initial creator revenue share must be `8000` basis points for selling plans.

## UI Requirements
- Owner Memberships page must be Owner-only.
- UI must display current values and pending edits before save.
- Use numeric inputs for prices, storage, credits, limits, and percentages.
- Use toggles/checkboxes for active, public, invitation-only, collaboration, and marketplace permission flags.
- Show founding program count out of 100.
- Show save success/failure status and validation errors.
- No hardcoded business model values may be used as editable source of truth; defaults may be shown only from fetched DB records.

## Validation Requirements
- PLAN-phase validation for this docs-only PR: branch validation only.
- Future BUILD validation must include targeted Owner/service checks for:
  - Owner can update Creator price.
  - Owner can update Studio team limit.
  - Owner can update revenue share basis points.
  - Non-Owner cannot access editor.
  - Invalid negative price is rejected.
  - Invalid percentage above 100% is rejected.
  - Founding locked active price is not overwritten by base plan price edits.
- Playwright is required in future BUILD only if Owner UI behavior is implemented.
- No Playwright validation is required for this PLAN-only PR.

## Acceptance Criteria
- Membership pricing, percentages, limits, and founding program settings are Owner-editable from DB-backed records.
- Owner edits are validated and audited.
- Non-Owners cannot access membership business model controls.
- Downstream marketplace and AI displays read updated data through services.

## Dependencies
- Upstream: PR 004, PR 005, PR 006, PR 009, PR 010, PR 014.
- Downstream: PR 018, PR 019.

