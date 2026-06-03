# Root Admin Specific Page Replacement Validation

PR: PR_26152_050-root-admin-specific-page-replacement

## Scope

Changed only these root Admin pages:

- admin/branding.html
- admin/controls.html
- admin/themes.html
- admin/design-system.html
- admin/grouping-colors.html

Historical source of truth used: `289132dcacd2ff8927a5936e4c73a3a0edb824ad:GameFoundryStudio/admin/*.html`, the parent of `742c7257a` (`PR_26152_027-theme-v2-admin-pages`). The current working tree no longer contains `GameFoundryStudio/admin` because `870cc75d9` deleted it during root migration.

## Source Match Validation

Result: PASS

Each affected root page was compared against its matching historical `GameFoundryStudio/admin` source after only these root-path transforms:

- Insert `<base href="../GameFoundryStudio/">` so the existing partial loader resolves `assets/partials/*` correctly from root Admin pages.
- Convert source `../assets/*` references to `assets/*` under the base path.
- Convert Admin side navigation links from `*.html` to `../admin/*.html`.
- Convert the controls hero fragment link from `#controls` to `../admin/controls.html#controls` so it is not captured by the base URL.
- Convert the controls hero image from missing `assets/images/forge-bot.png` to existing `assets/images/forge-bot-single.png`; the missing filename was absent in both the current and historical asset tree.

## Root Path Validation

Result: PASS

Validated 93 local references across the five pages, including:

- CSS: `GameFoundryStudio/assets/css/styles.css`
- JS: `GameFoundryStudio/assets/js/gamefoundry-partials.js`
- Controls JS: `GameFoundryStudio/assets/js/account-controls.js`
- Partials: `GameFoundryStudio/assets/partials/header-nav.html`, `GameFoundryStudio/assets/partials/footer.html`
- Images: favicon, mascot images, and controls hero image
- Root Admin side navigation targets
- Root Tools link from controls page

## HTML Restrictions

Result: PASS

The five affected pages contain no inline `style` attributes, no `<style>` blocks, no inline script blocks, no inline event handlers, and no `imageDataUrl` references.

## CSS Validation

Result: PASS

No CSS files changed. Theme V2 CSS was not modified. No CSS was added.

## Unrelated Page Validation

Result: PASS

`git diff --name-only` for implementation pages listed only:

- admin/branding.html
- admin/controls.html
- admin/design-system.html
- admin/grouping-colors.html
- admin/themes.html

No Tools, Games, Samples, Company, Account, root index, or other Admin pages were changed.

## Commands Run

- Read: `docs_build/dev/PROJECT_INSTRUCTIONS.md`
- Source read: `git show 289132dcacd2ff8927a5936e4c73a3a0edb824ad:GameFoundryStudio/admin/<page>.html`
- Scoped Node validation for the five affected pages: historical-source transform comparison, root path existence checks, HTML restriction checks, CSS diff check, and implementation/report scope check
- Targeted diff whitespace validation: `git diff --check -- admin/branding.html admin/controls.html admin/themes.html admin/design-system.html admin/grouping-colors.html docs_build/dev/reports/codex_review.diff docs_build/dev/reports/codex_changed_files.txt docs_build/dev/reports/root_admin_specific_page_replacement_validation.md docs_build/dev/commit_comment.txt`

## Tests Not Run

Repo-wide tests were not run, per BUILD instruction. Playwright impacted: No; this PR replaces static Admin page HTML and does not change tool runtime, Workspace V2, toolState, capture, or rendering behavior. Full samples smoke test: SKIP because no sample files or sample runtime were changed.

## Manual Validation

1. Open `/admin/branding.html`, `/admin/controls.html`, `/admin/themes.html`, `/admin/design-system.html`, and `/admin/grouping-colors.html`.
2. Confirm the header and footer partials load.
3. Confirm legacy source content is visible on each page, including Branding mascot/color sections, Controls control lab, Themes planning content, Design System CSS ownership content, and Grouping Colors table/accordion/grouping sections.
4. Confirm Admin side navigation links route to root `/admin/*.html` pages.
5. Confirm Controls `View Controls` scrolls/routes to `/admin/controls.html#controls` and `Back to Tools` routes to root `/tools/index.html`.
