# PR_26152_037 Root Admin Pages Migration Validation

## Scope

- Migrated approved Admin pages to the repository root:
  - `/admin/site-settings.html`
  - `/admin/branding.html`
  - `/admin/themes.html`
  - `/admin/design-system.html`
  - `/admin/controls.html`
  - `/admin/grouping-colors.html`
  - `/admin/ratings.html`
  - `/admin/users.html`
  - `/admin/roles.html`
  - `/admin/moderation.html`
  - `/admin/analytics.html`
- Removed the old `GameFoundryStudio/admin/` copies of those pages.
- Updated shared partial routing so Admin links resolve to the root Admin page locations.
- Kept Admin pages on Theme V2.
- Did not migrate Tools, Games, or Samples.
- Did not change any CSS files.

## Changed Files

- `admin/site-settings.html` added
- `admin/branding.html` added
- `admin/themes.html` added
- `admin/design-system.html` added
- `admin/controls.html` added
- `admin/grouping-colors.html` added
- `admin/ratings.html` added
- `admin/users.html` added
- `admin/roles.html` added
- `admin/moderation.html` added
- `admin/analytics.html` added
- `GameFoundryStudio/admin/site-settings.html` removed
- `GameFoundryStudio/admin/branding.html` removed
- `GameFoundryStudio/admin/themes.html` removed
- `GameFoundryStudio/admin/design-system.html` removed
- `GameFoundryStudio/admin/controls.html` removed
- `GameFoundryStudio/admin/grouping-colors.html` removed
- `GameFoundryStudio/admin/ratings.html` removed
- `GameFoundryStudio/admin/users.html` removed
- `GameFoundryStudio/admin/roles.html` removed
- `GameFoundryStudio/admin/moderation.html` removed
- `GameFoundryStudio/admin/analytics.html` removed
- `GameFoundryStudio/assets/js/gamefoundry-partials.js` updated for root Admin route handling

## Validation Commands

- PASS: `node --check GameFoundryStudio/assets/js/gamefoundry-partials.js`
- PASS: `rg -n --pcre2 "<script(?![^>]*\bsrc=)|<style|\son[a-z]+\s*=" index.html about.html vision.html mission.html roadmap.html release-notes.html account.html profile.html preferences.html security.html admin -g "*.html"`
  - No inline script blocks, style blocks, or inline event handlers found.
- PASS: `rg -n "assets/css/theme/v2/theme\.css|assets/js/gamefoundry-partials\.js|base href" index.html about.html vision.html mission.html roadmap.html release-notes.html account.html profile.html preferences.html security.html admin -g "*.html"`
  - Root Admin pages include the root Admin base path, Theme V2 stylesheet, and shared partial loader.
- PASS: `rg -n "admin/site-settings.html|admin/branding.html|admin/themes.html|admin/design-system.html|admin/controls.html|admin/grouping-colors.html|admin/ratings.html|admin/users.html|admin/roles.html|admin/moderation.html|admin/analytics.html|rootPageRoutes|currentPagePath" GameFoundryStudio/assets/js/gamefoundry-partials.js`
  - Shared partial routing points Admin routes to root Admin pages.
- PASS: `rg -n "\.\./admin/" admin -g "*.html"`
  - Root Admin side menus point to root Admin pages through the base-aware `../admin/*.html` pattern.
- PASS: `rg -n "href=\"admin/" admin -g "*.html"`
  - No root Admin page contains stale direct `href="admin/...` links.
- PASS: `git status --short -- GameFoundryStudio/assets/css/theme/v2`
  - No Theme V2 CSS files changed.
- PASS: `git status --short -- admin GameFoundryStudio/admin GameFoundryStudio/assets/js/gamefoundry-partials.js GameFoundryStudio/assets/css/theme/v2`
  - Scoped status shows the expected root Admin page additions, old in-folder page deletions, and partial router update.

## Link Validation

- `gamefoundry-partials.js` still maps Admin routes to:
  - `admin/site-settings.html`
  - `admin/branding.html`
  - `admin/themes.html`
  - `admin/design-system.html`
  - `admin/controls.html`
  - `admin/grouping-colors.html`
  - `admin/ratings.html`
  - `admin/users.html`
  - `admin/roles.html`
  - `admin/moderation.html`
  - `admin/analytics.html`
- Admin routes are included in `rootPageRoutes`.
- Root Admin pages use `<base href="../GameFoundryStudio/">`, so shared assets load from `GameFoundryStudio/assets/` and Admin side-menu links resolve back to root `/admin/*.html`.
- Root Admin pages keep shared header/footer partial slots.

## Skipped

- Repo-wide tests were not run by request.
- Tests outside affected root/GameFoundryStudio paths were not run by request.
- Full samples smoke test was not run by request.
- `git diff -- GameFoundryStudio/assets/js/gamefoundry-partials.js admin GameFoundryStudio/admin --stat` was attempted for the review artifact but was blocked by the Windows sandbox before git could start:
  - `windows sandbox: spawn setup refresh`
