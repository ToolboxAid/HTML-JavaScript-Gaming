# PLAN_PR_26169_011-marketplace-categories

## Objective
- Define marketplace categories for discovery and listing classification.

## Scope
- Future BUILD must support the approved categories:
  - Games.
  - Assets.
  - Audio.
  - Music.
  - Worlds.
  - Templates.
  - Tutorials.
- Categories must be exposed through a service or DB-backed source, not page-local arrays.
- Add no runtime behavior in this PLAN PR.

## Non-Scope
- No marketplace item migration.
- No seller revenue model changes.
- No checkout or download implementation.
- No category moderation workflow.

## Implementation Requirements
- Marketplace browsing and listing forms must use the same category source.
- Category codes must be stable and URL-safe.
- Category display labels must match the approved list.
- Browseable category lists must be alphabetically sorted unless an intentional-order exception is documented.
- Existing marketplace items with missing or invalid categories must show diagnostics or migration warnings rather than silently assigning a fallback.
- Category data must be available to Creator and Admin marketplace surfaces.

## Data Model Requirements
- Future BUILD must use an existing marketplace category table/source if present.
- If no category data source exists, introduce a DB-backed `marketplace_categories` source with:
  - `key`
  - `code`
  - `displayName`
  - `active`
  - `sortName`
  - audit fields
- Seed exact category codes:
  - `games`
  - `assets`
  - `audio`
  - `music`
  - `worlds`
  - `templates`
  - `tutorials`
- Marketplace listing records must reference category key or code rather than storing arbitrary category labels.

## UI Requirements
- Category filters and selectors must list the approved categories.
- Browseable category lists should render alphabetically: Assets, Audio, Games, Music, Templates, Tutorials, Worlds.
- User-facing labels must be plain category names.
- Invalid category states must be visible in Admin or diagnostics views.

## Validation Requirements
- PLAN-phase validation for this docs-only PR: branch validation only.
- Future BUILD validation must include targeted category checks for:
  - All seven approved categories exist.
  - No unapproved categories appear in browse/listing UI.
  - Category selector and browse filters use the same source.
  - Invalid category records are rejected or diagnosed.
  - Browseable category order follows alphabetical governance.
- Playwright is required in future BUILD only if marketplace UI behavior is implemented.
- No Playwright validation is required for this PLAN-only PR.

## Acceptance Criteria
- Marketplace categories match the approved list exactly.
- Category source is shared by browse and listing surfaces.
- Category display follows navigation/list sorting governance.
- No page-local category array becomes source of truth.

## Dependencies
- Upstream: PR 009.
- Downstream: marketplace listing, search, and Admin marketplace operations PRs after this stack.

