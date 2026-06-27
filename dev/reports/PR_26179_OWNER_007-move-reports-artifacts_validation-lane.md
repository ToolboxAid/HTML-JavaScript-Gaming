# PR_26179_OWNER_007-move-reports-artifacts Validation Lane

| Status | Item | Notes |
| --- | --- | --- |
| PASS | git diff --check | passed |
| PASS | node --check on changed JS/MJS files | passed |
| PASS | npm run test:audit:locations | passed |
| PASS | npm run validate:canonical-structure | passed |
| PASS | Playwright config list | npx playwright test --config=dev/config/playwright.config.cjs --list passed |
| WARN | Legacy workspace migration validation | ProjectWorkspaceMigrationGovernanceCloseoutValidation.test.mjs cannot load a pre-existing missing toolbox/workspace-manager-v2 module; not expanded in this reports/artifacts PR |

Scoped validation result: PASS

Note: The legacy workspace migration validation import failure is documented as an existing unrelated loader issue and was not repaired in this reports/artifacts PR.
