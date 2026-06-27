# Validation Lane - PR_26179_OWNER_006-move-bootstrap-scripts

| Status | Validation | Notes |
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
