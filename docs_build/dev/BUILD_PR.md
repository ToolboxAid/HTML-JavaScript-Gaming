# PR_26175_ALFA_007-game-hub-project-readonly-proof

## Purpose
Prove that Game Hub keeps existing project/game identity read-only while allowing normal create and metadata-edit workflows.

## Source Of Truth
This `BUILD_PR.md` is the source of truth for `PR_26175_ALFA_007-game-hub-project-readonly-proof`.

## Exact Scope
- Add targeted Playwright proof that existing Game Hub project identity is read-only in edit mode.
- Prove legacy Project Workspace project-information and project-record table controls are absent from Game Hub.
- Prove source-idea child rows are read-only context, not editable project controls.
- Prove add/create remains the only place where a new game name can be entered.
- Preserve existing valid create/open/edit/delete behavior.
- Do not change product UI or repository/API/service behavior unless targeted validation proves it is required.

## Exact Targets
- `docs_build/dev/BUILD_PR.md`
- `tests/playwright/tools/GameHubMockRepository.spec.mjs`
- `docs_build/dev/reports/PR_26175_ALFA_007-game-hub-project-readonly-proof_report.md`
- `docs_build/dev/reports/PR_26175_ALFA_007-game-hub-project-readonly-proof_validation-lane.md`
- `docs_build/dev/reports/PR_26175_ALFA_007-game-hub-project-readonly-proof_requirements-checklist.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Out Of Scope
- No product/UI implementation changes unless targeted validation fails because of a real read-only gap.
- No repository/API/service contract changes.
- No Game Journey completion-metrics changes.
- No shared toolbox status bar changes.
- No browser-owned product data as source of truth.
- No silent fallbacks.
- No inline styles, style blocks, or page-local CSS.
- No engine core changes.
- No `start_of_day` folder changes.

## Validation
Run targeted read-only proof validation:

```powershell
npx playwright test tests/playwright/tools/GameHubMockRepository.spec.mjs --workers=1 --grep "Game Hub proves project identity is read-only outside create"
```

Also verify changed source does not introduce inline styles or style blocks:

```powershell
rg -n "<[s]tyle|[s]tyle=" tests/playwright/tools/GameHubMockRepository.spec.mjs docs_build/dev/BUILD_PR.md docs_build/dev/reports/PR_26175_ALFA_007-game-hub-project-readonly-proof_report.md docs_build/dev/reports/PR_26175_ALFA_007-game-hub-project-readonly-proof_validation-lane.md docs_build/dev/reports/PR_26175_ALFA_007-game-hub-project-readonly-proof_requirements-checklist.md
```

## Artifact
Create repo-structured delta ZIP:

```text
tmp/PR_26175_ALFA_007-game-hub-project-readonly-proof_delta.zip
```
