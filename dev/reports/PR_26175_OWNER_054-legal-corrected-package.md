# PR_26175_OWNER_054-legal-corrected-package

## Purpose
Apply `gfs_legal_corrected_package.zip` as the legal foundation implementation source and fix public legal page rendering.

## Package Handling
- Extracted package to `tmp/gfs_legal_corrected_package_extract_20260624_230100`.
- Read `README.md`.
- Read `CODEX_FIX_INSTRUCTIONS.md`.
- Read every file under package `/legal/`, including canonical pages, markdown source documents, `legal-nav.js`, and legacy redirect pages.
- Treated `CODEX_FIX_INSTRUCTIONS.md` as the authoritative implementation specification.

## Root Cause
The repository legal pages were split across two incomplete implementations:

- Several public legal pages used `data-legal-document-page`, `data-legal-document-type`, and `assets/theme-v2/js/legal-document-page.js`.
- That dynamic renderer depended on published legal document registry content that was not available, producing missing-content warnings instead of rendering approved legal copy.
- Other pages were static placeholders with inconsistent hand-written side menus.
- `legal/disclaimer.html` was placeholder content and remained linked by old navigation.
- There was no single runtime source of truth for the left-side legal menu.

## Implementation
- Added approved static legal document content for all canonical public legal pages.
- Added markdown source documents from the package under `/legal/`.
- Added `legal/legal-nav.js` as the single runtime SSoT for legal side navigation.
- Updated all canonical legal pages to use one empty `<aside class="side-menu" aria-label="Legal documents" data-legal-nav></aside>` mount.
- Removed repeated fallback nav definitions from package HTML because CODEX instructions require no duplicate navigation definitions.
- Removed the obsolete dynamic renderer `assets/theme-v2/js/legal-document-page.js`.
- Removed placeholder `legal/disclaimer.html`.
- Kept package compatibility redirects:
  - `legal/terms.html` redirects to `terms-of-service.html`.
  - `legal/cookies-policy.html` redirects to `cookie-policy.html`.
- Updated footer legal links and route aliases to canonical legal pages while preserving legacy route aliases.
- Updated the legal Playwright spec to verify the corrected static-content implementation.

## Canonical Page Verification
All required pages were verified by headless browser validation:

| Page | Navigation renders | Selected page highlighted | `aria-current="page"` | Title correct | Body displayed | No console errors | No missing-document warning |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/legal/index.html` | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| `/legal/terms-of-service.html` | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| `/legal/privacy-policy.html` | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| `/legal/cookie-policy.html` | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| `/legal/community-guidelines.html` | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| `/legal/copyright-policy.html` | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| `/legal/dmca-policy.html` | PASS | PASS | PASS | PASS | PASS | PASS | PASS |

## Validation Commands
- PASS: package extracted without ignored entries.
- PASS: all package files read before implementation.
- PASS: package `/legal/` files copied into repo before CODEX duplicate-nav correction.
- PASS: targeted browser validation for all seven required pages:
  - document title checked
  - H1 checked
  - side navigation order checked
  - selected link checked
  - `aria-current="page"` checked
  - document body content checked
  - no old legal renderer attributes checked
  - no `Published legal document` or `is not available` text checked
  - no console errors, page errors, or failed requests checked
- PASS: `npx playwright test tests/playwright/tools/RemainingLegalPages.spec.mjs --project=playwright --reporter=line --workers=1`
- PASS: `git diff --check`
- PASS: `rg` found no runtime references to `legal-document-page`, `data-legal-document-type`, `data-legal-document-page`, `Published legal document`, `disclaimer.html`, or `legal-nav.js.example` under `legal` and `assets/theme-v2`.

## Hard Stop Confirmation
No legal page rendered without document content. All seven required legal pages render approved document bodies.

## Notes
- The package HTML included repeated `<noscript>` side-menu fallback links. Those were removed because the CODEX instructions require exactly one legal navigation implementation and no duplicate navigation definitions.
- The package markdown source files used trailing-space hard breaks. Those trailing spaces were normalized so `git diff --check` passes; the public approved HTML document content remains intact.
- The local validation server was configured with `GAMEFOUNDRY_API_URL` pointing to the test server API to avoid unrelated external local API connection noise from shared partial loading.
