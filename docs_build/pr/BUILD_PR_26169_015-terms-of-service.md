# BUILD_PR_26169_015-terms-of-service

## Objective
- Implement the public Terms of Service route as a legal document render backed by the PR_26169_014 legal foundation.

## Source Documents
- PLAN: `docs_build/pr/PLAN_PR_26169_015-terms-of-service.md`
- Legal foundation: `docs_build/pr/BUILD_PR_26169_014-legal-foundation.md`

## Scope
- Align `legal/terms.html` to render the `terms_of_service` legal document through a shared API/client/page module.
- Add a public Local API read route for published legal documents.
- Add a browser API client for published legal document reads.
- Add Terms page behavior that shows title, effective date, published body, or a visible unavailable diagnostic.
- Add targeted Terms page Playwright coverage.

## Non-Scope
- No Privacy, Cookies, Community, Copyright, or DMCA page changes.
- No legal acceptance tracking.
- No membership, marketplace, AI pricing, legal editor, or Owner editing changes.
- No final legal copy approval.

## Target Files
- `src/dev-runtime/server/local-api-router.mjs`
- `src/engine/api/legal-api-client.js`
- `assets/theme-v2/js/legal-document-page.js`
- `legal/terms.html`
- `tests/playwright/tools/TermsOfServicePage.spec.mjs`

## Implementation Requirements
- Terms page must request `terms_of_service` from the legal content API.
- Terms page must not contain page-local Terms body copy.
- Terms page must show stable heading text `Terms of Service`.
- Terms page must show effective date when published content is available.
- Terms page must show visible unavailable diagnostics when no published Terms exist.
- Draft Terms content must not render publicly.
- Keep all CSS and JavaScript external.

## Validation Requirements
- Verify branch is `main`.
- Run syntax checks for changed JavaScript and MJS files.
- Run static HTML restriction checks for `legal/terms.html`.
- Run targeted Playwright:
  - `npx playwright test tests/playwright/tools/TermsOfServicePage.spec.mjs`
- Generate Playwright V8 coverage reports through the targeted Playwright spec.
- Do not run full samples validation.

## Acceptance Criteria
- Terms of Service is implemented as a legal document render, not hardcoded page copy.
- Public users can reach the Terms page.
- Published Terms render through the shared page module.
- Missing published Terms shows a visible diagnostic and no fake copy.
- Terms work does not modify other legal pages.
