# PR_26158_039 Dev Runtime Boundary Enforcement Report

## Summary

PR_26158_039 moves the remaining active mock repository and guest seed implementation out of `toolbox/**` and into `src/dev-runtime/**`, while preserving the Browser -> Server API -> Data Source boundary.

No active browser/tool surface now imports `src/dev-runtime`, mock repositories, or moved seed files directly. The local API server remains the only runtime bridge to the dev-only implementations.

## Implementation

| Change | Evidence | Status |
| --- | --- | --- |
| Moved Asset mock repository into dev-runtime persistence. | `src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js`; `toolbox/assets/assets-mock-repository.js` deleted. | PASS |
| Moved Palette mock repository into dev-runtime persistence. | `src/dev-runtime/persistence/tool-repositories/palette-workspace-repository.js`; `toolbox/colors/palette-workspace-repository.js` deleted. | PASS |
| Moved Palette source seed rows into dev-runtime guest seeds. | `src/dev-runtime/guest-seeds/palette-source-mock-db.js`; `toolbox/colors/palette-source-mock-db.js` deleted. | PASS |
| Moved Game Configuration mock repository into dev-runtime persistence. | `src/dev-runtime/persistence/tool-repositories/game-configuration-mock-repository.js`; old toolbox file deleted. | PASS |
| Moved Game Design mock repository into dev-runtime persistence. | `src/dev-runtime/persistence/tool-repositories/game-design-mock-repository.js`; old toolbox file deleted. | PASS |
| Moved Project Journey mock repository into dev-runtime persistence. | `src/dev-runtime/persistence/tool-repositories/project-journey-mock-repository.js`; old toolbox file deleted. | PASS |
| Moved Project Workspace mock repository into dev-runtime persistence. | `src/dev-runtime/persistence/tool-repositories/project-workspace-mock-repository.js`; old toolbox file deleted. | PASS |
| Moved Local Mem guest/user tool-state sample construction into dev-runtime guest seeds. | `src/dev-runtime/guest-seeds/tool-state-samples.js`; `src/dev-runtime/server/mock-api-router.mjs` calls `createServerSeedTables()`. | PASS |
| Updated server router imports to dev-runtime repositories only. | `src/dev-runtime/server/mock-api-router.mjs` imports from `../persistence/tool-repositories/*` and `../guest-seeds/tool-state-samples.js`. | PASS |
| Updated repository-focused tests to import dev-runtime repositories. | `tests/playwright/tools/*MockRepository.spec.mjs`; `tests/playwright/tools/AdminDbViewer.spec.mjs`; `tests/playwright/tools/ProjectJourneyTool.spec.mjs`. | PASS |
| Added explicit boundary validation. | `tests/dev-runtime/DevRuntimeBoundary.test.mjs`. | PASS |

## Requirement Checklist

| Requirement | Evidence | Result |
| --- | --- | --- |
| Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first. | Read before implementation. | PASS |
| Audit mock, seed, test, guest, demo, fixture, dev-only, and local-only runtime code. | Static searches plus `DevRuntimeBoundary.test.mjs`; see `dev-runtime-audit.md`. | PASS |
| Move remaining dev-only implementation into approved `src/dev-runtime` areas. | Mock repositories moved to `src/dev-runtime/persistence/tool-repositories`; seed data moved to `src/dev-runtime/guest-seeds`. | PASS |
| Verify UAT/PROD bundles do not import/package `src/dev-runtime`. | Static audit over active browser/UAT/PROD candidate roots returned no matches. | PASS |
| Verify active tools consume runtime contracts only and do not import dev-runtime directly. | `rg` audit over `account`, `admin`, `assets`, `toolbox`, and active `src` surfaces returned no matches. | PASS |
| Verify Local Mem, guest seeds, test fixtures, and reseed behavior originate from `src/dev-runtime`. | Server seed creation now lives in `src/dev-runtime/guest-seeds/tool-state-samples.js`; reseed validation passed. | PASS |
| Preserve SQLite-backed Local DB behind API boundary. | AdminDbViewer Local DB readonly lane passed. | PASS |
| Preserve independent Local Mem and Local DB reseed behavior. | `DbSeedIntegrity` and LoginSessionMode Playwright passed. | PASS |
| Update reports with remaining violations. | This report and `dev-runtime-audit.md` list findings. | PASS |
| Do not add UAT/Prod adapter behavior. | No UAT/Prod adapter files changed. | PASS |
| Do not modify `start_of_day` folders. | No `start_of_day` files changed. | PASS |

## Validation

| Validation | Result |
| --- | --- |
| Changed-file syntax checks | PASS |
| `node --test tests/dev-runtime/DevRuntimeBoundary.test.mjs` | PASS, 3/3 |
| `node --test tests/dev-runtime/DbSeedIntegrity.test.mjs` | PASS, 2/2 |
| `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs` | PASS, 6/6 |
| `npx playwright test tests/playwright/tools/AdminDbViewer.spec.mjs` | PASS, 7/7 |
| `npx playwright test tests/playwright/tools/PaletteToolMockRepository.spec.mjs` | PASS, 4/4 |
| `npx playwright test tests/playwright/tools/AssetToolMockRepository.spec.mjs` | PASS, 6/6 |
| `npx playwright test tests/playwright/tools/ProjectJourneyTool.spec.mjs` | PASS, 13/13 |
| Static import boundary audit | PASS |
| `git diff --check` | PASS, line-ending warnings only |

## Remaining Violations

None found in active browser/tool surfaces.

`src/dev-runtime/server/` remains as the local API server boundary created by prior migration work. It is not mock data ownership; it imports the dev-runtime persistence and guest seed modules and exposes them through API routes.

## Notes

- V8 coverage is advisory for this PR because the moved modules are server/dev-runtime JavaScript and are not directly collected by browser V8 coverage.
- Existing seed-only audit fallback diagnostics still appear during some Local Mem/Local DB initialization tests. They are existing seed diagnostics and did not cause validation failures.
