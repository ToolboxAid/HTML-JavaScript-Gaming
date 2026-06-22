# PR_26172_CHARLIE_001 Repository Compliance Audit

## Scope

Audit repository compliance against:

- PR_034 Canonical Repository Structure
- PR_035 Test Structure Standardization
- PR_036 Legacy Migration Policy

Reviewed areas:

- `toolbox/`
- `assets/`
- `tests/`
- `api/`
- `serverside/`
- `src/engine/`

This PR is audit-only. No executable implementation changes were made.

## Team Ownership

- TEAM token: CHARLIE
- Ownership classification: governance / repository compliance / diagnostics
- TEAM ownership result: PASS

## Branch Validation

| Requirement | Status | Evidence |
| --- | --- | --- |
| Started from latest main | PASS | `main` was pulled before branch creation; source commit `c4a495f0aa8e32d499ca64555c4a3547e6fcb298`. |
| Worktree clean before branch | PASS | `git status --short` returned no output before branch creation. |
| Local/origin sync before branch | PASS | `git rev-list --left-right --count HEAD...origin/main` returned `0 0`. |
| PR branch created from main | PASS | Branch `pr/26172-CHARLIE-001-repository-compliance-audit` was created from latest `main`. |
| Runtime/source edits avoided | PASS | Planned changed files are reports only under `docs_build/dev/reports/`. |

## Repository Area Results

| Area | Status | Findings |
| --- | --- | --- |
| `toolbox/` | FAIL | Active tool JavaScript remains beside tool HTML entries instead of canonical `assets/toolbox/{tool-name}/js/index.js` or shared asset roots. |
| `assets/` | PASS | No non-compliant JS or CSS files were found in `assets/`; scanned JS/CSS lives under `assets/theme-v2/`. |
| `tests/` | FAIL | 494 files are in non-canonical top-level test locations outside `tests/toolbox/`, `tests/engine/`, `tests/api/`, `tests/server/`, `tests/js/shared/`, or `tests/regression/`. |
| `api/` | FAIL | Canonical root is absent. No API files were found to classify, but the expected top-level API area is not physically present. |
| `serverside/` | FAIL | Canonical root is absent. No serverside files were found to classify, but the expected top-level serverside area is not physically present. |
| `src/engine/` | FAIL | Most engine JS is under feature folders, but `src/engine/paletteList.js` is a root-level JS file and `src/engine/ui/*.css` contains CSS outside canonical asset/theme roots. |

## Non-Compliant JS Locations

### `toolbox/`

These active JavaScript files are outside the canonical tool asset structure:

- `toolbox/assets/assets-api-client.js`
- `toolbox/assets/assets-upload-worker.js`
- `toolbox/assets/assets.js`
- `toolbox/colors/colors.js`
- `toolbox/colors/palette-api-client.js`
- `toolbox/controls/controls-api-client.js`
- `toolbox/controls/controls.js`
- `toolbox/game-configuration/game-configuration-api-client.js`
- `toolbox/game-configuration/game-configuration.js`
- `toolbox/game-design/game-design-api-client.js`
- `toolbox/game-design/game-design.js`
- `toolbox/game-hub/game-hub-api-client.js`
- `toolbox/game-hub/game-hub.js`
- `toolbox/game-journey/game-journey-api-client.js`
- `toolbox/game-journey/game-journey.js`
- `toolbox/idea-board/index.js`
- `toolbox/messages/message-tts-service-registry.js`
- `toolbox/messages/messages-api-client.js`
- `toolbox/messages/messages.js`
- `toolbox/objects/objects-api-client.js`
- `toolbox/objects/objects.js`
- `toolbox/tags/tags-api-client.js`
- `toolbox/tags/tags.js`
- `toolbox/text-to-speech/text2speech.js`
- `toolbox/tool-registry-api-client.js`
- `toolbox/toolRegistry.js`
- `toolbox/tools-page-accordions.js`

Recommended target pattern:

- Tool-specific JS: `assets/toolbox/{tool-name}/js/index.js`
- Shared toolbox JS: `assets/js/shared/`

### `src/engine/`

- `src/engine/paletteList.js`

Recommended target pattern:

- Move under a feature folder such as `src/engine/palette/` after import-impact review.

## Non-Compliant CSS Locations

### `toolbox/`

- None found.

### `assets/`

- None found.

### `src/engine/`

These CSS files are active style assets under engine source:

- `src/engine/ui/baseLayout.css`
- `src/engine/ui/hubCommon.css`
- `src/engine/ui/spriteEditor.css`

