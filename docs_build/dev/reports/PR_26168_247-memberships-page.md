# PR_26168_247-memberships-page

## Branch Validation

PASS - Current branch is `main`.

Note: `test.sql` was already deleted in the working tree before this PR work and was left untouched/excluded from the PR package.

## Requirement Checklist

| Requirement | Status | Notes |
| --- | --- | --- |
| Follow `docs_build/dev/PROJECT_INSTRUCTIONS.md` | PASS | Read before implementation; kept top-level header IA exception intact. |
| Create only `PR_26168_247-memberships-page` | PASS | Scope limited to public Memberships page, shared navigation wiring, focused tests, and required reports/package. |
| Add `/memberships/index.html` | PASS | New public Theme V2 page added with Free, Creator, and Studio tier content. |
| Wire Memberships into shared nav | PASS | Added under shared Marketplace submenu in production header partial and local repo-server header mirror. |
| Wire Memberships into shared footer | PASS | Added to Product footer links. |
| Wire Memberships into mobile nav | PASS | Shared header submenu is the mobile/narrow navigation surface; Playwright validates the Memberships link at 390px width. |
| Use existing GFS shared layout and CSS | PASS | Page uses Theme V2 shared partials/classes and existing CSS only. |
| No backend enforcement | PASS | No API/service/runtime enforcement code added. |
| No database changes | PASS | No schema, migration, seed, or database files touched. |
| No legal pages | PASS | No legal pages added or modified. Existing shared footer legal links were not changed. |
| No teams | PASS | No team model, team UI, or team copy added. |
| No marketplace enforcement | PASS | Navigation placement only; no marketplace access logic or enforcement added. |
| No billing integration | PASS | No billing, checkout, payment, or provider code/copy added. |
| Commit message prepared | PASS | `docs_build/dev/commit_comment.txt` contains the requested title/body. |

## Intentional Order Notes

PASS - Primary top-level header navigation remains the documented product IA exception:
`Games`, `Toolbox`, `Marketplace`, `Learn`, followed by session-dependent account/admin items.

PASS - Memberships is placed inside the Marketplace submenu so the top-level header order remains unchanged.

PASS - New browseable lists remain alphabetized:
- Marketplace submenu: `Marketplace Home`, `Memberships`.
- Product footer: `Games`, `Learn`, `Marketplace`, `Memberships`, `Toolbox`.

## Validation Lane Report

| Lane | Status | Command / Notes |
| --- | --- | --- |
| JS syntax | PASS | `node --check assets/theme-v2/js/gamefoundry-partials.js` |
| Playwright spec syntax | PASS | `node --check tests/playwright/tools/PublicMembershipsPage.spec.mjs` |
| Existing header contract spec syntax | PASS | `node --check tests/playwright/tools/RootToolsFutureState.spec.mjs` |
| HTML inline guard | PASS | `rg --pcre2 -n "<script(?![^>]+src=)\|<style\|\\s(onclick\|onchange\|oninput\|onsubmit\|onkeydown\|onkeyup\|onload)=" ...` returned no matches. |
| Out-of-scope term guard | PASS | Targeted search for billing/checkout/payment/stripe/team/entitlement/enforcement/database/migration terms returned no matches in touched implementation files. |
| Static membership wiring | PASS | Node validation confirmed production header, local header mirror, footer, route map/root segment, and Free/Creator/Studio tier labels. |
| Playwright ownership audit | PASS | Scoped audit passed for `PublicMembershipsPage.spec.mjs`, `RootToolsFutureState.spec.mjs`, and `playwrightRepoServer.mjs`. |
| Targeted Memberships Playwright | PASS | `node node_modules/@playwright/test/cli.js test tests/playwright/tools/PublicMembershipsPage.spec.mjs --project=playwright --workers=1 --reporter=line` - 2 passed. |
| Targeted shared-header RootTools attempt | FAIL (pre-existing fixture) | Attempted RootTools header validation failed on unrelated local API/toolbox fixture state: empty toolbox card list and 500s from `/api/platform-settings/banner`, `/api/toolbox/game-workspace/repositories`, and `/api/toolbox/registry/snapshot`. Memberships coverage was validated by the focused public-page spec and static production partial check. |
| Diff whitespace | PASS | `git diff --check -- PR-scoped tracked files` passed; generated `codex_review.diff` is excluded because diff context lines trigger false trailing-whitespace positives. |
| Full samples smoke | SKIP | Samples and `start_of_day` were not touched; repo instructions say not to run broad samples smoke for this slice. |

## Manual Validation Notes

1. Open `/memberships/index.html`.
2. Confirm the page uses the shared header and footer.
3. Confirm the H1 reads `Choose the membership shape for your next game.`
4. Confirm Free, Creator, and Studio tier cards are visible.
5. Open the Marketplace submenu and confirm Memberships is listed.
6. Resize to a narrow mobile width and confirm the shared navigation still exposes Memberships.
7. Confirm Product footer includes Memberships.
8. Confirm there is no billing, backend enforcement, database, teams, legal page, or marketplace enforcement behavior.

Expected outcome: Memberships is a public informational page only, with shared Theme V2 chrome and no backend or data-model side effects.

## Changed Files

- `assets/theme-v2/js/gamefoundry-partials.js`
- `assets/theme-v2/partials/footer.html`
- `assets/theme-v2/partials/header-nav.html`
- `docs_build/dev/codex_commands.md`
- `docs_build/dev/commit_comment.txt`
- `docs_build/dev/reports/PR_26168_247-memberships-page.md`
- `docs_build/dev/reports/filesystem_scan_reduction_report.md`
- `docs_build/dev/reports/playwright_discovery_ownership_report.md`
- `docs_build/dev/reports/playwright_discovery_scope_report.md`
- `docs_build/dev/reports/playwright_structure_audit.md`
- `memberships/index.html`
- `src/dev-runtime/admin/header-nav.local.html`
- `tests/playwright/tools/PublicMembershipsPage.spec.mjs`
- `tests/playwright/tools/RootToolsFutureState.spec.mjs`

## Package

Generated artifacts:
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `tmp/PR_26168_247-memberships-page_delta.zip`
