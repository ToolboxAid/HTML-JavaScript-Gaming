# PR_26152_035 Root Company Pages Migration Validation

## Scope

- Migrated approved Company pages to the repository root:
  - `/about.html`
  - `/vision.html`
  - `/mission.html`
  - `/roadmap.html`
  - `/release-notes.html`
- Removed the old `GameFoundryStudio/` copies of those pages.
- Updated shared partial routing so Company links resolve to the root page locations.
- Did not migrate Admin, Account, Tools, Games, or Samples.
- Did not change any CSS files.

## Changed Files

- `about.html` added
- `vision.html` added
- `mission.html` added
- `roadmap.html` added
- `release-notes.html` added
- `GameFoundryStudio/about.html` removed
- `GameFoundryStudio/vision.html` removed
- `GameFoundryStudio/mission.html` removed
- `GameFoundryStudio/roadmap.html` removed
- `GameFoundryStudio/release-notes.html` removed
- `GameFoundryStudio/assets/js/gamefoundry-partials.js` updated for root Company route handling

## Validation Commands

- PASS: `node --check GameFoundryStudio/assets/js/gamefoundry-partials.js`
- PASS: `rg -n --pcre2 "<script(?![^>]*\bsrc=)|<style|\son[a-z]+\s*=" index.html about.html vision.html mission.html roadmap.html release-notes.html`
  - No inline script blocks, style blocks, or inline event handlers found.
- PASS: `rg -n "base href" about.html vision.html mission.html roadmap.html release-notes.html index.html`
  - Root index and root Company pages contain `<base href="GameFoundryStudio/">`.
- PASS: `rg -n "assets/css/theme/v2/theme\.css|assets/js/gamefoundry-partials\.js|data-partial=\"header-nav\"|data-partial=\"footer\"" index.html about.html vision.html mission.html roadmap.html release-notes.html`
  - Root Company pages load Theme V2 CSS and shared partial JS.
- PASS: `git status --short -- GameFoundryStudio/assets/css/theme/v2`
  - No Theme V2 CSS files changed.
- PASS: `git status --short -- index.html about.html vision.html mission.html roadmap.html release-notes.html GameFoundryStudio/about.html GameFoundryStudio/vision.html GameFoundryStudio/mission.html GameFoundryStudio/roadmap.html GameFoundryStudio/release-notes.html GameFoundryStudio/assets/js/gamefoundry-partials.js GameFoundryStudio/assets/css/theme/v2`
  - Scoped status shows the expected root page additions, old in-folder page deletions, and partial router update.

## Link Validation

- Root index uses `GameFoundryStudio/assets/js/gamefoundry-partials.js` through the existing base URL.
- `gamefoundry-partials.js` now treats these routes as root page routes:
  - `about`
  - `vision`
  - `mission`
  - `roadmap`
  - `release-notes`
- The rendered root index header/footer Company links therefore resolve out of `GameFoundryStudio/` and open the new root Company pages.

## Skipped

- Repo-wide tests were not run by request.
- Tests outside affected root/GameFoundryStudio paths were not run by request.
- Full samples smoke test was not run by request.
- `git diff` / `git diff --stat` were attempted for exact review artifacts but were intermittently blocked by the Windows sandbox before git could start:
  - `windows sandbox: spawn setup refresh`
