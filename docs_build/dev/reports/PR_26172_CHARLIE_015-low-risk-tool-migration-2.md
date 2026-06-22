# PR_26172_CHARLIE_015 Low-Risk Tool Migration 2

## Purpose

Migrate the second safest tool from `PR_26172_CHARLIE_013-tool-js-css-canonical-migration-audit`.

Selected tool:

- Tags

## Scope Summary

| Requirement | Status | Evidence |
| --- | --- | --- |
| Move JS to canonical structure | PASS | `toolbox/tags/tags.js` moved to `assets/toolbox/tags/js/index.js`. |
| Move CSS only if required | PASS | No Tags tool-specific CSS sidecar exists; Theme V2 CSS remains unchanged. |
| Preserve behavior | PASS WITH KNOWN BLOCKER | The executable code path was preserved by folding the tiny API wrapper into the canonical entrypoint. The existing Tags Playwright page test still fails on the same pre-existing Add Tag behavior before this PR. |
| Update references | PASS | Tags page module script and product-data validation allowlists now use the canonical path. |
| Targeted validation only | PASS | Ran targeted syntax, product-data, guardrail, and Tags Playwright validation only. |

## Files Changed

| File | Change |
| --- | --- |
| `assets/toolbox/tags/js/index.js` | Added via move from `toolbox/tags/tags.js`; folded in `tags-api-client.js` server repository wrapper. |
| `toolbox/tags/index.html` | Updated module script source to canonical JS path. |
| `scripts/validate-canonical-repository-structure.mjs` | Removed retired Tags legacy JS exceptions. |
| `scripts/validate-browser-env-agnostic.mjs` | Updated product-data client list to canonical Tags entrypoint. |
| `tests/dev-runtime/ProductDataProviderContractHardening.test.mjs` | Updated product-data client list to canonical Tags entrypoint. |
| `toolbox/tags/tags-api-client.js` | Removed after its small server-contract wrapper was folded into the canonical entrypoint. |

## Reference Check

Active references to retired Tags JS paths were searched with:

```text
rg -n "toolbox/tags/tags-api-client\.js|toolbox/tags/tags\.js|tags-api-client\.js|tags\.js" . --glob "!archive/**" --glob "!docs_build/dev/reports/**" --glob "!tmp/**" --glob "!node_modules/**"
```

Result:

- PASS for active runtime/test references.
- One `docs_build/database/seed/guest/tags.json` data-source field contains `tags.json`, not a retired JS path.

## Validation Results

| Command | Status | Notes |
| --- | --- | --- |
| `node --check assets/toolbox/tags/js/index.js` | PASS | Syntax check for canonical Tags module. |
| `node --check scripts/validate-browser-env-agnostic.mjs` | PASS | Syntax check for updated environment gate. |
| `node --check tests/dev-runtime/ProductDataProviderContractHardening.test.mjs` | PASS | Syntax check for updated product-data test. |
| `npm run validate:canonical-structure` | PASS | Blocking violations: 0; approved legacy exceptions: 492. |
| `node scripts/run-node-test-files.mjs tests/dev-runtime/ProductDataProviderContractHardening.test.mjs` | FAIL PRE-EXISTING | Fails on broader Toolbox registry/admin vote assertions unrelated to the Tags path update. |
| `node scripts/validate-browser-env-agnostic.mjs` | FAIL PRE-EXISTING | Fails on broader product-service and user-facing implementation wording findings unrelated to the Tags path update. |
| `npx playwright test tests/playwright/tools/TagsTool.spec.mjs` | FAIL PRE-EXISTING | 1/2 passed; page behavior test fails waiting for `[data-tags-editing-row="__new__"]`. |
| Previous-commit comparison | PASS | The same Tags Playwright failure reproduced on `bfc203e82` before PR_015 changes. |
| `git diff --check` | PASS | No whitespace errors. |

## Playwright Failure Classification

Root cause:

- The existing Tags page test fails after clicking Add Tag because `[data-tags-editing-row="__new__"]` does not appear.

Whether PR_015 caused it:

- No. The same failure reproduced in a temporary worktree checked out at `bfc203e82`, the commit immediately before PR_015 edits.

Action:

- Do not expand this canonical migration into Tags runtime behavior repair.
- Preserve the migration and document the existing blocker for a future scoped Tags behavior PR.

## Branch Validation

| Check | Status | Evidence |
| --- | --- | --- |
| Current branch | PASS | `PR_26172_CHARLIE_repository-compliance-stack`. |
| Worktree clean before PR_015 edits | PASS | PR_014 was committed and pushed before this scope. |
| Local/origin sync before PR_015 edits | PASS | `0 0` after PR_014 push. |
| Main merge avoided | PASS | No merge to `main` was performed. |

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Use second safest tool from PR_013 | PASS | Tags ranked #2. |
| Move JS to canonical structure | PASS | Canonical path added. |
| Move CSS only if required | PASS | No CSS move required. |
| Preserve behavior | PASS WITH KNOWN BLOCKER | Code path preserved; pre-existing Tags page behavior test remains failing. |
| Update references | PASS | HTML and validation references updated. |
| Targeted validation only | PASS | No samples or full smoke run. |
| Produce ZIP artifact | PASS | `tmp/PR_26172_CHARLIE_015-low-risk-tool-migration-2_delta.zip` generated. |

## Manual Validation Notes

- This PR removes two approved legacy JS exceptions from the canonical guardrail.
- The Tags server-contract wrapper still uses `createServerRepositoryClient`, `readServerToolConstants`, and `requireServerConstant`.
- Broader product-data validation failures are pre-existing and outside this low-risk canonical migration scope.
