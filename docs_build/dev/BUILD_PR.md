# PR_26175_ALFA_011-status-bar-journey-progress-context

## Purpose
Add right-anchored progress context to the shared toolbox status bar using the existing Game Journey completion metrics/API pipeline.

## Source Of Truth
This `BUILD_PR.md` is the source of truth for `PR_26175_ALFA_011-status-bar-journey-progress-context`.

## Exact Scope
- Preserve the ALFA_009 single-row toolbox status bar behavior:
  - left side displays only the selected Game Hub game name.
  - center displays only the current status message.
- Add right-anchored progress text in this format:
  - `{CurrentTool} {complete}/{total} ({percent}%) | Journey {complete}/{total} ({percent}%)`
- Use existing Game Journey completion metrics/API pipeline for Journey totals.
- Derive current-tool progress from the existing completion metrics record that matches the current toolbox tool/section.
- Do not add new storage.
- Do not use browser-owned authoritative progress data.
- Preserve fullscreen bottom anchoring and existing fullscreen content bottom reserve.
- Preserve normal placement above the footer.
- Use shared Theme V2 CSS/classes only.
- Update targeted Playwright coverage for the right-anchored progress text and existing left/center behavior.

## Exact Targets
- `docs_build/dev/BUILD_PR.md`
- `assets/theme-v2/js/toolbox-status-bar.js`
- `assets/theme-v2/css/status.css`
- `tests/playwright/tools/ToolboxSelectedGameStatusBar.spec.mjs`
- `docs_build/dev/reports/PR_26175_ALFA_011-status-bar-journey-progress-context_report.md`
- `docs_build/dev/reports/PR_26175_ALFA_011-status-bar-journey-progress-context_validation-lane.md`
- `docs_build/dev/reports/PR_26175_ALFA_011-status-bar-journey-progress-context_requirements-checklist.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Evidence Sources
- `assets/js/shared/game-journey-api-client.js`
- `src/api/game-journey-completion-api-client.js`
- `src/dev-runtime/server/local-api-router.mjs`
- `src/dev-runtime/persistence/game-journey-completion-metrics-store.mjs`

## Out Of Scope
- No Game Journey API/service/repository contract changes.
- No new persistence/storage.
- No browser-owned product data as source of truth.
- No silent fallback data.
- No environment/server details in the status bar.
- No selected game purpose in the visible status bar.
- No visible status category labels in the status bar.
- No large banners.
- No modal messages or modal-style status messages.
- No row highlights.
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
rg -n "<[s]tyle|[s]tyle=" assets/theme-v2/js/toolbox-status-bar.js assets/theme-v2/css/status.css tests/playwright/tools/ToolboxSelectedGameStatusBar.spec.mjs
```

## Artifact
Create repo-structured delta ZIP:

```text
tmp/PR_26175_ALFA_011-status-bar-journey-progress-context_delta.zip
```
