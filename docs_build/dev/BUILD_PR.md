# PR_26175_ALFA_009-status-bar-single-row-rebuild

## Purpose
Rebuild the shared toolbox status bar on current `main` so it is a single-row creator context bar.

## Source Of Truth
This `BUILD_PR.md` is the source of truth for `PR_26175_ALFA_009-status-bar-single-row-rebuild`.

## Exact Scope
- Display only the selected Game Hub game name on the left side of the toolbox status bar.
- Display only the current status message in the center of the toolbox status bar.
- Remove visible status bar labels: `Selected Game Name`, `Selected Game Purpose`, `Save State`, `Tool Action`, `Warning`, and `Error`.
- Remove selected-game purpose from the visible status bar.
- Preserve normal status bar placement above the footer.
- Remove extra status bar/footer spacing so the shared footer top padding resolves to `0px`.
- Preserve fullscreen/tool display mode bottom anchoring.
- Ensure fullscreen center scrollable content stops above the fixed status bar.
- Ensure fullscreen tool content is not hidden behind the status bar.
- Preserve Idea Board selected-game filtering exclusion.
- Preserve Game Hub as selected-game owner through the existing repository contract.
- Use shared Theme V2 CSS/classes only.
- Update targeted Playwright coverage for the single-row status bar, footer spacing, and fullscreen bottom reserve.

## Exact Targets
- `docs_build/dev/BUILD_PR.md`
- `assets/theme-v2/js/toolbox-status-bar.js`
- `assets/theme-v2/css/status.css`
- `assets/theme-v2/css/layout.css`
- `tests/playwright/tools/ToolboxSelectedGameStatusBar.spec.mjs`
- `docs_build/dev/reports/PR_26175_ALFA_009-status-bar-single-row-rebuild_report.md`
- `docs_build/dev/reports/PR_26175_ALFA_009-status-bar-single-row-rebuild_validation-lane.md`
- `docs_build/dev/reports/PR_26175_ALFA_009-status-bar-single-row-rebuild_requirements-checklist.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Out Of Scope
- No merge of PR #120.
- No reuse of stale ALFA_003 branch.
- No environment/server details in the status bar.
- No selected game purpose in the visible status bar.
- No visible status category labels in the status bar.
- No status action links in the visible status bar.
- No large banners.
- No modal messages or modal-style status messages.
- No row highlights.
- No API/service/repository contract changes.
- No browser-owned product data as source of truth.
- No inline styles, style blocks, or page-local CSS.
- No engine core changes.
- No `start_of_day` folder changes.

## Validation
Run targeted Playwright coverage:

```powershell
npx playwright test tests/playwright/tools/ToolboxSelectedGameStatusBar.spec.mjs --workers=1
```

Also verify changed source does not introduce inline styles or style blocks:

```powershell
rg -n "<[s]tyle|[s]tyle=" assets/theme-v2/js/toolbox-status-bar.js assets/theme-v2/css/status.css assets/theme-v2/css/layout.css tests/playwright/tools/ToolboxSelectedGameStatusBar.spec.mjs
```

## Artifact
Create repo-structured delta ZIP:

```text
tmp/PR_26175_ALFA_009-status-bar-single-row-rebuild_delta.zip
```
