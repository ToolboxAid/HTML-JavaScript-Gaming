# PR_26152_041 Root Tools Index Group Outline Validation

## Scope

- Restored tool tile group-color outlines on root `/tools/index.html`.
- Kept work limited to the root Tools index and its existing supporting JS path.
- Preserved existing sorting and grouping behavior.
- Preserved existing tool data, images, badges, descriptions, grouping colors, swatches, and links.
- Did not add CSS.
- Did not change `GameFoundryStudio/assets/css/theme/v2`.
- Did not migrate individual tool pages.
- Did not change tool runtime behavior.

## Changed Files

- `GameFoundryStudio/assets/js/tools-page-accordions.js`
- `docs/dev/commit_comment.txt`
- `docs/dev/reports/codex_changed_files.txt`
- `docs/dev/reports/codex_review.diff`
- `docs/dev/reports/root_tools_index_group_outline_validation.md`

## Validation Commands

- PASS: `node --check GameFoundryStudio/assets/js/tools-page-accordions.js`
  - External Tools index renderer syntax is valid.
- PASS: `rg -n "data-tools-order|data-tools-sort|data-tools-accordion-list|tools-page-accordions\.js" tools/index.html`
  - Root Tools index still contains the existing order control, grouped control, render target, and external JS reference.
- PASS: `rg -n --pcre2 "<script(?![^>]*\bsrc=)|<style|\son[a-z]+\s*=" tools/index.html`
  - No inline script blocks, style blocks, or inline event handlers found.
- PASS: `rg -n "control-card|control-lab" GameFoundryStudio/assets/js/tools-page-accordions.js`
  - Rendered tool tiles use the existing Theme V2 group-color outline hook.
- PASS: `rg -n "wrapper\.className = \`control-lab \$\{groupClass\(tool\.group\)\}\`|article\.className = \"control-card\"|border-color: var\(--tool-group-accent\)|control-lab\[class\*=\"tool-group-\"\] \.control-card|card-grid|createToolCard" GameFoundryStudio/assets/js/tools-page-accordions.js GameFoundryStudio/assets/css/theme/v2/controls.css`
  - JS emits `control-lab tool-group-*` and `control-card`.
  - Existing Theme V2 CSS owns the group-color border rule.
- PASS: `rg -n "assets/images/tools/|assets/images/badges/|brand-color-swatch|assets/images/badges|tools\.sort|tools\.reverse" GameFoundryStudio/assets/js/tools-page-accordions.js`
  - Tool images, badges, swatches, ascending sort, and descending sort remain present.
- PASS: `git status --short -- GameFoundryStudio/assets/css/theme/v2`
  - No Theme V2 CSS files changed.
- PASS: `git status --short -- GameFoundryStudio/assets/css/theme/v2 tools/index.html GameFoundryStudio/assets/js/tools-page-accordions.js docs/dev/commit_comment.txt docs/dev/reports/codex_review.diff docs/dev/reports/codex_changed_files.txt docs/dev/reports/root_tools_index_group_outline_validation.md`
  - Scoped status shows only the supporting JS and required reports for this PR.

## Behavior Validation

- Tool data still loads from `GameFoundryStudio/assets/js/tools-page-accordions.js`.
- Grouping controls remain wired through `data-tools-sort="grouped"`.
- Ascending and descending sorting remain wired through `data-tools-order`.
- Every rendered tile is created through `createToolCard`.
- `createToolCard` now returns a grouped wrapper containing a `control-card`, so every tile uses the existing group-color outline rule.
- Grouped accordions and sorted grids both use the same `createToolCard` output.

## Skipped

- Repo-wide tests were not run by request.
- Tests outside the root Tools index were not run by request.
- Full samples smoke test was not run by request.
- Individual tool runtime validation was not run by request.
