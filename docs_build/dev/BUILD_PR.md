# PR_26175_ALFA_006-game-hub-create-project-validation

## Purpose
Add creator-facing validation for the Game Hub create-project row so blank game names do not silently create fallback projects.

## Source Of Truth
This `BUILD_PR.md` is the source of truth for `PR_26175_ALFA_006-game-hub-create-project-validation`.

## Exact Scope
- Validate the Game Hub add-game row before calling the repository create method.
- Block signed-in creator saves when the game name is blank or whitespace-only.
- Keep the add-game row open after validation failure.
- Show a creator-safe validation message in the existing Game Hub status log.
- Mark the game name input invalid for accessibility.
- Preserve valid create/open/delete behavior.
- Preserve guest save redirect behavior.
- Preserve API/service/repository contracts.
- Add targeted Playwright coverage for the create validation path.

## Exact Targets
- `docs_build/dev/BUILD_PR.md`
- `toolbox/game-hub/game-hub.js`
- `tests/playwright/tools/GameHubMockRepository.spec.mjs`
- `docs_build/dev/reports/PR_26175_ALFA_006-game-hub-create-project-validation_report.md`
- `docs_build/dev/reports/PR_26175_ALFA_006-game-hub-create-project-validation_validation-lane.md`
- `docs_build/dev/reports/PR_26175_ALFA_006-game-hub-create-project-validation_requirements-checklist.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Out Of Scope
- No repository/API/service contract changes.
- No Game Journey completion-metrics changes.
- No shared toolbox status bar changes.
- No unrelated Game Hub workflow changes.
- No browser-owned product data as source of truth.
- No silent create-name fallback in the Game Hub page flow.
- No inline styles, style blocks, or page-local CSS.
- No engine core changes.
- No `start_of_day` folder changes.

## Validation
Run targeted create-project validation:

```powershell
npx playwright test tests/playwright/tools/GameHubMockRepository.spec.mjs --workers=1 --grep "Game Hub creates, opens, and deletes mock games"
```

Also verify changed source does not introduce inline styles or style blocks:

```powershell
rg -n "<[s]tyle|[s]tyle=" toolbox/game-hub/game-hub.js tests/playwright/tools/GameHubMockRepository.spec.mjs docs_build/dev/BUILD_PR.md docs_build/dev/reports/PR_26175_ALFA_006-game-hub-create-project-validation_report.md docs_build/dev/reports/PR_26175_ALFA_006-game-hub-create-project-validation_validation-lane.md docs_build/dev/reports/PR_26175_ALFA_006-game-hub-create-project-validation_requirements-checklist.md
```

## Artifact
Create repo-structured delta ZIP:

```text
tmp/PR_26175_ALFA_006-game-hub-create-project-validation_delta.zip
```
