# PR_26175_ALFA_008-game-hub-feature-matrix

## Purpose
Audit the current Game Hub workflow and publish a feature matrix that maps implemented creator-facing behavior to code and Playwright evidence.

## Source Of Truth
This `BUILD_PR.md` is the source of truth for `PR_26175_ALFA_008-game-hub-feature-matrix`.

## Exact Scope
- Produce a Game Hub feature matrix only.
- Audit Game Hub table workflow, selected/open game behavior, create/edit/delete actions, child tables, guest save gating, empty/error states, Theme V2 layout, and targeted Game Hub coverage.
- Use current `main` behavior as evidence.
- Preserve Game Hub UI/product behavior.
- Preserve API/service/repository contracts.
- Preserve previous ALFA Game Hub cleanup and create-validation behavior.
- Do not implement product/UI changes unless validation exposes a requirement-critical defect.

## Exact Targets
- `docs_build/dev/BUILD_PR.md`
- `docs_build/dev/reports/PR_26175_ALFA_008-game-hub-feature-matrix_report.md`
- `docs_build/dev/reports/PR_26175_ALFA_008-game-hub-feature-matrix_validation-lane.md`
- `docs_build/dev/reports/PR_26175_ALFA_008-game-hub-feature-matrix_requirements-checklist.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Evidence Sources
- `toolbox/game-hub/index.html`
- `toolbox/project-workspace/index.html`
- `toolbox/game-hub/game-hub.js`
- `toolbox/game-hub/game-hub-api-client.js`
- `src/dev-runtime/persistence/tool-repositories/game-workspace-mock-repository.js`
- `tests/playwright/tools/GameHubMockRepository.spec.mjs`

## Out Of Scope
- No Game Hub product or UI changes.
- No Game Journey changes.
- No shared toolbox status bar changes.
- No browser-owned product data as source of truth.
- No API/service/repository contract changes.
- No inline styles, style blocks, or page-local CSS.
- No engine core changes.
- No `start_of_day` folder changes.
- No ALFA_007 work.

## Validation
Run targeted Game Hub validation:

```powershell
npx playwright test tests/playwright/tools/GameHubMockRepository.spec.mjs --workers=1
```

Also verify changed docs/reports do not introduce inline styles or style blocks:

```powershell
rg -n "<[s]tyle|[s]tyle=" docs_build/dev/BUILD_PR.md docs_build/dev/reports/PR_26175_ALFA_008-game-hub-feature-matrix_report.md docs_build/dev/reports/PR_26175_ALFA_008-game-hub-feature-matrix_validation-lane.md docs_build/dev/reports/PR_26175_ALFA_008-game-hub-feature-matrix_requirements-checklist.md
```

## Artifact
Create repo-structured delta ZIP:

```text
tmp/PR_26175_ALFA_008-game-hub-feature-matrix_delta.zip
```
