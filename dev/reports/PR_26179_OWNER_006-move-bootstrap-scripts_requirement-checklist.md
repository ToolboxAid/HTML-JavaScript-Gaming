# Requirement Checklist - PR_26179_OWNER_006-move-bootstrap-scripts

| Status | Requirement | Evidence |
| --- | --- | --- |
| PASS | Move local/test bootstrap scripts and dev-only runner scripts/config into dev/bootstrap/, dev/scripts/, or dev/config/. | Moved tracked root scripts/ to dev/scripts/ and Playwright configs to dev/config/. |
| PASS | Keep application runtime/business logic out of dev/. | No src/, product UI, API contract, database, assets, docs/, games/, toolbox/, account/, admin/, or legal runtime files were moved into dev/. |
| PASS | Ensure npm run dev:local-api still works. | package.json now points dev:local-api at dev/scripts/start-local-api-server.mjs; syntax/import validation passed without launching a long-running server. |
| PASS | GitHub Actions references moved script paths. | .github/workflows/platform-validation.yml now runs node ./dev/scripts/run-platform-validation-suite.mjs. |
| PASS | No Creator-writeable repo folder introduced. | This PR moves dev tooling only and adds no Creator data write path. |
| PASS | No runtime/business logic scope expansion. | Changes are limited to dev scripts/config, package script paths, validation tests/docs, and generated reports. |
| PASS | No broad unrelated cleanup. | No product/runtime implementation files were changed. |
