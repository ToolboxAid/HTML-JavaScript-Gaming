# PR_26154_006 Theme V2 Asset Ownership Normalization Report

## Summary

Completed the focused Theme V2 image ownership normalization.

- Moved all Theme V2 image content into the public canonical image root: `assets/theme/v2/images/`.
- Removed the former engine-owned image folder after verifying the public copy matched the source file set.
- Removed the temporary nested public image folder and did not recreate it.
- Updated active HTML, JS, template, and report references to resolve public Theme V2 images through `assets/theme/v2/images/`.
- Updated `tool-display-mode.js` so badge and character requests resolve from `/assets/theme/v2/images/`.
- Preserved `src/engine/theme/v2/` because it still contains non-image Theme V2 CSS, JS, partial, template, and placeholder assets.

## Asset Move

Image migration result:

- Source image files moved: 109
- Canonical public image files after required fallbacks: 111
- Required badge fallback: `assets/theme/v2/images/badges/index.png`
- Required character fallback: `assets/theme/v2/images/characters/index.png`

The two required `index.png` fallbacks were created from the existing `settings-studio.png` badge and character images because no exact fallback source file existed in the moved source set.

## Reference Updates

Updated affected public/root pages, tool pages, templates, and scripts so image references use the canonical public image root.

Notable runtime/helper updates:

- `src/engine/theme/v2/assets/js/tool-display-mode.js` uses `/assets/theme/v2/images` as its badge and character root.
- `src/engine/theme/v2/templates/_tool_template_v2.html` and `tools/_templates-v2/index.html` use `data-asset-root="assets/theme/v2/images"`.
- `tools/tools-page-accordions.js` points generated tool-card and badge images at `../assets/theme/v2/images/...`.

No layout, CSS, ToolDisplayMode behavior, Storage Inspector runtime, or unrelated tool implementation work was changed.

## Remaining src/engine/theme/v2 Surface

`src/engine/theme/v2/` remains in place and is not empty.

Remaining folders:

- `assets/`
- `templates/`

Remaining `assets/` surface:

- `css/`
- `js/`
- `partials/`
- `image-missing.svg`

Remaining template surface:

- `_page_template_v2.html`
- `_tool_template_v2.html`

The folder was not deleted because these Theme V2 CSS, JS, partial, template, and placeholder files remain active.

## Targeted Validation

Passed:

- Confirmed the former engine-owned image folder is absent.
- Confirmed the temporary nested public image folder is absent.
- Confirmed canonical public image root exists with 111 files.
- Confirmed zero remaining public image references to the former engine-owned image folder, excluding protected `start_of_day/`, generated review artifacts, and `tmp/`.
- Confirmed zero references to the temporary nested public image folder, excluding protected `start_of_day/`, generated review artifacts, and `tmp/`.
- Confirmed canonical public image references are present across active public/root pages, tools, templates, and scripts.
- Confirmed `assets/theme/v2/images/badges/index.png` exists.
- Confirmed `assets/theme/v2/images/characters/index.png` exists.
- Confirmed browser requests for `/assets/theme/v2/images/badges/index.png` and `/assets/theme/v2/images/characters/index.png` return `200`.
- Passed static validation for changed HTML, JS, CSS, and Markdown files.
- Passed `git diff --check`; Git emitted line-ending normalization warnings only.
- Generated `docs_build/dev/reports/codex_review.diff`.
- Generated `docs_build/dev/reports/codex_changed_files.txt`.
- Created repo-structured delta ZIP: `tmp/PR_26154_006-theme-v2-asset-ownership-normalization_delta.zip`.

Skipped:

- `npm run test:workspace-v2`, because this PR changed image asset ownership/pathing only and did not change active tool launch or navigation behavior.
- Tests against `old_games` and `old_samples`, per request.
- Full samples smoke test, per request.
