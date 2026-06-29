# PR_26180_OWNER_014 Validation Report

| Validation | Result | Notes |
|---|---:|---|
| `node --test dev/tests/dev-runtime/StaticWebRootCompatibility.test.mjs dev/tests/dev-runtime/TeamAwareBootstrap.test.mjs dev/tests/tools/GameAssetManifestDiscovery.test.mjs` | PASS | 18 tests passed. |
| `npx playwright test dev/tests/playwright/tools/StaticWebRootCompatibility.spec.mjs dev/tests/playwright/tools/AdminHealthOperationsPage.spec.mjs dev/tests/playwright/tools/AdminInvitationsNavPage.spec.mjs` | PASS | 8 Playwright tests passed. |
| Targeted legacy layout scan | PASS | No tracked root legacy browser/dev folders remain; active scripts/tests only reference dev-owned script paths. |
| `node --test dev/tests/dev-runtime/TeamAwareBootstrap.test.mjs` | PASS | 12 tests passed. |
| Package script command surface check | PASS | `dev:bootstrap`, `dev:api`, `dev:web`, and `dev:local-api` are present. |
| `git diff --check` | PASS | Whitespace check passed; Git reported line-ending conversion warnings only. |
| `npm run validate:canonical-structure` | PASS | Blocking violations: 0; approved legacy exceptions: 503. |

## Notes

The targeted Playwright run updated a shared coverage artifact during execution. That generated churn was not retained in this PR; validation evidence is captured in the PR-specific reports instead.
