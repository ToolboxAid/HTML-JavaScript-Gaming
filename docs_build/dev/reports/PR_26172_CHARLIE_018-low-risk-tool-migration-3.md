# PR_26172_CHARLIE_018-low-risk-tool-migration-3

## Summary

Status: PASS with documented validation blockers

This PR migrated the Game Configuration toolbox JS family to the canonical tool asset structure selected by PR017.

Canonical path:

- `assets/toolbox/game-configuration/js/index.js`

Removed legacy active JS paths:

- `toolbox/game-configuration/game-configuration.js`
- `toolbox/game-configuration/game-configuration-api-client.js`

No CSS migration was required.

## Files Reviewed

- `toolbox/game-configuration/index.html`
- `toolbox/game-configuration/game-configuration.js`
- `toolbox/game-configuration/game-configuration-api-client.js`
- `assets/toolbox/game-configuration/js/index.js`
- `scripts/validate-canonical-repository-structure.mjs`
- `scripts/validate-browser-env-agnostic.mjs`
- `tests/dev-runtime/ProductDataProviderContractHardening.test.mjs`
- `tests/playwright/tools/GameConfigurationMockRepository.spec.mjs`

## Files Changed

| File | Change |
| --- | --- |
| `assets/toolbox/game-configuration/js/index.js` | Moved Game Configuration page module into canonical location and folded in the API client wrapper. |
| `toolbox/game-configuration/game-configuration-api-client.js` | Removed after wrapper was consolidated into the canonical module. |
| `toolbox/game-configuration/index.html` | Updated module script source to canonical path. |
| `scripts/validate-canonical-repository-structure.mjs` | Removed Game Configuration legacy JS exceptions. |
| `scripts/validate-browser-env-agnostic.mjs` | Updated Game Configuration product-data entrypoint path. |
| `tests/dev-runtime/ProductDataProviderContractHardening.test.mjs` | Updated Game Configuration product-data entrypoint path. |
| `tests/playwright/tools/GameConfigurationMockRepository.spec.mjs` | Added test-server API URL isolation matching other toolbox specs so local `.env` does not force browser calls to `127.0.0.1:5501`. |

## Behavior Preservation

- The HTML route remains `toolbox/game-configuration/index.html`.
- The browser module still creates the Game Configuration repository through the existing server API client.
- Existing DOM selectors and response rendering were preserved.
- The API wrapper function and constants were preserved in the canonical module.
- No persistence behavior was added.
- No additional tool family was migrated.

## Validation Commands

| Command | Result | Notes |
| --- | --- | --- |
| `rg "toolbox/game-configuration/(game-configuration|game-configuration-api-client)\\.js|game-configuration-api-client" -n --glob '!docs_build/dev/reports/**' --glob '!tmp/**' --glob '!node_modules/**'` | PASS | No active stale Game Configuration JS references remain. |
| `node --check assets/toolbox/game-configuration/js/index.js` | PASS | Syntax valid. |
| `node --check scripts/validate-canonical-repository-structure.mjs` | PASS | Syntax valid. |
| `node --check scripts/validate-browser-env-agnostic.mjs` | PASS | Syntax valid. |
| `node --check tests/dev-runtime/ProductDataProviderContractHardening.test.mjs` | PASS | Syntax valid. |
| `node --check tests/playwright/tools/GameConfigurationMockRepository.spec.mjs` | PASS | Syntax valid. |
| `npm run validate:canonical-structure` | PASS | Blocking violations: 0. Approved legacy exceptions reduced to 490. |
| `git diff --check` | PASS | Whitespace validation passed. |
| `npx playwright test tests/playwright/tools/GameConfigurationMockRepository.spec.mjs` | FAIL | Browser reached same-origin API after test isolation, but Local API returned 500 for Game Configuration repository mutating methods and known Game Journey completion metrics route. |
| `node --test tests/dev-runtime/ProductDataProviderContractHardening.test.mjs` | FAIL | Pre-existing failures remain in public-config/toolbox-votes contract assertions. Game Configuration path update was applied. |

## Playwright Failure Notes

Initial Playwright run failed because local `.env` pointed browser API calls at `http://127.0.0.1:5501/api` while no local API server was running. The Game Configuration spec was updated to isolate `GAMEFOUNDRY_API_URL` and `GAMEFOUNDRY_SITE_URL` to the repo test server, matching patterns used by other toolbox specs.

After that test isolation, the browser loaded the canonical module and reached the same-origin API. Remaining failures are server/API behavior, not missing canonical assets:

- `500 /api/toolbox/game-configuration/repositories/.../methods/makeMissingGameDesign`
- `500 /api/toolbox/game-configuration/repositories/.../methods/makeValidGameDesign`
- `500 /api/toolbox/game-configuration/repositories/.../methods/updateConfiguration`
- `500 /api/game-journey/completion-metrics`

The Game Journey completion metrics failure is the previously documented legacy SQLite preservation blocker from PR006A.

## Requirement Checklist

| Requirement | Result | Notes |
| --- | --- | --- |
| Migrate one safest tool from PR017 | PASS | Game Configuration migrated. |
| Move JS to canonical structure | PASS | `assets/toolbox/game-configuration/js/index.js`. |
| Move CSS only if required | PASS | No CSS move required. |
| Preserve behavior | PASS with validation blocker | DOM behavior is preserved by code inspection and targeted page probe; full Playwright is blocked by pre-existing API 500s. |
| Update references | PASS | HTML, guardrail, and product-data checks updated. |
| Targeted validation only | PASS | No samples or full smoke run. |
| Do not migrate multiple helper families/tools | PASS | Only Game Configuration changed. |

## Branch Validation

| Check | Result | Notes |
| --- | --- | --- |
| Current branch is Charlie stack branch | PASS | `PR_26172_CHARLIE_repository-compliance-stack` |
| Worktree clean before PR018 edits | PASS | PR017 was committed and pushed before PR018 edits. |
| Local/origin sync before PR018 edits | PASS | `0 0` before PR018 edits. |
| Stack remains unmerged | PASS | No merge performed. |

## Manual Validation Notes

- Continue stack: YES.
- The migration reduced canonical legacy exceptions by two files.
- Runtime validation blockers should not prevent PR019 because they are not caused by Game Configuration canonical path migration.
- Future owner review may choose a separate Local API/Game Configuration persistence hardening PR to remove the repository-method 500s from the Playwright lane.
