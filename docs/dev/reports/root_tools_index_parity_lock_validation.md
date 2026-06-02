# PR_26152_048 Root Tools Index Parity Lock Validation

## Scope

Validated only:
- `/tools/index.html`
- `GameFoundryStudio/assets/js/tools-page-accordions.js`
- Reports

No additional pages were migrated.
No CSS files were changed.

## Project Instructions

Read:
- `docs/dev/PROJECT_INSTRUCTIONS.md`

## Static Inspection

Inspected current root Tools index:
- `tools/index.html`

Inspected supporting renderer:
- `GameFoundryStudio/assets/js/tools-page-accordions.js`

Findings:
- `/tools/index.html` loads `assets/css/theme/v2/theme.css`.
- `/tools/index.html` uses `[data-tools-accordion-list]` as the render target.
- `tools-page-accordions.js` renders Theme V2-oriented `.control-card` tiles inside `.card-grid`.
- `tools-page-accordions.js` still defines tool images, badges, descriptions, grouping names, grouping colors, outlines, sorting, grouping, and links.

## Parity Blocker

Root Tools index visual parity with the older GameFoundryStudio Tools index requires changing generated classes/layout and/or stylesheet references.

The PR instruction says:

> If parity requires CSS/class/id changes, stop and document the issue instead.

Result: Blocked. No root Tools index code changes were made.

## Inline CSS / Script / Event Handler Scan

Command:
```powershell
rg -n --pcre2 '<script(?![^>]*\bsrc=)|<style|\son[a-z]+\s*=' tools/index.html
```

Result: Passed. No matches found.

## JavaScript Syntax Check

Command:
```powershell
node --check GameFoundryStudio/assets/js/tools-page-accordions.js
```

Result: Passed.

## CSS Guard

Command:
```powershell
git status --short -- GameFoundryStudio/assets/css/theme/v2 GameFoundryStudio/assets/css/styles.css
```

Result: Passed. No scoped CSS changes.

## Skipped

- Repo-wide tests were not run by request.
- Tests outside the root Tools index surface were not run by request.
- No Playwright run was performed because no index code was changed.
