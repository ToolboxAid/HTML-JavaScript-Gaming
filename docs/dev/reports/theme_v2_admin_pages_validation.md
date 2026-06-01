# Theme V2 Admin Pages Validation

PR: `PR_26152_027-theme-v2-admin-pages`

## Scope

- Migrated these GameFoundryStudio Admin pages to `../assets/css/theme/v2/theme.css`:
  Site Settings, Branding, Themes, Design System, Controls, Grouping Colors, Ratings, Users, Roles, Moderation, Analytics.
- Added reusable Admin/reference/control styling only under `GameFoundryStudio/assets/css/theme/v2/`.
- Fixed the Admin Controls page ForgeBot image path from a missing `forge-bot.png` to existing `forgebot.png`.
- Left Account, Tools, Games, and Samples HTML unchanged.

## Playwright Impact

Playwright impacted: Yes.

The PR changes Admin page rendering and Admin navigation styling. Validation used a targeted GameFoundryStudio static-server Playwright check, not repo-wide Workspace V2 tests, because the BUILD explicitly limits validation to GameFoundryStudio Admin scope.

## Validation Commands

1. Targeted Playwright static-server validation for all 11 Admin pages.
2. Deprecated Admin stylesheet check:
   `rg -n "assets/css/styles\\.css" GameFoundryStudio\\admin`
3. Admin theme-v2 stylesheet check:
   `rg -n "assets/css/theme/v2/theme\\.css" GameFoundryStudio\\admin`
4. Inline HTML restriction check:
   `rg -n --pcre2 "<script\\b(?![^>]*\\bsrc=)|<style\\b|\\son[a-z]+\\s*=" GameFoundryStudio\\admin GameFoundryStudio\\assets\\partials`
5. Non-Admin migration guard:
   `git diff --name-only -- GameFoundryStudio | rg -v "^GameFoundryStudio/(admin/|assets/css/theme/v2/)"`
6. CSS-outside-theme-v2 guard:
   `git diff --name-only -- GameFoundryStudio | rg --pcre2 "^GameFoundryStudio/assets/css/(?!theme/v2/)"`
7. Targeted whitespace check:
   `git diff --check -- GameFoundryStudio\\admin GameFoundryStudio\\assets\\css\\theme\\v2`
8. Token-discipline scan for changed non-token v2 CSS surfaces:
   `rg -n --pcre2 "\\b\\d+(?:\\.\\d+)?px\\b|#[0-9a-fA-F]{3,8}\\b" GameFoundryStudio\\assets\\css\\theme\\v2\\accordion.css GameFoundryStudio\\assets\\css\\theme\\v2\\controls.css GameFoundryStudio\\assets\\css\\theme\\v2\\forms.css GameFoundryStudio\\assets\\css\\theme\\v2\\layout.css GameFoundryStudio\\assets\\css\\theme\\v2\\panels.css GameFoundryStudio\\assets\\css\\theme\\v2\\tables.css GameFoundryStudio\\assets\\css\\theme\\v2\\typography.css`

## Results

- PASS: all 11 Admin pages returned 200 and rendered with `theme/v2/theme.css`.
- PASS: no Admin page loaded deprecated `assets/css/styles.css`.
- PASS: Admin header/footer partials rendered on every Admin page.
- PASS: header Admin navigation was active on every Admin page.
- PASS: Admin side navigation loaded all 11 Admin pages and preserved the expected active page state.
- PASS: Admin page images and local assets resolved.
- PASS: no inline script blocks, style blocks, or inline event handlers were found in affected Admin HTML or shared partials.
- PASS: changed GameFoundryStudio files are limited to `GameFoundryStudio/admin/` and `GameFoundryStudio/assets/css/theme/v2/`.
- PASS: no CSS outside `GameFoundryStudio/assets/css/theme/v2/` was changed.
- PASS: `git diff --check` completed with no whitespace errors.
- WARN: Git reported repository line-ending notices: `LF will be replaced by CRLF the next time Git touches it`.

## Lanes

- lanes executed: runtime/static page validation for the affected GameFoundryStudio Admin pages.
- lanes skipped: engine, samples, tools, Account, Games, and repo-wide integration because this PR only migrates GameFoundryStudio Admin pages to theme v2.
- samples decision: SKIP because Samples are explicitly out of scope and full samples smoke testing is forbidden by this BUILD.
- blocker scope: GameFoundryStudio Admin pages and theme-v2 reusable styling only.

## Manual Validation

1. Start a local static server from the repo root.
2. Open `/GameFoundryStudio/admin/site-settings.html`.
3. Use the Admin side menu to open each Admin page from Site Settings through Analytics.
4. Confirm each page retains header/footer, side-menu navigation, cards, callouts, tables, controls, swatches, and images.
5. Confirm Account, Tools, Games, and Samples pages were not migrated as part of this PR.
