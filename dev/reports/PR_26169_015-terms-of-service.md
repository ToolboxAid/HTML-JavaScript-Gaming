# PR_26169_015-terms-of-service Report

## Scope
- PR: `PR_26169_015-terms-of-service`
- Source PLAN: `docs_build/pr/PLAN_PR_26169_015-terms-of-service.md`
- Legal foundation dependency: `docs_build/pr/BUILD_PR_26169_014-legal-foundation.md`
- BUILD doc: `docs_build/pr/BUILD_PR_26169_015-terms-of-service.md`

## Branch Validation
- Current branch before implementation: `main`
- Current branch before packaging: `main`
- Expected branch: `main`
- Result: PASS

## Requirement Checklist
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`: PASS
- Read matching PLAN_PR before implementation: PASS
- Create/read BUILD_PR before implementation: PASS
- Implement only PR_26169_015 purpose: PASS
- Terms page reads `terms_of_service` from the legal content API: PASS
- Terms page renders published title, effective date, and body content when API content is published: PASS
- Terms page shows visible unavailable diagnostics when no published Terms exist: PASS
- Draft/placeholder Terms content does not render publicly: PASS
- Terms page does not own hardcoded Terms body copy: PASS
- Public users can reach `legal/terms.html`: PASS
- Header/footer route already resolves to `legal/terms.html`: PASS
- Do not modify Privacy, Cookies, Community, Copyright, DMCA, legal acceptance, pricing, marketplace, or AI behavior: PASS

## Implementation Summary
- Added `GET /api/legal/document` backed by `readPublishedLegalDocument`.
- Added `legal-api-client.js`.
- Added `legal-document-page.js` for published legal rendering and unavailable diagnostics.
- Replaced the static Terms placeholder copy with a Theme V2 legal document shell.
- Added targeted Terms page Playwright coverage for missing published content and published API content.

## Validation
- `git branch --show-current`: PASS (`main`)
- `node --check src/dev-runtime/server/local-api-router.mjs`: PASS
- `node --check src/engine/api/legal-api-client.js`: PASS
- `node --check assets/theme-v2/js/legal-document-page.js`: PASS
- `node --check tests/playwright/tools/TermsOfServicePage.spec.mjs`: PASS
- Static HTML restriction check for `legal/terms.html`: PASS
- `npx playwright test tests/playwright/tools/TermsOfServicePage.spec.mjs`: PASS, 2 tests passed
- `git diff --check` scoped to PR_015 files: PASS

## Playwright And Coverage
- Playwright impacted: Yes.
- Validated behavior:
  - Public Terms route loads.
  - Missing published Terms shows `WARN` diagnostics and an empty body.
  - Previous placeholder copy does not render.
  - Stubbed published Terms API content renders title, effective date, and body paragraphs.
  - HTML has no inline script, inline style, inline event handler, or page-local CSS.
- V8 coverage artifacts:
  - `docs_build/dev/reports/playwright_v8_coverage_report.txt`
  - `docs_build/dev/reports/coverage_changed_js_guardrail.txt`
- Coverage evidence for PR_015 browser files:
  - `(100%) assets/theme-v2/js/legal-document-page.js`
  - `(100%) src/engine/api/legal-api-client.js`
  - `(57%) assets/theme-v2/js/gamefoundry-partials.js`
- Coverage note: because the sequential stack is intentionally uncommitted, the coverage helper also reports advisory WARN entries for earlier stack files. Those warnings are outside the PR_015 blocker scope.

## Lanes
- Impacted lanes: public Terms page runtime and legal document API/client.
- Skipped lanes: Privacy, Cookies, Community, Copyright, DMCA, legal acceptance, Owner editor UI, membership, marketplace, AI pricing, full samples.
- Skip rationale: PLAN_PR_26169_015 is scoped to Terms of Service rendering only.
- Full samples decision: SKIP. No samples, sample loader, or shared sample runtime changed.
- Full suite requirement: Not triggered by this PR scope.
- Expected blocker scope: PR_015 Terms route/API/page runtime only.

## Acceptance Criteria Evidence
- Terms of Service implemented as a legal document render, not hardcoded page copy: PASS
- Public users can reach Terms page: PASS
- Missing content does not silently fallback: PASS
- Published Terms render through shared page module: PASS
- Terms work does not modify other legal pages: PASS

## Manual Validation
- Start the local repo server and open `legal/terms.html`.
- Expected with current seed data: title `Terms of Service`, visible WARN diagnostic, effective date unavailable message, and no placeholder Terms body copy.
- Published content rendering is covered by the Playwright API stub test.
- Out of scope: other legal pages, final legal copy, acceptance tracking, Owner legal editor, and full samples validation.

## Artifacts
- Changed files list: `docs_build/dev/reports/codex_changed_files.txt`
- Review diff: `docs_build/dev/reports/codex_review.diff`
- ZIP artifact: `tmp/PR_26169_015-terms-of-service_delta.zip`
- ZIP validation: PASS, repo-structured artifact exists with 13 expected entries and size > 0.