Recommended target pattern:

- Move shared UI/theme styling into `assets/theme-v2/css/` or create an approved engine UI style policy before relocation.

## Non-Compliant Test Locations

Canonical test roots from PR_035:

- `tests/toolbox/{tool-name}/`
- `tests/engine/{feature-name}/`
- `tests/api/{feature-name}/`
- `tests/server/{feature-name}/`
- `tests/js/shared/`
- `tests/regression/`

The audit found 494 files in non-canonical test locations:

| Path | File Count | Examples |
| --- | ---: | --- |
| `tests/ai/` | 1 | `tests/ai/AIBehaviors.test.mjs` |
| `tests/assets/` | 1 | `tests/assets/AssetLoaderSystem.test.mjs` |
| `tests/audio/` | 1 | `tests/audio/AudioService.test.mjs` |
| `tests/combat/` | 1 | `tests/combat/Combat.test.mjs` |
| `tests/config/` | 1 | `tests/config/ConfigStore.test.mjs` |
| `tests/core/` | 11 | `tests/core/EngineCoreBoundaryBaseline.test.mjs` |
| `tests/dev-runtime/` | 31 | `tests/dev-runtime/AdminHealthOperations.test.mjs` |
| `tests/entity/` | 1 | `tests/entity/Entity.test.mjs` |
| `tests/events/` | 2 | `tests/events/EventBus.test.mjs` |
| `tests/final/` | 11 | `tests/final/ReleaseReadinessSystems.test.mjs` |
| `tests/fixtures/` | 52 | `tests/fixtures/assets/asset-scenarios.json` |
| `tests/fx/` | 1 | `tests/fx/ParticleSystem.test.mjs` |
| `tests/games/` | 35 | `tests/games/AsteroidsValidation.test.mjs` |
| `tests/helpers/` | 11 | `tests/helpers/playwrightRepoServer.mjs` |
| `tests/index.html` | 1 | `tests/index.html` |
| `tests/input/` | 8 | `tests/input/InputService.test.mjs` |
| `tests/persistence/` | 1 | `tests/persistence/StorageService.test.mjs` |
| `tests/playwright/` | 44 | `tests/playwright/tools/GameJourneyTool.spec.mjs` |
| `tests/playwright_installation.txt` | 1 | `tests/playwright_installation.txt` |
| `tests/production/` | 3 | `tests/production/ProductionReadiness.test.mjs` |
| `tests/README.md` | 1 | `tests/README.md` |
| `tests/render/` | 1 | `tests/render/Renderer.test.mjs` |
| `tests/replay/` | 2 | `tests/replay/ReplaySystem.test.mjs` |
| `tests/results/` | 26 | `tests/results/playwright-results.json` |
| `tests/run-tests.mjs` | 1 | `tests/run-tests.mjs` |
| `tests/runtime/` | 81 | `tests/runtime/V2SessionPersistence.test.mjs` |
| `tests/samples/` | 1 | `tests/samples/FullscreenRuleEnforcement.test.mjs` |
| `tests/scenes/` | 3 | `tests/scenes/SceneManager.test.mjs` |
| `tests/schemas/` | 1 | `tests/schemas/tool.manifest.schema.json` |
| `tests/shared/` | 92 | `tests/shared/ProjectContract.test.mjs` |
| `tests/testRunner.html` | 1 | `tests/testRunner.html` |
| `tests/testRunner.js` | 1 | `tests/testRunner.js` |
| `tests/tools/` | 57 | `tests/tools/ToolBoundaryEnforcement.test.mjs` |
| `tests/validation/` | 3 | `tests/validation/samples.runtime.validation.report.json` |
| `tests/vector/` | 1 | `tests/vector/VectorMath.test.mjs` |
| `tests/world/` | 4 | `tests/world/WorldSystems.test.mjs` |

Generated Playwright result artifacts under `tests/results/` should be treated as cleanup/archive candidates rather than active test source.

## Legacy Migration Candidates

