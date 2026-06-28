# BUILD_PR_26169_016-privacy-cookies-community-copyright-dmca

## Objective
- Implement the remaining public legal document pages for Privacy Policy, Cookies Policy, Community Guidelines, Copyright Policy, and DMCA Policy using the PR_26169_014 legal foundation and the PR_26169_015 shared legal page renderer.

## Source Documents
- PLAN: `docs_build/pr/PLAN_PR_26169_016-privacy-cookies-community-copyright-dmca.md`
- Legal foundation: `docs_build/pr/BUILD_PR_26169_014-legal-foundation.md`
- Terms renderer dependency: `docs_build/pr/BUILD_PR_26169_015-terms-of-service.md`

## Scope
- Align required legal document slugs for the five remaining document types.
- Replace or add public Theme V2 legal pages for:
  - `privacy_policy`
  - `cookies_policy`
  - `community_guidelines`
  - `copyright_policy`
  - `dmca_policy`
- Route each page through the shared legal document API/client/page module.
- Show title, effective date, body content, and visible unavailable diagnostics.
- Update footer and route mapping so the five public legal pages are reachable.
- Add targeted legal page validation coverage.

## Non-Scope
- No Terms of Service page changes.
- No cookie consent banner.
- No moderation workflow.
- No DMCA submission, ticketing, or support queue.
- No final legal copy approval.
- No membership, marketplace, AI credit, team, Owner editor, or admin operations changes.

## Target Files
- `src/dev-runtime/legal/legal-document-service.mjs`
- `assets/theme-v2/js/legal-document-page.js`
- `assets/theme-v2/js/gamefoundry-partials.js`
- `assets/theme-v2/partials/footer.html`
- `legal/privacy-policy.html`
- `legal/cookies-policy.html`
- `legal/community-guidelines.html`
- `legal/copyright-policy.html`
- `legal/dmca-policy.html`
- `tests/dev-runtime/LegalFoundation.test.mjs`
- `tests/playwright/tools/RemainingLegalPages.spec.mjs`

## Implementation Requirements
- Public pages must request their matching legal document type from the legal content API.
- Public pages must not contain page-local legal body copy.
- Missing published content must show visible diagnostics and an empty body.
- Draft content must not render publicly.
- Required slugs must be:
  - `privacy`
  - `cookies`
  - `community`
  - `copyright`
  - `dmca`
- Footer legal links must resolve to the implemented pages.
- Legal links presented as browseable lists must be alphabetically sorted.
- Keep all CSS and JavaScript external.

## Validation Requirements
- Verify branch is `main`.
- Run syntax checks for changed JavaScript and MJS files.
- Run static HTML restriction checks for all five changed legal pages.
- Run targeted legal foundation unit validation:
  - `node --test tests/dev-runtime/LegalFoundation.test.mjs`
- Run targeted legal page Playwright validation:
  - `npx playwright test tests/playwright/tools/RemainingLegalPages.spec.mjs`
- Generate Playwright V8 coverage reports through the targeted Playwright spec.
- Run scoped `git diff --check`.
- Do not run full samples validation.

## Acceptance Criteria
- All five pages render through the legal foundation.
- No page owns duplicate legal body copy.
- Published content renders with title, effective date, and body.
- Missing published content is visibly diagnosed for every page.
- Draft content does not render publicly.
- Footer legal navigation resolves to the implemented routes.
- Terms of Service remains unchanged by this PR.
