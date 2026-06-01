# PR_26152_038 Root Tools Index Migration Validation

## Scope

- Migrated the approved Tools index to the repository root:
  - `/tools/index.html`
- Removed the old `GameFoundryStudio/tools/index.html` copy.
- Updated root `index.html` direct Tools links so `/index.html` opens `/tools/index.html`.
- Updated shared partial routing so the global Tools nav points to the root Tools index.
- Kept individual tool runtime pages under `GameFoundryStudio/tools/`.
- Kept the root Tools index on Theme V2.
- Did not change any CSS files.

## Changed Files

- `tools/index.html` updated as the root Theme V2 Tools index
- `GameFoundryStudio/tools/index.html` removed
- `index.html` updated so direct Tools links point to root `/tools/index.html`
- `GameFoundryStudio/assets/js/gamefoundry-partials.js` updated so the Tools route is handled as a root route

## Validation Commands

- PASS: `node --check GameFoundryStudio/assets/js/gamefoundry-partials.js`
- PASS: `rg -n --pcre2 "<script(?![^>]*\bsrc=)|<style|\son[a-z]+\s*=" index.html tools/index.html GameFoundryStudio/assets/partials/header-nav.html GameFoundryStudio/assets/partials/footer.html`
  - No inline script blocks, style blocks, or inline event handlers found.
- PASS: `rg -n "assets/css/theme/v2/theme\.css|assets/js/gamefoundry-partials\.js|base href" tools/index.html index.html`
  - Root Tools index and root home page load Theme V2 assets and shared partial handling.
- PASS: `rg -n "\.\./tools/index\.html|tools/index\.html|rootPageRoutes" index.html GameFoundryStudio/assets/js/gamefoundry-partials.js GameFoundryStudio/assets/partials/header-nav.html GameFoundryStudio/assets/partials/footer.html`
  - Root `index.html` links to `../tools/index.html`.
  - Shared partials keep route-based Tools links.
  - Shared route handling includes the Tools route in the root route set.
- PASS: `rg -n "tools-page-accordions|assets/css/styles\.css|\.\./assets/css" tools/index.html index.html`
  - Root Tools index does not reference the old legacy stylesheet or Tools accordion script.
- PASS: `git status --short -- GameFoundryStudio/assets/css/theme/v2`
  - No Theme V2 CSS files changed.
- PASS: `git status --short -- tools/index.html GameFoundryStudio/tools/index.html index.html GameFoundryStudio/assets/js/gamefoundry-partials.js GameFoundryStudio/assets/css/theme/v2 docs/dev/commit_comment.txt docs/dev/reports/codex_review.diff docs/dev/reports/codex_changed_files.txt docs/dev/reports/root_tools_index_migration_validation.md`
  - Scoped status shows the expected root Tools index update, old in-folder index deletion, root home link update, and partial router update.

## Link Validation

- Root `/index.html` direct Tools calls now use `../tools/index.html`, which resolves to root `/tools/index.html` from the existing `GameFoundryStudio/` base.
- `gamefoundry-partials.js` maps:
  - `tools` -> `tools/index.html`
- `tools` is included in `rootPageRoutes`.
- Root `/tools/index.html` uses `<base href="../GameFoundryStudio/">`, so existing individual tool links continue to resolve to the current runtime pages under `GameFoundryStudio/tools/`.

## Skipped

- Repo-wide tests were not run by request.
- Tests outside affected root/GameFoundryStudio paths were not run by request.
- Full samples smoke test was not run by request.
- Individual tool runtime page migration and validation were not run by request.
- `git diff -- index.html tools/index.html GameFoundryStudio/tools/index.html GameFoundryStudio/assets/js/gamefoundry-partials.js --stat` was attempted for the review artifact but was blocked by the Windows sandbox before git could start:
  - `windows sandbox: spawn setup refresh`
