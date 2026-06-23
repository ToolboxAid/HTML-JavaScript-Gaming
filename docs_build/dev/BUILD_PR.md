# PR_26175_ALFA_005-game-hub-audit-findings-cleanup

## Purpose
Clean up the targeted Game Hub audit findings from `PR_26175_ALFA_004-game-hub-completion-status-audit`.

## Source Of Truth
This `BUILD_PR.md` is the source of truth for `PR_26175_ALFA_005-game-hub-audit-findings-cleanup`.

## Exact Scope
- Resolve the targeted Game Hub Playwright failures recorded by the ALFA_004 audit.
- Keep the cleanup focused on stale or over-broad test expectations unless product code is required by validation.
- Preserve the existing Game Hub table workflow behavior.
- Preserve the shared toolbox selected-game status bar behavior.
- Preserve Game Journey completion-metrics API/service behavior.
- Do not implement unrelated product or UI changes.

## ALFA_004 Findings To Clean Up
- `tests/playwright/tools/GameHubMockRepository.spec.mjs:238`: duplicate `Open Game Hub` link strict-mode conflict after the shared toolbox status bar added its own Game Hub action.
- `tests/playwright/tools/GameHubMockRepository.spec.mjs:257`: stale expectation that no `Game Status` label exists.
- `tests/playwright/tools/GameHubMockRepository.spec.mjs:582`: stale guest-mode expectation that no `Game Status` label exists.
- `tests/playwright/tools/GameHubMockRepository.spec.mjs:1019`: toolbox role-filter lane records known `500 /api/game-journey/completion-metrics` requests outside the Game Hub table workflow.

## Exact Targets
- `docs_build/dev/BUILD_PR.md`
- `tests/playwright/tools/GameHubMockRepository.spec.mjs`
- `docs_build/dev/reports/PR_26175_ALFA_005-game-hub-audit-findings-cleanup_report.md`
- `docs_build/dev/reports/PR_26175_ALFA_005-game-hub-audit-findings-cleanup_validation-lane.md`
- `docs_build/dev/reports/PR_26175_ALFA_005-game-hub-audit-findings-cleanup_requirements-checklist.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Out Of Scope
- No Game Hub product or UI behavior changes unless targeted validation proves they are required.
- No Game Journey completion-metrics product/API/service changes.
- No API/service contract changes.
- No browser-owned product data as source of truth.
- No silent fallbacks.
- No inline styles, style blocks, or page-local CSS.
- No engine core changes.
- No `start_of_day` folder changes.

## Validation
Run:

```powershell
npx playwright test tests/playwright/tools/GameHubMockRepository.spec.mjs --workers=1
```

Also verify the changed source does not introduce inline styles or style blocks:

```powershell
rg -n "<[s]tyle|[s]tyle=" tests/playwright/tools/GameHubMockRepository.spec.mjs docs_build/dev/BUILD_PR.md docs_build/dev/reports/PR_26175_ALFA_005-game-hub-audit-findings-cleanup_report.md docs_build/dev/reports/PR_26175_ALFA_005-game-hub-audit-findings-cleanup_validation-lane.md docs_build/dev/reports/PR_26175_ALFA_005-game-hub-audit-findings-cleanup_requirements-checklist.md
```

## Artifact
Create repo-structured delta ZIP:

```text
tmp/PR_26175_ALFA_005-game-hub-audit-findings-cleanup_delta.zip
```
