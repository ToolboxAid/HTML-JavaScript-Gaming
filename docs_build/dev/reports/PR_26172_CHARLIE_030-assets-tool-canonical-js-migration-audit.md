# PR_26172_CHARLIE_030-assets-tool-canonical-js-migration-audit

Status: PASS.

Branch: `PR_26172_CHARLIE_repository-compliance-stack`

## Purpose

Perform detailed migration audit for Assets / Asset Browser / Vector Art because worker/API/client paths may be higher risk.

## Files Reviewed

- `toolbox/assets/assets.js`
- `toolbox/assets/assets-api-client.js`
- `toolbox/assets/assets-upload-worker.js`
- `toolbox/assets/index.html`
- `assets/toolbox/objects/js/index.js`
- `tests/playwright/tools/AssetToolMockRepository.spec.mjs`
- `tests/dev-runtime/ProductDataProviderContractHardening.test.mjs`
- `scripts/validate-browser-env-agnostic.mjs`
- `scripts/validate-canonical-repository-structure.mjs`

## Findings

### `assets.js`

Current path:
- `toolbox/assets/assets.js`

Current HTML reference:
- `toolbox/assets/index.html` loads `toolbox/assets/assets.js`.

Current imports:
- `./assets-api-client.js`
- `../../src/api/session-api-client.js`

Worker construction:
- `const UPLOAD_WORKER_URL = new URL("./assets-upload-worker.js", import.meta.url);`
- `new Worker(UPLOAD_WORKER_URL, { type: "module" })`

Decision:
- `assets.js` can safely move to `assets/toolbox/assets/js/index.js` if imports are updated and the worker URL points back to the retained legacy worker path.

Required path changes after entrypoint migration:
- API client import becomes `../../../../toolbox/assets/assets-api-client.js`.
- Session API import becomes `../../../../src/api/session-api-client.js`.
- Worker URL becomes `new URL("../../../../toolbox/assets/assets-upload-worker.js", import.meta.url)`.

### `assets-api-client.js`

Current path:
- `toolbox/assets/assets-api-client.js`

References:
- `toolbox/assets/assets.js`
- `assets/toolbox/objects/js/index.js`
- `tests/dev-runtime/ProductDataProviderContractHardening.test.mjs`
- `scripts/validate-browser-env-agnostic.mjs`
- `scripts/validate-canonical-repository-structure.mjs`

Decision:
- Do not move in the entrypoint PR.
- It is not Assets-only because Objects imports it.
- A later shared API placement decision is required before moving it safely.

### `assets-upload-worker.js`

Current path:
- `toolbox/assets/assets-upload-worker.js`

References:
- `toolbox/assets/assets.js`
- `tests/playwright/tools/AssetToolMockRepository.spec.mjs`
- `scripts/validate-canonical-repository-structure.mjs`

Decision:
- Do not move in the entrypoint PR.
- The active canonical guardrail only allows `assets/toolbox/{tool}/js/index.js`, `assets/js/shared/`, and `assets/theme-v2/js/`.
- A worker-specific canonical filename/pattern does not exist yet.
- Moving the worker without updating governance/guardrails would create a new canonical-structure violation or require a new exception pattern.

## Exact Validation Needed

For entrypoint migration:
- `node --check assets/toolbox/assets/js/index.js`
- `git diff --check`
- `npm run validate:canonical-structure`
- Active stale-reference check for `toolbox/assets/assets.js`
- Direct Assets page probe to confirm:
  - canonical module loads
  - asset type accordions render
  - no page errors/request failures
- Worker behavior remains unchanged if worker stays at `toolbox/assets/assets-upload-worker.js`.

For worker/API placement resolution:
- `npm run validate:browser-env-agnostic`
- `npm run validate:canonical-structure`
- targeted Assets worker Playwright validation if worker path changes

## Risk Classification

- `assets.js`: SAFE for entrypoint-only migration with retained worker/API paths.
- `assets-api-client.js`: NEEDS CARE; shared with Objects.
- `assets-upload-worker.js`: STOP / owner review; canonical worker placement is undefined.

## Requirement Checklist

- [x] Reviewed Assets page script.
- [x] Reviewed Assets API client.
- [x] Reviewed upload worker.
- [x] Reviewed Assets HTML.
- [x] Reviewed asset-related tests.
- [x] Reviewed worker construction path.
- [x] Reviewed browser validation rules.
- [x] Reviewed canonical structure guardrail rules.
- [x] Determined whether entrypoint can safely move.
- [x] Determined API client should remain pending shared placement.
- [x] Determined worker should remain pending worker placement governance.
- [x] No implementation changes.

## Validation Lane Report

PASS:
- Report exists.
- Runtime source unchanged in this PR.
- ZIP artifact required under `tmp/`.

Skipped:
- Playwright not run because this PR is audit-only.
- Canonical guardrail not rerun because this PR does not change JS/CSS/test structure.
- Samples not run per scope.

## Manual Validation Notes

The safe next step is an entrypoint-only migration. Worker and API-client placement should be resolved separately, with retained exceptions documented if governance does not yet define canonical worker/shared API paths.
