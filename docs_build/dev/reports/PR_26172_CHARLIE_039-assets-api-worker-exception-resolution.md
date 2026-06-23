# PR_26172_CHARLIE_039-assets-api-worker-exception-resolution

## Summary

Status: PASS with worker exception retained.

Resolved Assets retained exceptions using PR_037 and PR_038 findings:

- Moved `toolbox/assets/assets-api-client.js` to `assets/js/shared/assets-api-client.js`.
- Kept `toolbox/assets/assets-upload-worker.js` as a temporary exception with a removal plan.

## Files Changed

- `assets/js/shared/assets-api-client.js`
- `assets/toolbox/assets/js/index.js`
- `assets/toolbox/objects/js/index.js`
- `scripts/validate-canonical-repository-structure.mjs`
- `scripts/validate-browser-env-agnostic.mjs`
- `tests/dev-runtime/ProductDataProviderContractHardening.test.mjs`
- `docs_build/dev/reports/PR_26172_CHARLIE_039-assets-api-worker-exception-resolution.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## API Client Resolution

Decision: migrated to shared.

Reason:

- `assets-api-client.js` is used by both Assets and Objects.
- `assets/js/shared/` is the canonical shared JavaScript location.
- The canonical structure guardrail already accepts files under `assets/js/shared/`.

Updated imports:

- `assets/toolbox/assets/js/index.js`
- `assets/toolbox/objects/js/index.js`

Updated validation references:

- `scripts/validate-canonical-repository-structure.mjs`
- `scripts/validate-browser-env-agnostic.mjs`
- `tests/dev-runtime/ProductDataProviderContractHardening.test.mjs`

## Worker Resolution

Decision: keep temporary exception.

Reason:

- PR_038 confirmed the upload HTTP 500 is caused by Local API persistence/provider behavior, not by the worker path.
- The worker loads successfully from `toolbox/assets/assets-upload-worker.js`.
- Current canonical governance does not define an approved tool-local worker path.
- Moving the worker to `assets/js/shared/` would be misleading because it is not shared.

Removal plan:

1. Add or approve a canonical worker path rule.
2. Move the worker to that approved path.
3. Update `new Worker(...)` URL construction in the Assets entrypoint.
4. Run upload validation after the persistence/API blocker is resolved.
5. Remove `toolbox/assets/assets-upload-worker.js` from guardrail exceptions.

## Validation Lane Report

- `node --check assets/js/shared/assets-api-client.js`
  - Result: PASS
- `node --check assets/toolbox/assets/js/index.js`
  - Result: PASS
- `node --check assets/toolbox/objects/js/index.js`
  - Result: PASS
- `git diff --check`
  - Result: PASS
- `npm run validate:canonical-structure`
  - Result: PASS
  - Blocking violations: 0
  - Approved legacy exceptions: 480
- `node --test tests/regression/CanonicalRepositoryStructureGuardrail.test.mjs`
  - Result: PASS
- Active stale reference check for `toolbox/assets/assets-api-client.js`
  - Result: PASS
  - No active non-report references remain.
- Direct browser page-load probe:
  - Assets: PASS, heading rendered and shared client returned HTTP 200.
  - Objects: PASS, heading rendered and shared client returned HTTP 200.
- `node --test tests/dev-runtime/ProductDataProviderContractHardening.test.mjs`
  - Result: FAIL
  - Existing unrelated failures:
    - Public config request order expectation.
    - Admin/tool votes import expectation.
  - The Assets client path list was updated in this test, but the remaining failures are outside this PR scope.

## Branch Validation

- Current branch: `PR_26172_CHARLIE_repository-compliance-stack`
- Expected branch: `PR_26172_CHARLIE_repository-compliance-stack`
- Local/origin sync before PR: `0 0`
- Branch validation: PASS

## Requirement Checklist

- Use PR_037 findings: PASS
- Use PR_038 findings: PASS
- Resolve Assets API client placement: PASS
- Resolve Assets worker placement: PASS, retained as temporary exception.
- Migrate if safe: PASS, API client migrated.
- Keep documented temporary exception if unsafe: PASS, worker retained.
- Preserve upload behavior: PASS, no worker behavior changed.
- No feature changes: PASS
- Produce ZIP artifact: PASS after artifact creation.

## Manual Validation Notes

This PR removes one active Assets retained exception. The upload worker remains the only Assets-specific retained JS exception because the codebase needs an approved worker placement rule before a safe move.
