# PLAN_PR_26169_016-privacy-cookies-community-copyright-dmca

## Objective
- Plan the remaining legal pages: Privacy Policy, Cookies Policy, Community Guidelines, Copyright Policy, and DMCA Policy.

## Scope
- Future BUILD must add or align routes and rendering for five legal document types.
- Content must come from the legal content source defined in PR 014.
- Add no runtime behavior in this PLAN PR.

## Non-Scope
- No Terms of Service changes.
- No cookie consent banner unless explicitly scoped later.
- No moderation workflow.
- No DMCA ticketing or support queue.

## Implementation Requirements
- Public pages must render the current published document for:
  - `privacy_policy`
  - `cookies_policy`
  - `community_guidelines`
  - `copyright_policy`
  - `dmca_policy`
- Missing published content must show visible diagnostics instead of placeholder copy.
- Footer/header legal links must resolve to these pages if navigation is in scope.
- Community and copyright pages must not introduce moderation or takedown behavior beyond legal content rendering.
- DMCA page must provide legal content rendering only unless future BUILD explicitly scopes submission handling.

## Data Model Requirements
- Read legal content from `legal_documents` and published versions defined in PR 014.
- Required slugs:
  - `privacy`
  - `cookies`
  - `community`
  - `copyright`
  - `dmca`
- Do not store legal copy in page-local constants.
- Do not add membership, AI credit, marketplace, or team data changes.

## UI Requirements
- Each page must show title, effective date, and body content.
- Stable page headings:
  - `Privacy Policy`
  - `Cookies Policy`
  - `Community Guidelines`
  - `Copyright Policy`
  - `DMCA Policy`
- Pages must use public/root Theme V2 structure if public.
- Legal links must be browseable and alphabetically sorted where presented as a list, unless governed footer order already exists.
- No inline script, inline style, or page-local CSS in future BUILD.

## Validation Requirements
- PLAN-phase validation for this docs-only PR: branch validation only.
- Future BUILD validation must include targeted route/content checks for:
  - All five routes resolve.
  - Published content renders for each document.
  - Missing published content is diagnosed for each document.
  - Draft content does not render publicly.
  - Navigation/footer links resolve if modified.
- No Playwright validation is required for this PLAN-only PR.

## Acceptance Criteria
- All five legal pages are rendered through the legal foundation.
- No page owns duplicate legal copy.
- Public legal routing is stable.
- Legal page work remains separate from support, moderation, and takedown workflow implementation.

## Dependencies
- Upstream: PR 014, PR 015.
- Downstream: PR 017, future support/moderation/DMCA workflow PRs.

