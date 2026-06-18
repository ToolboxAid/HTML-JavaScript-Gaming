# PLAN_PR_26169_014-legal-foundation

## Objective
- Define the legal content foundation for Terms, Privacy, Cookies, Community, Copyright, and DMCA pages.

## Scope
- Future BUILD must establish a legal document source and routing model.
- Owner must be able to manage legal content in a later PR or through an existing Owner settings surface.
- Add no runtime behavior in this PLAN PR.

## Non-Scope
- No final legal copy approval.
- No Terms of Service page content beyond structural requirements.
- No Privacy/Cookies/Community/Copyright/DMCA page content beyond structural requirements.
- No legal acceptance modal unless explicitly scoped later.

## Implementation Requirements
- Legal document pages must use one shared legal content service.
- Legal documents must support draft and published versions.
- Published legal pages must render the current published version.
- Missing published legal content must fail visibly in Admin/Owner diagnostics and must not render placeholder legal text as production content.
- Legal content edits must be Owner-scoped.
- Legal page routing must be stable and crawlable.
- Legal content must not be hardcoded into unrelated UI components.

## Data Model Requirements
- Future BUILD must use an existing owner-editable content/settings table if present.
- If no suitable source exists, introduce:
  - `legal_documents`: `key`, `documentType`, `slug`, `title`, `status`, `publishedVersionKey`, audit fields.
  - `legal_document_versions`: `key`, `documentKey`, `version`, `bodyMarkdown`, `effectiveAt`, `publishedAt`, `publishedBy`, audit fields.
- Required document types:
  - terms_of_service.
  - privacy_policy.
  - cookies_policy.
  - community_guidelines.
  - copyright_policy.
  - dmca_policy.
- Legal document storage must not include pricing, membership limits, AI credit costs, or marketplace percentages.

## UI Requirements
- Public legal pages must share consistent header/footer and Theme V2 styling if they are public/root pages.
- Owner/Admin diagnostics must show document type, status, current published version, and last updated date.
- User-facing legal pages must show title, effective date, and content body.
- No page-local CSS, inline styles, or inline scripts in future BUILD.

## Validation Requirements
- PLAN-phase validation for this docs-only PR: branch validation only.
- Future BUILD validation must include targeted content/route checks for:
  - Each required legal document type resolves.
  - Published pages render only published content.
  - Missing published content is diagnosed.
  - Draft content does not appear publicly.
  - Owner-only edit access is enforced when editing is introduced.
- No Playwright validation is required for this PLAN-only PR.

## Acceptance Criteria
- Legal content has a declared source of truth.
- Required legal document types are enumerated.
- Published legal pages can be implemented without page-local legal constants.
- Owner legal responsibility is represented in the plan.

## Dependencies
- Upstream: PR 001, PR 002.
- Downstream: PR 015, PR 016, PR 017.

