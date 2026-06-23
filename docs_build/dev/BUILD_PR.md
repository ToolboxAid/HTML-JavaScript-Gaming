# PR_26175_ALFA_002-toolbox-status-bar-context-polish

## Purpose
Polish the shared toolbox status bar context display so it shows only selected-game name/purpose on the left and categorized tool context in the center.

## Source Of Truth
This `BUILD_PR.md` is the source of truth for `PR_26175_ALFA_002-toolbox-status-bar-context-polish`.

## Exact Scope
- Do not include environment text in the status bar because environment already appears in the platform banner.
- On the left side, display the selected Game Hub game name and selected Game Hub game purpose.
- On the center side, display tool context messages for tool actions, save state, validation messages, warnings, or errors.
- Preserve normal placement above the footer.
- Preserve fullscreen/tool display mode bottom anchoring.
- Preserve Idea Board selected-game filtering exclusion.
- Preserve Game Hub as selected-game owner through the existing repository contract.
- Keep the shared Theme V2 toolbox component model.
- Update targeted Playwright coverage for the polished left and center context.

## Exact Targets
- `docs_build/dev/BUILD_PR.md`
- `assets/theme-v2/js/toolbox-status-bar.js`
- `assets/theme-v2/css/status.css`
- `tests/playwright/tools/ToolboxSelectedGameStatusBar.spec.mjs`
- `docs_build/dev/reports/PR_26175_ALFA_002-toolbox-status-bar-context-polish_report.md`
- `docs_build/dev/reports/PR_26175_ALFA_002-toolbox-status-bar-context-polish_validation-lane.md`
- `docs_build/dev/reports/PR_26175_ALFA_002-toolbox-status-bar-context-polish_requirements-checklist.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Out Of Scope
- No environment status in the toolbox status bar.
- No row highlights.
- No large banners.
- No modal-style status messages.
- No inline styles, style blocks, or page-local CSS.
- No API/service contract changes.
- No engine core changes.
- No `start_of_day` folder changes.

## Validation
Run:

```powershell
npx playwright test tests/playwright/tools/ToolboxSelectedGameStatusBar.spec.mjs --workers=1
```

Also verify the changed source does not introduce inline styles or style blocks:

```powershell
rg -n "<style|style=" assets/theme-v2/js/toolbox-status-bar.js assets/theme-v2/css/status.css tests/playwright/tools/ToolboxSelectedGameStatusBar.spec.mjs
```

## Artifact
Create repo-structured delta ZIP:

```text
tmp/PR_26175_ALFA_002-toolbox-status-bar-context-polish_delta.zip
```
