# PLAN_PR_26169_015-terms-of-service

## Objective
- Plan the Terms of Service page using the legal foundation.

## Scope
- Future BUILD must add or align the Terms of Service route and content rendering.
- Terms content must come from the legal content source defined in PR 014.
- Add no runtime behavior in this PLAN PR.

## Non-Scope
- No Privacy, Cookies, Community, Copyright, or DMCA pages.
- No legal acceptance tracking unless exact future BUILD scope adds it.
- No membership, marketplace, or AI pricing changes.

## Implementation Requirements
- Terms page must render the current published `terms_of_service` document.
- Page must show title and effective date.
- If no published Terms exist, public route must show a visible unavailable/legal diagnostics state and must not render fake copy.
- Footer/header legal links must resolve to the Terms page if navigation is in scope.
- Terms content must be editable only through Owner-scoped legal management when editing exists.
- Terms page must not duplicate legal content in static page-local constants.

## Data Model Requirements
- Read legal content from:
  - `legal_documents.documentType = terms_of_service`.
  - The linked published legal document version.
- If legal acceptance tracking is explicitly added later, use a separate acceptance table and do not overload `user_memberships`.
- No changes to membership pricing, AI credit costs, marketplace percentages, or membership limits in this PR.

## UI Requirements
- Terms page must use public/root Theme V2 structure if it is a public page.
- Show document title, effective date, and body content.
- Provide stable page heading text: `Terms of Service`.
- Avoid in-page marketing copy or feature explanations.
- No inline script, inline style, or page-local CSS in future BUILD.

## Validation Requirements
- PLAN-phase validation for this docs-only PR: branch validation only.
- Future BUILD validation must include targeted route/content checks for:
  - Terms route exists.
  - Published Terms render.
  - Missing published Terms shows a visible diagnostic.
  - Draft Terms do not render publicly.
  - Header/footer link resolves if modified.
- No Playwright validation is required for this PLAN-only PR.

## Acceptance Criteria
- Terms of Service is implemented as a legal document render, not hardcoded page copy.
- Public users can reach the Terms page.
- Missing content does not silently fallback.
- Terms work does not modify other legal pages.

## Dependencies
- Upstream: PR 014.
- Downstream: PR 016.

