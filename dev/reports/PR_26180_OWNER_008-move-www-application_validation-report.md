# PR_26180_OWNER_008 Validation Report

## Required Validation

| Command | Result |
|---|---|
| `node --check` on 68 changed JS/MJS files | PASS |
| `node ./dev/scripts/run-node-test-files.mjs dev/tests/dev-runtime/StaticWebRootCompatibility.test.mjs` | PASS |
| `npx playwright test dev/tests/playwright/tools/StaticWebRootCompatibility.spec.mjs --reporter=line` | PASS: 2/2 |
| `git diff --check` | PASS |
| `npm run validate:canonical-structure` | PASS |

## Targeted Route Coverage

The targeted Playwright smoke confirms 200 responses for:

- `/index.html`
- `/toolbox/index.html`
- `/assets/theme-v2/css/theme.css`
- `/account/sign-in.html`
- `/admin/system-health.html`
- `/games/index.html`

The targeted Node test confirms:

- default local web root resolves to `www`
- `GAMEFOUNDRY_LOCAL_WEB_ROOT=repo-root` resolves to repository root
- public route normalization remains stable
- configurable web root serving works

## Informational Non-Blocking Checks

Additional helper checks were attempted and are not part of the required validation lane:

- `node ./dev/scripts/validate-tool-registry.mjs` failed on existing registry/content assertions unrelated to this path move.
- `node ./dev/scripts/validate-active-tools-surface.mjs` failed on existing active-tool content assertions unrelated to this path move.
- `npm run validate:browser-env-agnostic` failed on existing product-data contract assertions unrelated to this path move.

Generated report deltas from those exploratory checks were restored and are not part of this PR.

## Result

PASS for required validation.
