# BUILD_PR_26169_014-legal-foundation

## Objective
- Establish the DB-backed legal document source and routing model for downstream public legal pages.

## Source Documents
- PLAN: `docs_build/pr/PLAN_PR_26169_014-legal-foundation.md`
- Business model foundation: `docs_build/pr/PLAN_PR_26169_001-creator-platform-foundation.md`

## Scope
- Add `legal_documents` and `legal_document_versions` as the shared legal content source because no suitable owner-editable legal source exists.
- Seed the required legal document records as draft/unpublished foundation records.
- Add a shared legal document service for document resolution, routing metadata, published-version reads, and diagnostics.
- Add targeted legal foundation contract tests.

## Non-Scope
- No final legal copy approval.
- No public legal page rendering changes.
- No Terms of Service page implementation.
- No Privacy/Cookies/Community/Copyright/DMCA page implementation.
- No legal acceptance modal.
- No Owner legal editor UI.
- No pricing, membership limit, AI credit, or marketplace percentage storage in legal tables.

## Target Files
- `src/dev-runtime/persistence/mock-db-store.js`
- `src/dev-runtime/seed/seed-db-keys.mjs`
- `src/dev-runtime/seed/server-seed-loader.mjs`
- `src/dev-runtime/auth/provider-contract-stubs.mjs`
- `src/dev-runtime/legal/legal-document-service.mjs`
- `tests/dev-runtime/LegalFoundation.test.mjs`

## Implementation Requirements
- Add `legal_documents` fields:
  - `key`
  - `documentType`
  - `slug`
  - `title`
  - `status`
  - `publishedVersionKey`
  - audit fields
- Add `legal_document_versions` fields:
  - `key`
  - `documentKey`
  - `version`
  - `bodyMarkdown`
  - `effectiveAt`
  - `publishedAt`
  - `publishedBy`
  - audit fields
- Required document types:
  - `terms_of_service`
  - `privacy_policy`
  - `cookies_policy`
  - `community_guidelines`
  - `copyright_policy`
  - `dmca_policy`
- Legal documents must support draft and published versions.
- Published reads must return only the linked published version.
- Missing published content must return visible diagnostics and no placeholder body content.
- Draft content must not appear in published reads.
- Legal routing metadata must be stable and crawlable.

## Validation Requirements
- Verify branch is `main`.
- Run syntax checks for changed JavaScript and MJS files.
- Run targeted legal foundation tests:
  - `node --test tests/dev-runtime/LegalFoundation.test.mjs`
- Do not run Playwright.
- Do not run full samples validation.

## Acceptance Criteria
- Legal content has a declared DB-backed source of truth.
- Required legal document types are enumerated and seeded.
- Published legal reads can be implemented without page-local legal constants.
- Missing published content is diagnosed.
- Draft content does not render as published content.
- Owner legal responsibility is represented through service diagnostics and future editor-ready metadata.