| Priority | Candidate | Reason | Recommended Handling |
| --- | --- | --- | --- |
| P0 | `tests/results/` | Generated result artifacts are tracked under active tests. | Move to ignored output or archive/report storage after owner approval. |
| P1 | `toolbox/*/*.js` and shared `toolbox/*.js` | Active JS is colocated with HTML entries instead of canonical asset roots. | Migrate tool JS to `assets/toolbox/{tool-name}/js/index.js`; migrate shared JS to `assets/js/shared/`. |
| P1 | `tests/dev-runtime/`, `tests/playwright/`, `tests/runtime/`, `tests/shared/`, `tests/tools/` | Large active test buckets conflict with PR_035 canonical test roots. | Split by ownership into `tests/toolbox/`, `tests/engine/`, `tests/api/`, `tests/server/`, `tests/js/shared/`, and `tests/regression/`. |
| P2 | `src/engine/paletteList.js` | Root-level engine JS file is outside `src/engine/{feature-name}/`. | Move to an approved feature folder with import compatibility reviewed. |
| P2 | `src/engine/ui/*.css` | CSS lives under engine source instead of theme/tool asset roots. | Move to `assets/theme-v2/css/` or define an explicit engine UI CSS policy. |
| P3 | Missing `api/` and `serverside/` roots | Canonical target roots are absent. | Create roots when the first API/server migration needs them, with placeholder README only if governance permits. |

## Prioritized Remediation List

1. Remove or archive tracked generated artifacts under `tests/results/`.
2. Create a staged migration plan for `toolbox/` JavaScript sidecars, starting with shared files (`toolRegistry.js`, `tool-registry-api-client.js`, `tools-page-accordions.js`).
3. Standardize high-volume test buckets in phases: `tests/dev-runtime/`, `tests/playwright/`, `tests/runtime/`, `tests/shared/`, then `tests/tools/`.
4. Move `src/engine/paletteList.js` into an engine feature folder after import-impact review.
5. Resolve engine CSS placement for `src/engine/ui/*.css`.
6. Add or defer canonical `api/` and `serverside/` roots with explicit owner-approved scope.

## Recommended Next Charlie PRs

- `PR_26172_CHARLIE_002-test-results-artifact-cleanup-plan`
- `PR_26172_CHARLIE_003-toolbox-js-canonical-asset-migration-plan`
- `PR_26172_CHARLIE_004-test-structure-standardization-plan`
- `PR_26172_CHARLIE_005-engine-root-js-and-css-migration-plan`
- `PR_26172_CHARLIE_006-api-serverside-root-readiness-plan`

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Follow ProjectInstructions | PASS | Read active `docs_build/dev/ProjectInstructions/` governance before work. |
| Start from latest main | PASS | Main pulled and branch created from `c4a495f0aa8e32d499ca64555c4a3547e6fcb298`. |
| Worktree clean before work | PASS | `git status --short` returned no output before edits. |
| Audit PR_034 structure | PASS | Compared scoped paths to canonical toolbox, assets, engine, API, and serverside roots. |
| Audit PR_035 tests | PASS | Compared `tests/` contents to canonical test roots. |
| Audit PR_036 legacy migration policy | PASS | Classified migration candidates without moving or deleting files. |
| Review `toolbox/` | PASS | Identified 27 non-compliant JS files. |
| Review `assets/` | PASS | Found no non-compliant active JS/CSS in `assets/`. |
| Review `tests/` | PASS | Identified 494 files in non-canonical test locations. |
| Review `api/` | PASS | Directory absent; recorded as structural failure. |
| Review `serverside/` | PASS | Directory absent; recorded as structural failure. |
| Review `src/engine/` | PASS | Identified root JS and engine CSS placement issues. |
| No executable implementation changes | PASS | Audit/report-only scope. |
| Create audit report | PASS | This file. |
| Create standard Codex reports | PASS | `docs_build/dev/reports/codex_review.diff` and `docs_build/dev/reports/codex_changed_files.txt` exist. |
| Create ZIP artifact | PASS | `tmp/PR_26172_CHARLIE_001-repository-compliance-audit_delta.zip` exists. |

## Validation Lane Report

- `git diff --check`: PASS.
- Report exists: PASS.
- Required Codex reports exist: PASS.
- ZIP artifact exists: PASS.
- Runtime source files changed: PASS, changed files are limited to `docs_build/dev/reports/`.
- Playwright: SKIP, audit-only documentation/report PR.
- Samples: SKIP, audit-only documentation/report PR.

## Manual Validation Notes

- The audit intentionally did not move files, delete generated artifacts, create canonical roots, or modify executable source.
- `api/` and `serverside/` were missing from the working tree; this was recorded as a structural finding, not remediated in this PR.
- Non-canonical test locations were counted by top-level path under `tests/` to keep the report actionable without rewriting the test tree.
- Tracked generated artifacts under `tests/results/` are listed as a high-priority cleanup candidate because they are active repository files but not active test source.
