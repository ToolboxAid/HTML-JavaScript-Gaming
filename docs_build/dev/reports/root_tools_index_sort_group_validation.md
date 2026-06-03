# PR_26152_040 Root Tools Index Sort Group Validation

## Scope

- Restored missing sorting and grouping behavior on root `/tools/index.html`.
- Kept work limited to the root Tools index and its existing supporting JS path.
- Preserved existing tool data, images, badges, descriptions, grouping colors, and links.
- Did not add CSS.
- Did not change `GameFoundryStudio/assets/css/theme/v2`.
- Did not migrate individual tool pages.
- Did not change tool runtime behavior.

## Changed Files

- `tools/index.html`
- `GameFoundryStudio/assets/js/tools-page-accordions.js`
- `docs_build/dev/commit_comment.txt`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/root_tools_index_sort_group_validation.md`

## Validation Commands

- PASS: `node --check GameFoundryStudio/assets/js/tools-page-accordions.js`
  - External Tools index renderer syntax is valid.
- PASS: `rg -n "data-tools-order|data-tools-sort|data-tools-accordion-list|tools-page-accordions\.js" tools/index.html`
  - Root Tools index contains the existing order control, grouped control, render target, and external JS reference.
- PASS: `rg -n --pcre2 "<script(?![^>]*\bsrc=)|<style|\son[a-z]+\s*=" tools/index.html`
  - No inline script blocks, style blocks, or inline event handlers found.
- PASS: `rg -n "render\(\"ascending\"\)|render\(\"grouped\"\)|dataset\.toolsOrder|tools\.sort|tools\.reverse|createAccordion|getGroupedTools|createToolGrid" GameFoundryStudio/assets/js/tools-page-accordions.js`
  - Existing ascending, descending, and grouped behavior paths are present.
- PASS: `rg -n "assets/images/tools/|assets/images/badges/|brand-color-swatch|card-grid|vertical-accordion|className = \`card|className = \"btn\"|href = tool.href" GameFoundryStudio/assets/js/tools-page-accordions.js`
  - Rendered cards include tool images, badges, color indicators, Theme V2 cards, grouped accordions, and links.
- PASS: `rg -n "assets/css/theme/v2|<link rel=\"stylesheet\"|tools-page-accordions\.js|data-tools-accordion-list" tools/index.html`
  - Root Tools index still loads Theme V2 and the existing external sorting/grouping renderer.
- PASS: `git status --short -- GameFoundryStudio/assets/css/theme/v2`
  - No Theme V2 CSS files changed.
- PASS: `git status --short -- GameFoundryStudio/assets/css/theme/v2 tools/index.html GameFoundryStudio/assets/js/tools-page-accordions.js docs_build/dev/commit_comment.txt docs_build/dev/reports/codex_review.diff docs_build/dev/reports/codex_changed_files.txt docs_build/dev/reports/root_tools_index_sort_group_validation.md`
  - Scoped status shows only the root Tools index, existing supporting JS, and required reports.

## Behavior Validation

- Tool data loads from `GameFoundryStudio/assets/js/tools-page-accordions.js`.
- Initial render calls `render("ascending")`.
- Ascending sort uses `title.localeCompare`.
- Descending sort reverses the sorted list.
- Grouped render uses the existing `toolGroups` source and `createAccordion`.
- Sorted and grouped renders both call the same Theme V2 card builder, so cards retain:
  - tool images
  - tool badges
  - descriptions
  - grouping labels
  - grouping color indicators
  - links

## Skipped

- Repo-wide tests were not run by request.
- Tests outside the root Tools index were not run by request.
- Full samples smoke test was not run by request.
- Individual tool runtime validation was not run by request.
- Browser/package tooling discovery was attempted, but the Windows sandbox repeatedly blocked process launch with:
  - `windows sandbox: spawn setup refresh`
