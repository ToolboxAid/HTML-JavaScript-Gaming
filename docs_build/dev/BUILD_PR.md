# PR_26175_ALFA_003-toolbox-status-bar-single-row-polish

## Purpose
Update the shared toolbox status bar to a single-row creator context bar.

## Source Of Truth
This `BUILD_PR.md` is the source of truth for `PR_26175_ALFA_003-toolbox-status-bar-single-row-polish`.

## Exact Scope
- Display only the selected Game Hub game name on the left side.
- Display only the current status message in the center.
- Remove visible status bar labels: `Selected Game Name`, `Selected Game Purpose`, `Save State`, `Tool Action`, `Warning`, and `Error`.
- Remove selected game purpose from the visible status bar.
- Keep the game name and status message on the same row at desktop/toolbox widths.
- Preserve normal placement above the footer.
- Preserve fullscreen/tool display mode bottom anchoring.
- Ensure fullscreen center tool content and its scrollbar stop above the fixed status bar.
- Add bottom reserve equal to the status bar height for the fullscreen center tool area.
- Preserve Idea Board selected-game filtering exclusion.
- Preserve Game Hub as selected-game owner through the existing repository contract.
- Keep the shared Theme V2 toolbox component model.
- Keep creator-facing language simple.
- Do not add environment/server details to the UI.
- Update targeted Playwright coverage for the single-row layout and fullscreen bottom reserve.

## Exact Targets
- `docs_build/dev/BUILD_PR.md`
- `assets/theme-v2/js/toolbox-status-bar.js`
- `assets/theme-v2/css/status.css`
- `tests/playwright/tools/ToolboxSelectedGameStatusBar.spec.mjs`
- `docs_build/dev/reports/PR_26175_ALFA_003-toolbox-status-bar-single-row-polish_report.md`
- `docs_build/dev/reports/PR_26175_ALFA_003-toolbox-status-bar-single-row-polish_validation-lane.md`
- `docs_build/dev/reports/PR_26175_ALFA_003-toolbox-status-bar-single-row-polish_requirements-checklist.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Out Of Scope
- No environment status in the toolbox status bar.
- No large banners.
- No modal messages or modal-style status messages.
- No row highlights.
- No selected game purpose in the visible status bar.
- No visible status category labels in the status bar.
- No API/service contract changes.
- No inline styles, style blocks, or page-local CSS.
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
tmp/PR_26175_ALFA_003-toolbox-status-bar-single-row-polish_delta.zip
```
