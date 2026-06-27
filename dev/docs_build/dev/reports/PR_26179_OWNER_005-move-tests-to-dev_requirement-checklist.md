# Requirement Checklist - PR_26179_OWNER_005-move-tests-to-dev

| Requirement | Status | Evidence |
| --- | --- | --- |
| Move `tests/` to `dev/tests/` | PASS | 0 tracked root `tests/` files; 577 tracked `dev/tests/` files. |
| Update `package.json` scripts | PASS | Test scripts reference `dev/tests`. |
| Update Playwright config | PASS | `playwright.config.cjs` discovers under `dev/tests/ui` and `dev/tests/playwright`. |
| Update imports, paths, and test references | PASS | Scripts, ProjectInstructions, and moved test relative paths updated. |
| Keep tests working from new path | PASS | Targeted node tests, service API script, and Playwright discovery passed. |
| Keep product/runtime paths unchanged | PASS | No product runtime files moved by PR_005. |
| Produce required reports | PASS | Report set, changed files, and review diff generated under `dev/docs_build/dev/reports/`. |
| Produce repo-structured ZIP | PASS | `tmp/PR_26179_OWNER_005-move-tests-to-dev_delta.zip` refreshed. |
