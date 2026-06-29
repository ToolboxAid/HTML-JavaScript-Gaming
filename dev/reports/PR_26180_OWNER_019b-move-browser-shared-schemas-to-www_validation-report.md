# PR_26180_OWNER_019b-move-browser-shared-schemas-to-www Validation Report

| Validation | Status | Notes |
| --- | --- | --- |
| Startup validation | PASS | Loaded Project Instructions v2026.06.28.018 before work; PR updates version to v2026.06.28.019. |
| Branch validation | PASS | Started from `PR_26180_OWNER_019a-contracts-schemas-obsolescence-audit`; created stacked branch `PR_26180_OWNER_019b-move-browser-shared-schemas-to-www`. |
| `node --check dev/scripts/validate-json-contracts.mjs` | PASS | Syntax check passed. |
| `node --check dev/tests/tools/ToolManifestBoundary.test.mjs` | PASS | Syntax check passed. |
| `node --check dev/tests/tools/ObjectVectorStudioV2DeleteCleanup.test.mjs` | PASS | Syntax check passed. |
| Targeted node tests | PASS | `ToolManifestBoundary` and `StaticWebRootCompatibility` passed. |
| Static schema URL checks | PASS | Representative `/src/shared/schemas/tools/...` and `/src/shared/contracts/replayContracts.js` routes resolve from `www/`. |
| Browser import/reference scan | PASS | No browser code imports top-level `api/`; stale active root filesystem schema references were updated. Public schema IDs remain intentionally unchanged. |
| Focused Playwright route smoke | PASS | `dev/tests/playwright/tools/StaticWebRootCompatibility.spec.mjs`: 2/2 passed. |
| `npm run validate:canonical-structure` | PASS | Canonical repository structure guardrail passed. |
| `git diff --check` | PASS | Passed; Git reported line-ending normalization warnings only. |

## Notes

`dev/tests/tools/ObjectVectorStudioV2DeleteCleanup.test.mjs` is not part of the active node test runner and still depends on a removed legacy Object Vector tool module path from before this PR. This PR updated only its schema file path for the moved browser schema; it did not expand into legacy test resurrection.
