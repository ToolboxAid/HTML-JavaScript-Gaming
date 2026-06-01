# PR_26152_036 Root Account Pages Migration Validation

## Scope

- Migrated approved Account pages to the repository root:
  - `/account.html`
  - `/profile.html`
  - `/preferences.html`
  - `/security.html`
- Removed the old `GameFoundryStudio/account/` copies of those pages.
- Updated shared partial routing so Account links resolve to the root page locations.
- Kept Account pages on Theme V2.
- Did not migrate Admin, Tools, Games, or Samples.
- Did not change any CSS files.

## Changed Files

- `account.html` added
- `profile.html` added
- `preferences.html` added
- `security.html` added
- `GameFoundryStudio/account/index.html` removed
- `GameFoundryStudio/account/profile.html` removed
- `GameFoundryStudio/account/preferences.html` removed
- `GameFoundryStudio/account/security.html` removed
- `GameFoundryStudio/assets/js/gamefoundry-partials.js` updated for root Account route handling

## Validation Commands

- PASS: `node --check GameFoundryStudio/assets/js/gamefoundry-partials.js`
- PASS: `rg -n --pcre2 "<script(?![^>]*\bsrc=)|<style|\son[a-z]+\s*=" index.html about.html vision.html mission.html roadmap.html release-notes.html account.html profile.html preferences.html security.html`
  - No inline script blocks, style blocks, or inline event handlers found.
- PASS: `rg -n "base href" account.html profile.html preferences.html security.html about.html vision.html mission.html roadmap.html release-notes.html index.html`
  - Root index, root Company pages, and root Account pages contain `<base href="GameFoundryStudio/">`.
- PASS: `rg -n "assets/css/theme/v2/theme\.css" account.html profile.html preferences.html security.html about.html vision.html mission.html roadmap.html release-notes.html index.html`
  - Root Account pages load Theme V2 assets.
- PASS: `rg -n "data-partial" account.html profile.html preferences.html security.html about.html vision.html mission.html roadmap.html release-notes.html index.html`
  - Root Account pages keep shared header/footer partial slots.
- PASS: `rg -n "account.html|profile.html|preferences.html|security.html|rootPageRoutes|isAccountChild|rootPrefix" GameFoundryStudio/assets/js/gamefoundry-partials.js`
  - Shared partial routing points Account routes to root pages.
- PASS: `git status --short -- GameFoundryStudio/assets/css/theme/v2`
  - No Theme V2 CSS files changed.
- PASS: `git status --short -- account.html profile.html preferences.html security.html GameFoundryStudio/account/index.html GameFoundryStudio/account/profile.html GameFoundryStudio/account/preferences.html GameFoundryStudio/account/security.html GameFoundryStudio/assets/js/gamefoundry-partials.js GameFoundryStudio/assets/css/theme/v2 docs/dev/commit_comment.txt docs/dev/reports/codex_review.diff docs/dev/reports/codex_changed_files.txt docs/dev/reports/root_account_pages_migration_validation.md`
  - Scoped status shows the expected root page additions, old in-folder page deletions, and partial router update.

## Link Validation

- `gamefoundry-partials.js` now maps:
  - `account` -> `account.html`
  - `account-profile` -> `profile.html`
  - `account-preferences` -> `preferences.html`
  - `account-security` -> `security.html`
- Account routes are included in `rootPageRoutes`.
- Root pages use `rootPrefix()` without leaving the `GameFoundryStudio/` base, so partials load from `GameFoundryStudio/assets/partials/`.
- Root Account links render to root Account pages from the shared header/footer.

## Skipped

- Repo-wide tests were not run by request.
- Tests outside affected root/GameFoundryStudio paths were not run by request.
- Full samples smoke test was not run by request.
- `git diff --stat` was attempted for exact review artifact generation but was intermittently blocked by the Windows sandbox before git could start:
  - `windows sandbox: spawn setup refresh`
