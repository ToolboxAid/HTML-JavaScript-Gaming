# PR_26179_OWNER_006-move-bootstrap-scripts

Generated: 2026-06-27T19:11:00.890Z
Branch: PR_26179_OWNER_006-move-bootstrap-scripts
Base: PR_26179_OWNER_005-move-tests-to-dev
HEAD before report commit: c36a05304b3593ca2a0b6d8cbb99fefc2bb92922

## Purpose

Move local/test bootstrap scripts and dev-only runner scripts/config into the dev workspace while preserving existing command surfaces.

## Summary

- Moved tracked root `scripts/` files to `dev/scripts/`.
- Moved root Playwright configs to `dev/config/`.
- Updated `package.json` scripts to call `dev/scripts/`.
- Updated GitHub Actions platform validation to call `node ./dev/scripts/run-platform-validation-suite.mjs`.
- Updated moved script repo-root calculations, script self-references, PowerShell helper paths, and tests that import script modules.
- Kept application runtime/business logic out of `dev/`.

## Scope Confirmation

Documentation/dev-runner/config only. No product UI, API, database, `src/`, `docs/`, `games/`, `toolbox/`, `account/`, `admin/`, `legal/`, or asset runtime behavior was moved.

## Requirement Checklist

| Status | Requirement | Evidence |
| --- | --- | --- |
| PASS | Move local/test bootstrap scripts and dev-only runner scripts/config into dev/bootstrap/, dev/scripts/, or dev/config/. | Moved tracked root scripts/ to dev/scripts/ and Playwright configs to dev/config/. |
| PASS | Keep application runtime/business logic out of dev/. | No src/, product UI, API contract, database, assets, docs/, games/, toolbox/, account/, admin/, or legal runtime files were moved into dev/. |
| PASS | Ensure npm run dev:local-api still works. | package.json now points dev:local-api at dev/scripts/start-local-api-server.mjs; syntax/import validation passed without launching a long-running server. |
| PASS | No Creator-writeable repo folder introduced. | This PR moves dev tooling only and adds no Creator data write path. |
| PASS | No runtime/business logic scope expansion. | Changes are limited to dev scripts/config, package script paths, validation tests/docs, and generated reports. |
| PASS | No broad unrelated cleanup. | No product/runtime implementation files were changed. |

## Validation

| Status | Lane | Evidence |
| --- | --- | --- |
| PASS | Current branch | PR_26179_OWNER_006-move-bootstrap-scripts |
| PASS | Base branch for stack | PR_26179_OWNER_005-move-tests-to-dev |
| PASS | node --check changed JS/CJS/MJS files | 32 changed JS/CJS/MJS files checked successfully. |
| PASS | Local API bootstrap import | Imported dev/scripts/start-local-api-server.mjs and verified formatStartupLogLines export. |
| PASS | Targeted moved-script tests | node ./dev/scripts/run-node-test-files.mjs dev/tests/dev-runtime/LocalApiStartupLogging.test.mjs dev/tests/tools/AssetOwnershipStrategyCloseout.test.mjs dev/tests/regression/CanonicalRepositoryStructureGuardrail.test.mjs |
| PASS | Service API lane through moved runner | npm run test:service:api |
| PASS | Playwright structure audit through moved runner | npm run test:audit:locations |
| PASS | Playwright moved config discovery | npx playwright test --config=dev/config/playwright.config.cjs --list |
| PASS | Canonical structure validation | npm run validate:canonical-structure |
| PASS | GitHub Actions platform-validation path | Workflow now calls node ./dev/scripts/run-platform-validation-suite.mjs; targeted grep confirms no .github workflow still calls node ./scripts/run-platform-validation-suite.mjs. |
| PASS | Platform validation suite | node ./dev/scripts/run-platform-validation-suite.mjs completed 8/8 scenarios. |
| PASS | Whitespace validation | git diff --check -- . |

## Manual Validation Notes

- No UI changes were made.
- Full browser Playwright execution was not run; PR_006 changed runner/config placement, so validation used structure audit and `--list` discovery with the moved config.
- `npm run dev:local-api` was not left running; the moved startup module was imported successfully and the package script points to the moved file.
- PR #241 CI blocker was a workflow script path issue only; no runtime behavior or file moves were changed for this fix.

## Changed Files

`dev/docs_build/dev/reports/codex_changed_files.txt` contains the full name-status list.
